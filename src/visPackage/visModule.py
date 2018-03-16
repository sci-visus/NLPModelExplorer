
'''
 - the portal for sending data to the visualization
 - act as a server for the js based visualization
 - open web browser


 Data Model
 - data object is linked by object id, json format
'''

from flask import Flask
import socketio
import eventlet
from socketioManager import *
import webbrowser, threading
import time
import json

app = Flask(__name__)
sio = socketio.Server()
fApp = socketio.Middleware(sio, app)
dataManager = socketioManager(sio)

exampleData = [
{"index":4,
    "src": "A couple is taking a break from bicycling .\n",
    "targ":"a couple sit next to their bikes .\n",
    "pred":"neutral"
},
{
    "index":0,
    "src": "Two women are embracing while holding to go packages .\n",
    "targ": "The sisters are hugging goodbye while holding to go packages after just eating lunch .\n",
    "pred": "neutral"
},{
    "index":1,
    "src": "Two young children in blue jerseys , one with the number 9 and one with the number 2 are standing on wooden steps in a bathroom and washing their hands in a sink .\n",
    "targ": "Two kids in numbered jerseys wash their hands .\n",
    "pred": "entailment"
},{
    "index":2,
    "src": "This church choir sings to the masses as they sing joyous songs from the book at a church .",
    "targ": "The church has cracks in the ceiling .",
    "pred": "neutral"
},{
    "index":3,
    "src": "A woman with a green headscarf , blue shirt and a very big grin .",
    "targ": "The woman is young .",
    "pred": "neutral"
}
]

#################### server control ######################
class visModule:
    def __init__(self):
        dataManager.setObject(self)

    # envoke callback when the server is running
    @sio.on('message', namespace='/app')
    def parsingMessage(sid, msg):
        # print sid, msg
        return dataManager.receiveFromClient(msg)

    def show(self):
        url = 'http://localhost:5050'
        threading.Timer(1.5, lambda: webbrowser.open(url, new=0) ).start()
        #
        eventlet.wsgi.server(eventlet.listen(('localhost', 5050)), fApp)

        # deploy as an eventlet WSGI server
        # sio.start_background_task(self.startServer)

    # @staticmethod
    def startServer(self):
        eventlet.wsgi.server(eventlet.listen(('localhost', 5050)), fApp)
        # socketio.run(app, host='localhost',port=5050, debug=True)

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

layoutConfig = None

