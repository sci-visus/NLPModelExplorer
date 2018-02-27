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
from util import *
from eval import pick_label, evaluate
from itertools import izip


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
        opt.att_output=''
        opt.attention='local'
        opt.classifier='local'
        opt.constr=''
        opt.data = '../data/snli_1.0/snli_1.0-val.hdf5' #validation dataset
        opt.dropout = dropout
        opt.encoder = encoder
        opt.fix_word_vecs=1
        opt.forward_hooks = ""

        opt.gpuid=-1
        opt.hidden_size=200
        opt.load_file=model
        opt.num_att_labels=1
        opt.num_labels=3
        opt.seed=3435
        opt.word_vec_size=300
        opt.word_vecs=wordVec

        ##### whether or not using raw attention #####
        opt.customize_att = 0

        #read the wordDict
        self.tokenMap = {}
        with open(wordDict, 'r+') as f:
            lines = f.readlines()
            for l in lines:
                toks = l.split(" ")
                self.tokenMap[toks[0]] = int(toks[1])

        #evaluate
        self.shared = Holder()
        embeddings = WordVecLookup(opt)
        self.embeddings = embeddings
        self.pipeline = Pipeline(opt, self.shared)
        # pretrained = torch.load('{0}.pt'.format(opt.load_file))

        # initialize
        print('initializing model from {0}'.format(opt.load_file))
        param_dict = load_param_dict('{0}.hdf5'.format(opt.load_file))
        self.pipeline.set_param_dict(param_dict)

        # instead of directly using the pretrained model, copy parameters into a fresh new model
        #	this allows post-training customization
        # print('initializing from pretrained model, might have warnings if code has been changed...')
        # self.pipeline.init_weight_from(pretrained)

        if opt.gpuid != -1:
            self.embeddings.cuda()
            self.pipeline = self.pipeline.cuda()

        self.opt = opt
        # exit()

    def mapToToken(self, sentence):
        tokenList = []
        sentence = sentence.rstrip().split(" ")
        for word in sentence:
            tokenList.append(self.tokenMap[word.lower()])
        #1XN array
        tokenList.append(self.tokenMap["<s>"])
        # print tokenList
        token = torch.from_numpy(np.asarray(tokenList).reshape(1, len(tokenList)))
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
        return att.numpy()
