
class bidafModelInterface:
    def __init__(self, wordVec, model):
        opt = argparse.Namespace()
        opt.gpuid = -1
        opt.word_vec_size=300
        opt.word_vecs=wordVec

        shared = Holder()

        if opt.gpuid != -1:
            torch.cuda.set_device(opt.gpuid)

        # build model
        m = Pipeline(opt, shared)

        # initialization
        print('loading pretrained model from {0}...'.format(opt.load_file))
        param_dict = load_param_dict('{0}.hdf5'.format(opt.load_file))
        m.set_param_dict(param_dict)

        model_parameters = filter(lambda p: p.requires_grad, m.parameters())
        num_params = sum([np.prod(p.size()) for p in model_parameters])
        print('total number of trainable parameters: {0}'.format(num_params))

        if opt.gpuid != -1:
            m = m.cuda()

    def predict(self):
        wv_idx1 = Variable(source, requires_grad=False)
        wv_idx2 = Variable(target, requires_grad=False)
        y_gold = Variable(label, requires_grad=False)
        # set resources, TODO

        # update network parameters
        m.update_context(batch_ex_idx, batch_l, source_l, target_l, res_map, raw)

        # forward pass
        log_p1, log_p2 = m.forward(wv_idx1, wv_idx2)

        # loss
        crit1 = torch.nn.NLLLoss(size_average=False)
        crit2 = torch.nn.NLLLoss(size_average=False)
        if opt.gpuid != -1:
            crit1 = crit1.cuda()
            crit2 = crit2.cuda()
        loss1 = crit1(log_p1, y_gold[:,0])    # loss on start idx
        loss2 = crit2(log_p2, y_gold[:,1])    # loss on end idx
        loss = (loss1 + loss2) / batch_l
    # loading data
    # data = Data(opt, opt.data)
    # acc1, acc2, avg_loss = evaluate(opt, shared, m, data)
