from visModule import *

############## specialized vis modules ################

'''
data organization structure
    - sentenceList (list of example pairs)
    - currentPair (the current selected pair)
    - allSourceSens (all source sentences including the oringal)
    - allTargetSens (all target sentences including the oringal)
    - allPairsPrediction (a matrix record the predict for all combination of pairs)
    - perturbedSource
    - perturbedTarget
    - prediction (the current prediction)
    - predictionsHighlight (use the index to update currentPair display)
'''

exampleData = [
{
    "index": 0,
    "src": "<s> A reusable launch system (RLS, or reusable launch vehicle, RLV) is a launch system which is capable of launching a payload into space more than once. This contrasts with expendable launch systems, where each launch vehicle is launched once and then discarded. No completely reusable orbital launch system has ever been created. Two partially reusable launch systems were developed, the Space Shuttle and Falcon 9. The Space Shuttle was partially reusable: the orbiter (which included the Space Shuttle main engines and the Orbital Maneuvering System engines), and the two solid rocket boosters were reused after several months of refitting work for each launch. The external tank was discarded after each flight. \n",
    "targ": "<s> How many partially reusable launch systems were developed?",
    "pred": "Two"
}
]

#############  machine comprehension ##############
class MCModule(visModule):
    def __init__(self, componentLayout):
        super(MCModule, self).__init__(componentLayout)

    def initSetup(self):
        dataManager.setData("sentenceList", exampleData)
        # dataManager.setData("pipeline", pipelineState)
        dataManager.setData("currentPair", {"sentences":[exampleData[0]['src'], exampleData[0]['targ']],"label":exampleData[0]['pred']})

    def setSentencePerturbationHook(self, callback):
        self.sentencePerturbationHook = callback

    def setPredictionHook(self, callback):
        self.predictionHook = callback

    def setAttentionHook(self, callback):
        self.attentionHook = callback

    def setReloadModelCallback(self, callback):
        self.reloadModelCallback = callback

    def predict(self):
        sentencePair = dataManager.getData("currentPair")['sentences']
        predictionResult = self.predictionHook(sentencePair)
        dataManager.setData("prediction", predictionResult)
        #use raw attention
        attentionMatrix = self.attentionHook("score1")
        # print attentionMatrix
        dataManager.setData("attention", attentionMatrix)
        return True

    def reloadModel(self):
        self.reloadModelCallback();
        self.predict()
        self.predictAll()
        return True

    def parseSentence(self, sentence):
        return True
