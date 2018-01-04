function make_local_attention(opt, input_size, hidden_size, num_labels, dropout)
   local sent_l1 = 5 -- sent_l1, sent_l2, and batch_l are default values that will change 
   local sent_l2 = 10
   local batch_l = 1
   local size = hidden_size    

   local f1 = nn.Sequential()
   f1:add(nn.Dropout(dropout))      
   f1:add(nn.Linear(size, hidden_size))
   f1:add(nn.ReLU())
   f1:add(nn.Dropout(dropout))
   f1:add(nn.Linear(hidden_size, hidden_size))
   f1:add(nn.ReLU())
   f1.name = 'f1'
   local f2 = nn.Sequential()
   f2:add(nn.Dropout(dropout))   
   f2:add(nn.Linear(size, hidden_size))
   f2:add(nn.ReLU())
   f2:add(nn.Dropout(dropout))
   f2:add(nn.Linear(hidden_size, hidden_size))
   f2:add(nn.ReLU())
   f2.name = 'f2'
   local input1_view = nn.View(batch_l*sent_l1, size)
   local input2_view = nn.View(batch_l*sent_l2, size)
   local input1_unview = nn.View(batch_l, sent_l1, hidden_size)
   local input2_unview = nn.View(batch_l, sent_l2, hidden_size)   
   input1_view.name = 'input1_view'
   input2_view.name = 'input2_view'
   input1_unview.name = 'input1_unview'
   input2_unview.name = 'input2_unview'

   local input1_hidden = input1_unview(f1(input1_view(shared.input1_enc)))
   local input2_hidden = input2_unview(f2(input2_view(shared.input2_enc)))
   local scores1 = nn.MM()({input1_hidden,
             nn.Transpose({2,3})(input2_hidden)}) -- batch_l x sent_l1 x sent_l2
   local scores2 = nn.Transpose({2,3})(scores1) -- batch_l x sent_l2 x sent_l1

   local scores1_view = nn.View(batch_l*sent_l1, sent_l2)
   local scores2_view = nn.View(batch_l*sent_l2, sent_l1)
   local scores1_unview = nn.View(batch_l, sent_l1, sent_l2)
   local scores2_unview = nn.View(batch_l, sent_l2, sent_l1)
   scores1_view.name = 'scores1_view'
   scores2_view.name = 'scores2_view'
   scores1_unview.name = 'scores1_unview'
   scores2_unview.name = 'scores2_unview'
  
   if opt.ali_output == '' then
      shared.att_soft1 = scores1_unview(nn.SoftMax()(scores1_view(scores1)))
      shared.att_soft2 = scores2_unview(nn.SoftMax()(scores2_view(scores2)))
   else
      -- add a printing layer if needs printing
      require 'PrintAttention'
      --scores1 = nn.PrintAttention(opt, opt.ali_output .. '_scores')(scores1)
      shared.att_soft1 = nn.PrintAttention(opt, opt.ali_output)(scores1_unview(nn.SoftMax()(scores1_view(scores1))))
      shared.att_soft2 = scores2_unview(nn.SoftMax()(scores2_view(scores2)))
   end
   

   --return shared
end

function init_param_local_attention(opt, layers, loaded_layers)
   local layer_ids = {2, 5}

   for i,layer in pairs(layer_ids) do
      layers.f1.modules[layer].weight:copy(loaded_layers.f1.modules[layer].weight)
      layers.f2.modules[layer].weight:copy(loaded_layers.f2.modules[layer].weight)
      layers.f1.modules[layer].bias:copy(loaded_layers.f1.modules[layer].bias)
      layers.f2.modules[layer].bias:copy(loaded_layers.f2.modules[layer].bias)
   end
end

function share_param_local_attention(opt, layers, what_to_share)
   local layer_ids = {2, 5}

   if what_to_share == 'param' then
      for i,layer in pairs(layer_ids) do
         layers.f2.modules[layer].weight:copy(layers.f1.modules[layer].weight)
         layers.f2.modules[layer].bias:copy(layers.f1.modules[layer].bias)
      end
   elseif what_to_share == 'gParam' then
      for i,layer in pairs(layer_ids) do
         layers.f1.modules[layer].gradWeight:add(layers.f2.modules[layer].gradWeight)
         layers.f1.modules[layer].gradBias:add(layers.f2.modules[layer].gradBias)
         layers.f2.modules[layer].gradWeight:zero()
         layers.f2.modules[layer].gradBias:zero()
      end
   else
      assert(false, 'what_to_share: ' .. tostring(what_to_share) .. ' unrecognized.')
   end
end

function set_size_to_local_attention(opt, batch_ex_idx, batch_l, sent_l1, sent_l2, input_size, hidden_size, t)
   t.input1_view.size[1] = batch_l*sent_l1
   t.input1_view.numElements = batch_l*sent_l1*hidden_size   
   t.input1_unview.size[1] = batch_l
   t.input1_unview.size[2] = sent_l1
   t.input1_unview.numElements = batch_l*sent_l1*hidden_size
   
   t.input2_view.size[1] = batch_l*sent_l2
   t.input2_view.numElements = batch_l*sent_l2*hidden_size
   t.input2_unview.size[1] = batch_l
   t.input2_unview.size[2] = sent_l2
   t.input2_unview.numElements = batch_l*sent_l2*hidden_size     
   
   t.scores1_view.size[1] = batch_l*sent_l1
   t.scores1_view.size[2] = sent_l2
   t.scores1_view.numElements = batch_l*sent_l1*sent_l2
   t.scores2_view.size[1] = batch_l*sent_l2
   t.scores2_view.size[2] = sent_l1
   t.scores2_view.numElements = batch_l*sent_l1*sent_l2

   t.scores1_unview.size[1] = batch_l
   t.scores1_unview.size[2] = sent_l1
   t.scores1_unview.size[3] = sent_l2
   t.scores1_unview.numElements = batch_l*sent_l1*sent_l2
   t.scores2_unview.size[1] = batch_l
   t.scores2_unview.size[2] = sent_l2 
   t.scores2_unview.size[3] = sent_l1  
   t.scores2_unview.numElements = batch_l*sent_l1*sent_l2
end