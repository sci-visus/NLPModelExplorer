from visPackage import *
from modelInterface import *
from sentenceGenerator import *

#initialize NLP model
model = modelInterface(
    wordDict="../data/snli_1.0/snli_1.0.word.dict",
    wordVec="../data/glove.hdf5", model="../data/local_300_parikh")

#sentence perturbation
gen = sentenceGenerator()
#dependency parsing
dep = dependencyTree()

#visualization components
visComponentList = ["prediction", "sentence", "attention", "evaluation"]

#setup interface
modelVis = textEntailVisModule(visComponentList)
modelVis.setPredictionHook(model.predict)
modelVis.setAttentionHook(model.attention)
modelVis.setSentencePerturbationHook(gen.perturbSentence)
modelVis.setSentenceParserHook(dep.getDependencyTree)
# modelVis.predictionChangeHook()

#open browser for visualization
# modelVis.show()
modelVis.startServer()
