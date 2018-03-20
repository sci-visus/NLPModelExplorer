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
from util import *
from backward_hooks import *
from embeddings import *



parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.ArgumentDefaultsHelpFormatter)
print type(parser)
# parser.add_argument('--res', help="Path to resource files, separated by comma.", default="")
parser.add_argument('--load_file', help="Path from where model to be loaded.", default="model")

## pipeline specs
parser.add_argument('--encoder', help="The type of encoder", default="proj")
parser.add_argument('--attention', help="The type of attention", default="local")
parser.add_argument('--classifier', help="The type of classifier", default="local")
parser.add_argument('--hidden_size', help="The hidden size of the pipeline", type=int, default=200)
parser.add_argument('--word_vec_size', help="The input word embedding dim", type=int, default=300)
parser.add_argument('--num_labels', help="The number of prediction labels", type=int, default=3)
parser.add_argument('--dropout', help="The dropout probability", type=float, default=0.0)
parser.add_argument('--learning_rate', help="The learning rate for training", type=float, default=0.05)
parser.add_argument('--word_vecs', help="The path to word embeddings", default = "")
parser.add_argument('--fix_word_vecs', help="Whether to make word embeddings NOT learnable", type=int, default=1)
parser.add_argument('--seed', help="The random seed", type=int, default=3435)
parser.add_argument('--gpuid', help="The GPU index, if -1 then use CPU", type=int, default=-1)
parser.add_argument('--customize_att', help="Whether to use customized att values instead of computed ones", type=int, default=0)
parser.add_argument('--zero_out_encoder', help="Whether to zero out the gradient of encoder layers before update", type=int, default=0)
parser.add_argument('--zero_out_attention', help="Whether to zero out the gradient of attention layers before update", type=int, default=0)
parser.add_argument('--zero_out_classifier', help="Whether to zero out the gradient of classifier layers before update", type=int, default=0)

def pick_label(dist):
	return np.argmax(dist, axis=1)

# This function will run one epoch of training given a batch of examples
# 	updates will be made to model m
# To overfit to the batch, might need to run multiple epochs (call it multiple times)
# wv is the word vector library (Embedding)
# m is the model, will be modified during overfitting
# ex is the pack of information for the batch of examples
#	i.e. data[i] in train.py or eval.py
def overfit_to_ex(opt, shared, wv, optim, m, ex):
	m.train(True)
	if opt.dropout != 0.0:
		print('dropout should be 0 during overfitting.')

	total_loss = 0.0
	num_sents = 0
	num_correct = 0
	# loss function
	criterion = torch.nn.NLLLoss(size_average=False)
	if opt.gpuid != -1:
		criterion = criterion.cuda()

	# number of batches
	source, target, batch_ex_idx, batch_l, source_l, target_l, y_gold = ex
	wv_idx1 = Variable(source, requires_grad=False)
	wv_idx2 = Variable(target, requires_grad=False)
	y_gold = Variable(y_gold, requires_grad=False)

	# lookup word vecs
	word_vecs1 = wv(wv_idx1)
	word_vecs2 = wv(wv_idx2)

	# update network parameters
	m.update_context(batch_ex_idx, batch_l, source_l, target_l)

	y_dist = m.forward(word_vecs1, word_vecs2)

	loss = criterion(y_dist, y_gold)

	# register hooks
	# 	the variable name must be recorded in shared holder
	#	then after backward pass, the gradient of the specified variable name will be recorded in shared
	# e.g. retain_grad(shared, 'att_soft1')
	#	then after backward pass, shared.att_soft1.grad will has its gradient
	retain_grad(shared, 'att_soft1')
	retain_grad(shared, 'att1')

	# zero out previous gradient and do backward pass
	m.zero_grad()
	loss.backward()
	print loss

	# zero out some gradients before update
	if opt.zero_out_encoder == 1:
		m.encoder.zero_grad()
	if opt.zero_out_attention == 1:
		m.attention.zero_grad()
	if opt.zero_out_classifier == 1:
		m.classifier.zero_grad()

	# update
	optim.step(shared)
	total_loss = loss.data[0]
	# print "total_loss", total_loss
	y_dist = m.forward(word_vecs1, word_vecs2)
	# return the updated model, and y prediction (probabilities)
	return m, y_dist.data.exp()



def main(args):
	opt = parser.parse_args(args)
	print opt, type(opt)
	shared = Holder()

	torch.manual_seed(opt.seed)
	if opt.gpuid != -1:
		torch.cuda.set_device(opt.gpuid)
		torch.cuda.manual_seed_all(opt.seed)

	# build model
	embeddings = WordVecLookup(opt)
	pipeline = Pipeline(opt, shared)

	# initialize
	print('initializing model from {0}'.format(opt.load_file))
	param_dict = load_param_dict('{0}.hdf5'.format(opt.load_file))
	pipeline.set_param_dict(param_dict)
	optim = Adagrad(pipeline, opt)
	if opt.gpuid != -1:
		embeddings.cuda()
		pipeline = pipeline.cuda()
		optim.cuda()

	# loading data
	# res_files = None if opt.res == '' else opt.res.split(',')


	################### some options
	#opt.zero_out_encoder = 1
	#opt.zero_out_attention = 1
	#opt.zero_out_classifier = 1

	# fake some input
	batch_l = 1
	sent_l1 = 11
	sent_l2 = 16
	src = [2, 26541, 38507, 38122, 32686, 33083, 32090, 20493, 6051, 12375, 392]
	targ = [2, 13579, 7067, 38122, 35529, 4917, 33083, 32090, 20493, 6051, 12375, 38981, 34394, 33186, 5546, 392]
	batch_ex_idx = None
	source = torch.LongTensor(src).view(1, sent_l1)
	target = torch.LongTensor(targ).view(1, sent_l2)
	y_gold = torch.LongTensor([0])
	ex = (source, target, batch_ex_idx, batch_l, sent_l1, sent_l2, y_gold)

	m, y = overfit_to_ex(opt, shared, embeddings, optim, pipeline, ex)
	print(y)
	# print(shared.att_soft1.grad)
	# m, y = overfit_to_ex(opt, shared, embeddings, optim, pipeline, ex)
	# print(y)
	# print(shared.att_soft1.grad)



if __name__ == '__main__':
	sys.exit(main(sys.argv[1:]))
