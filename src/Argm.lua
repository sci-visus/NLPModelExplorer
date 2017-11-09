local Argm, _ = torch.class('nn.Argm', 'nn.Module')
local gurobi = require 'gurobi'


function Argm:lazy_init_ILP_constraints_label1()
   assert(self.ali_labels == 1, 'ali_labels ~= 1')

   --  for z_ij where i,j == nul, simply enforce it
   local constr = torch.zeros(self.ali_labels, self.max_sent_l, self.max_sent_l)
   local constr_thresh = 1.0
   constr[1][1][1] = 1.0

   table.insert(self.noali_constrs, constr)
   table.insert(self.noali_thresh, constr_thresh)
   
   --------------- setup one to one alignment constraints ---------------
   -- for i in S, z_ij where i!=nul, z_ij = 1
   local non_null = {2,self.max_sent_l}
   local null = 1
   for i=2,self.max_sent_l do
      local constr = torch.zeros(self.ali_labels, self.max_sent_l, self.max_sent_l)
      constr[{1, i, non_null}] = 1.0
      constr[{1, i, null}] = 1.0
      self.c1to1_p_constrs[i] = constr
      self.c1to1_p_thresh[i] = 1.0
   end
   -- for j in T, z_ijl where j!=nul, z_lij = 1
   for j=2,self.max_sent_l do
      local constr = torch.zeros(self.ali_labels, self.max_sent_l, self.max_sent_l)
      constr[{1, non_null, j}] = 1.0
      constr[{1, null, j}] = 1.0
      self.c1to1_h_constrs[j] = constr
      self.c1to1_h_thresh[j] = 1.0
   end
end

function Argm:lazy_init_ILP_constraints_labeln()
   --------------- setup empty alignment constraints ---------------
   --  for z_lij where i,j == nul, simply disable it
   --  for z_lij where i or j == nul and l != NOALI, simply disable it
   --    NOTE, when ali_labels > 1, assume the last label is NOALI
   if self.ali_labels > 1 then
      local constr = torch.zeros(self.ali_labels, self.max_sent_l, self.max_sent_l)
      local constr_thresh = 0.0

      for l=1,self.ali_labels-1 do
         constr[l][1][1] = 1.0
         constr[{l, 1, {}}] = 1.0
         constr[{l, {}, 1}] = 1.0
      end

      table.insert(self.noali_constrs, constr)
      table.insert(self.noali_thresh, constr_thresh)
   end

   --  for z_lij where i,j != nul and l == NOALI, disable z_lij
   l = self.ali_labels
   local constr = torch.zeros(self.ali_labels, self.max_sent_l, self.max_sent_l)
   local constr_thresh = 0.0
   local non_null = {2,self.max_sent_l}
   constr[{l, non_null, non_null}] = 1.0
   table.insert(self.noali_constrs, constr)
   table.insert(self.noali_thresh, constr_thresh)


   --------------- setup one to one alignment constraints ---------------
   -- for i in S, z_ijl where i!=nul, z_lij = 1
   local noali = self.ali_labels
   local non_noali = {1,self.ali_labels-1}
   local null = 1
   for i=2,self.max_sent_l do
      local constr = torch.zeros(self.ali_labels, self.max_sent_l, self.max_sent_l)
      constr[{non_noali, i, non_null}] = 1.0
      constr[{noali, i, null}] = 1.0
      self.c1to1_p_constrs[i] = constr
      self.c1to1_p_thresh[i] = 1.0
   end
   -- for j in T, z_ijl where j!=nul, z_lij = 1
   for j=2,self.max_sent_l do
      local constr = torch.zeros(self.ali_labels, self.max_sent_l, self.max_sent_l)
      constr[{non_noali, non_null, j}] = 1.0
      constr[{noali, null, j}] = 1.0
      self.c1to1_h_constrs[j] = constr
      self.c1to1_h_thresh[j] = 1.0
   end
end


function Argm:__init(opt)
   --self.rowAverage = (rowAverage == nil) and true or rowAverage
   self.ali_labels = opt.ali_labels
   self.max_sent_l = 256
   self.noali_constrs = {}
   self.noali_thresh = {}
   self.c1to1_p_constrs = {}
   self.c1to1_p_thresh = {}
   self.c1to1_h_constrs = {}
   self.c1to1_h_thresh = {}

   self.active_eq_constrs = {}
   self.active_eq_thresh = {}
   self.active_le_constrs = {}
   self.active_le_thresh = {}

   -- context dependent variables
   self.batch_l = 0
   self.sent_l1 = 0
   self.sent_l2 = 0
   self.opt = opt
   self.batch_ex_idx = {}
   self.res_table = {}

   -- internal use only
   self.lazy_flag = false

   if self.ali_labels > 1 then
      self:lazy_init_ILP_constraints_labeln()
   else
      self:lazy_init_ILP_constraints_label1()
   end
end

