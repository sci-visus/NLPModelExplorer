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
# from __future__ import print_function

class batchEvaluation:
    def __init__(self, srcFile, targFile, labelFile, saveFileName=None):
        #load input pair and grouth truth label
        self.srcFile = srcFile
        self.targFile = targFile
        self.labelFile = labelFile
        if saveFileName:
            self.saveFileName = saveFileName

    def initialize(self):
        if self.saveFileName:
            try:
                with open(self.saveFileName, 'rb') as handle:
                    self.storage = pickle.load(handle)
                    print self.storage.keys()
            except:
                print "File:", self.saveFileName, "does not exist. Generate prediction now ..."
                self.generatePerturbedPrediction()
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

    '''
        generate statistics and write to a JSON file
    '''
    def generateStatistic(self):
        wrongPred = 0
        allPred = 0
        labels = ["entailment", "neutral", "contradiction"]
        self.storage["perturbErrorRatio"] = []
        preOrigIndex = None
        origIndex = None
        for index, srcSen in enumerate(self.storage["srcSens"]):
            if index > 200:
                break
            pred = labels[np.argmax(self.storage["pred"][index])]
            # print  self.storage["mapToOrigIndex"]
            origIndex = self.storage["mapToOrigIndex"][index]
            # print len(self.storage["origLabel"]), origIndex
            # print len(self.storage["origPred"])
            origLabel = self.storage["origLabel"][origIndex]
            if pred is not origLabel:
                wrongPred = wrongPred + 1

            allPred = allPred + 1

            if preOrigIndex and preOrigIndex is not origIndex:

                origPred = self.storage["origPred"][origIndex]
                ratio = float(wrongPred)/float(allPred)
                # self.storage["perturbErrorRatio"].append(ratio)
                print ratio

                #### reset variable ####
                wrongPred = 0
                allPred = 0

            preOrigIndex = origIndex

    def generatePerturbedPrediction(self):
        self.storage = {}

        ##### same length as original ######
        self.storage["origSrc"] = []
        self.storage["origTarg"] = []
        self.storage["origLabel"] = []
        self.storage["origPred"] = []

        ##### perturbed length ######
        self.storage["srcSens"] = []
        self.storage["targSens"] = []
        self.storage["mapToOrigIndex"] = []
        self.storage["pred"] = []

        num_lines = sum(1 for line in open(self.labelFile))
        index = 0
        for _, (src_orig, targ_orig, label_orig) in \
            enumerate(itertools.izip(open(self.srcFile,'r'),
            open(self.targFile,'r'),open(self.labelFile,'r'))):
                # generate perturbation
                # print index, src_orig, targ_orig, label_orig
                targ_perb = self.perturb(targ_orig)
                if self.verify(src_orig) and self.verify(targ_orig):
                    self.storage["origSrc"].append(src_orig)
                    self.storage["origTarg"].append(targ_orig)
                    self.storage["origLabel"].append(label_orig)
                    self.storage["origPred"].append(self.predict([src_orig,targ_orig]))

                    for targ in targ_perb:
                        self.storage["srcSens"].append(src_orig)
                        self.storage["targSens"].append(targ)
                        self.storage["mapToOrigIndex"].append(index)
                        pred = self.predict([src_orig, targ])
                        self.storage["pred"].append(pred)

                    index = index + 1
                    ##### statistic #####

                # batch prediction
                if index % 10 == 0:
                    item = "  processing:" + str(float(index)/float(num_lines)*100.0) + "%" + str(index)
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
    evaluator = batchEvaluation("../data/snli_1.0/src-test.txt",
                           "../data/snli_1.0/targ-test.txt",
                           "../data/snli_1.0/label-test.txt",
                           "../data/test-pred-statistic.pkl" )

    ###### dev set ######
    # evaluator = batchEvaluation("../data/snli_1.0/src-dev.txt",
    #                        "../data/snli_1.0/targ-dev.txt",
    #                        "../data/snli_1.0/label-dev.txt",
    #                        "../data/test-pred-statistic.pkl" )
    evaluator.setPredictionHook(model.predict)
    evaluator.setAttentionHook(model.attention)
    evaluator.setSentencePerturbationHook(gen.perturbSentence)
    evaluator.setSentenceVerifyHook(gen.verifySentence)

    evaluator.initialize()
    evaluator.generateStatistic()

if __name__ == '__main__':
	sys.exit(main(sys.argv[1:]))
