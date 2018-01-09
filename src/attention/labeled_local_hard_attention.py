import sys
sys.path.insert(0, '../')

import torch
from torch import nn
import numpy as np
from view import *
from holder import *
from join_table import *
from argmax import *
from constraint import *
import time

class LabeledLocalHardAttention(torch.nn.Module):
	def __init__(self, opt, shared):
		super(LabeledLocalHardAttention, self).__init__()

		for l in xrange(opt.num_att_labels):
			f_l = nn.Sequential(
				nn.Dropout(opt.dropout),
				nn.Linear(opt.hidden_size, opt.hidden_size),
				nn.ReLU(),
				nn.Dropout(opt.dropout),
				nn.Linear(opt.hidden_size, opt.hidden_size),
				nn.ReLU())
			setattr(self, 'f_l_{0}'.format(l), f_l)
		

		# temp stuff will be changed on the fly
		batch_l = 1
		sent_l1 = 2
		sent_l2 = 3

		self.input_view1 = View(batch_l * sent_l1, opt.hidden_size)
		self.input_view2 = View(batch_l * sent_l2, opt.hidden_size)
		self.input_unview1 = View(batch_l, sent_l1, opt.hidden_size)
		self.input_unview2 = View(batch_l, sent_l2, opt.hidden_size)
		self.score_view1 = View(batch_l * sent_l1, sent_l2 * opt.num_att_labels)
		self.score_view2 = View(batch_l * sent_l2, sent_l1 * opt.num_att_labels)
		self.score_unview1 = View(batch_l, sent_l1, sent_l2 * opt.num_att_labels)
		self.score_unview2 = View(batch_l, sent_l2, sent_l1 * opt.num_att_labels)
		self.softmax = nn.Softmax(1)
		self.score_joiner = JoinTable(2)
		self.att_joiner = JoinTable(2)	# used for att transpose
		self.argmax = Argmax(opt, shared)

		# bookkeeping
		self.opt = opt
		self.shared = shared
		self.dropout = opt.dropout
		self.hidden_size = opt.hidden_size
		self.num_att_labels = opt.num_att_labels

		# get constraint
		self.constr_names = opt.constr.split(',')


	def transpose_att1(self, att):
		chunks = []
		sent_l2 = att.shape[2] / self.num_att_labels
		for l in xrange(self.num_att_labels):
			# get the chunk and transpose it
			chunks.append(att[:, :, l*sent_l2:(l+1)*sent_l2].transpose(1,2))
		return self.att_joiner(chunks)


	def forward(self, sent1, sent2):
		self.update_context()
		labeled_score1 = []
		labeled_score2 = []

		for l in xrange(self.num_att_labels):
			f_l = getattr(self, 'f_l_{0}'.format(l))

			hidden1 = self.input_unview1(f_l(self.input_view1(sent1)))
			hidden2 = self.input_unview2(f_l(self.input_view2(sent2)))
			# score tensors of size batch_l x sent_l1 x sent_l2
			score1 = hidden1.bmm(hidden2.transpose(1,2))
			score2 = score1.transpose(1,2).contiguous()

			labeled_score1.append(score1)
			labeled_score2.append(score2)

		score1 = self.score_joiner(labeled_score1)
		score2 = self.score_joiner(labeled_score2)

		# hard attention
		self.shared.att_hard1 = self.argmax(score1)
		self.shared.att_hard2 = self.transpose_att1(self.shared.att_hard1)

		# masking to block scores and gradient on invalid attention values
		mask1 = Variable(one_to_one_mask(self.opt, score1.shape), requires_grad=False)
		mask2 = self.transpose_att1(mask1)

		# attention
		self.shared.att_soft1 = self.score_unview1(self.softmax(self.score_view1(score1)))
		self.shared.att_soft2 = self.score_unview2(self.softmax(self.score_view2(score2)))

		self.shared.mixed_att1 = self.shared.att_soft1 * self.shared.att_hard1
		self.shared.mixed_att2 = self.shared.att_soft2 * self.shared.att_hard2

		return [self.shared.mixed_att1, self.shared.mixed_att2]


	def update_context(self):
		batch_l = self.shared.batch_l
		sent_l1 = self.shared.sent_l1
		sent_l2 = self.shared.sent_l2
		hidden_size = self.hidden_size
		num_att_labels = self.num_att_labels

		self.input_view1.dims = (batch_l * sent_l1, hidden_size)
		self.input_view2.dims = (batch_l * sent_l2, hidden_size)
		self.input_unview1.dims = (batch_l, sent_l1, hidden_size)
		self.input_unview2.dims = (batch_l, sent_l2, hidden_size)
		self.score_view1.dims = (batch_l * sent_l1, sent_l2 * num_att_labels)
		self.score_view2.dims = (batch_l * sent_l2, sent_l1 * num_att_labels)
		self.score_unview1.dims = (batch_l, sent_l1, sent_l2 * num_att_labels)
		self.score_unview2.dims = (batch_l, sent_l2, sent_l1 * num_att_labels)

		cb_funcs = []
		if 'one_to_one' in self.constr_names:
			cb_funcs.append(one_to_one)
		# TODO, need more

		self.shared.expr_constr_callbacks = [cb_funcs for i in xrange(batch_l)]
		self.shared.le_constr = [[] for i in xrange(batch_l)]
		self.shared.le_thresh = [[] for i in xrange(batch_l)]
		#mask = (np.random.uniform(0, 1, (sent_l1 * sent_l2, )) > 0.5).astype('float64')
		self.shared.eq_constr = [[] for i in xrange(batch_l)]
		self.shared.eq_thresh = [[0.0] for i in xrange(batch_l)]



if __name__ == '__main__':
	from torch.autograd import Variable
	hidden_size = 3

	opt = Holder()
	opt.hidden_size = 3
	opt.dropout = 0.0
	opt.num_att_labels = 3
	opt.gpuid = -1
	shared = Holder()
	shared.batch_l = 2
	shared.sent_l1 = 3
	shared.sent_l2 = 4
	shared.input1  = Variable(torch.randn(shared.batch_l, shared.sent_l1, opt.hidden_size), True)
	shared.input2 = Variable(torch.randn(shared.batch_l, shared.sent_l2, opt.hidden_size), True)

	# build network
	attender = LabeledLocalHardAttention(opt, shared)

	# update batch info
	shared.batch_l = 2
	shared.sent_l1 = 3
	shared.sent_l2 = 4

	# run network
	rs = attender(shared.input1, shared.input2)

	print(attender)
	print(shared.att_hard1)
	print(shared.mixed_att1)

	print(shared.att_hard2)
	print(shared.mixed_att2)





