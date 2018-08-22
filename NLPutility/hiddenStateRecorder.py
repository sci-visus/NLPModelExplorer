'''
store the NLP model inner states during the evaluation process

'''

#### for baseline performance
# from sklearn.neighbors import NearestNeighbors
from bson import dumps, loads

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
        exit()

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
        with open(outputPath, 'w') as outfile:
            dumps(self.hiddenStore, outfile)

    def load(self, inputPath):
        with open(inputPath, 'w') as inputfile:
            self.hiddenStore = loads(inputfile)

    def buildSearchIndex(self, stateName=None):
        if stateName == None:
            ## build index for all keys
            pass
        else:
            store = self.hiddenStore[stateName]

    def neighborLookup(self, stateName, tag):
        # default baseline implementation
        pass
