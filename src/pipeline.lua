-- shared variables among pipeline phases
shared = {}

function make_pipeline(opt, input_size, hidden_size, num_labels, dropout)
   -- build encoder phase
   if opt.encoder == 'proj' then
      make_proj_encoder(opt, input_size, hidden_size, num_labels, dropout)
   elseif opt.encoder == 'lstm' then
      make_lstm_encoder(opt, input_size, hidden_size, num_labels, dropout)
   else
      assert(false, 'encoder type ' .. opt.encoder .. ' unrecognized.')
   end

   -- build attention phase
   if opt.attention == 'local' then
      make_local_attention(opt, input_size, hidden_size, num_labels, dropout)
   else
      assert(false, 'attention type ' .. opt.attention .. ' unrecognized.')
   end

   -- build entailment classifier phase
   local output

   if opt.classifier == 'local' then
      output = make_local_classifier(opt, input_size, hidden_size, num_labels, dropout)
   else 
      assert(false, 'entailment classifier type ' .. opt.attention .. ' unrecognized.')
   end

   return nn.gModule(shared.inputs, output)
   --return make_sent_encoder(input_size, hidden_size, num_labels, dropout)
end


function init_param_pipeline(opt, layers, loaded_layers)
   -- init encoder phase
   if opt.encoder == 'proj' then
      init_param_proj_encoder(opt, layers, loaded_layers)
   elseif opt.encoder == 'lstm' then
      init_param_lstm_encoder(opt, layers, loaded_layers)
   else
      assert(false, 'encoder type ' .. opt.encoder .. ' unrecognized.')
   end

   -- init attention phase
   if opt.attention == 'local' then
      init_param_local_attention(opt, layers, loaded_layers)
   else
      assert(false, 'attention type ' .. opt.attention .. ' unrecognized.')
   end

   -- init entailment classifier phase
   if opt.classifier == 'local' then
      init_param_local_classifier(opt, layers, loaded_layers)
   else 
      assert(false, 'entailment classifier type ' .. opt.attention .. ' unrecognized.')
   end

end

-- all world knowledge constraints go to here
function set_extra_resources_to_pipeline(res_table)
   shared.res_table = res_table
end


function set_size_to_pipeline(opt, batch_ex_idx, batch_l, sent_l1, sent_l2, input_size, hidden_size, t)
   shared.opt = opt
   shared.batch_ex_idx = batch_ex_idx
   shared.batch_l = batch_l
   shared.sent_l1 = sent_l1
   shared.sent_l2 = sent_l2

   local size_setter
   -- encoder
   if opt.encoder == 'proj' then
      size_setter = set_size_to_proj_encoder
   elseif opt.encoder == 'lstm' then
      size_setter = set_size_to_lstm_encoder
   else
      assert(false, 'encoder type ' .. opt.encoder .. ' unrecognized.')
   end
   size_setter(opt, batch_ex_idx, batch_l, sent_l1, sent_l2, input_size, hidden_size, t)

   -- attention
   if opt.attention == 'local' then
      size_setter = set_size_to_local_attention
   else
      assert(false, 'attention type ' .. opt.attention .. ' unrecognized.')
   end
   size_setter(opt, batch_ex_idx, batch_l, sent_l1, sent_l2, input_size, hidden_size, t)

   -- classifier
   if opt.classifier == 'local' then
      size_setter = set_size_to_local_classifier
   else 
      assert(false, 'entailment classifier type ' .. opt.attention .. ' unrecognized.')
   end
   size_setter(opt, batch_ex_idx, batch_l, sent_l1, sent_l2, input_size, hidden_size, t)
   
   --set_size_encoder(batch_l, sent_l1, sent_l2, input_size, hidden_size, t)
end

function share_param_pipeline(opt, all_layers, what_to_share)

   local sharer
   -- encoder
   if opt.encoder == 'proj' then
      sharer = share_param_proj_encoder
   elseif opt.encoder == 'lstm' then
      sharer = share_param_lstm_encoder
   else
      assert(false, 'encoder type ' .. opt.encoder .. ' unrecognized.')
   end
   sharer(opt, all_layers, what_to_share)

   -- attention
   if opt.attention == 'local' then
      sharer = share_param_local_attention
   else
      assert(false, 'attention type ' .. opt.attention .. ' unrecognized.')
   end
   sharer(opt, all_layers, what_to_share)

   -- classifier
   if opt.classifier == 'local' then
      sharer = share_param_local_classifier
   else 
      assert(false, 'entailment classifier type ' .. opt.attention .. ' unrecognized.')
   end
   sharer(opt, all_layers, what_to_share)
end


function make_loss(opt)
   local loss
   if opt.loss == 'nll' then
      loss = make_nll_loss(opt)
   else
      assert(false, 'loss type ' .. opt.loss .. ' unrecognized.')
   end

   return loss
end

function pick_label(opt, pred_output)
   local label 
   if opt.loss == 'structured_hinge' then -- remainent, TODO kill this
      assert(#pred_output == 2, 'prediction output must be a table of 2 tensors {gold, pred}')
      local _, pred_argmax = pred_output[2]:max(2)
      label = pred_argmax
   elseif opt.loss == 'nll' then
      local _, pred_argmax = pred_output:max(2)
      label = pred_argmax
   else
      assert(false, 'loss type ' .. opt.loss .. ' unrecognized.')
   end

   return label
end


