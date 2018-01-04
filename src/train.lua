require 'nn'
require 'rnn'
require 'nngraph'
require 'hdf5'
require 'data.lua'

require 'encoder/proj_encoder.lua'
require 'encoder/lstm_encoder.lua'
require 'attention/local_attention.lua'
require 'classifier/local_classifier.lua'
require 'loss/nll_loss.lua'
require 'pipeline.lua'
require 'utils.lua'

cmd = torch.CmdLine()

-- data files
cmd:text("")
cmd:text("**Data options**")
cmd:text("")
cmd:option('-data_file','data/entail-train.hdf5', [[Path to the training *.hdf5 file]])
cmd:option('-val_data_file', 'data/entail-val.hdf5', [[Path to validation *.hdf5 file]])
cmd:option('-test_data_file','data/entail-test.hdf5',[[Path to test *.hdf5 file]])

cmd:option('-savefile', 'model', [[Savefile name]])

-- model specs
cmd:option('-hidden_size', 200, [[MLP hidden layer size]])
cmd:option('-word_vec_size', 300, [[Word embedding size]])
cmd:option('-share_params',1, [[Share parameters between the two sentence encoders]])
cmd:option('-dropout', 0.2, [[Dropout probability.]])   

-- pipeline specs
cmd:option('-mode', 'train', '[[Pipeline mode: train, eval or play]]')
cmd:option('-encoder', 'proj', [[Encoder type]])
cmd:option('-attention', 'local', [[Attention type]])
cmd:option('-classifier', 'local', [[Entailment classifier type]])
cmd:option('-loss', 'nll', '[[Loss function type]]')

-- specifics for mode play
cmd:option('-play', '', [[Specifies what to play with]])

-- alignment labels
cmd:option('-ali_labels', 1, [[Number of alignment labels]])
cmd:option('-ali_output', '', [[The path to where alignment to output]])
cmd:option('-output_ali_gradient', false, [[Whether output gradient of alignemnt]])

-- pipeline specs
cmd:option('-is_hard_soft_pretrain', false, [[If this is pretraining for hard_soft pipeline]])
cmd:option('-load_model', '', [[The path to a pretrained model]])
cmd:option('-res_file', '', [[The resource config file for the all data]])
cmd:option('-att_average', false, [[Make sure attention sum up to 1 row-wisely]])
cmd:option('-mix_scores', 'local_softmax', [[How mixed scores are calculated in mixed attention]])
cmd:option('-hard_att_over', 'scores', [[Fromw hat attentions are calculated]])
cmd:option('-no_eval_after_epoch', false, [[Whether to evaluate by the end of epoch]])

-- optimization
cmd:option('-epochs', 100, [[Number of training epochs]])
cmd:option('-param_init', 0.01, [[Parameters are initialized over uniform distribution with support
                               (-param_init, param_init)]])
cmd:option('-optim', 'adagrad', [[Optimization method. Possible options are: 
                              sgd (vanilla SGD), adagrad, adadelta, adam]])
cmd:option('-learning_rate', 0.05, [[Starting learning rate. If adagrad/adadelta/adam is used, 
                                then this is the global learning rate.]])
cmd:option('-pre_word_vecs', 'glove.hdf5', [[If a valid path is specified, then this will load 
                                      pretrained word embeddings (hdf5 file)]])
cmd:option('-fix_word_vecs', 1, [[If = 1, fix word embeddings]])
cmd:option('-max_batch_l', '', [[If blank, then it will infer the max batch size from the
				   data.]])
cmd:option('-gpuid', -1, [[Which gpu to use. -1 = use CPU]])
cmd:option('-print_every', 1000, [[Print stats after this many batches]])
cmd:option('-seed', 3435, [[Seed for random initialization]])

opt = cmd:parse(arg)
torch.manualSeed(opt.seed)

function zero_table(t)
  for i = 1, #t do
    t[i]:zero()
  end
end

-- utility function
function get_layer(layer)
  if layer.name ~= nil then
    all_layers[layer.name] = layer
  end
end

-- initialize modules
function init()
  params, grad_params = {}, {}
  opt.train_perf = {}
  opt.val_perf = {}

  for i = 1, #layers do
    local p, gp = layers[i]:getParameters()
    local rand_vec = torch.randn(p:size(1)):mul(opt.param_init)
    if opt.gpuid >= 0 then
      rand_vec = rand_vec:cuda()
    end  
    p:copy(rand_vec)   
    params[i] = p
    grad_params[i] = gp
  end

  -- init parameters if a loaded model is specified
  if opt.load_model ~= '' then
    local loaded = torch.load(opt.load_model)
    local loaded_layers = {}

    -- record named layers in modules
    for k,v in pairs(loaded[1][3].modules) do
      if v.name ~= nil then
        loaded_layers[v.name] = v
      end
    end

    print("initializing parameters from pretrained model at " .. opt.load_model)
    init_param_pipeline(opt, all_layers, loaded_layers)
  end

  if opt.pre_word_vecs:len() > 0 then
    print("loading pre-trained word vectors")
    local f = hdf5.open(opt.pre_word_vecs)     
    local pre_word_vecs = f:read('word_vecs'):all()
    for i = 1, pre_word_vecs:size(1) do
      word_vecs_enc1.weight[i]:copy(pre_word_vecs[i])
      word_vecs_enc2.weight[i]:copy(pre_word_vecs[i])       
    end
  end

  --copy shared params   
  params[2]:copy(params[1])   
  if opt.share_params == 1 then
    share_param_pipeline(opt, all_layers, 'param')   
  end
  
  -- prototypes for gradients so there is no need to clone
  word_vecs1_grad_proto = torch.zeros(opt.max_batch_l, opt.max_sent_l_src, opt.word_vec_size)
  word_vecs2_grad_proto = torch.zeros(opt.max_batch_l, opt.max_sent_l_targ, opt.word_vec_size)
  
  if opt.gpuid >= 0 then
    cutorch.setDevice(opt.gpuid)                        
    word_vecs1_grad_proto = word_vecs1_grad_proto:cuda()
    word_vecs2_grad_proto = word_vecs2_grad_proto:cuda()
  end
