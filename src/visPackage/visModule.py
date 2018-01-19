
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

app = Flask(__name__)
sio = socketio.Server()
fApp = socketio.Middleware(sio, app)
dataManager = socketioManager(sio)

#################### server control ######################
class visModule:
    def __init__(self):
        dataManager.setObject(self)

    @app.route('/')
    def index():
        # dataManager.clear()
        return app.send_static_file('index.html')

    @app.route('/<name>')
    def views(name):
        return {
            'prediction_view': app.send_static_file('viewTemplates/prediction_view.mst'),
            'attention_view': app.send_static_file('viewTemplates/template_view.mst'),
            'sentence_view': app.send_static_file('viewTemplates/sentence_view.mst')
        }.get(name)

    # envoke callback when the server is running
    @sio.on('message', namespace='/app')
    def parsingMessage(sid, msg):
        # print sid, msg
        return dataManager.receiveFromClient(msg)

    def show(self):
        # url = 'http://localhost:5050'
        # threading.Timer(1.5, lambda: webbrowser.open(url, new=0) ).start()
        #
        # eventlet.wsgi.server(eventlet.listen(('localhost', 5050)), fApp)

        # deploy as an eventlet WSGI server
        sio.start_background_task(self.startServer)

    # @staticmethod
    def startServer(self):
        eventlet.wsgi.server(eventlet.listen(('localhost', 5050)), fApp)
        # socketio.run(app, host='localhost',port=5050, debug=True)

############## specialized vis modules ################

'''
data organization structure
    - sentenceList (list of pairs)
    - currentPair (the current selected pair)
    - allSourcePairs (all source pairs including the oringal)
    - allTargetPairs (all target pairs including the oringal)
    - allPairsPrediction (a matrix record the predict for all combination of pairs)
    - perturbedSource
    - perturbedTarget
    - prediction (the current prediction)
    - predictionsHighlight (use the index to update currentPair display)
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
            # sentence = dict()
            # sentence['index'] = pair['index']
            # sentence['src'] = pair['src']
            # sentence['targ'] = pair['targ']
            sentenceList.append(pair)
        dataManager.setData("sentenceList", sentenceList)
        # print data[0]
        dataManager.setData("currentPair", [data[0]['src'], data[0]['targ']])

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
        allSourcePairs = dataManager.getData("allSourcePairs")
        allTargetPairs = dataManager.getData("allTargetPairs")
        print "original s, t:"
        print allSourcePairs[0]
        print allTargetPairs[0]

        allPairsPrediction = np.zeros( (len(allSourcePairs), len(allTargetPairs), 3) )
        for i, source in enumerate(allSourcePairs):
            for j, target in enumerate(allTargetPairs):
                if i>=j:
                    predResult = self.predictionHook([source, target])
                    allPairsPrediction[i,j,:] = predResult
                    allPairsPrediction[j,i,:] = predResult
        # print allPairsPrediction
        dataManager.setData("allPairsPrediction", allPairsPrediction)

    def perturbSentence(self, sentence):
        perturbed = self.sentencePerturbationHook(sentence)
        return [sentence] + perturbed