-- align constraints with scores
   -- input tensor must be 3d, where the 1st dim is label, 2nd is src, 3rd is targ
   -- The layout is [s1: [(t1,l1), (t2,l1)], s1: [(t1,l2), (t2,l2)], s2: [(t1,l1), (t2,l1)], ...]
function Argm:trans_flatten(t)
   -- swap the first 2 dims to align the flattened elements to scores
   c = t:transpose(1,2):contiguous()
   return c:view(1, c:nElement())
end

-- clear up all constraints
function Argm:clear_constr()
   self.active_eq_constrs = {}
   self.active_eq_thresh = {}
   self.active_le_constrs = {}
   self.active_le_thresh = {}

   for ex=1,self.batch_l do
      self.active_eq_constrs[ex] = {}
      self.active_eq_thresh[ex] = {}
      self.active_le_constrs[ex] = {}
      self.active_le_thresh[ex] = {}
   end
end

function Argm:setup_EQ_constr()
   if self.res_table.synonym ~= nil and #(self.res_table.synonym) > 0 then
      assert(self.batch_l == #(self.batch_ex_idx), 'batch_l does not match size of batch_ex_idx.')
      assert(self.ali_labels == 1 or self.ali_labels == 3, 'extra constraints only support ali_labels=1 or 3.')
      assert(#(self.batch_ex_idx) == #(self.res_table.synonym), 'batch_ex_idx size mismatch constr size.')

      for ex=1,self.batch_l do
         --print(tostring(self.batch_ex_idx[ex]) .. ' ' .. tostring(self.sent_l1) .. ' ' .. tostring(self.sent_l2))
         -- TODO, only using synonym now, no lemma involved
         local synonym = self.res_table.synonym[ex].synonym
         for l=1,#synonym do
            local constr = torch.zeros(self.ali_labels, self.sent_l1, self.sent_l2)
            local lem = synonym[l]
            local closure = self.res_table.synonym[ex][lem]
            local idx1 = closure[1]
            local idx2 = closure[2]
            local num_edges = 0
   
            -- if i,j belong to the same synonym set,
               -- then l_{ij} must NOT be OPPO
            local l_oppo = 2
            for i=1,#idx1 do
               for j=1,#idx2 do
                  constr[l_oppo][idx1[i]][idx2[j]] = 1.0
               end
            end
            table.insert(self.active_eq_constrs[ex], self:trans_flatten(constr))
            table.insert(self.active_eq_thresh[ex], num_edges)
         end
      end
   end
end

function Argm:setup_OP_constr()
   if self.res_table.antonym ~= nil and #(self.res_table.antonym) > 0 then
      assert(self.batch_l == #(self.batch_ex_idx), 'batch_l does not match size of batch_ex_idx.')
      assert(self.ali_labels == 1 or self.ali_labels == 3, 'extra constraints only support ali_labels=1 or 3.')
      assert(#(self.batch_ex_idx) == #(self.res_table.synonym), 'batch_ex_idx size mismatch constr size.')

      for ex=1,self.batch_l do
         --print(tostring(self.batch_ex_idx[ex]) .. ' ' .. tostring(self.sent_l1) .. ' ' .. tostring(self.sent_l2))
         local antonym = self.res_table.antonym[ex].antonym
         for l=1,#antonym do
            local constr = torch.zeros(self.ali_labels, self.sent_l1, self.sent_l2)
            local lem = antonym[l]
            local closure = self.res_table.antonym[ex][lem]
            local idx1 = closure[1]
            local idx2 = closure[2]
            local num_edges = 0
   
            -- if i,j belong to the same antonym set,
               -- then l_{ij} must NOT be EQUI
            local l_equi = 1
            for i=1,#idx1 do
               for j=1,#idx2 do
                  constr[l_equi][idx1[i]][idx2[j]] = 1.0
               end
            end
            table.insert(self.active_eq_constrs[ex], self:trans_flatten(constr))
            table.insert(self.active_eq_thresh[ex], num_edges)
         end
      end
   end
end

function Argm:setup_NOA_constr()
   
end

-- basic 1-to-1 alignment constraint
-- adjust ilp constraints according to current batch dimensions
--    chop the constraints tensor to fit the sizes of input tensor (in fwd/bwd passes)
function Argm:setup_1to1_constr()
   -- before setting up, change all intrinsic constraints into cpu tensor
      --    this is because gModule:cuda() changed all cpu tensor into gpu tensor while we need some cpu tensors for ILP
      --    supposed to do this for only once
   if string.find(self.noali_constrs[1]:type(), 'Cuda') ~= nil then
      assert(self.lazy_flag == false)
      for i=1,#(self.noali_constrs) do
         self.noali_constrs[i] = self.noali_constrs[i]:double()
      end

      for i=2,#(self.c1to1_p_constrs) do
         self.c1to1_p_constrs[i] = self.c1to1_p_constrs[i]:double()
      end

      for i=2,#(self.c1to1_h_constrs) do
         self.c1to1_h_constrs[i] = self.c1to1_h_constrs[i]:double()
      end
      self.lazy_flag = true
   end

   -- chop off preinitialized constraint tensors according to 
   for ex=1,self.batch_l do

      for k=1,#(self.noali_constrs) do
         local constr = self.noali_constrs[k]:sub(1, self.ali_labels, 1, self.sent_l1, 1, self.sent_l2)
         local thresh = self.noali_thresh[k]
         --print('self.noali_constrs')
         --print(constr)
         table.insert(self.active_eq_constrs[ex], self:trans_flatten(constr))
         table.insert(self.active_eq_thresh[ex], thresh)
      end
   
      for k=2,self.sent_l1 do
         local constr = self.c1to1_p_constrs[k]:sub(1, self.ali_labels, 1, self.sent_l1, 1, self.sent_l2)
         local thresh = self.c1to1_p_thresh[k]
         --print('self.c1to1_p_constrs')
         --print(constr)
         table.insert(self.active_eq_constrs[ex], self:trans_flatten(constr))
         table.insert(self.active_eq_thresh[ex], thresh)
      end
   
      for k=2,self.sent_l2 do
         local constr = self.c1to1_h_constrs[k]:sub(1, self.ali_labels, 1, self.sent_l1, 1, self.sent_l2)
         local thresh = self.c1to1_h_thresh[k]
         --print('self.c1to1_h_constrs')
         --print(constr)
         table.insert(self.active_eq_constrs[ex], self:trans_flatten(constr))
         table.insert(self.active_eq_thresh[ex], thresh)
      end
   end
end

-- Assuming the input is of dimension batch_l x sent_l1 x (sent_l2 * ali_labels)
--    The input is a similarity score tensor
function Argm:updateOutput(input)
   self:clear_constr()
   self:setup_1to1_constr()
   self:setup_EQ_constr()
   self:setup_OP_constr()
   self:setup_NOA_constr()

   assert(self.batch_l == (#input)[1], 'batch_l does not match (#input)[1].')

   local env = gurobi.loadenv("")
   local models = {}

   -- inference coeff
   local batch_coeff = -input
   -- gpu to cpu
   if self.opt.gpuid > 0 then
      batch_coeff = batch_coeff:double()
   end
   -- sanity check
   if batch_coeff:nElement() >= 100000 * self.batch_l then
      -- typically it should not be this large
      --    if too large throw a message
      print(batch_coeff:nElement())
      print(#batch_coeff)
      print(self.sent_l1)
      print(self.sent_l2)
    end

   ---- eq constraints
   local eq_constrs = {}
   local eq_thresh = {}
   for ex=1,self.batch_l do
      if #(self.active_eq_constrs[ex]) ~= 0 then
         eq_constrs[ex] = torch.cat(self.active_eq_constrs[ex], 1)
         eq_thresh[ex] = torch.Tensor(self.active_eq_thresh[ex])
      end
   end

   ---- le constraints
   local le_constrs = {}
   local le_thresh = {}
   for ex=1,self.batch_l do
      if #(self.active_le_constrs[ex]) ~= 0 then
         le_constrs[ex] = torch.cat(self.active_le_constrs[ex], 1)
         le_thresh[ex] = torch.Tensor(self.active_le_thresh[ex])
      end
   end


   for ex=1,self.batch_l do
      local model

      local coeff = batch_coeff[ex]
      coeff = coeff:view(coeff:nElement())

      model = gurobi.newmodel(env, "", coeff)

      if #(self.active_eq_constrs[ex]) ~= 0 then
         gurobi.addconstrs(model, eq_constrs[ex], 'EQ', eq_thresh[ex])
      end

      if #(self.active_le_constrs[ex]) ~= 0 then
         gurobi.addconstrs(model, le_constrs[ex], 'LE', le_thresh[ex])
      end

      models[ex] = model
   end

   -- do hard argmax
   --    by solving inference in parallel
   local status, results = gurobi.solvePar(models)
   for i=1,self.batch_l do
      if self.batch_ex_idx ~= nil and #(self.batch_ex_idx) ~= 0 then
         assert(status[i]==2, 'Non-optimal status: ' .. status[i] .. ' on example: ' .. self.batch_ex_idx[i])
      else
         assert(status[i]==2, 'Non-optimal status: ' .. status[i])
      end
   end

   self.output = results:view(self.batch_l, self.sent_l1, self.sent_l2*self.ali_labels)

   -- free models
   for ex=1,self.batch_l-1 do
      gurobi.free(nil, models[ex])
   end
   gurobi.free(env, models[self.batch_l])

   if opt.gpuid ~= -1 then
      cutorch.setDevice(self.opt.gpuid)  
      self.output = self.output:cuda()
   end

   -- averaging row-wisely
   --if self.rowAverage then
   --   local sum = self:output:sum(3)
   --   sum[sum:eq(0)] = 1
   --   self.output:cdiv(sum:expandAs(self.output))
   --end

   return self.output
end

function Argm:updateGradInput(input, gradOutput)
   -- just zeros
   self.gradInput = input:clone():zero()
   return self.gradInput
end


