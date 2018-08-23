'''
store the NLP model inner states during the evaluation process

'''

#### for baseline performance
# from sklearn.neighbors import NearestNeighbors
import bson
import numpy as np

class hiddenStateRecorder:
    def __init__(self):
        self.hiddenStore = {}

        #### for appendTagState
        self.currentTag = {}

    '''
        record state corresponding to a string (word, sentence, label, tag)
        in the neural network for high-dimensional lookup
    '''
    def saveTagState(self, stateType, tag, states=None):
        if stateType not in self.hiddenStore:
            self.hiddenStore[stateType] = {}

        self.currentTag[stateType] = tag
        if states is not None:
            self.hiddenStore[stateType][tag] = states

    '''
        record the state when the corresponding tag can not be accessed
        in the same context, i.e., when the original sentence can not be
        accessed in the encoder layer.
    '''
    def appendTagState(self, stateType, states):
        if stateType in self.currentTag:
            tag = self.currentTag[stateType]
            self.hiddenStore[stateType][tag] = states

    def save(self, outputPath):
        with open(outputPath, 'w') as f:
            f.write(bson.BSON.encode(self.hiddenStore))

    def load(self, inputPath):
        with open(inputPath, 'w') as f:
            self.hiddenStore = bson.decode_all(f.read())

    def buildSearchIndex(self, stateType=None):
        if stateType == None:
            stateType = self.hiddenStore.keys()[0]

        store = self.hiddenStore[stateType]
        self.hiddenStore[stateType] = {}
        size = len(store)
        print "build index for ", size, " sentence ..."
        data = self.hiddenStore[stateType]["data"] = np.zeros( (store[store.keys()[0]].size, size) )
        sen2index = self.hiddenStore[stateType]["sen2index"] = {}
        index2sen = self.hiddenStore[stateType]["index2sen"] = []

        for index, key in enumerate(store.keys()):
            entry = store[key]
            # print entry
            data[:,index] = entry
            sen2index[key] = index
            index2sen.append(key)
        # print "data:", data.shape
        # print "sentence:", sentence

    def neighborLookup(self, stateType, tag, k=20):
        # default baseline implementation
        sen2index = self.hiddenStore[stateType]["sen2index"]
        index2sen = self.hiddenStore[stateType]["index2sen"]

        index = sen2index[tag]
        data = self.hiddenStore[stateType]["data"]
        ref = data[:,index]
        # print np.squeeze(np.array(np.matrix(data).T*np.matrix(ref).T))
        #euclidean distance
        dist = np.linalg.norm(data-np.vstack(ref), axis=0)
        indices = np.argsort(dist)[0:k]
        #cosine distance
        # indices = np.argsort(np.squeeze(np.array(np.matrix(data).T*np.matrix(ref).T)))
        indices = indices[0:k]
        # print indices
        neighbors = {}
        neighbors["sentence"] = [index2sen[ind] for ind in indices]
        neighbors["distance"] = [dist[ind] for ind in indices]

        # print indices[0:20]
        return neighbors
