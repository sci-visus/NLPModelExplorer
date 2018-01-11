from visPackage import *
from modelInterface import *
from sentenceGenerator import *

data = [{
 "index":1,
 "src": "Two women are embracing while holding to go packages .\n",
 "targ": ["The sisters are hugging goodbye while holding to go packages after just eating lunch .\n",
          "The ses are hugging goodbye while holding to go packages after just eating lunch .\n",
          "The babies are hugging goodbye while holding to go packages after just eating lunch .\n",
          "The babes are hugging goodbye while holding to go packages after just eating lunch .\n",
          "The brethren are hugging goodbye while holding to go packages after just eating lunch .\n",
          "The sisters are hugging bye while holding to go packages after just eating lunch .\n",
          "The sisters are hugging goodbye while holding to go boxes after just eating lunch .\n",
          "The sisters are hugging goodbye while holding to go parcels after just eating lunch .\n",
          "The sisters are hugging goodbye while holding to go bundles after just eating lunch .\n",
          "The sisters are hugging goodbye while holding to go hardwares after just eating lunch .\n",
          "The sisters are hugging goodbye while holding to go packets after just eating lunch.\n",
          "The sisters are hugging goodbye while holding to go software after just eating lunch .\n",
          "The sisters are hugging goodbye while holding to go packages after just eating luncheon .\n"],
  "pred": [{"entailment": 0.00020701600447895, "neutral": 0.99391493434478, "contradiction": 0.0058780496507449},
          {"entailment": 0.0016417056941494, "neutral": 0.83697824810893, "contradiction": 0.16138004619692},
          {"entailment": 0.00087081213829998, "neutral": 0.84435574473394, "contradiction": 0.15477344312776},
          {"entailment": 0.0021986096456173, "neutral": 0.92118027990006, "contradiction": 0.076621110454324},
          {"entailment": 0.0016417056941494, "neutral": 0.83697824810893, "contradiction": 0.16138004619692},
          {"entailment": 0.00027179009363398, "neutral": 0.99415059120047, "contradiction": 0.0055776187058924},
          {"entailment": 0.00055702941675696, "neutral": 0.96665429089175, "contradiction": 0.032788679691493},
          {"entailment": 0.00054429037958207, "neutral": 0.94561603142416, "contradiction": 0.053839678196261},
          {"entailment": 0.00078967784621692, "neutral": 0.95516006329384, "contradiction": 0.044050258859942},
          {"entailment": 0.00065285760930952, "neutral": 0.93219162791879, "contradiction": 0.067155514471904},
          {"entailment": 0.00041696223553599, "neutral": 0.97358871856797, "contradiction": 0.025994319196492},
          {"entailment": 0.00049952066598977, "neutral": 0.98254969007693, "contradiction": 0.016950789257079},
          {"entailment": 0.00031762037709425, "neutral": 0.9952506535388, "contradiction": 0.0044317260841019}]
}]


model = modelInterface(data="../data/snli_1.0-val.hdf5", wordVec="../data/glove.hdf5", model="local_200_parikh")
gen = sentenceGenerator()

modelVis = textEntailVisModule()
modelVis.setData(data)
modelVis.setPredictionHook(model.predict)
modelVis.setSentencePerturbationHook(gen.perturb_noun_in_sentence)

# modelVis.callbackPredictionChange()
#open browser for visualization
# modelVis.show()
modelVis.startServer()
