from itertools import izip
import json

# srcName = "../../data/snli_1.0/src-dev.txt.short.perturbed"
# targName = "../../data/snli_1.0/targ-dev.txt.short.perturbed"
# predName = "../pred_short.txt"
srcName = "../../data/snli_1.0/src-dev.txt.perturbed"
targName = "../../data/snli_1.0/targ-dev.txt.perturbed"
predName = "../pred.txt"
# predName = "../pred_full.txt"

outputName = "data.js"

listOfDict = []
with open(srcName) as src, open(targName) as targ, open(predName) as pred:

    previousSS = None
    targetList = []
    targetPredList = []
    count = 0
    for ss, st, p in izip(src, targ, pred):
        # print ss, st, p
        if ss[0] == '-':
            # print targetList
            # print ss
            # print "-----"

            count = count+1
            # print "count", count, listOfDict
            if count == 1000:
                break

            cDict = dict()
            cDict['src'] = previousSS
            cDict['targ'] = targetList
            cDict['pred'] = targetPredList
            listOfDict.append(cDict)

            targetList = []
            targetPredList = []
            continue

        previousSS = ss

        #need to record this for every line
        targetList.append(st)
        predDict = dict()

        for sp in p.split(', '):
            # print sp
            predDict[sp.split(' ')[0]] = float(sp.split(' ')[1])
        targetPredList.append(predDict)
        # print targetList, targetPredList

    #write last entry
    # print listOfDict
    cDict = dict()
    cDict['src'] = previousSS
    cDict['targ'] = targetList
    cDict['pred'] = targetPredList
    listOfDict.append(cDict)

    # print listOfDict
    with open(outputName, 'w') as outfile:
        outfile.write("var sdata = ")
        json.dump(listOfDict, outfile)
