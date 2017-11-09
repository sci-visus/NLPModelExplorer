--
-- Manages the data matrices
--

local data = torch.class("data")

function data:__init(opt, data_file, res_list)
   local f = hdf5.open(data_file, 'r')
   
   self.opt = opt
   self.source  = f:read('source'):all()
   self.target  = f:read('target'):all()   
   self.target_l = f:read('target_l'):all() --max target length each batch
   self.source_l = f:read('source_l'):all()
   self.label = f:read('label'):all()
   self.batch_l = f:read('batch_l'):all()
   self.batch_idx = f:read('batch_idx'):all()
   self.target_size = f:read('target_size'):all()[1]
   self.source_size = f:read('source_size'):all()[1]
   self.label_size = f:read('label_size'):all()[1]
   self.ex_idx = f:read('ex_idx'):all()
   self.length = self.batch_l:size(1)
   self.seq_length = self.target:size(2) 
   self.batches = {}
   for i = 1, self.length do
      local source_i =  self.source:sub(self.batch_idx[i], self.batch_idx[i]+self.batch_l[i]-1,
				  1, self.source_l[i])
      local target_i = self.target:sub(self.batch_idx[i], self.batch_idx[i]+self.batch_l[i]-1,
				       1, self.target_l[i])
      local label_i = self.label:sub(self.batch_idx[i], self.batch_idx[i] + self.batch_l[i]-1)
      table.insert(self.batches,  {target_i, source_i, self.batch_l[i], self.target_l[i],
				   self.source_l[i], label_i})
   end

   local json = require 'rapidjson'

   -- load synonym file
   if res_list.synonym_file ~= nil and res_list.synonym_file ~= '' then
      print('loading synonym file from '.. res_list.synonym_file)
      self.synonym = json.load(res_list.synonym_file)
      self.synonym = self.synonym['synonym']

      print('optimizing synonym indices...')
      local num_ex = (#(self.ex_idx))[1]
      for i=1,num_ex do
         local ex_synonym = self.synonym[tostring(i)]
         local synonym = ex_synonym.synonym
         for l=1,#synonym do
            local lem = synonym[l]
            local closure = ex_synonym[lem]
            local idx1 = closure[1]
            local idx2 = closure[2]

            for j=1,#idx1 do
               idx1[j] = tonumber(idx1[j]) + 2
            end

            for j=1,#idx2 do
               idx2[j] = tonumber(idx2[j]) + 2
            end
         end
      end
   end

   -- load antonym file
   if res_list.antonym_file ~= nil and res_list.antonym_file ~= '' then
      print('loading antonym file from '.. res_list.antonym_file)
      self.antonym = json.load(res_list.antonym_file)
      self.antonym = self.antonym.antonym

      print('optimizing antonym indices...')
      local num_ex = (#(self.ex_idx))[1]
      for i=1,num_ex do
         local ex_antonym = self.antonym[tostring(i)]
         local antonym = ex_antonym.antonym
         for l=1,#antonym do
            local lem = antonym[l]
            local closure = ex_antonym[lem]
            local idx1 = closure[1]
            local idx2 = closure[2]

            for j=1,#idx1 do
               idx1[j] = tonumber(idx1[j]) + 2
            end

            for j=1,#idx2 do
               idx2[j] = tonumber(idx2[j]) + 2
            end
         end
      end
   end

   -- load content file
   if res_list.content_file ~= nil and res_list.content_file ~= '' then
      print('loading content file from '.. res_list.content_file)
      --local f = io.open(content_file, 'r')
      --local s = f:read("*a")
      self.content = json.load(res_list.content_file)
      self.content = self.content['content_words']
      --f:close()

      print('optimizing content indices...')
      local num_ex = (#(self.ex_idx))[1]
      for i=1,num_ex do
         local ex_content = self.content[tostring(i)]
         local p = ex_content["p"]
         local h = ex_content["h"]
         for j=1,#p do
            p[j] = tonumber(p[j]) + 2
         end

         for j=1,#h do
            h[j] = tonumber(h[j]) + 2
         end
      end
   end

   -- load constraint file
   if res_list.lemma_file ~= nil and res_list.lemma_file ~= '' then
      print('loading constraint file from '.. res_list.lemma_file)
      --local f = io.open(constr_file, 'r')
      --local s = f:read("*a")
      self.constr = json.load(res_list.lemma_file)
      self.constr = self.constr['exclusive_lemmas']
      --f:close()

      -- optimize indices
         -- changing string to integer and incr by 2 (<s> and starting from 1)
      local num_ex = (#(self.ex_idx))[1]
      print('optimizing constraint indices...')
      for i=1,num_ex do
         local ex_constr = self.constr[tostring(i)]
         local lemmas = ex_constr["lemmas"]
         for l=1,#lemmas do
            local lem = lemmas[l]
            local closure = ex_constr[lem]
            local idx1 = closure[1]
            local idx2 = closure[2]

            for j=1,#idx1 do
               idx1[j] = tonumber(idx1[j]) + 2
            end

            for j=1,#idx2 do
               idx2[j] = tonumber(idx2[j]) + 2
            end
         end
      end
   end
end

function data:size()
   return self.length
end

function data.__index(self, idx)
   if type(idx) == "string" then
      return data[idx]
   else
      local target = self.batches[idx][1]
      local source = self.batches[idx][2]      
      local batch_l = self.batches[idx][3]
      local target_l = self.batches[idx][4]
      local source_l = self.batches[idx][5]
      local label = self.batches[idx][6]

      -- get batch ex indices
      local batch_ex_idx = {}
      for i=self.batch_idx[idx],self.batch_idx[idx]+self.batch_l[idx]-1 do
         table.insert(batch_ex_idx, self.ex_idx[i])
      end

      local res_table = {}

      -- get synonym
      res_table.synonym = nil
      if self.synonym ~= nil then
         res_table.synonym = {}
         for i=1,#batch_ex_idx do
            table.insert(res_table.synonym, self.synonym[tostring(batch_ex_idx[i])])
         end
      end

      -- get antonym
      if self.antonym ~= nil then
         res_table.antonym = {}
         for i=1,#batch_ex_idx do
            table.insert(res_table.antonym, self.antonym[tostring(batch_ex_idx[i])])
         end
      end

      -- get lemma constraints
      if self.constr ~= nil then
         res_table.constr = {}
         for i=1,#batch_ex_idx do
            table.insert(res_table.constr, self.constr[tostring(batch_ex_idx[i])])
         end
      end

      if self.content ~= nil then
         res_table.content = {}
         for i=1,#batch_ex_idx do
            table.insert(res_table.content, self.content[tostring(batch_ex_idx[i])])
         end
      end

      if self.opt.gpuid >= 0 then --if multi-gpu, source lives in gpuid1, rest on gpuid2
         source = source:cuda()
         target = target:cuda()
         label = label:cuda()
      end

      -- in play mode, if specified to shuffle label
      if self.opt.play_pipeline == 'y_to_a_update' then
         print('********** play mode: y_to_a_update *********')
         -- basically shift label to the right by 1 column circlically
         label = label:index(2, torch.LongTensor({3,1,2}))
      end

      return {target, source, batch_ex_idx, batch_l, target_l, source_l, label, res_table}
   end
end

return data