end


-- training pipeline
function train(train_data, valid_data)

  local timer = torch.Timer()
  local start_decay = 0

  function train_batch(data, epoch)
    local train_loss = 0
    local train_sents = 0
    local batch_order = torch.randperm(data.length) -- shuffle mini batch order     
    local start_time = timer:time().real
    local num_words_target = 0
    local num_words_source = 0
    local train_num_correct = 0 
    pipeline:training()
    for i = 1, data:size() do
      zero_table(grad_params, 'zero')
      local d = data[batch_order[i]]
      local target, source, batch_ex_idx, batch_l, target_l, source_l, label, res_table = table.unpack(d)

      set_extra_resources_to_pipeline(res_table)
      
      -- resize the various temporary tensors that are going to hold contexts/grads
      local word_vecs1_grads = word_vecs1_grad_proto[{{1, batch_l}, {1, source_l}}]:zero()
      local word_vecs2_grads = word_vecs2_grad_proto[{{1, batch_l}, {1, target_l}}]:zero()
      local word_vecs1 = word_vecs_enc1:forward(source)
      local word_vecs2 = word_vecs_enc2:forward(target)	 
      set_size_to_pipeline(opt, batch_ex_idx, batch_l, source_l, target_l, opt.word_vec_size, opt.hidden_size, all_layers)
      local pred_input = {word_vecs1, word_vecs2}
      local pred_label = pipeline:forward(pred_input)
      -- local _, pred_argmax = pred_label:max(2)
      local pred_argmax = pick_label(opt, pred_label)
      train_num_correct = train_num_correct + pred_argmax:double():view(batch_l):eq(label:double()):sum()	 
      local loss = disc_criterion:forward(pred_label, label)
      local dl_dp = disc_criterion:backward(pred_label, label)

      -- divide gradients by batch size
      --    in case dl_dp is a table
      if type(dl_dp) == 'table' then
        for i=1,#dl_dp do
          dl_dp[i]:div(batch_l)
        end
      else
        dl_dp:div(batch_l)
      end

      local dl_dinput1, dl_dinput2 = table.unpack(pipeline:backward(pred_input, dl_dp))    
      word_vecs_enc1:backward(source, dl_dinput1)
      word_vecs_enc2:backward(target, dl_dinput2)
      
      if opt.fix_word_vecs == 1 then
	       word_vecs_enc1.gradWeight:zero()
	       word_vecs_enc2.gradWeight:zero()	   
      end
      
      grad_params[1]:add(grad_params[2])
      grad_params[2]:zero()

      if opt.share_params == 1 then
         share_param_pipeline(opt, all_layers, 'gParam')
      end
      
      -- Update params
      for j = 1, #grad_params do
	     if opt.optim == 'adagrad' then
	       adagrad_step(params[j], grad_params[j], layer_etas[j], optStates[j])
	     elseif opt.optim == 'adadelta' then
	       adadelta_step(params[j], grad_params[j], layer_etas[j], optStates[j])
	     elseif opt.optim == 'adam' then
	       adam_step(params[j], grad_params[j], layer_etas[j], optStates[j])	       
	     else
	       params[j]:add(grad_params[j]:mul(-opt.learning_rate))       
	     end
      end	 

      params[2]:copy(params[1])
      if opt.share_params == 1 then
        share_param_pipeline(opt, all_layers, 'param')    
      end
      
      -- Bookkeeping
      num_words_target = num_words_target + batch_l*target_l
      num_words_source = num_words_source + batch_l*source_l
      train_loss = train_loss + loss
      train_sents = train_sents + batch_l
      local time_taken = timer:time().real - start_time
      if i % opt.print_every == 0 then
	      local stats = string.format('Epoch: %d, Batch: %d/%d, Batch size: %d, LR: %.4f, ',
				    epoch, i, data:size(), batch_l, opt.learning_rate)
	      stats = stats .. string.format('Loss: %.4f, Acc: %.4f, ',
				       train_loss/train_sents, train_num_correct/train_sents)
	      stats = stats .. string.format('Training: %d total tokens/sec',
				       (num_words_target+num_words_source) / time_taken)
	      print(stats)
      end
    end
    return train_loss, train_sents, train_num_correct
  end
  local best_val_perf = 0
  local test_perf = 0
  for epoch = 1, opt.epochs do
    local total_loss, total_sents, total_correct = train_batch(train_data, epoch)
    local train_score = total_correct/total_sents
    print('Train', train_score)
    opt.train_perf[#opt.train_perf + 1] = train_score
    if opt.no_eval_after_epoch == false then
      local score = eval(valid_data)
      local savefile = string.format('%s.t7', opt.savefile)            
      if score > best_val_perf then
        best_val_perf = score
        test_perf = eval(test_data)
        print('saving checkpoint to ' .. savefile)
        torch.save(savefile, {layers, opt})	 	 
      end
      opt.val_perf[#opt.val_perf + 1] = score
      print(opt.train_perf)
      print(opt.val_perf)
    else
      print(opt.train_perf)
    end
  end
  print("Best Val", best_val_perf)
  print("Test", test_perf)   
  -- save final model
  local savefile = string.format('%s_final.t7', opt.savefile)
  print('saving final model to ' .. savefile)
  for i = 1, #layers do
    layers[i]:double()
  end   
  torch.save(savefile, {layers, opt})
end

-- evaluation pipeline
function eval(data)
  pipeline:evaluate()
  local total_loss = 0
  local num_sents = 0
  local num_correct = 0
  for i = 1, data:size() do
    local d = data[i]
    local target, source, batch_ex_idx, batch_l, target_l, source_l, label, res_table = table.unpack(d)
    local word_vecs1 = word_vecs_enc1:forward(source) 	 
    local word_vecs2 = word_vecs_enc2:forward(target)
    set_extra_resources_to_pipeline(res_table)
    set_size_to_pipeline(opt, batch_ex_idx, batch_l, source_l, target_l,
		     opt.word_vec_size, opt.hidden_size, all_layers)
    local  pred_input = {word_vecs1, word_vecs2}
    local pred_label = pipeline:forward(pred_input)
    local loss = disc_criterion:forward(pred_label, label)
    --local _, pred_argmax = pred_label:max(2)
    local pred_argmax = pick_label(opt, pred_label)
    num_correct = num_correct + pred_argmax:double():view(batch_l):eq(label:double()):sum()
    num_sents = num_sents + batch_l
    total_loss = total_loss + loss

  end
  local acc = num_correct/num_sents
  print("Acc", acc)
  print("Loss", total_loss / num_sents)
  collectgarbage()
  return acc
end

function main() 
  -- parse input params
  opt = cmd:parse(arg)
  if opt.gpuid >= 0 then
    print('using CUDA on GPU ' .. opt.gpuid .. '...')
    require 'cutorch'
    require 'cunn'
    cutorch.setDevice(opt.gpuid)
    cutorch.manualSeed(opt.seed)      
  end
  
  -- Create the data loader class.
  print('loading data...')

  -- load resource config file first
  all_resources = {}
  if opt.res_file ~= nil and opt.res_file ~= "" then
    local json = require 'rapidjson'
    all_resources = json.load(opt.res_file)
  end

  train_data = data.new(opt, opt.data_file, all_resources.train)   
  valid_data = data.new(opt, opt.val_data_file, all_resources.val)
  test_data = data.new(opt, opt.test_data_file, all_resources.test)
  print('done!')
  print(string.format('Source vocab size: %d, Target vocab size: %d',
		      train_data.source_size, train_data.target_size))   
  opt.max_sent_l_src = train_data.source:size(2)
  opt.max_sent_l_targ = train_data.target:size(2)
  if opt.max_batch_l == '' then
    opt.max_batch_l = train_data.batch_l:max()
  end
  
  print(string.format('Source max sent len: %d, Target max sent len: %d',
		      train_data.source:size(2), train_data.target:size(2)))   
  
  -- Build model
  word_vecs_enc1 = nn.LookupTable(train_data.source_size, opt.word_vec_size)
  word_vecs_enc2 = nn.LookupTable(train_data.target_size, opt.word_vec_size)
  pipeline = make_pipeline(opt, opt.word_vec_size, opt.hidden_size,
				   train_data.label_size, opt.dropout)	 

  disc_criterion = make_loss(opt)
  -- disc_criterion.sizeAverage = false
  layers = {word_vecs_enc1, word_vecs_enc2, pipeline}

  layer_etas = {}
  optStates = {}   
  for i = 1, #layers do
    layer_etas[i] = opt.learning_rate -- can have layer-specific lr, if desired
    optStates[i] = {}
  end
  
  if opt.gpuid >= 0 then
    for i = 1, #layers do	 
      layers[i]:cuda()
    end
    -- disc_criterion:cuda()
  end

  -- these layers will be manipulated during training
  all_layers = {}   
  pipeline:apply(get_layer)

  print('run pipeline mode: ' .. opt.mode)
  init()
  if opt.mode == 'train' then
    train(train_data, valid_data)
  elseif opt.mode == 'eval' then
    eval(valid_data)
  elseif opt.mode == 'test' then
    eval(test_data)
  end
end

main()
