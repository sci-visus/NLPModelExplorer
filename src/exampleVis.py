from visPackage import *
from modelInterface import *
from sentenceGenerator import *


def randomPredict(pair):
    rnum = np.random.random(3)
    rnum = rnum/np.sum(rnum)
    # pred = dict()
    # pred["neutral"] = rnum[0]
    # pred["contradiction"] = rnum[1]
    # pred["entailment"] = rnum[2]
    return rnum

model = modelInterface(wordDict="../data/snli_1.0.word.dict", wordVec="../data/glove.hdf5", model="local_200_parikh")


################ test model interface #################
# model.evaluateTestData("../data/snli_1.0/src-test.txt", "../data/snli_1.0/targ-test.txt", "../data/snli_1.0/label-test.txt")
# model.predict([exampleData[0]["src"], exampleData[0]["targ"]])
# model.attention()
# exit()
#######################################################

gen = sentenceGenerator()
###### test sentence perturbation interface ###########
# ps = gen.perturbSentence("A woman eat an apple.")
# print ps
# exit()
#######################################################
visComponentList = ["prediction", "sentence", "attention", "evaluation"]

modelVis = textEntailVisModule(visComponentList)
modelVis.setPredictionHook(model.predict)
modelVis.setAttentionHook(model.attention)
modelVis.setSentencePerturbationHook(gen.perturbSentence)

# modelVis.callbackPredictionChange()
#open browser for visualization
# modelVis.startServer()
# model.train()
# modelVis.closeServer()

modelVis.show()
# modelVis.startServer()
