'''
store the NLP model inner states during the evaluation process

'''

#### for baseline performance
# from sklearn.neighbors import NearestNeighbors


class hiddenStateRecorder:
    def __init__(self):
        self.hiddenStore = {}
        self.currentTag = {}

    '''
        record state corresponding to a string (word, sentence, label, tag)
        in the neural network for high-dimensional lookup
    '''
    def saveTagState(self, stateName, tag, states=None):
        if stateName in self.hiddenStore:
            self.hiddenStore[stateName] = {}
        else:
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
        import bson
        with open(outputPath, 'w') as outfile:
            bson.dump(self.hiddenStore, outfile)

    def buildSearchIndex(self, stateName=None):
        if stateName == None:
            ## build index for all keys
            pass
        else:
            store = self.hiddenStore[stateName]

    def load(self, inputPath):
        import bson
        with open(inputPath, 'w') as outfile:
            bson.load(self.hiddenStore, outfile)

    def neighborLookup(self, stateName, tag):
        # default baseline implementation
        pass
