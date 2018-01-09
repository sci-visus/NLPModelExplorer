import sys
sys.path.insert(0, '../')

import torch
from torch import nn
from view import *
from holder import *
from join_table import *

class LabeledLocalAttention(torch.nn.Module):
	def __init__(self, opt, shared):
		super(LabeledLocalAttention, self).__init__()

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

		# bookkeeping
		self.shared = shared
		self.dropout = opt.dropout
		self.hidden_size = opt.hidden_size
		self.num_att_labels = opt.num_att_labels


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

		# attention
		self.shared.att_soft1 = self.score_unview1(self.softmax(self.score_view1(score1)))
		self.shared.att_soft2 = self.score_unview2(self.softmax(self.score_view2(score2)))


		return [self.shared.att_soft1, self.shared.att_soft2]


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



if __name__ == '__main__':
	from torch.autograd import Variable
	hidden_size = 3

	opt = Holder()
	opt.hidden_size = 3
	opt.dropout = 0.0
	opt.num_att_labels = 3
	shared = Holder()
	shared.batch_l = 1
	shared.sent_l1 = 5
	shared.sent_l2 = 8
	shared.input1  = Variable(torch.randn(shared.batch_l, shared.sent_l1, opt.hidden_size), True)
	shared.input2 = Variable(torch.randn(shared.batch_l, shared.sent_l2, opt.hidden_size), True)

	# build network
	attender = LabeledLocalAttention(opt, shared)

	# update batch info
	shared.batch_l = 1
	shared.sent_l1 = 5
	shared.sent_l2 = 8

	# run network
	rs = attender(shared.input1, shared.input2)

	print(attender)
	print(rs)
	print(rs[0].sum(2))
	print(rs[1].sum(2))





