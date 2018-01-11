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

parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.ArgumentDefaultsHelpFormatter)

parser.add_argument('--data', help="Path to evaluation data hdf5 file.", default="data/entail-val.hdf5")

parser.add_argument('--load_file', help="Path from where model to be loaded.", default="model")

## pipeline specs
parser.add_argument('--encoder', help="The type of encoder", default="proj")
parser.add_argument('--attention', help="The type of attention", default="local")
parser.add_argument('--classifier', help="The type of classifier", default="local")
parser.add_argument('--hidden_size', help="The hidden size of the pipeline", type=int, default=200)
parser.add_argument('--word_vec_size', help="The input word embedding dim", type=int, default=300)
parser.add_argument('--dropout', help="The dropout probability", type=float, default=0.2)
parser.add_argument('--num_att_labels', help='The number of attention labels', type=int, default=1)
parser.add_argument('--num_labels', help="The number of prediction labels", type=int, default=3)
parser.add_argument('--constr', help="The list of constraints to use in hard attention", default='')
parser.add_argument('--forward_hooks', help="The list of forward hooks to call after forward pass", default='')
parser.add_argument('--att_output', help="The path to where the attention will be output", default='')
parser.add_argument('--word_vecs', help="The path to word embeddings", default = "")
parser.add_argument('--fix_word_vecs', help="Whether to make word embeddings NOT learnable", type=int, default=1)
parser.add_argument('--seed', help="The random seed", type=int, default=3435)
parser.add_argument('--gpuid', help="The GPU index, if -1 then use CPU", type=int, default=-1)

def pick_label(dist):
	return np.argmax(dist, axis=1)

def evaluate(opt, shared, wv, m, data):
	m.train(False)

	total_loss = 0.0
	num_sents = 0
	num_correct = 0
	# loss function
	criterion = torch.nn.NLLLoss(size_average=False)
	if opt.gpuid != -1:
		criterion = criterion.cuda()

	for i in xrange(data.size()):
		data_name, source, target, batch_ex_idx, batch_l, source_l, target_l, label = data[i]

		wv_idx1 = Variable(source, requires_grad=False)
		wv_idx2 = Variable(target, requires_grad=False)
		y_gold = Variable(label, requires_grad=False)
		# set resources, TODO

		# lookup word vecs
		word_vecs1 = wv(wv_idx1)
		word_vecs2 = wv(wv_idx2)

		# update network parameters
		m.update_context(batch_ex_idx, batch_l, source_l, target_l)

		# forward pass
		y_dist = m.forward(word_vecs1, word_vecs2)
		loss = criterion(y_dist, y_gold)
		total_loss += loss.data[0]

		# post-forward callbacks
		run_forward_hooks(opt, shared, m)
			
		# stats
		num_correct += np.equal(pick_label(y_dist.data), label).sum()
		num_sents += batch_l

	acc = float(num_correct) / num_sents
	return acc, total_loss



def main(args):
	opt = parser.parse_args(args)
	shared = Holder()

	torch.manual_seed(opt.seed)
	if opt.gpuid != -1:
		torch.cuda.set_device(opt.gpuid)
		torch.cuda.manual_seed_all(opt.seed)

	# build model
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
	acc, loss = evaluate(opt, shared, embeddings, pipeline, data)
	print('Val: {0:.4f}, Loss: {0:.4f}'.format(acc, loss))


if __name__ == '__main__':
	sys.exit(main(sys.argv[1:]))
