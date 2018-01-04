
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

class textEntailVisModule:
    def __init__(self):
        self.index = 0

    # def init(self):
        # app = Flask(__name__)
        # socketio = SocketIO(app)
        # self.app.run(host='localhost',port=5000,debug=True)

    # an sentence pair index (self.index) is used as handle for the correspondence
    # between attention, prediction, and the input
    def setData(self, data):
        self.data = data
        dataManager.setData("predictions", self.data[self.index]['pred']);
        dataManager.setData("predictionsHighlight", 0);

    def setPredictions(self, predictions):
        dataManager.setData("predictions", predictions);
        dataManager.setData("predictionsHighlight", 0);

    def setAttention(self, att):
        pass

    # called when the user change the prediction, the attention need to be
    # recomputed by python model
    def setGradientUpdateHook(self, callback):
        self.gradientUpdateHook = callback


    def setSentenceModelEvaluationHook(self, callback):
        self.sentenceModelEvaluationHook = callback


    #################### server control ######################
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
            'sentence_view': app.send_static_file('viewTemplates/template_view.mst')
        }.get(name)

    # envoke callback when the server is running
    @socketio.on('message', namespace='/app')
    def parsingMessage(msg):
        dataManager.receiveFromClient(msg)

    def show(self):
        # delay
        # time.sleep(60)

        url = 'http://localhost:5050'
        threading.Timer(2.0, lambda: webbrowser.open(url, new=0) ).start()

        socketio.run(app, host='localhost',port=5050, debug=True)
        # webbrowser.open('http://localhost:5000', new=2)

    def startServer(self):
        socketio.run(app, host='localhost',port=5050, debug=True)
