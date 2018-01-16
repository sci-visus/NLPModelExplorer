from visPackage import *
from modelInterface import *
from sentenceGenerator import *

initData = [{
 "index":0,
 "src": "Two women are embracing while holding to go packages .\n",
 "targ": "The sisters are hugging goodbye while holding to go packages after just eating lunch .\n"
}]


# model = modelInterface(data="../data/snli_1.0-val.hdf5", wordVec="../data/glove.hdf5", model="local_200_parikh")
gen = sentenceGenerator()
# ps = gen.perturbSentence("A woman eat an apple.")
# print ps
# exit()

modelVis = textEntailVisModule()
# modelVis.setData(initData)
# modelVis.setPredictionHook(model.predict)
modelVis.setSentencePerturbationHook(gen.perturbSentence)

# modelVis.callbackPredictionChange()
#open browser for visualization
modelVis.show()
# modelVis.startServer()
