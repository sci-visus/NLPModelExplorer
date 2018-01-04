local class = require 'class'
local Constraints = class('Constraints')

function Constraints:__init(opt, max_sent_l)
	assert(opt.ali_labels > 1)
	self.max_sent_l = max_sent_l or 256
	self.label_map = {}
	if opt.ali_labels == 2 then
		self.label_map['SPE'] = 1
		self.label_map['NOA'] = 2
	elseif opt.ali_labels == 3 then
		self.label_map['SPE'] = 1
		self.label_map['OPP'] = 2
		self.label_map['NOA'] = 3
	elseif opt.ali_labels == 4 then
		self.label_map['SPE'] = 1
		self.label_map['OPP'] = 2
		self.label_map['REL'] = 3
		self.label_map['NOA'] = 4
	end

	self.y_map = {}
	self.y_map[1] = 'entailment'
	self.y_map[2] = 'neutral'
	self.y_map[3] = 'contradiction'

	self.eq_constr = {}
	self.eq_thresh = {}
	self.le_constr = {}
	self.le_thresh = {}
end

function Constraints:define_spe(batch_l, sent_l1, sent_l2, ys)
	if self.y_map[y] == 'entailment' then
		local constr = torch.zeros(opt.ali_labels, sent_l1, sent_l2)
		local spe = self.label_map['SPE']
		local non_null = {2, self.max_sent_l}
		spe_constr[{spe, non_null, non_null}] = 1.0
		spe_thresh = 1.0
	
		for i=1,batch_l do
			self.le_constr[i] = - spe_constr
			self.le_constr[i] = - spe_thresh
		end
	end
end

function Constraints