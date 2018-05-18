from visPackage import MCModule
from modelInterface import *
from translationPerturbation import *

#initialize NLP model
model = modelInterface(
    wordDict="../data/snli_1.0/snli_1.0.word.dict",
    wordVec="../data/glove.hdf5", model="../data/local_300_parikh")

#sentence perturbation
# gen = sentenceGenerator()
gen = translationPerturbation()

# visualization components
# attention is linked to paragraph
visLayout = {
    "column":[{"row":
                [
                # "Summary",
                "Paragraph"
                ]},
            {"row":["AttentionAsymmetric"]}]
    }

#setup interface
modelVis = MCModule(visLayout)

modelVis.setPredictionHook(model.predict)
modelVis.setAttentionHook(model.attention)
modelVis.setReloadModelCallback(model.reloadModel)
# modelVis.setSentencePerturbationHook(gen.perturbSentence)

#open browser for visualization
# modelVis.show()
modelVis.startServer()
