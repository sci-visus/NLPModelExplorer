from visPackage import *
from modelInterface import *
from sentenceGenerator import *

exampleData = [{
    "index":0,
    "src": "Two women are embracing while holding to go packages .\n",
    "targ": "The sisters are hugging goodbye while holding to go packages after just eating lunch .\n"
},{
    "index":1,
    "src": "Two young children in blue jerseys , one with the number \
    9 and one with the number 2 are standing on wooden steps in a bathroom and washing their hands in a sink .\n",
    "targ": "Two kids in numbered jerseys wash their hands .\n"
}
]


def randomPredict(pair):
    rnum = np.random.random(3)
    rnum = rnum/np.sum(rnum)
    pred = dict()
    pred["neutral"] = rnum[0]
    pred["contradiction"] = rnum[1]
    pred["entailment"] = rnum[2]
    return pred

# model = modelInterface(data="../data/snli_1.0-val.hdf5", wordVec="../data/glove.hdf5", model="local_200_parikh")
gen = sentenceGenerator()
# ps = gen.perturbSentence("A woman eat an apple.")
# print ps
# exit()

modelVis = textEntailVisModule()
modelVis.setSentenceExample(exampleData)
# modelVis.setData(initData)
# modelVis.setPredictionHook(model.predict)
modelVis.setPredictionHook(randomPredict)
modelVis.setSentencePerturbationHook(gen.perturbSentence)

# modelVis.callbackPredictionChange()
#open browser for visualization
# modelVis.show()
modelVis.startServer()
