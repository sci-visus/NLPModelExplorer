'''
python eval.py --gpuid -1 --data ../data/snli_1.0-val.hdf5
 --word_vecs ../data/glove.hdf5 --encoder proj
 --attention local --classifier local
 --dropout 0.0
 --load_file local_200_parikh
'''

class modelInterface:
    #setup model
    def __init__(self, data, wordVec, model, encoder="proj", attention="local",
                classifier="local", dropout=0.0):
        pass

    #evaluate model
    def predict(sentencePair):
        p = [0.1, 0.3, 0.6]
        pred = dict()
        pred["entail"] = p[0]
        pred["neutral"] = p[1]
        pred["contradict"] = p[2]
        return pred
