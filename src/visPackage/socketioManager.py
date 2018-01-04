'''
Send and receive data between server and client using SocketIO
'''
from sets import Set
from flask_socketio import send, emit, socketio, SocketIO, join_room, leave_room, close_room,disconnect
import json
import numpy as np

class socketioManager:
    def __init__(self):
        self.data2ID = dict()
        self.data = dict()
        self.namespace = "/app"

    #receive from client
    def receiveFromClient(self, msg):
        print msg
        #parse
        messageType = msg['type']
        if messageType == 'setData':
            self.setData(msg["name"], msg["data"], msg["id"])
        elif messageType == 'subscribeData':
            self.subscribeData(msg["name"], msg["id"])

    def sendToClient(self, uID, json):
        print "send to client", uID
        emit(uID, json, namespace = self.namespace, broadcast=True)

    def sendDataToClient(self, name, data, uID):
        mappedData = dataMapper.Py2Js(data)
        # print "send to client:", data, " => ", mappedData
        if mappedData:
            msg = dict()
            msg['type'] = "data"
            msg['name'] = name
            msg['data'] = mappedData
            self.sendToClient(uID, msg)

    def setData(self, name, data, uID = None):
        self.data[name] = data
        #propagate data update
        if name in self.data2ID.keys():
            for id in self.data2ID[name]:
                if id == uID:
                    continue
                mappedData = dataMapper.Py2Js(data)
                if mappedData:
                    msg = dict()
                    msg['type'] = "data"
                    msg['name'] = name
                    msg['data'] = mappedData
                    self.sendToClient(id, msg)


    def subscribeData(self, name, uID):
        # print name, uID
        if name in self.data2ID.keys():
            self.data2ID[name].add(id)
        else:
            self.data2ID[name] = Set()
            self.data2ID[name].add(id)

        #tigger data update if the subscribed data already exist
        if name in self.data.keys():
            self.sendDataToClient(name, self.data[name], uID)


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
        if isinstance(data, int):
            # print "@@@@@@@@ int signal @@@@@@@@\n", data
            returnData["data"] = data

        ############ array #############
        elif isinstance(data, np.ndarray):
            # print "@@@@@@@@ array signal @@@@@@@@\n", data
            returnData['data'] = data.tolist()
        else:
            returnData['data'] = json.dumps(data)

        return returnData
