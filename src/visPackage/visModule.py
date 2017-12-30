
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


class textEntailVisModule:
    def init(self):
        self.app = Flask(__name__)
        self.socketio = SocketIO(self.app)
        # pass
        # self.app.run(host='localhost',port=5000,debug=True)

    # an input pair ID is used as handle for the correspondence
    # between attention, prediction, and the input
    def addPredictions(self, predictions):
        pass

    def addAttention(self, att):
        pass

    # called when the user change the prediction, the attention need to be
    # recomputed by python model
    def setGradientUpdateHook(self, updateCallback):
        pass

    def show(self):
        #delay
        # time.sleep(60)
        url = 'http://localhost:5000'
        threading.Timer(1.25, lambda: webbrowser.open(url, new=2) ).start()
        self.socketio.run(self.app, host='localhost',port=5000, debug=True)
        # webbrowser.open('http://localhost:5000', new=2)
