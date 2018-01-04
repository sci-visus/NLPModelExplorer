function make_lstm_encoder(opt, input_size, hidden_size, num_labels, dropout)
   local inputs = {}
   table.insert(inputs, nn.Identity()())
   table.insert(inputs, nn.Identity()())
   local input1 = inputs[1] -- batch_l x sent_l1 x input_size
   local input2 = inputs[2] --batch_l x sent_l2 x input_size

   -- transpose the input tensor to fit the input format for Sequencer
   --    basically taking the horizontal slices as vertical slices
   --    to produce tensor of sent1_l1 x batch_l x input_size
   local trans1 = nn.Transpose({1,2})
   local trans2 = nn.Transpose({1,2})

   -- single directional lstm encoder
   local lstm1 = nn.Sequential()
   local lstm2 = nn.Sequential()
   lstm1:add(nn.Sequencer(nn.Dropout(dropout)))
   lstm1:add(nn.Sequencer(nn.FastLSTM(input_size, hidden_size)))
   lstm2:add(nn.Sequencer(nn.Dropout(dropout)))
   if opt.share_params == 1 then
      lstm2:add(lstm1.modules[2]:sharedClone(true))
   else
      lstm2:add(nn.Sequencer(nn.FastLSTM(input_size, hidden_size)))
   end
   lstm1.name = 'lstm1'
   lstm2.name = 'lstm2'

   -- transpose the encoding back to original layout
   --    again swapping dimension 1 and 2 to produce tensor of batch_l x sent_l1 x input_size
   local untrans1 = nn.Transpose({1,2})
   local untrans2 = nn.Transpose({1,2})

   -- wrap up into shared
   shared.inputs = inputs
   shared.input1_enc = untrans1(lstm1(trans1(input1)))
   shared.input2_enc = untrans2(lstm2(trans2(input2)))

   --return shared
end

function init_param_lstm_encoder(opt, layers, loaded_layers)
   assert(false, "init_param_lstm_encoder is not yet implemented")
end

function set_size_to_lstm_encoder(opt, batch_ex_idx, batch_l, sent_l1, sent_l2, input_size, hidden_size, t)
   -- nothing to set to 
end

function share_param_lstm_encoder(opt, layers, what_to_share)
   -- nothing to handle here as FastLSTM.sharedClone() already did it
end


