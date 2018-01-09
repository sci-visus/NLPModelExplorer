import sys
sys.path.insert(0, '../')

import torch
from torch import nn
from view import *
from join_table import *
from holder import *

class LabeledLocalClassifier(torch.nn.Module):
	def __init__(self, opt, shared):
		super(LabeledLocalClassifier, self).__init__()

		# temp stuff will be changed on the fly
		batch_l = 1
		sent_l1 = 2
		sent_l2 = 3

		labeled_cat_size = opt.hidden_size * 2 * opt.num_att_labels
		self.input_view1 = View(batch_l * sent_l1, labeled_cat_size)
		self.input_view2 = View(batch_l * sent_l2, labeled_cat_size)
		self.input_unview1 = View(batch_l, sent_l1, opt.hidden_size)
		self.input_unview2 = View(batch_l, sent_l2, opt.hidden_size)
		self.input_joiner = JoinTable(2)
		self.phi_joiner = JoinTable(1)

		# bookkeeping
		self.shared = shared
		self.dropout = opt.dropout
		self.hidden_size = opt.hidden_size
		self.num_att_labels = opt.num_att_labels

		# NOTE, this part is different from structatt-torch branch
		# the performance is on the same bar, but this requires fewer parameters
		self.g = nn.Sequential(
			nn.Dropout(opt.dropout),
			nn.Linear(labeled_cat_size, opt.hidden_size),
			nn.ReLU(),
			nn.Dropout(opt.dropout),
			nn.Linear(opt.hidden_size, opt.hidden_size),
			nn.ReLU())

		cat_size = opt.hidden_size * 2
		self.h = nn.Sequential(
			nn.Dropout(opt.dropout),
			nn.Linear(cat_size, opt.hidden_size),
			nn.ReLU(),
			nn.Dropout(opt.dropout),
			nn.Linear(opt.hidden_size, opt.hidden_size),
			nn.ReLU(),
			nn.Linear(opt.hidden_size, opt.num_labels),
			nn.LogSoftmax(1))

	def forward(self, sent1, sent2, att1, att2):
		self.update_context()

		labeled_input1 = []
		labeled_input2 = []
		for l in xrange(self.num_att_labels):
			att_l1 = att1[:, :, l*self.shared.sent_l2:(l+1)*self.shared.sent_l2]
			att_l2 = att2[:, :, l*self.shared.sent_l1:(l+1)*self.shared.sent_l1]

			attended2 = att_l1.bmm(sent2)
			attended1 = att_l2.bmm(sent1)

			labeled_input1.extend([sent1, attended2])
			labeled_input2.extend([sent2, attended1])

		cat1 = self.input_joiner(labeled_input1)
		cat2 = self.input_joiner(labeled_input2)

		phi1 = self.input_unview1(self.g(self.input_view1(cat1)))
		phi2 = self.input_unview2(self.g(self.input_view2(cat2)))

		flat_phi1 = phi1.sum(1)
		flat_phi2 = phi2.sum(1)

		phi = self.phi_joiner([flat_phi1, flat_phi2])
		self.shared.out = self.h(phi)

		return self.shared.out

	def update_context(self):
		batch_l = self.shared.batch_l
		sent_l1 = self.shared.sent_l1
		sent_l2 = self.shared.sent_l2
		num_att_labels = self.num_att_labels
		labeled_cat_size = self.hidden_size * 2 * num_att_labels

		self.input_view1.dims = (batch_l * sent_l1, labeled_cat_size)
		self.input_view2.dims = (batch_l * sent_l2, labeled_cat_size)
		self.input_unview1.dims = (batch_l, sent_l1, self.hidden_size)
		self.input_unview2.dims = (batch_l, sent_l2, self.hidden_size)

	def weights(self, m):
		classname = m.__class__.__name__
		if hasattr(m, 'weight'):
			print('{0} weight {1}'.format(classname, m.weight))
		if hasattr(m, 'bias'):
			print('{0} bias {1}'.format(classname, m.bias))

if __name__ == '__main__':
	sys.path.insert(0, '../attention/')
	from torch.autograd import Variable
	from labeled_local_attention import *

	opt = Holder()
	opt.hidden_size = 3
	opt.dropout = 0.0
	opt.num_labels = 3
	opt.num_att_labels = 3
	shared = Holder()
	shared.batch_l = 2
	shared.sent_l1 = 5
	shared.sent_l2 = 8
	shared.input1 = Variable(torch.randn(shared.batch_l, shared.sent_l1, opt.hidden_size), True)
	shared.input2 = Variable(torch.randn(shared.batch_l, shared.sent_l2, opt.hidden_size), True)

	# build network
	attender = LabeledLocalAttention(opt, shared)
	classifier = LabeledLocalClassifier(opt, shared)

	# update batch info
	shared.batch_l = 2
	shared.sent_l1 = 5
	shared.sent_l2 = 8

	# run network
	shared.att1, shared.att2 = attender(shared.input1, shared.input2)
	shared.out = classifier(shared.input1, shared.input2, shared.att1, shared.att2)

	print(shared.att1)
	print(shared.att1.sum(2))
	print(shared.att2)
	print(shared.att2.sum(2))
	print(shared.out)
	print(classifier)
	#print(classifier.g[1].weight)
	#print(classifier.g[1].bias)
	#classifier.apply(classifier.weights)
#
	#for i, p in enumerate(classifier.parameters()):
	#	print(p.data)
	#	print(p.grad)
	#