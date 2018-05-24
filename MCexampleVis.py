from visPackage import MCModule
# from nli_src import modelInterface
from bidaf_src import bidafModelInterface
from NLPutility import translationPerturbation

#initialize NLP model
model = bidafModelInterface(
    wordDict="data/bidaf/squad.word.dict",
    wordVec="data/bidaf/glove.hdf5", model="data/bidaf/bidaf_5.ema")
# print model

# exit()
# model = modelInterface(
#     wordDict="data/snli_1.0/snli_1.0.word.dict",
#     wordVec="data/glove.hdf5", model="data/local_300_parikh")

#sentence perturbation
# gen = sentenceGenerator()
gen = translationPerturbation()

# visualization components
# attention is linked to paragraph
visLayout = {
    "column":[{"row":
                [
                "Paragraph",
                "AttentionSubMatrix"
                ]},
            {"row":["AttentionAsymmetric"]}]
    }

#setup interface
modelVis = MCModule(visLayout)

modelVis.setPredictionHook(model.predict)
modelVis.setAttentionHook(model.attention)
modelVis.setReloadModelCallback(model.reloadModel)
modelVis.setSentencePerturbationHook(gen.perturbSentence)

#open browser for visualization
# modelVis.show()
modelVis.startServer()
