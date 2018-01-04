function make_proj_encoder(opt, input_size, hidden_size, num_labels, dropout)
   local sent_l1 = 5 -- sent_l1, sent_l2, and batch_l are default values that will change 
   local sent_l2 = 10
   local batch_l = 1
   local inputs = {}
   table.insert(inputs, nn.Identity()())
   table.insert(inputs, nn.Identity()())
   local input1 = inputs[1] -- batch_l x sent_l1 x input_size
   local input2 = inputs[2] --batch_l x sent_l2 x input_size
   
   local proj1 = nn.Linear(input_size, hidden_size, false)
   local proj2 = nn.Linear(input_size, hidden_size, false)
   proj1.name = 'proj1'
   proj2.name = 'proj2'
   local input1_proj_view = nn.View(batch_l*sent_l1, input_size)
   local input2_proj_view = nn.View(batch_l*sent_l2, input_size)
   local input1_proj_unview = nn.View(batch_l, sent_l1, hidden_size)
   local input2_proj_unview = nn.View(batch_l, sent_l2, hidden_size)   
   input1_proj_view.name = 'input1_proj_view'
   input2_proj_view.name = 'input2_proj_view'
   input1_proj_unview.name = 'input1_proj_unview'
   input2_proj_unview.name = 'input2_proj_unview'

   shared.inputs = inputs
   shared.input1_enc = input1_proj_unview(proj1(input1_proj_view(input1))) 
   shared.input2_enc = input2_proj_unview(proj2(input2_proj_view(input2)))  

   --return shared
end

function init_param_proj_encoder(opt, layers, loaded_layers)
   layers.proj1.weight:copy(loaded_layers.proj1.weight)
   --layers.proj1.bias:copy(loaded_layers.proj1.bias)
   layers.proj2.weight:copy(loaded_layers.proj2.weight)
   --layers.proj2.bias:copy(loaded_layers.proj2.bias)
end

function set_size_to_proj_encoder(opt, batch_ex_idx, batch_l, sent_l1, sent_l2, input_size, hidden_size, t)
   t.input1_proj_view.size[1] = batch_l*sent_l1
   t.input1_proj_view.numElements = batch_l*sent_l1*input_size
   t.input2_proj_view.size[1] = batch_l*sent_l2
   t.input2_proj_view.numElements = batch_l*sent_l2*input_size 

   t.input1_proj_unview.size[1] = batch_l
   t.input1_proj_unview.size[2] = sent_l1
   t.input1_proj_unview.numElements = batch_l*sent_l1*hidden_size
   t.input2_proj_unview.size[1] = batch_l
   t.input2_proj_unview.size[2] = sent_l2
   t.input2_proj_unview.numElements = batch_l*sent_l2*hidden_size
end

function share_param_proj_encoder(opt, layers, what_to_share)
   if what_to_share == 'param' then
      layers.proj2.weight:copy(layers.proj1.weight)
   elseif what_to_share == 'gParam' then
      layers.proj1.gradWeight:add(layers.proj2.gradWeight)
      layers.proj2.gradWeight:zero()
   else
      assert(false, 'what_to_share: ' .. what_to_share .. ' unrecognized.')
   end
end