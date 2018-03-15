from visPackage import *
from modelInterface import *
from sentenceGenerator import *

#initialize NLP model
model = modelInterface(
    wordDict="../data/snli_1.0/snli_1.0.word.dict",
    wordVec="../data/glove.hdf5", model="../data/local_300_parikh")

pair = ["Two women are embracing while holding to go packages .\n",
"The sisters are hugging goodbye while holding to go packages after just eating lunch .\n"]

model.updatePrediction(pair, 0)
