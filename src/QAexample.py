from visPackage import *
from modelInterface import *
from sentenceGenerator import *

#initialize NLP model
model = modelInterface(
    wordDict="../data/snli_1.0/snli_1.0.word.dict",
    wordVec="../data/glove.hdf5", model="../data/local_300_parikh")

#sentence perturbation
# gen = sentenceGenerator()
gen = translationPerturbation()

#visualization components
visLayout = {
    "column":[{"row":["Summary", "Paragraph"]},
            {"row":["AttentionAsymmetric"]}]
    }

#setup interface
modelVis = nlizeModule(visLayout)

modelVis.setPredictionHook(model.predict)
modelVis.setAttentionHook(model.attention)
modelVis.setPredictionUpdateHook(model.updatePrediction)
modelVis.setAttentionUpdateHook(model.updateAttention)
modelVis.setReloadModelCallback(model.reloadModel)

modelVis.setPipelineStatisticHook(model.pipelineStatistic)

modelVis.setSentencePerturbationHook(gen.perturbSentence)
modelVis.setSentenceParserHook(dep.getDependencyTree)

#open browser for visualization
# modelVis.show()
modelVis.startServer()
