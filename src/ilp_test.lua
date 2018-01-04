#!/usr/bin/env th

local torch = require 'torch'
torch.setdefaulttensortype('torch.DoubleTensor')

local gurobi = require 'gurobi'

collectgarbage()
collectgarbage()

local tester = torch.Tester()
local gurobiTest = torch.TestSuite()

local eps = 1e-5

function gurobiTest.ILPLe()
   local env = gurobi.loadenv("")

   local c = torch.Tensor{-1.0, -1.0}
   local G = torch.Tensor{{1, 2}, {-1, -1}}
   local h = torch.Tensor{4.0, -1.0}

   local model = gurobi.newmodel(env, "", c)
   gurobi.addconstrs(model, G, 'LE', h)
   local status, x = gurobi.solve(model)

   local optX = torch.Tensor{1.0, 1.0}
   tester:asserteq(status, 2, 'Non-optimal status: ' .. status)
   tester:assertTensorEq(x, optX, eps, 'Invalid optimal value.')

   gurobi.free(env, model)
end

function gurobiTest.ILPEq()
   local env = gurobi.loadenv("")

   local c = torch.Tensor{-1.0, -1.0}
   local G = torch.Tensor{{1, 2}}
   local h = torch.Tensor{1.0}

   local model = gurobi.newmodel(env, "", c)
   gurobi.addconstrs(model, G, 'EQ', h)
   local status, x = gurobi.solve(model)

   local optX = torch.Tensor{1.0, 0}
   tester:asserteq(status, 2, 'Non-optimal status: ' .. status)
   tester:assertTensorEq(x, optX, eps, 'Invalid optimal value.')

   gurobi.free(env, model)
end

function gurobiTest.par()
   local c = torch.Tensor{-1.0, -1.0}
   local G = torch.Tensor{{1, 2}, {-1, -1}}
   local h = torch.Tensor{4.0, -1.0}

   local env = gurobi.loadenv("")
   local model1 = gurobi.newmodel(env, "", c)
   gurobi.addconstrs(model1, G, 'LE', h)

   local model2 = gurobi.newmodel(env, "", c)
   gurobi.addconstrs(model2, G, 'LE', h)

   local status, xs = gurobi.solvePar({model1, model2})

   local optX = torch.Tensor{1.0, 1.0}
   for i = 1,2 do
      local status_i = status[i]
      local x = xs[i]
      tester:asserteq(status_i, 2, 'Non-optimal status: ' .. status_i)
      tester:assertTensorEq(x, optX, eps, 'Invalid optimal value.')
   end

   gurobi.free(nil, model1)
   gurobi.free(env, model2)
end

function gurobiTest.ILPPar()
   local env = gurobi.loadenv("")

   local c = torch.Tensor{-1.0, -1.0}
   local G = torch.Tensor{{1, 2}, {-1, -1}}
   local h = torch.Tensor{4.0, -1.0}

   local model1 = gurobi.newmodel(env, "", c)
   gurobi.addconstrs(model1, G, 'LE', h)

   local model2 = gurobi.newmodel(env, "", c)
   gurobi.addconstrs(model2, G, 'LE', h)

   local status, xs = gurobi.solvePar({model1, model2})

   local optX = torch.Tensor{1.0, 1.0}
   for i = 1,2 do
      local status_i = status[i]
      local x = xs[i]
      tester:asserteq(status_i, 2, 'Non-optimal status: ' .. status_i)
      tester:assertTensorEq(x, optX, eps, 'Invalid optimal value.')
   end

   gurobi.free(nil, model1)
   gurobi.free(env, model2)
end



tester:add(gurobiTest)
tester:run()