class textEntailVisModule(visModule):
    def __init__(self, componentLayout):
        # super(visModule, self).__init__()
        self.index = 0
        global layoutConfig
        layoutConfig = componentLayout
        dataManager.setObject(self)

    @app.route('/')
    def index():
        dataManager.clear()
        dataManager.setData("componentLayout", layoutConfig)
        dataManager.setData("sentenceList", exampleData)
        dataManager.setData("currentPair", {"sentences":[exampleData[0]['src'], exampleData[0]['targ']],"label":exampleData[0]['pred']})
        return app.send_static_file('index.html')

    @app.route('/<name>')
    def views(name):
        return {
            'prediction_view': app.send_static_file('viewTemplates/prediction_view.mst'),
            'attention_view': app.send_static_file('viewTemplates/template_view.mst'),
            'attentionSentence_view': app.send_static_file('viewTemplates/attentionSentence_view.mst'),
            'sentence_view': app.send_static_file('viewTemplates/sentence_view.mst'),
            'evaluation_view': app.send_static_file('viewTemplates/evaluation_view.mst'),
            'pipeline_view': app.send_static_file('viewTemplates/template_view.mst')
        }.get(name)


    def loadSummaryStatistic(self, filename):
        with open(filename) as json_data:
            statistics = json.load(json_data)
            # print "loadSummaryStatistic: ", type(statistics), type(statistics[0])
            dataManager.setData("evaluationStatistics", statistics)

    # an sentence pair index (self.index) is used as handle for the correspondence
    # between attention, prediction, and the input
    ### !!!! this is not called curretnly !!!! ####
    def setSentenceExample(self, data):
        sentenceList = []
        for pair in data:
            # dataManager.setData("predictions", self.data[self.index]['pred']);
            # dataManager.setData("predictionsHighlight", 0);
            # sentence = dict()
            # sentence['index'] = pair['index']
            # sentence['src'] = pair['src']
            # sentence['targ'] = pair['targ']
            sentenceList.append(pair)
        dataManager.setData("sentenceList", sentenceList)
        dataManager.setData("originalPair", [data[0]['src'], data[0]['targ']])
        dataManager.setData("currentPair", {"sentences":[data[0]['src'], data[0]['targ']],"label":data[0]['pred']})

    # called when the user change the prediction, the attention need to be
    # recomputed by python model
    def setGradientUpdateHook(self, callback):
        self.gradientUpdateHook = callback

    def setSentencePerturbationHook(self, callback):
        self.sentencePerturbationHook = callback

    def setPredictionHook(self, callback):
        self.predictionHook = callback

    def setAttentionHook(self, callback):
        self.attentionHook = callback

    def setSentenceParserHook(self, callback):
        self.parserHook = callback

    def setPredictionUpdateHook(self, callback):
        self.predictionUpdateHook = callback

    def setAttentionUpdateHook(self, callback):
        self.attentionUpdateHook = callback

    #get sentence parse tree
    def parseSentence(self, sentence):
        if self.parserHook:
            depTree = self.parserHook(sentence)
            return {"depTree": depTree, "sentence":sentence}

    def predictUpdate(self, newLabel, iteration, encoderFlag, attFlag, classFlag ):
        print "predictUpdate", newLabel, iteration, encoderFlag, attFlag, classFlag
        sentencePair = dataManager.getData("currentPair")['sentences']
        att, pred = self.predictionUpdateHook(sentencePair, newLabel, iteration, encoderFlag, attFlag, classFlag)
        print att, pred

        # dataManager.setData("attention", att)
        dataManager.setData("predictionUpdate", pred)

        #update other predictions
        self.predictAll()

    def predict(self):
        sentencePair = dataManager.getData("currentPair")['sentences']
        predictionResult = self.predictionHook(sentencePair)
        dataManager.setData("prediction", predictionResult)
        #use raw attention
        attentionMatrix = self.attentionHook("score1")
        # print attentionMatrix
        dataManager.setData("attention", attentionMatrix)

    def updateAttention(self):
        sentencePair = dataManager.getData("currentPair")['sentences']
        predictionResult = self.predictionHook(sentencePair)
        # dataManager.setData("prediction", predictionResult)
        #use raw attention
        attentionMatrix = self.attentionHook("score1")
        dataManager.setData("attention", attentionMatrix)

    def predictAll(self):
        allSourceSens = None
        allTargetSens = None
        sentencePair = dataManager.getData("currentPair")['sentences'];
        if dataManager.getData("allSourceSens") is not None:
            allSourceSens = dataManager.getData("allSourceSens")
        else:
            allSourceSens = [sentencePair[0]]
        if dataManager.getData("allTargetSens") is not None:
            allTargetSens = dataManager.getData("allTargetSens")
        else:
            allTargetSens = [sentencePair[1]]
        # print "original s, t:"
        # print allSourceSens, allTargetSens
        if len(allSourceSens) <= 1 and len(allTargetSens) <= 1:
            return

        allPairsPrediction = np.zeros( (len(allSourceSens), len(allTargetSens), 3) )
        # allAttention = [None]
        for i, source in enumerate(allSourceSens):
            for j, target in enumerate(allTargetSens):
                if i==0 or j==0:
                    predResult = self.predictionHook([source, target])
                    allPairsPrediction[i,j,:] = predResult
                    # allPairsPrediction[j,i,:] = predResult
        # print allPairsPrediction
        dataManager.setData("allPairsPrediction", allPairsPrediction)
        # dataManager.setData("allAttention", allAttention)

    def perturbSentence(self, sentence):
        perturbed = self.sentencePerturbationHook(sentence)
        return [sentence] + perturbed
