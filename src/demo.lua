require 'nn'

a = torch.Tensor(1,54)
for i=1,54 do a[1][i] = i end
t = nn.View(3,2,9)(a)

local batch_l = 3
local sent1_l = 2
local sent2_l = 3
local ali_labels = 3

for l=1,ali_labels+1 do

	local mlp = nn.Concat(1)
	for l=1,ali_labels+1 do
	mlp:add(nn.Sequential():add(nn.Select(3,l*sent2_l)):add(nn.View(1,3,2)))
	mlp:add(nn.Sequential():add(nn.Select(3,)):add(nn.View(1,3,2)))
	mlp:add(nn.Sequential():add(nn.Select(3,3)):add(nn.View(1,3,2)))

end

mlp = nn.Concat(1)
mlp:add(nn.Sequential():add(nn.Select(3,1)):add(nn.View(1,3,2)))
mlp:add(nn.Sequential():add(nn.Select(3,2)):add(nn.View(1,3,2)))
mlp:add(nn.Sequential():add(nn.Select(3,3)):add(nn.View(1,3,2)))
blk1 = mlp:forward(t)
print(blk1)
