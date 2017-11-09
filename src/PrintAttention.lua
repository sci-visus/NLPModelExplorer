local PrintAttention, parent = torch.class('nn.PrintAttention', 'nn.Module')
-- printing module
--    works as a dummy layer, nothing is done except printing

function PrintAttention:__init(opt, output_path)
	self.opt = opt
	self.output_path = output_path
	self.att_output_file = output_path .. '.hdf5'
	-- clear up the file
	local file = hdf5.open(self.att_output_file, 'w')
	file:close()

	-- if specified to output gradient of alignment as well
	if opt.output_ali_gradient then
		self.grad_outputfile = self.output_path .. '.grad.hdf5'
		local file = hdf5.open(self.grad_outputfile, 'w')
		file:close()
	end
end

function PrintAttention:print_tensors(t, out_path)
	local file = hdf5.open(out_path, 'a')
	for i=1,#(self.batch_ex_idx) do
		local ex_id = self.batch_ex_idx[i]
		local ex_att = t:narrow(1, i, 1)
		local att_slices = {}

		for l=1,opt.ali_labels do
			table.insert(att_slices, ex_att:narrow(3, (l-1)*self.sent_l2+1, self.sent_l2))
		end

		local att_tensor = torch.cat(att_slices, 1)
		-- kill dimension 1 if ali_labels == 1 for better visual effect
		if opt.ali_labels == 1 then
			att_tensor = att_tensor:view((#att_tensor)[2], (#att_tensor)[3])
		end
		-- decr index by 1 to make it starts from 0
		file:write(tostring(ex_id-1), att_tensor:double())
	end
	file:close()
end

function PrintAttention:updateOutput(input)
	self.batch_l = shared.batch_l
	self.sent_l1 = shared.sent_l1
	self.sent_l2 = shared.sent_l2
	self.batch_ex_idx = shared.batch_ex_idx

	local att = input
	assert((#att)[1] == self.batch_l, "(#att)[1] ~= batch_l.")
	assert((#att)[3] == self.sent_l2 * self.opt.ali_labels, "(#att)[2] does not match number of alignment labels and sent_l2.")

	print('writing attentions for ' ..tostring(#(self.batch_ex_idx)) .. ' examples')
	self:print_tensors(att, self.att_output_file)

  	self.output = input
  	return self.output
end

function PrintAttention:updateGradInput(input, gradOutput)
  	self.gradInput = gradOutput

  	-- if specified to output attention gradient
  	if self.opt.output_ali_gradient then
  		print('writing attention gradients for ' ..tostring(#(self.batch_ex_idx)) .. ' examples')
  		self:print_tensors(gradOutput, self.grad_outputfile)
  	end

  	return self.gradInput
end