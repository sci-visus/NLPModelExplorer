from flask import Flask ,render_template,request,json,jsonify
import numpy as np
import h5py


app = Flask(__name__)
######################################################################
@app.route('/')
def index():
    return render_template('attentionVis.html')

@app.route('/_getSentences', methods=['GET', 'POST'])
def getSentences():
    source = '../../data/snli_1.0/src-dev.txt'
    target = '../../data/snli_1.0/targ-dev.txt'
    
    #source sentence
    s_sens = []
    with open(source) as f:
        lines = f.readlines()
    for line in lines:
        s_sens.append(line.strip())
    
    #target sentence
    t_sens = []
    with open(target) as f:
        lines = f.readlines()
    for line in lines:
        t_sens.append(line.strip())
    
    return json.dumps({'source':s_sens, 'target':t_sens})
    
@app.route('/_getData', methods=['GET', 'POST'])
def getData():
    
    rjson = request.get_json()
    sen1 = rjson['sen1']
    sen2 = rjson['sen2']
    index = str(rjson['index'])

    #get prediction label 
    label = '../../data/snli_1.0/label-dev.txt'
    with open(label) as f:
        labels = f.readlines()

    #get attention matrix
    file = h5py.File('../val_att.hdf5', 'r')    
    matrix = []
    for item in file[index]:
        matrix.extend(item.tolist())

    #get sentence parse tree
    src_sen_tree = json.load(open('../../data/snli_1.0/src-dev.json'))
    targ_sen_tree = json.load(open('../../data/snli_1.0/targ-dev.json'))

    result = {'sen1':sen1.strip().split(' ')}
    result['sen1_tree'] = targ_sen_tree[index] 
    result['sen2'] = sen2.strip().split(' ') 
    result['sen2_tree'] = src_sen_tree[index]
    result['matrix'] = matrix
    result['label'] = labels[int(index)]
    return json.dumps(result)

if __name__ == '__main__':
    app.run(debug=True)