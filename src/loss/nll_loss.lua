function make_nll_loss(opt)
	--local loss = nn.ClassNLLCriterion()
	--loss.sizeAverage = false
--
	--if opt.gpuid > 0 then
	--	loss:cuda()
	--end
--
	--return loss

	-- use customized ClassNllCriterion
	require 'Nll'
	local loss = nn.Nll(opt)
	return loss
end