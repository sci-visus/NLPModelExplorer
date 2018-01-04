local ExpandSum, parent = torch.class('nn.ExpandSum', 'nn.Module')
-- take summation along all dimensions of the input tensor
  -- and output a tensor of the same size whose each element is the sum

function ExpandSum:__init()
  parent.__init(self)
  self.output = {}
  self.gradInput = {}
end

function ExpandSum:updateOutput(input)
  self.output = input:clone():zero() + input:sum()
  return self.output
end

function ExpandSum:updateGradInput(input, gradOutput)
  self.gradInput = gradOutput
  return self.gradInput
end