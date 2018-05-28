from visPackage import MCModule
from bidaf_src import bidafModelInterface
from NLPutility import translationPerturbation

#initialize machine comprehension model
model = bidafModelInterface(
    wordDict="data/bidaf/squad.word.dict",
    wordVec="data/bidaf/glove.hdf5",
    model="data/bidaf/bidaf_clip5_20.ema")

gen = translationPerturbation()

# visualization components
# attention is linked to paragraph
visLayout = {
    "column":[{"row": ["Paragraph",
                        "AttentionSubMatrix"]},
            {"row": ["AttentionAsymmetric"]}]
    }

#setup interface
modelVis = MCModule(visLayout)

modelVis.setPredictionHook(model.predict)
modelVis.setAttentionHook(model.attention)
modelVis.setReloadModelCallback(model.reloadModel)
modelVis.setSentencePerturbationHook(gen.perturbSentence)

#open browser for visualization
modelVis.startServer()
