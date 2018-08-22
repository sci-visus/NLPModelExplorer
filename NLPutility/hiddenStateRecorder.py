'''
store the NLP model inner states during the evaluation process

'''

#### for baseline performance
# from sklearn.neighbors import NearestNeighbors
from bson import dumps, loads

class hiddenStateRecorder:
    def __init__(self):
        self.hiddenStore = {}
        self.currentTag = {}

    '''
        record state corresponding to a string (word, sentence, label, tag)
        in the neural network for high-dimensional lookup
    '''
    def saveTagState(self, stateName, tag, states=None):
        if stateName not in self.hiddenStore:
            self.hiddenStore[stateName] = {}

        self.currentTag[stateName] = tag
        if states:
            self.hiddenStore[stateName][tag] = states

    '''
        record the state when the corresponding tag can not be accessed
        in the same context, i.e., when the original sentence can not be
        accessed in the encoder layer.
    '''
    def appendTagState(self, stateName, states):
        if stateName in self.currentTag:
            tag = self.currentTag[stateName]
            self.hiddenStore[stateName][tag] = states
        #test
        exit()

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
