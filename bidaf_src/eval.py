import sys
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
from embeddings import *
from data import *

parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.ArgumentDefaultsHelpFormatter)

parser.add_argument('--data', help="Path to data hdf5 file.", default="data/squad-val.hdf5")
parser.add_argument('--load_file', help="Path from where model to be loaded.", default="")
parser.add_argument('--word_vecs', help="The path to word embeddings", default = "")
parser.add_argument('--dict', help="The path to word dictionary", default = "")
## pipeline specs
parser.add_argument('--word_vec_size', help="The input word embedding dim", type=int, default=300)
parser.add_argument('--hw_hidden_size', help="The hidden size of the highway networks", type=int, default=100)
parser.add_argument('--hidden_size', help="The general hidden size of the pipeline, twice of BIDAF's d", type=int, default=200)
parser.add_argument('--percent', help="The percent of training data to use", type=float, default=1.0)
parser.add_argument('--mu', help="The mu ratio used in EMA", type=float, default=0.999)
parser.add_argument('--dropout', help="The dropout probability", type=float, default=0.0)
# TODO, param_init of uniform dist or normal dist???
parser.add_argument('--fix_word_vecs', help="Whether to make word embeddings NOT learnable", type=int, default=1)
parser.add_argument('--gpuid', help="The GPU index, if -1 then use CPU", type=int, default=-1)
parser.add_argument('--enc_rnn_layer', help="The number of layers of rnn encoder", type=int, default=1)
parser.add_argument('--reenc_rnn_layer', help="The number of layers of rnn reencoder", type=int, default=2)
parser.add_argument('--cls_rnn_layer', help="The number of layers of classifier rnn", type=int, default=1)
parser.add_argument('--birnn', help="Whether to use bidirectional rnn", type=int, default=1)
parser.add_argument('--rnn_type', help="The type of rnn to use (lstm or gru)", default='lstm')
parser.add_argument('--hw_layer', help="The number of highway layers to use", type=int, default=2)

# dist: torch tensor of distribution (batch_l, context_l)
def pick_span(p1, p2):
	start = p1.max(1)[1].unsqueeze(-1)
	end = p2.max(1)[1].unsqueeze(-1)
	return torch.cat([start, end], 1)

# pick the i,j that i <= j
# input torch tensors of distribution (batch_l, context_l)
def pick_constrained_span(p1, p2):
	# product of probabilities in 2d for each example
	mats = p1.cpu().unsqueeze(-1) * p2.cpu().unsqueeze(1)	# (batch_l, context_l, context_l)
	#
	spans = []
	for i in xrange(mats.shape[0]):
		# get the upper triangular matrix
		triu = np.triu(mats[i].numpy())
		# get the max index
		max_idx = np.argmax(triu)
		max_idx = np.unravel_index(max_idx, triu.shape)
		spans.append([max_idx[0], max_idx[1]])
		assert(max_idx[0] <= max_idx[1])

	spans = torch.Tensor(spans).long()	# (batch_l, 2)
	return spans

def pick_idx(p):
	p = p.cpu().numpy()
	return np.argmax(p, axis=1)

def count_correct_idx(pred, gold):
	return np.equal(pred, gold).sum()

# pred: torch tensor of shape (batch_l, 2)
# gold: torch tensor of shape (batch_l, 2)
def get_span_f1(pred, gold):
	pred = pred.cpu()
	gold = gold.cpu()
	gold_start = gold[:,0]
	gold_end = gold[:,1] + 1	# exclusive idx
	pred_start = pred[:,0]
	pred_end = pred[:,1] + 1	# exclusive idx

	start = torch.max(pred_start, gold_start)
	end = torch.min(pred_end, gold_end)

	pred_range = (pred_end - pred_start).float().clamp(min=1.0)
	gold_range = (gold_end - gold_start).float().clamp(min=1.0)
	overlap = (end - start).float().clamp(min=0.0)

	# recall
	rec = overlap / gold_range
	assert((rec > 1.0).sum()==0 and (rec < 0).sum()==0)

	# prec
	prec = overlap / pred_range
	assert((prec > 1.0).sum()==0 and (prec < 0).sum()==0)
	
	# f1
	denom = prec + rec
	denom_mask = (denom == 0.0).float()
	f1 = 2.0 * prec * rec / (denom + denom_mask)
	assert((f1 > 1.0).sum()==0 and (f1 < 0).sum()==0)

	return (prec, rec, f1)


def evaluate(opt, shared, m, data):
	m.train(False)

	total_loss = 0.0
	num_ex = 0
	val_idx1_correct = 0
	val_idx2_correct = 0
	val_span_f1 = 0.0

	m.begin_pass()
	for i in xrange(data.size()):
		data_name, source, target, batch_ex_idx, batch_l, source_l, target_l, label, res_map, raw = data[i]

		wv_idx1 = Variable(source, requires_grad=False)
		wv_idx2 = Variable(target, requires_grad=False)
		y_gold = Variable(label, requires_grad=False)

		# update network parameters
		m.update_context(batch_ex_idx, batch_l, source_l, target_l, res_map, raw)

		# forward pass
		log_p1, log_p2 = m.forward(wv_idx1, wv_idx2)
		crit1 = torch.nn.NLLLoss(size_average=False)
		crit2 = torch.nn.NLLLoss(size_average=False)
		if opt.gpuid != -1:
			crit1 = crit1.cuda()
			crit2 = crit2.cuda()
		loss1 = crit1(log_p1, y_gold[:,0])	# loss on start idx
		loss2 = crit2(log_p2, y_gold[:,1])	# loss on end idx
		loss = (loss1 + loss2) / batch_l

		# stats
		#idx1 = pick_idx(log_p1.data)
		#idx2 = pick_idx(log_p2.data)
		pred_span = pick_constrained_span(log_p1.data.exp(), log_p2.data.exp())
		idx1 = pred_span[:,0]
		idx2 = pred_span[:,1]
		val_idx1_correct += count_correct_idx(idx1, y_gold[:,0].data)
		val_idx2_correct += count_correct_idx(idx2, y_gold[:,1].data)
		span_prec, span_rec, span_f1 = get_span_f1(pred_span, y_gold.data)
		val_span_f1 += span_f1.sum()
		total_loss += loss.data[0] * batch_l
		num_ex += batch_l

	m.end_pass()

	acc1 = float(val_idx1_correct) / num_ex
	acc2 = float(val_idx2_correct) / num_ex
	acc_span = val_span_f1 / num_ex
	avg_loss = total_loss / num_ex

	return (acc1, acc2, acc_span, avg_loss)



def main(args):
	opt = parser.parse_args(args)
	shared = Holder()

	# build model
	m = Pipeline(opt, shared)

	# initialization
	print('loading pretrained model from {0}...'.format(opt.load_file))
	param_dict = load_param_dict('{0}.hdf5'.format(opt.load_file))
	m.set_param_dict(param_dict)
	if opt.gpuid != -1:
		m = m.cuda()

	# loading data
	data = Data(opt, opt.data)
	acc1, acc2, acc_span, avg_loss = evaluate(opt, shared, m, data)
	acc = (acc1 + acc2) / 2.0
	print('Val EM: {0:.4f}/{1:.4f}/{2:.4f}, F1: {3:.4f}, Loss: {4:.4f}'.format(acc1, acc2, acc, acc_span, avg_loss))


if __name__ == '__main__':
	sys.exit(main(sys.argv[1:]))
