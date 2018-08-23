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
        sentence = self.hiddenStore[stateType]["sentence"] = {}

        for index, key in enumerate(store.keys()):
            entry = store[key]
            # print entry
            data[:,index] = entry
            sentence[key] = index
        # print "data:", data.shape
        # print "sentence:", sentence

    def neighborLookup(self, stateType, tag, k=20):
        # default baseline implementation
        index = self.hiddenStore[stateType]["sentence"][tag]
        data = self.hiddenStore[stateType]["data"]
        ref = data[:,index]
        # print np.linalg.norm(data-np.vstack(ref), axis=0)
        indices = np.argsort(np.linalg.norm(data-np.vstack(ref), axis=0))
        # print indices[0:20]
        return indices[0:k]
