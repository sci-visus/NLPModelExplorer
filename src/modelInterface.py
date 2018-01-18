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
from eval import pick_label, evaluate

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
            data='../data/snli_1.0-val.hdf5',
            dropout=0.0,
            encoder='proj',
            fix_word_vecs=1,
            forward_hooks='',

            gpuid=-1,
            hidden_size=200,
            load_file='local_200_parikh',
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
        opt.data = '../data/snli_1.0-val.hdf5' #validation dataset
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
        self.wordDictName = wordDict
        #read the wordDict

        #evaluate
        shared = Holder()
        embeddings = WordVecLookup(opt)
        self.embeddings = embeddings
        pipeline = Pipeline(opt, shared)
        pretrained = torch.load('{0}.pt'.format(opt.load_file))

        # instead of directly using the pretrained model, copy parameters into a fresh new model
        #	this allows post-training customization
        print('initializing from pretrained model, might have warnings if code has been changed...')
        pipeline.init_weight_from(pretrained)
        if opt.gpuid != -1:
            embeddings.cuda()
            pipeline = pipeline.cuda()

        # loading data
        data = Data(opt, opt.data)
        # print data
        acc, loss = evaluate(opt, shared, embeddings, pipeline, data)
        print('Val: {0:.4f}, Loss: {0:.4f}'.format(acc, loss))
        # exit()

    def mapToToken(self, sentence):
        token = [1,2]
        return token

    #evaluate model
    def predict(self, sentencePair):
        #map to token
        sourceSen = sentencePair[0]
        targetSen = sentencePair[1]
        source = self.mapToToken(sourceSen)
        target = self.mapToToken(targetSen)

        wv_idx1 = Variable(source, requires_grad=False)
        wv_idx2 = Variable(target, requires_grad=False)

        word_vecs1 = embeddings(wv_idx1)
        word_vecs2 = embeddings(wv_idx2)

        y_dist = m.forward(word_vecs1, word_vecs2)
        print "prediction result:", y_dist

        p = np.log(y_dist)
        pred = dict()
        pred["entail"] = p[0]
        pred["neutral"] = p[1]
        pred["contradict"] = p[2]
        return pred
