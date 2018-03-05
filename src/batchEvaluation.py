'''
    batch test and summarize the data prediction resutl

    require:
        - input pairs
        - model hooks
        - perturbation hooks
'''
from modelInterface import *
from sentenceGenerator import *
import pickle
import itertools

class batchEvaluation:
    def __init__(self, srcFile, targFile, labelFile, saveFileName=None):
        #load input pair and grouth truth label
        self.srcFile = srcFile
        self.targFile = targFile
        self.labelFile = labelFile

        if saveFileName:
            self.saveFileName = saveFileName
            try:
                with open(self.saveFileName, 'rb') as handle:
                    self.storage = pickle.load(handle)
            except:
                print "File:", saveFileName, "does not exist. Generate prediction now ..."
                # evaluator.generatePerturbedPrediction()
        #     self.storage = saveFile
        # perturbation type: only perturb target/ perturb all

    def setSentencePerturbationHook(self, perturb):
        self.perturb = perturb

    def setPredictionHook(self, predict):
        self.predict =  predict

    def setAttentionHook(self, att):
        self.att = att

    '''
        this should also provide batch attentions
    '''
    def setBatchPredictionHook(self, batchPredict):
        self.batchPredict = batchPredict

    def setSentenceVerifyHook(self, verify):
        self.verify = verify

    def generateStatistic(self):
        pass

    def generatePerturbedPrediction(self):
        # from __future__ import print_function

        self.storage = {}
        self.storage["origSrc"] = []
        self.storage["origTarg"] = []
        self.storage["srcSens"] = []
        self.storage["targSens"] = []
        self.storage["mapToOrigIndex"] = []
        self.storage["origPred"] = []
        self.storage["pred"] = []

        num_lines = sum(1 for line in open(self.labelFile))
        for index, (src_orig, targ_orig, label_orig) in \
            enumerate(itertools.izip(open(self.srcFile,'r'),
            open(self.targFile,'r'),open(self.labelFile,'r'))):
                # generate perturbation
                # print index, src_orig, targ_orig, label_orig
                targ_perb = self.perturb(targ_orig)
                if self.verify(src_orig) and self.verify(targ_orig):
                    self.storage["origSrc"].append(src_orig)
                    self.storage["origTarg"].append(targ_orig)
                    self.storage["origLabel"].append(label_orig)
                    self.storage["origPred"] = self.predict([src_orig,targ_orig])

                    for targ in targ_perb:
                        self.storage["srcSens"].append(src_orig)
                        self.storage["targSens"].append(targ)
                        self.storage["mapToOrigIndex"].append(index)
                        pred = self.predict([src_orig, targ])
                        self.storage["pred"].append(pred)

                    ##### statistic #####
                    

                # batch prediction
                if index % 10 == 0:
                    item = "  processing:" + str(float(index)/float(num_lines)*100.0) + "%"
                    print item
                    # print(item, flush=True)

                # summary prediction deviation
        with open(self.saveFileName, 'wb') as handle:
            pickle.dump(self.storage, handle, protocol=pickle.HIGHEST_PROTOCOL)

def main(args):

    #### model ####
    model = modelInterface(
        wordDict="../data/snli_1.0/snli_1.0.word.dict",
        wordVec="../data/glove.hdf5", model="../data/local_300_parikh")

    #sentence perturbation
    gen = sentenceGenerator()

    ###### test set ######
    # evaluator = batchEvaluation("../data/snli_1.0/src-test.txt",
    #                        "../data/snli_1.0/targ-test.txt",
    #                        "../data/snli_1.0/label-test.txt",
    #                        "../data/test-pred-statistic.pkl" )

    ###### dev set ######
    evaluator = batchEvaluation("../data/snli_1.0/src-dev.txt",
                           "../data/snli_1.0/targ-dev.txt",
                           "../data/snli_1.0/label-dev.txt",
                           "../data/test-pred-statistic.pkl" )
    evaluator.setPredictionHook(model.predict)
    evaluator.setAttentionHook(model.attention)
    evaluator.setSentencePerturbationHook(gen.perturbSentence)
    evaluator.setSentenceVerifyHook(gen.verifySentence)

if __name__ == '__main__':
	sys.exit(main(sys.argv[1:]))
