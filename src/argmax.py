import numpy as np
import torch
from torch import nn
from torch.autograd import Function
from torch.autograd import Variable
from multiprocessing import Pool
import gurobipy as gp
from gurobi import *
import time

# gurobi python multiprocessing worker
# input parameters for an example to do ILP inference
# NOTE, all incoming tensors should be numpy arrays
def mp_grbpy_worker(params):
	opt, ex, obj, expr_constr_callbacks, le_constr, le_thresh, eq_constr, eq_thresh = params
	shape = list((int(obj.shape[0]), int(obj.shape[1])))
	m = gp.Model(name='{0}'.format(ex))
	v = m.addVars(*shape, vtype=gp.GRB.BINARY, obj=obj, name='V')

	# external constraints
	for le_c, le_t in zip(le_constr, le_thresh):
		m.addConstr(gp.quicksum(v[i,j]
						for i in xrange(shape[0])
						for j in xrange(shape[1])
						if le_c[i,j] == 1) <= le_t)
	
	for eq_c, eq_t in zip(eq_constr, eq_thresh):
		m.addConstr(gp.quicksum(v[i,j]
						for i in xrange(shape[0])
						for j in xrange(shape[1])
						if eq_c[i,j] == 1) == eq_t)

	# constraint callbacks
	if expr_constr_callbacks is not None:
		for cb in expr_constr_callbacks:
			cb(opt, m, v, shape)

	m.setParam('OutputFlag', 0)
	m.modelSense = gp.GRB.MAXIMIZE
	m.optimize()

	# query result
	rs = np.asarray(m.getAttr('X')).reshape((shape[0], shape[1]))
	return rs
	

# gurobi c multiprocessing worker
# NOTE: expr constraint does NOT work in c interface
def mp_grbc_worker(params):
	opt, ex, obj, expr_constr_callbacks, le_constr, le_thresh, eq_constr, eq_thresh = params
	env = grb_load_env()
	m = grb_new_model(env, '{0}'.format(ex), obj)

	# set to maximize (-1: maximize, 1: minimize)
	grb_set_int_attr(m, 'ModelSense', -1)

	# constr
	for i in xrange(len(le_constr)):
		grb_add_constr(m, le_constr[i], 'LE', le_thresh[i], 'le_{0}'.format(i))

	for i in xrange(len(eq_constr)):
		grb_add_constr(m, eq_constr[i], 'EQ', eq_thresh[i], 'eq_{0}'.format(i))

	rs = np.zeros(obj.shape, dtype=obj.dtype)
	grb_solve(m, rs)

	return rs

# Argmax funciton layer
# Accepts two types of constraints
#	1. general form <tensor, sense, threshold>
#	2. python expression (see constraint.py)
class ArgmaxFunction(Function):
	def __init__(self, opt, shared):
		super(ArgmaxFunction, self).__init__()
		self.opt = opt
		self.shared = shared
		self.pool = Pool(64)


	def __getstate__(self):
		self_dict = self.__dict__.copy()
		del self_dict['pool'] # pool does not support pickle thus throw exception when saving the model
		return self_dict

	def __setstate__(self, state):
		self.__dict__.update(state)

		
	# inputs a 3d score tensor for a batch of examples
	#	constraints are to be defined under shared.*
	# outputs an indicator tensor
	def forward(self, scores):
		shared = self.shared
		orig_shape = scores.shape
		batch_l, x_l, y_l = scores.shape
		assert(batch_l == shared.batch_l)

		# le_constr is a list of list of matrices that contains the le constraints for the example batch
		# le_thresh is a list of list of numbers
		# the same structure for eq_constr and eq_thresh
		le_constr, le_thresh, eq_constr, eq_thresh = shared.le_constr, shared.le_thresh, shared.eq_constr, shared.eq_thresh
		# a special type of constraints that are defined by expr call back functions instead of <tensor, sense, thresh> form
		expr_constr_callbacks = shared.expr_constr_callbacks

		# scores are the definition of ILP objective
		#	 convert to numpy array
		obj = scores.numpy() if self.opt.gpuid == -1 else scores.cpu().numpy()
		obj = obj.astype(np.dtype('float64'))	# gurobi only takes double

		params = zip([self.opt for i in xrange(batch_l)],
			[i for i in xrange(batch_l)],
			[obj[i,:,:] for i in xrange(batch_l)],
			expr_constr_callbacks, 
			le_constr,
			le_thresh,
			eq_constr,
			eq_thresh)

		# a flat matrix to store ILP results
		output = np.zeros((batch_l, x_l * y_l))

		# run ilp for the batch
		rs = self.pool.map(mp_grbpy_worker, params)
		# pool.close()

		# query results
		for i in xrange(batch_l):
			output[i, :] = rs[i].reshape((x_l*y_l,))

		# reshape to match the dims of input scores
		#	NOTE, gurobi requires double and yields double, so make it float afterwards
		output = torch.from_numpy(output.reshape(orig_shape)).float()

		if self.opt.gpuid != -1:
			output = output.cuda()

		return output


	def backward(self, grad_output):
		grad_input = torch.zeros(grad_output.shape)
		if self.opt.gpuid != -1:
			grad_input = grad_input.cuda()
		return grad_input


class Argmax(torch.nn.Module):
	def __init__(self, opt, shared):
		super(Argmax, self).__init__()
		self.opt = opt
		self.shared = shared
		self.func = ArgmaxFunction(self.opt, self.shared)

	def forward(self, scores):
		output = self.func(scores)
		return output



if __name__ == '__main__':
	from constraint import *
	from torch import cuda
	batch_l = 1000
	s = np.random.uniform(-0.1, 1, (batch_l,20,20))

	from holder import *
	opt = Holder()
	opt.gpuid = 1
	opt.num_att_labels = 3
	shared = Holder()
	shared.batch_l = batch_l
	shared.le_constr = [[] for i in xrange(batch_l)]
	shared.le_thresh = [[] for i in xrange(batch_l)]
	shared.eq_constr = [[] for i in xrange(batch_l)]
	shared.eq_thresh = [[] for i in xrange(batch_l)]
	shared.expr_constr_callbacks = [[] for i in xrange(batch_l)]

	cuda.set_device(opt.gpuid)
	scores = Variable(torch.from_numpy(s).cuda(), requires_grad=True)

	argm = Argmax(opt, shared)

	import time
	start = time.time()
	output = argm(scores)
	end = time.time()
	print('{0}s used in forward'.format(end-start))

	grad = torch.randn(scores.shape)
	if opt.gpuid != -1:
		grad = grad.cuda()
	for i in xrange(10):
		start = time.time()
		grad_input = argm.func.backward(grad)
		end = time.time()
		print('{0}s used in backward'.format(end-start))





