from flask import Flask ,render_template,request,json,jsonify
import numpy as np
import h5py


app = Flask(__name__)
######################################################################
@app.route('/')
def index():
    return render_template('attentionVis.html')
    
@app.route('/_getData', methods=['GET', 'POST'])
def getData():
    
    file = h5py.File('../dev_ali.hdf5', 'r')
    matrix = []
    for item in file['2']:
        matrix.extend(item.tolist())
    
    
    shape = file['2'].shape
    sen1 = ''
    for i in range(shape[0]):
        sen1 += '1 '
    
    sen2 = ''
    for j in range(shape[1]):
        sen2 += '2 '
    
    result = {'sen1':sen1.strip().split(' '), 'sen2': sen2.strip().split(' '), 'matrix':matrix}
    return json.dumps(result)

if __name__ == '__main__':
    app.run(debug=True)