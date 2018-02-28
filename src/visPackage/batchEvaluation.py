'''
    batch test and summarize the data
'''

class batchEvaluation:
    def __init__(self, saveFile):
        # self.model = model
        if saveFile:
            self.storage = saveFile
        pass

    def setPredictionHook(predict):
        self.predict =  predict

    '''
        this should also provide batch attentions
    '''
    def setBatchPredictionHook(batchPredict):
        self.batchPredict = batchPredict
