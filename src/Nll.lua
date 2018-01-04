local Nll, parent = torch.class('nn.Nll', 'nn.Criterion')

function Nll:__init(opt)
	self.y_selectors = torch.eye(3)

	if opt.gpuid >= 0 then
		cutorch.setDevice(opt.gpuid)
		self.y_selectors = self.y_selectors:cuda()
	end

	self.gradInput = {}
end

function Nll:unravel_index(i)
	return self.y_selectors:index(1, i:view(i:nElement()))
end

function Nll:updateOutput(input, target)
	-- assumes input is a probability tensor of size batch_l x 3
	local y_gold = self:unravel_index(target)
	local loss = torch.cmul(input, y_gold):sum()

	return - loss
end


function Nll:updateGradInput(input, target)

	local y_gold = self:unravel_index(target)

	-- by default input is of size 1
	--	in case it's larger than size 1, take the first as input and rest as auxilliary info with 0 grad
	if type(input) == 'table' then
		self.gradInput[1] = -y_gold
		for i=2,#input do
			self.gradInput[i] = input[i]:clone():zero()
		end
	else
		self.gradInput = - y_gold
	end

	return self.gradInput
end