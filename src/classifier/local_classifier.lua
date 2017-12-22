function make_local_classifier(opt, input_size, hidden_size, num_labels, dropout)
   local sent_l1 = 5 -- sent_l1, sent_l2, and batch_l are default values that will change 
   local sent_l2 = 10
   local batch_l = 1
   local size = hidden_size    

   local input2_soft = nn.MM()({shared.att_soft1, shared.input2_enc}) -- batch_l x sent_l1 x input_size
   local input1_soft = nn.MM()({shared.att_soft2, shared.input1_enc}) -- batch_l x sent_l2 x input_size

   local input1_combined = nn.JoinTable(3)({shared.input1_enc, input2_soft}) -- batch_l x sent_l1 x input_size*2
   local input2_combined = nn.JoinTable(3)({shared.input2_enc, input1_soft}) -- batch_l x sent_l2 x input_size*2
   local new_size = size*2
   local input1_combined_view = nn.View(batch_l*sent_l1, new_size)
   local input2_combined_view = nn.View(batch_l*sent_l2, new_size)
   local input1_combined_unview = nn.View(batch_l, sent_l1, hidden_size)
   local input2_combined_unview = nn.View(batch_l, sent_l2, hidden_size)
   input1_combined_view.name = 'input1_combined_view'
   input2_combined_view.name = 'input2_combined_view'
   input1_combined_unview.name = 'input1_combined_unview'
   input2_combined_unview.name = 'input2_combined_unview'

   local g1 = nn.Sequential()
   g1:add(nn.Dropout(dropout))   
   g1:add(nn.Linear(new_size, hidden_size))
   g1:add(nn.ReLU())
   g1:add(nn.Dropout(dropout))      
   g1:add(nn.Linear(hidden_size, hidden_size))
   g1:add(nn.ReLU())
   g1.name = 'g1'
   local g2 = nn.Sequential()
   g2:add(nn.Dropout(dropout))
   g2:add(nn.Linear(new_size, hidden_size))
   g2:add(nn.ReLU())
   g2:add(nn.Dropout(dropout))         
   g2:add(nn.Linear(hidden_size, hidden_size))
   g2:add(nn.ReLU())
   g2.name = 'g2'
   local input1_output = input1_combined_unview(g1(input1_combined_view(input1_combined)))
   local input2_output = input2_combined_unview(g2(input2_combined_view(input2_combined)))
   input1_output = nn.Sum(2)(input1_output) -- batch_l x hidden_size
   input2_output = nn.Sum(2)(input2_output) -- batch_l x hidden_size     
   local new_size = hidden_size*2
   
   local join_layer = nn.JoinTable(2)
   local input12_combined = join_layer({input1_output, input2_output})
   join_layer.name = 'join'
   local out_layer = nn.Sequential()
   out_layer:add(nn.Dropout(dropout))
   out_layer:add(nn.Linear(new_size, hidden_size))
   out_layer:add(nn.ReLU())
   out_layer:add(nn.Dropout(dropout))
   out_layer:add(nn.Linear(hidden_size, hidden_size))
   out_layer:add(nn.ReLU())
   out_layer:add(nn.Linear(hidden_size, num_labels))
   out_layer:add(nn.LogSoftMax())
   out_layer.name = 'out_layer'
   
   shared.out = out_layer(input12_combined)

   return {shared.out}
end

function init_param_local_classifier(opt, layers, loaded_layers)
   local layer_ids = {2, 5}
   local out_layer_ids = {2, 5, 7}

   for i,layer in pairs(layer_ids) do
      layers.g1.modules[layer].weight:copy(loaded_layers.g1.modules[layer].weight)
      layers.g2.modules[layer].weight:copy(loaded_layers.g2.modules[layer].weight)
      layers.g1.modules[layer].bias:copy(loaded_layers.g1.modules[layer].bias)
      layers.g2.modules[layer].bias:copy(loaded_layers.g2.modules[layer].bias)
   end

   for i,layer in pairs(out_layer_ids) do
      layers.out_layer.modules[layer].weight:copy(loaded_layers.out_layer.modules[layer].weight)
      layers.out_layer.modules[layer].bias:copy(loaded_layers.out_layer.modules[layer].bias)
   end
end

function share_param_local_classifier(opt, layers, what_to_share)
   local layer_ids = {2, 5}

   if what_to_share == 'param' then
      for i,layer in pairs(layer_ids) do
         layers.g2.modules[layer].weight:copy(layers.g1.modules[layer].weight)
         layers.g2.modules[layer].bias:copy(layers.g1.modules[layer].bias)
      end
   elseif what_to_share == 'gParam' then
      for i,layer in pairs(layer_ids) do
         layers.g1.modules[layer].gradWeight:add(layers.g2.modules[layer].gradWeight)
         layers.g1.modules[layer].gradBias:add(layers.g2.modules[layer].gradBias)
         layers.g2.modules[layer].gradWeight:zero()
         layers.g2.modules[layer].gradBias:zero()
      end
   else
      assert(false, 'what_to_share: ' .. tostring(what_to_share) .. ' unrecognized.')
   end
end

function set_size_to_local_classifier(opt, batch_ex_idx, batch_l, sent_l1, sent_l2, input_size, hidden_size, t)
   t.input1_combined_view.size[1] = batch_l*sent_l1
   t.input1_combined_view.numElements = batch_l*sent_l1*2*hidden_size
   t.input2_combined_view.size[1] = batch_l*sent_l2
   t.input2_combined_view.numElements = batch_l*sent_l2*2*hidden_size     

   t.input1_combined_unview.size[1] = batch_l
   t.input1_combined_unview.size[2] = sent_l1
   t.input1_combined_unview.numElements = batch_l*sent_l1*hidden_size
   t.input2_combined_unview.size[1] = batch_l
   t.input2_combined_unview.size[2] = sent_l2
   t.input2_combined_unview.numElements = batch_l*sent_l2*hidden_size
end