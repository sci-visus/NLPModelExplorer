'''
python eval.py --gpuid -1 --data ../data/snli_1.0-val.hdf5
 --word_vecs ../data/glove.hdf5 --encoder proj
 --attention local --classifier local
 --dropout 0.0
 --load_file local_200_parikh
'''

import sys
sys.path.insert(0, '../')
from pipeline import *
import argparse
import h5py
import os
import random
import time
import numpy as np
import torch
from torch.autograd import Variable
from torch import nn
from torch import cuda
from holder import *
from optimizer import *
from embeddings import *
from data import *
from forward_hooks import *
from backward_hooks import *
from util import *
from eval import pick_label, evaluate
from itertools import izip
from overfit_to_ex import overfit_to_ex


class modelInterface:
    #setup model
    def __init__(self, wordDict, wordVec, model, encoder="proj", attention="local",
                classifier="local", dropout=0.0):
        # import argparse
        # build model
        '''
            Namespace(att_output='',
            attention='local',
            classifier='local',
            constr='',
            data='../data/snli_1.0/snli_1.0-val.hdf5',
            dropout=0.0,
            encoder='proj',
            fix_word_vecs=1,
            forward_hooks='',

            gpuid=-1,
            hidden_size=200,
            load_file='../data/snli_1.0/local_200_parikh.hdf5',
            num_att_labels=1,
            num_labels=3,
            seed=3435,
            word_vec_size=300,
            word_vecs='../data/glove.hdf5')
        '''
        opt = argparse.Namespace()
        # opt.att_output=''
        opt.attention=attention
        opt.classifier=classifier
        # opt.constr=''
        # opt.data = '../data/snli_1.0/snli_1.0-val.hdf5' #validation dataset
        opt.dropout = dropout
        opt.encoder = encoder
        opt.fix_word_vecs=1
        # opt.forward_hooks = ""

        opt.gpuid=-1
        opt.hidden_size=200
        opt.load_file=model
        # opt.num_att_labels=1
        opt.num_labels=3
        opt.seed=3435
        opt.word_vec_size=300
        opt.word_vecs=wordVec

        #for MIRA optimization
        opt.learning_rate = 0.02
        opt.zero_out_encoder = 0
        opt.zero_out_attention = 0
        opt.zero_out_classifier = 0

        ##### whether or not using raw attention #####
        opt.customize_att = 0
        self.opt = opt
        print opt, type(opt)

        #read the wordDict
        self.tokenMap = {}
        with open(wordDict, 'r+') as f:
            lines = f.readlines()
            for l in lines:
                toks = l.split(" ")
                self.tokenMap[toks[0]] = int(toks[1])-1

        self.shared = Holder()

        torch.manual_seed(self.opt.seed)
        if opt.gpuid != -1:
            torch.cuda.set_device(self.opt.gpuid)
            torch.cuda.manual_seed_all(self.opt.seed)

        #evaluate
        self.embeddings = WordVecLookup(self.opt)
        self.pipeline = Pipeline(self.opt, self.shared)

        # initialize
        print('initializing model from {0}'.format(self.opt.load_file))
        param_dict = load_param_dict('{0}.hdf5'.format(self.opt.load_file))
        self.pipeline.set_param_dict(param_dict)

        self.optim = Adagrad(self.pipeline, self.opt)

        # instead of directly using the pretrained model, copy parameters into a fresh new model
        #	this allows post-training customization
        # print('initializing from pretrained model, might have warnings if code has been changed...')
        # self.pipeline.init_weight_from(pretrained)

        if opt.gpuid != -1:
            self.embeddings.cuda()
            self.pipeline = self.pipeline.cuda()
            self.optim = self.optim.cuda()


    def mapToToken(self, sentence):
        tokenList = [self.tokenMap["<s>"]]
        sentence = sentence.rstrip().split(" ")
        for word in sentence:
            if word in self.tokenMap.keys():
                tokenList.append(self.tokenMap[word])
            else:
                tokenList.append(self.tokenMap["<unk>"])
        #1XN array
        # tokenList.append(self.tokenMap["<s>"])
        # print tokenList
        token = torch.LongTensor(tokenList).view(1, len(tokenList))
        # print token
        return token

    #evaluate model

    def evaluateTestData(self, srcName, targName, groundTruthName):
        #load src, targ file
                # loading data
        data = Data(self.opt, self.opt.data)
        acc, loss, predictionValue, groundTruthlabel = evaluate(self.opt, self.shared, self.embeddings, self.pipeline, data)
        # print('Val: {0:.4f}, Loss: {0:.4f}'.format(acc, loss))

        # predLabel = []
        i = 0
        with open(srcName) as src, open(targName) as targ, open(groundTruthName) as label:
            for ssen, tsen, predLabel in izip(src, targ, label):
                # print ssen, tsen, predLabel
                # predLabel.append(label)
                print groundTruthlabel[i], np.argmax(np.array(predictionValue[i])), predLabel
                i += 1


    def batchPredict(self, sentencePairs):

        #convert sentence to batchFormat
        for pair in sentencePairs:
            source = self.mapToToken(pair[0])
            target = self.mapToToken(pair[1])


    def predict(self, sentencePair):
        #map to token
        sourceSen = sentencePair[0]
        targetSen = sentencePair[1]
        source = self.mapToToken(sourceSen)
        target = self.mapToToken(targetSen)

        wv_idx1 = Variable(source, requires_grad=False)
        wv_idx2 = Variable(target, requires_grad=False)
        # Variable(torch.from_numpy(indices).cuda(), requires_grad=False)

        word_vecs1 = self.embeddings(wv_idx1)
        word_vecs2 = self.embeddings(wv_idx2)

        # update network parameters
        # print source.shape[1], target.shape[1]
        self.pipeline.update_context([0], 1, source.shape[1], target.shape[1])

        y_dist = self.pipeline.forward(word_vecs1, word_vecs2)

        p = y_dist.exp()
        # print "prediction result:", p
        # pred = dict()
        pred = p.data.numpy()
        # pred["entail"] = p[0]
        # pred["neutral"] = p[1]
        # pred["contradict"] = p[2]
        return pred

    def attention(self, att_name="att_soft1"):
        #get the current attention, this seems to be reading attention from file
        batch_att = getattr(self.shared, att_name)
        print self.shared.keys()
        print "get attention: ", att_name
        # print('printing {0} for {1} examples...'.format(att_name, self.shared.batch_l))
        # for i in xrange(self.shared.batch_l):
        #     ex_id = self.shared.batch_ex_idx[i]
        #remove the attention corresponds to <s>
        att = batch_att.data[0, 1:, 1:]
        att = att.numpy()
        print "attention range:", att.min(), att.max()
        # att = att/att.max()
        return att

    ############ pipeline update ################

    '''
        update pipeline based on user assigned new prediction
    '''
    def updatePrediction(self, sentences, newLabel, interation=1, encoderFlag=True, attFlag=True, classFlag=True):

        self.opt.zero_out_encoder = 0 if encoderFlag else 1
        self.opt.zero_out_attention = 0 if attFlag else 1
        self.opt.zero_out_classifier = 0 if classFlag else 1
        y_gold = torch.LongTensor([newLabel])
        # print "y_gold", y_gold

        #map to token
        sourceSen = sentences[0]
        targetSen = sentences[1]
        source = self.mapToToken(sourceSen)
        target = self.mapToToken(targetSen)

        # print source, target
        # Variable(torch.from_numpy(indices).cuda(), requires_grad=False)
        sent_l1 = source.shape[1]
        sent_l2 = target.shape[1]

        ex = (source, target, None, 1, sent_l1, sent_l2, y_gold)
        # print ex
        for i in range(interation):
            m, y = overfit_to_ex(self.opt, self.shared, self.embeddings, self.optim, self.pipeline, ex)
            print y
        # m, y = overfit_to_ex(self.opt, self.shared, self.embeddings, self.optim, self.pipeline, ex)
        # print y
        # m, y = overfit_to_ex(self.opt, self.shared, self.embeddings, self.optim, self.pipeline, ex)
        # print y
        print 'att_soft1', self.shared.att_soft1.data[0, 1:, 1:].numpy()
        return "att", y.numpy()[0]

    def updateAttention(self, sentencePair, attMatrix):
        #map to token
        sourceSen = sentencePair[0]
        targetSen = sentencePair[1]
        source = self.mapToToken(sourceSen)
        target = self.mapToToken(targetSen)

        wv_idx1 = Variable(source, requires_grad=False)
        wv_idx2 = Variable(target, requires_grad=False)
        # Variable(torch.from_numpy(indices).cuda(), requires_grad=False)

        word_vecs1 = self.embeddings(wv_idx1)
        word_vecs2 = self.embeddings(wv_idx2)

        ####### set the flag ############
        self.opt.customized = 1
        # self.pipeline = Pipeline(self.opt, self.shared)
        self.shared.customized_att1 = torch.Tensor(attMatrix)
        # print self.shared.customized_att1
        self.shared.customized_att2 = torch.Tensor(attMatrix).transpose(1,2).contiguous()

        # print source.shape[1], target.shape[1]
        self.pipeline.update_context([0], 1, source.shape[1], target.shape[1])

        y_dist = self.pipeline.forward(word_vecs1, word_vecs2)

        p = y_dist.exp()
        # print "prediction result:", p
        # pred = dict()
        pred = p.data.numpy()

        ####### restore the flag ########
        self.opt.customized = 0
        # self.pipeline = Pipeline(self.opt, self.shared)
        return pred




    ################ helper #################
    '''
     y_gold value 0,1,2 represent correct label
    '''

    # def overfit_to_ex(self, optim, word_vecs1, word_vecs2, sent_l1, sent_l2, y_gold):
    #     opt = self.opt
    #     shared = self.shared
    #
    #     self.pipeline.train(True)
    #
    #     if opt.dropout != 0.0:
    #         print('dropout should be 0 during overfitting.')
    #
    #     total_loss = 0.0
    #     num_sents = 0
    #     num_correct = 0
    #     # loss function
    #     criterion = torch.nn.NLLLoss(size_average=False)
    #     if opt.gpuid != -1:
    #         criterion = criterion.cuda()
    #
    #     y_gold = Variable(y_gold, requires_grad=False)
    #
    #     # update network parameters
    #     self.pipeline.update_context(None, 1, sent_l1, sent_l2)
    #
    #     y_dist = self.pipeline.forward(word_vecs1, word_vecs2)
    #     # print y_dist, y_gold
    #     loss = criterion(y_dist, y_gold)
    #
    #
    #     # retain_grad(shared, 'score1')
    #     retain_grad(shared, 'att_soft1')
    #
    #     # zero out previous gradient and do backward pass
    #     self.pipeline.zero_grad()
    #     loss.backward()
    #
    #     # zero out some gradients before update
    #     if opt.zero_out_encoder == 1:
    #         self.pipeline.encoder.zero_grad()
    #     if opt.zero_out_attention == 1:
    #         self.pipeline.attention.zero_grad()
    #     if opt.zero_out_classifier == 1:
    #         self.pipeline.classifier.zero_grad()
    #
    #     # update
    #     optim.step(shared)
    #
    #     total_loss = loss.data[0]
    #     # print "total_loss", total_loss
    #
    #     batch_att = shared.att_soft1;
    #     att = batch_att.data[0, 1:, 1:]
    #     att = att.numpy()
    #     # print "attention range:", att.min(), att.max()
    #
    #     #using new model to prediction
    #     # y_dist = m.forward(word_vecs1, word_vecs2)
    #     # return the updated model, and y prediction (probabilities)
    #     return self.pipeline, y_dist.data.exp()
    #     ###### help function
