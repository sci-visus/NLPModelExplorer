
'''
 - the portal for sending data to the visualization
 - act as a server for the js based visualization
 - open web browser


 Data Model
 - data object is linked by object id, json format

'''

from flask import Flask
from flask_socketio import send, emit, socketio, SocketIO, join_room, leave_room, close_room,disconnect

import webbrowser, threading
import time

#global app/socketio for decorator access
app = Flask(__name__)
socketio = SocketIO(app)

class textEntailVisModule:
    # def init(self):
        # app = Flask(__name__)
        # socketio = SocketIO(app)
        # self.app.run(host='localhost',port=5000,debug=True)

    # an input pair ID is used as handle for the correspondence
    # between attention, prediction, and the input
    def addData(self, data):
        self.data = data

    def addPredictions(self, predictions):
        pass

    def addAttention(self, att):
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

    @app.route("/getData")
    def queryData():
        pass

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
        # if registry:
        # registry.parsingMessage(msg
        pass

    def show(self):
        # delay
        # time.sleep(60)
        url = 'http://localhost:5050'
        threading.Timer(2.0, lambda: webbrowser.open(url, new=0) ).start()
        socketio.run(app, host='localhost',port=5050, debug=True)
        # webbrowser.open('http://localhost:5000', new=2)
