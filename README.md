# NLPModelExplorer

### This branch is a reimplementation of the master branch using Pytorch

### First thins first, here is the TODO:
   - fit to visualization interface

## Intro
- The code was extensively modified from Harvard NLP's reimplimentation of Ankur Parikh's decomposable attention model https://github.com/harvardnlp/decomp-attn

## Setup
- Please install numpy, torch, h5py
- For data files, please refer to those data in master branch

### 1. Training
  `python train.py --gpuid 1 --train_data ../../learnlab/data/snli_1.0-train.hdf5 --val_data ../../learnlab/data/snli_1.0-val.hdf5 --word_vecs ../../learnlab/data/glove.hdf5 --encoder proj --attention local --classifier local --dropout 0.2 --epochs 200 --save_file local_200_parikh | tee local_200_parikh.txt`
  
  This will function the same as the traning script in master branch. The trained model will be saved accordingly. Expect to see accuracy to be around 0.83 on val set. The trained model has been uploaded.

### 2. Evaluation
  `python eval.py --gpuid 1 --data ../data/snli_1.0-val.hdf5 --word_vecs ../data/glove.hdf5 --encoder proj --attention local --classifier local --dropout 0.0 --load_file local_200_parikh`
  
   Using the pretrained model to do evaluation on val set. Expect to see `Val: 0.8335, Loss: 0.8335`
   
  
### 3. Attention Printing
  To print intermediate variables during forward pass, checkout the mechanism of `forward_hooks.py`. For instance, to print out soft attention (i.e. attention yielded by softmax), run the following:
  
  `python eval.py --gpuid -1 --data ../../learnlab/data/snli_1.0-val.hdf5 --word_vecs ../../learnlab/data/glove.hdf5 --encoder proj --attention local --classifier local --dropout 0.0 --load_file local_200_parikh --forward_hooks print_att_soft1 --att_output val_att`
  
  This will print out soft attention to the specified path as a hdf5 file. To print more stuff, simply extend `forward_hooks.py` file.
