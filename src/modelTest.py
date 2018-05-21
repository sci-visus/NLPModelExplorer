# from visPackage import *
# from modelInterface import *
# from sentenceGenerator import *
from translationPerturbation import *

#initialize NLP model
trans = translationPerturbation('../key/Paraphrasing-684a368e96ad.json')
exit()

model = modelInterface(
    wordDict="../data/snli_1.0/snli_1.0.word.dict",
    wordVec="../data/glove.hdf5", model="../data/local_300_parikh")

pair = ["Two women are embracing while holding to go packages .\n",
"The sisters are hugging goodbye while holding to go packages after just eating lunch .\n"]

model.updatePrediction(pair, 0, 4, True, True, False)
