'''
store the NLP model inner states during the evaluation process

'''


class hiddenStateRecorder:
    def __init__(self):
        pass

    '''
    '''
    def sentenceEncoder(self, sentence, code, layerInfo):
        pass


    def save(self, outputPath):
        import bson
        with open(outputPath, 'w') as outfile:
            hiddenSen = self.hiddenStore["senEncode"]
            self.hiddenStore["senEncode"]={}
            for
            bson.dump(self.hiddenStore, outfile)
