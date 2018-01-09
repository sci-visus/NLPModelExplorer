import gurobipy as gp
import numpy as np
import torch


scores = np.random.uniform(0.1, 1, (3,4,5))
shape = list(scores.shape)
print(shape)

c1 = np.zeros((3,4,5))
c1[1:3, 1:3, 1:3] = 1

m = gp.Model()
v = m.addVars(*shape, vtype=gp.GRB.BINARY, obj=scores, name='V')
m.addConstr(gp.quicksum(v[i,j,l] for i in range(shape[0])
			for j in range(shape[1])
			for l in range(shape[2])
			if c1[i,j,l] == 1) == 0, name='c1')

m.setParam('OutputFlag', 0)	# mute
m.modelSense = gp.GRB.MAXIMIZE
m.update()

m.optimize()


print(m.params)
print(m.getAttr('Status'))	# expect 2
print(c1)
print(np.asarray(m.getAttr('X')).reshape((3,4,5)))