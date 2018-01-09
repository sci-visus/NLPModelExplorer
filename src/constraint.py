import gurobipy as gp
import numpy as np
import torch

# predefined constraints
#	unlike general form of constraint which processed as a tensor and a threshold
# these ones are specialized and optmized

# a src can be aligned with at most one tgt
#	except the first src (which is nul)
# m: the gurobi model
# v: the gurobi variables of the model
# shape: the shape of scores for the example
def one_per_row(opt, m, v, shape):
	if opt.num_att_labels == 1:
		# TODO, quicksum?
		m.addConstrs((v.sum(i, '*') == 1 for i in xrange(1, shape[0])),
			name='one_per_row')
	else:
		# one_per_row constr is the same as when num_att_labels == 1
		m.addConstrs((v.sum(i, '*') == 1 for i in xrange(1, shape[0])),
			name='one_per_row')

# a tgt can be aligned with at most one src
#	except the first tgt (which is nul)
def one_per_col(opt, m, v, shape):
	if opt.num_att_labels == 1:
		m.addConstrs((v.sum('*', j) == 1 for j in xrange(1, shape[1])),
			name='one_per_col')
	else:
		step = shape[1]/opt.num_att_labels
		# one_per_col constr needs to deal with labels
		for k in xrange(1, step):
			m.addConstr(gp.quicksum(v[i,j] 
				for i in xrange(0, shape[0])
				for j in xrange(k, shape[1], step)) == 1,
				name='one_per_col[{0}]'.format(k))


# nul-nul blocked
def no_nul_nul(opt, m, v, shape):
	if opt.num_att_labels == 1:
		m.addConstr(v[0,0] == 0, name='no_nul_nul')
	else:
		step = shape[1]/opt.num_att_labels
		# when having multiple labels, assuming the last label is for nul alignment
		m.addConstr(v[0, shape[1]-step] == 0, name='no_nul_nul')

# invalid nul blocked
def no_invalid_nul(opt, m, v, shape):
	expr = None
	if opt.num_att_labels == 1:
		m.addConstr(gp.quicksum(v[i,j] 
				for i in range(0, 1)
				for j in range(0, 1)) == 0, name='no_invalid_nul')
	else:
		step = shape[1]/opt.num_att_labels
		expr = gp.quicksum(v[0,j] 
					for j in range(0, shape[1]-step)) + \
				gp.quicksum(v[i,j]
					for i in range(1, shape[0])
					for j in range(0, shape[1]-step, step)) + \
				gp.quicksum(v[i,j]
					for i in range(1, shape[0])
					for j in range(shape[1]-step+1, shape[1])) == 0

		m.addConstr(expr, name='no_invalid_nul')

# batch_shape: the shape of batch scores (batch_l, sent_l1, sent_l2 * num_att_labels)
def one_to_one_mask(opt, batch_shape):
	mask = np.ones(batch_shape, dtype=np.float32)
	if opt.num_att_labels == 1:
		mask[:,0,0] = 0.0
	else:
		step = batch_shape[2] / opt.num_att_labels
		mask[:, 0, 0:batch_shape[2]-step+1] = 0.0
		mask[:, :, 0:batch_shape[2]-step:step] = 0.0
		mask[:, 1:batch_shape[1], batch_shape[2]-step+1:batch_shape[2]] = 0.0

	mask = torch.from_numpy(mask)
	if opt.gpuid != -1:
		mask = mask.cuda()
	return mask



# emsemble constraint
def one_to_one(opt, m, v, shape):
	one_per_row(opt, m, v, shape)
	one_per_col(opt, m, v, shape)
	no_nul_nul(opt, m, v, shape)
	no_invalid_nul(opt, m, v, shape)


if __name__ == '__main__':
	from holder import *
	opt = Holder()
	opt.gpuid = -1
	opt.num_att_labels = 3
	batch_shape = (2,5,12)

	mask = one_to_one_mask(opt, batch_shape)
	print(mask)