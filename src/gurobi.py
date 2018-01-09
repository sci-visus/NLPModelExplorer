import ctypes
import torch
from ctypes import cdll
import numpy as np
import gurobi_h as hd
from multiprocessing import Pool

lib = cdll.LoadLibrary('/opt/gurobi702/linux64/lib/libgurobi70.so')

MAX_VAR_NUM = 100000
v_types = hd.GRB_BINARY * MAX_VAR_NUM
v_idx = [i for i in xrange(MAX_VAR_NUM)]

c_int_p = ctypes.POINTER(ctypes.c_int)
c_double_p = ctypes.POINTER(ctypes.c_double)

def int_arr(l):
	return (ctypes.c_int * len(l))(*l)

def grb_load_env():
	env = ctypes.POINTER(hd.GRBenv)()
	err = lib.GRBloadenv(ctypes.byref(env), "")
	assert(err == 0)

	# mute
	lib.GRBsetintparam(env, 'OutputFlag', 0)
	return env


def grb_new_model(env, name, obj):
	m = ctypes.POINTER(hd.GRBmodel)()
	num_vars = obj.size
	assert(num_vars <= MAX_VAR_NUM)

	assert(obj.dtype == 'float64')
	obj_ = obj.ctypes.data_as(c_double_p)
	err = lib.GRBnewmodel(
		env, 
		ctypes.byref(m), 
		name, 
		num_vars, 
		obj_, 
		c_double_p(), 
		c_double_p(), 
		v_types, 
		ctypes.POINTER(ctypes.c_char_p)())
	assert(err == 0)
	return m

def grb_set_int_attr(model, name, val):
	err = lib.GRBsetintattr(model, name, val)
	assert(err == 0)

def grb_get_int_attr(model, name):
	attr = ctypes.c_int()
	err = lib.GRBgetintattr(model, name, ctypes.byref(attr))
	assert(err == 0)
	return attr


def grb_add_constr(model, lhs, sense, rhs, name):
	lhs_ = torch.from_numpy(lhs)	# ugly conversion
	coeff_idx_ = lhs_.nonzero()
	coeff_idx = coeff_idx_.numpy().reshape(coeff_idx_.nelement(),).astype('int32')
	coeff_val_ = lhs_[torch.ne(lhs_, 0.0)]
	coeff_val = coeff_val_.numpy()
	num_non_zero = coeff_idx_.nelement()

	# deal with sense char
	sense_ = None
	if sense == 'LE':
		sense_ = hd.GRB_LESS_EQUAL
	elif sense == 'EQ':
		sense_ = hd.GRB_EQUAL
	elif sense == 'GE':
		sense_ = hd.GRB_GREATER_EQUAL
	else:
		assert(False)

	err = lib.GRBaddconstr(model, 
		ctypes.c_int(num_non_zero), 
		coeff_idx.ctypes.data_as(c_int_p),
		coeff_val.ctypes.data_as(c_double_p),
		ctypes.c_char(sense_),
		ctypes.c_double(rhs),
		name)
	assert(err == 0)


def grb_solve(model, rs):
	err = lib.GRBoptimize(model)
	assert(err == 0)

	status = grb_get_int_attr(model, 'Status')

	# convert c_int to native int
	if status.value == 2:
		num_vars = rs.size
		idx_ = int_arr(v_idx)
		rs_ = rs.ctypes.data_as(c_double_p)
		err = lib.GRBgetdblattrlist(model, 'X', num_vars, idx_, rs_)
		assert(err == 0)

	return status.value	

def grb_free_model(model):
	err = lib.GRBfreemodel(model)
	assert(err == 0)

def grb_free_env(env):
	lib.GRBfreeenv(env)

def worker(p):
	rs = np.zeros(p.shape, dtype=p.dtype)
	env = grb_load_env()
	m = grb_new_model(env, '', p)
	grb_solve(m, rs)
	return rs

def mp_test(num_models):
	x_list = [np.random.uniform(-0.1, 1, (3,4)) for i in xrange(num_models)]
	pool = Pool(64)

	y_list = pool.map(worker, x_list)
	pool.close()
	pool.join()

	return y_list


if __name__ == '__main__':
	import time
	x = np.random.uniform(-0.1, 1, (3,4))
	
	env = grb_load_env()
	
	m = grb_new_model(env, 'model', x)
	
	y = np.ones((3,4), dtype='float64')
	status = grb_solve(m, y)
	print(status)
	print(x)
	print(y)
	
	#num_models = 100
	#x_list = [np.random.uniform(-0.1, 1, (3,4)) for i in xrange(num_models)]
	#y_list = [np.ones((3,4), dtype='float64') for i in xrange(num_models)]
	#model_list = []
	#
	#start = time.time()
	#env = grb_load_env()
	#for i in xrange(num_models):
	#	m = grb_new_model(env, '{0}'.format(i), x_list[i])
	#	model_list.append(m)
	#
	#
	#start = time.time()
	#grb_solve_par(model_list, y_list)
	#end = time.time()
	#print('{0}s used'.format(end-start))
	
	start = time.time()
	rs = mp_test(1000)
	end = time.time()
	print('{0}s used'.format(end-start))















#
#


