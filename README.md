# NLPModelExplorer

## Intro
- The code was extensively modified from Harvard NLP's reimplimentation of Ankur Parikh's decomposable attention model https://github.com/harvardnlp/decomp-attn

## Setup

### 1. Install
- Please install numpy, pytorch, h5py, requests, nltk 
- Download model and data file (download from google drive):  
   `cd src; python downloadModels.py`

### 1. Training
- The pre-trained model will be loaded.
   
### 2. Test the model
- Using the pretrained model to do evaluation on val set. Expect to see `Val: 0.8631, Loss: 0.3750`
- To test run the following:  
  `eval.py --gpuid -1 --data ../data/snli_1.0/snli_1.0-val.hdf5 --word_vecs ../data/glove.hdf5 --encoder proj --attention local --classifier local --dropout 0.0 --load_file ../data/local_300_parikh`
  
  
   
### 3. Run the visualization server
 - Start the server:  
   `python exampleVis.py` 
 - Then open the browser at http://localhost:5050/
 
