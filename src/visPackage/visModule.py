
'''
 - the portal for sending data to the visualization
 - act as a server for the js based visualization
 - open web browser


 Data Model
 - data object is linked by object id, json format
'''

from flask import Flask
from flask_socketio import send, emit, socketio, SocketIO, join_room, leave_room, close_room,disconnect
from socketioManager import *
import webbrowser, threading
import time

#global app/socketio for decorator access
app = Flask(__name__)
socketio = SocketIO(app)
dataManager = socketioManager()

#################### server control ######################
class visModule:
    def __init__(self):
        dataManager.setObject(self)

    @app.route('/')
    def index():
        return app.send_static_file('index.html')

    # @app.route("/getData", methods=['POST', 'GET'])
    # def queryData():
    #     requestJson = request.get_json()
    #     return

    @app.route('/<name>')
    def views(name):
        return {
            'prediction_view': app.send_static_file('viewTemplates/prediction_view.mst'),
            'attention_view': app.send_static_file('viewTemplates/template_view.mst'),
            'sentence_view': app.send_static_file('viewTemplates/sentence_view.mst')
        }.get(name)

    # envoke callback when the server is running
    @socketio.on('message', namespace='/app')
    def parsingMessage(msg):
        return dataManager.receiveFromClient(msg)

    def show(self):
        # delay
        # time.sleep(60)

        url = 'http://localhost:5050'
        threading.Timer(2.0, lambda: webbrowser.open(url, new=0) ).start()

        socketio.run(app, host='localhost',port=5050, debug=True)
        # webbrowser.open('http://localhost:5000', new=2)

    def startServer(self):
        socketio.run(app, host='localhost',port=5050, debug=True)

############## specialized vis modules ################

'''
data organization structure
    - sentenceList (list of pairs)
    - currentPair (the current selected pair)
    - allPairs (all current perturbed pairs)
    - perturbedSource
    - perturbedTarget
    - prediction
    - allPairsPrediction
'''
class textEntailVisModule(visModule):
    def __init__(self):
        self.index = 0
        dataManager.setObject(self)

    # def init(self):
        # app = Flask(__name__)
        # socketio = SocketIO(app)
        # self.app.run(host='localhost',port=5000,debug=True)

    # an sentence pair index (self.index) is used as handle for the correspondence
    # between attention, prediction, and the input
    def setSentenceExample(self, data):
        sentenceList = []
        for pair in data:
            # dataManager.setData("predictions", self.data[self.index]['pred']);
            # dataManager.setData("predictionsHighlight", 0);
            sentence = dict()
            sentence['index'] = pair['index']
            sentence['src'] = pair['src']
            sentence['targ'] = pair['targ']
            sentenceList.append(sentence)
        dataManager.setData("sentenceList", sentenceList)
        dataManager.setData("currentPair", [data[0]['src'],data[0]['targ']])

    def setPredictions(self, predictions):
        dataManager.setData("predictions", predictions);
        dataManager.setData("predictionsHighlight", 0);

    def setPerturbedSource(self, sentences):
        dataManager.setData("perturbedSource", sentences)

    def setPerturbedSource(self, sentences):
        dataManager.setData("perturbedTarget", sentences)

    def setAttention(self, att):
        pass

    # called when the user change the prediction, the attention need to be
    # recomputed by python model
    def setGradientUpdateHook(self, callback):
        self.gradientUpdateHook = callback

    def setSentencePerturbationHook(self, callback):
        self.sentencePerturbationHook = callback

    def setPredictionHook(self, callback):
        self.predictionHook = callback

    def predict(self):
        sentencePair = dataManager.getData("currentPair")
        predictionResult = self.predictionHook(sentencePair)
        dataManager.setData("prediction", predictionResult)

    def predictAll(self):
        allPairs = dataManager.getData("allPairs")
        predictionResults = []
        for pair in allPairs:
            predictionResult = self.predictionHook(pair)
            predictionResults.append(predictionResult)
        dataManager.setData("allPairsPrediction", predictionResults)

    def perturbSentence(self, sentence):
        return self.sentencePerturbationHook(sentence)
