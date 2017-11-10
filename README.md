# NLPModelExplorer

### First things first, here is a todo list:
- Import AllenNLP's decomposable attention model. (This is important to make future work simpler) For now, this reimplementation works for the current purpose.
- Filter perturbed sentences by killing tokens that are not in training set.

## Intro
- The code was extensively modified from Harvard NLP's reimplimentation of Ankur Parikh's decomposable attention model https://github.com/harvardnlp/decomp-attn

## Setup

If you care about training and processing, goto step 1, else goto step 3.

### 1. Training
  First, train the model (a pretrained model is already given in the repo)
  - Install torch, following instructions in http://torch.ch/docs/getting-started.html.
  - luarocks install rnn
  - luarocks install cutorch (cuda device is required for training; it's not essential if only need to use the model)
  - install hdf5 module, following instructions here https://github.com/deepmind/torch-hdf5/blob/master/doc/usage.md
  - goto src/ and run this command:
    `th train.lua -gpuid 1 -data_file ../data/snli_1.0-train.hdf5 -val_data_file ../data/snli_1.0-val.hdf5 -test_data_file ../data/snli_1.0-test.hdf5 -pre_word_vecs ../data/glove.hdf5 -encoder proj -attention local -classifier local -loss nll -epochs 100 -savefile model_100_local_parikh | tee log_100_local_parikh.txt`
    All required data files are in the repo. After 100 epoches training, the model and log will be saved into the paths specified.
    
### 2. Sentence Perturbation
  The purpose of this section is to replace nouns in a sentence with synonyms and antonyms and observe how the model predict. Given premise and hypothesis, only hypothesis sentence will be perturbed while premise sentence will be duplicated (to make sure 1 premise and 1 hypothesis per example).
  - Simply run this command:
    `python sentence_perturbation.py ../data/snli_1.0/src-dev.txt ../data/snli_1.0/targ-dev.txt`
    Then perturbed files are `../data/snli_1.0/src-dev.txt.perturbed` and `../data/snli_1.0/targ-dev.txt.perturbed`
    
### 3. Prediction
  Then we can use the pretrained model to make prediction on the perturbed dataset.
  TODO
  
