
'''
 - the portal for sending data to the visualization
 - act as a server for the js based visualization
 - open web browser


 Data Model
 - data object is linked by object id, jason file

'''

from flask import Flask
from hdanalysis.modules import *
from hdanalysis.core import *


class visModule:
    def init():
        self.app = Flask(__name__)
        socketio = SocketIO(self.app)
        socketio.run(app, debug=True)
        # pass

    # an input pair ID is used as handle for the correspondence
    # between attention, prediction, and the input
    def addPredictions(self, predictions):
        pass

    def addAttention(self, att):
        pass

    # called when the user change the prediction, the attention need to be updated
    def addGradientUpdateCallback(self, updateCallback):
        pass
