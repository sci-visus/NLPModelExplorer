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
    def __init__(self, data, wordVec, model, encoder="proj", attention="local",
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
        opt.data = data
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

        #evaluate

        shared = Holder()
    	embeddings = WordVecLookup(opt)
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
        print data
    	acc, loss = evaluate(opt, shared, embeddings, pipeline, data)
    	print('Val: {0:.4f}, Loss: {0:.4f}'.format(acc, loss))

    #evaluate model
    def predict(sentencePair):
        p = [0.1, 0.3, 0.6]
        pred = dict()
        pred["entail"] = p[0]
        pred["neutral"] = p[1]
        pred["contradict"] = p[2]
        return pred
