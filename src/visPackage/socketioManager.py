'''
Send and receive data between server and client using SocketIO
'''
from sets import Set
from flask_socketio import send, emit, socketio, SocketIO, join_room, leave_room, close_room,disconnect
# import json

class socketioManager:
    def __init__(self):
        self.data2ID = dict()
        self.namespace = "/app"

    #receive from client
    def receiveFromClient(self, msg):
        #parse
        messageType = msg['type']
        if messageType == 'setData':
            self.setData(msg["data"], msg["name"])
        elif messageType == 'subscribeData':
            self.subscribeData(msg["id"], msg["name"])

    def sendToClient(self, id, json):
        emit(id, json, namespace = self.namespace, broadcast=True)

    def setData(self, data, name):
        self.data[name] = data
        #propagate data update
        for id in self.data2ID[name]:
            mappedData = dataMapper.Py2Js(data)
            if mappedData:
                msg = dict()
                msg['type'] = "data"
                msg['name'] = name
                msg['data'] = mappedData
                self.sendToClient(uID, msg)
            self.send(id, data)

    def subscribeData(self, id, name):
        if name in self.data2ID.keys():
            self.data2ID[name].add(id)
        else:
            self.data2ID[name] = Set()
            self.data2ID[name].add(id)

    # def registerActionResponse(self, signal, callback):
    #     pass

class dataMapper:
    @staticmethod
    def Js2Py(data):
        if isinstance(data, list):
            return np.array(data)
        else:
            return data

    @staticmethod
    def Py2Js(data):
        returnData = dict()

        ############ int #############
        elif isinstance(data, int):
            # print "@@@@@@@@ int signal @@@@@@@@\n", data
            returnData["data"] = data

        ############ array #############
        elif isinstance(data, np.ndarray):
            # print "@@@@@@@@ array signal @@@@@@@@\n", data
            returnData['data'] = data.tolist()

        return returnData
