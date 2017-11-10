# NLPModelExplorer

First things first, here is a todo list:
- Import AllenNLP's decomposable attention model. (This is important to make future work simpler) For now, this reimplementation works for the current purpose.

Intro
- The code was extensively modified from Harvard NLP's reimplimentation of Ankur Parikh's decomposable attention model https://github.com/harvardnlp/decomp-attn

Setup

If you care about training and processing, goto step 1, else goto step

### 1. Training
  - Install torch, following instructions in http://torch.ch/docs/getting-started.html.
  - luarocks install rnn
  - luarocks install cutorch (cuda device is required for training; it's not essential if only need to use the model)
  - install hdf5 module, following instructions here https://github.com/deepmind/torch-hdf5/blob/master/doc/usage.md
  - run this command:
    `th train.lua -gpuid 1 -data_file ../data/snli_1.0-train.hdf5 -val_data_file ../data/snli_1.0-val.hdf5 -test_data_file ../data/snli_1.0-test.hdf5 -pre_word_vecs ../data/glove.hdf5 -encoder proj -attention local -classifier local -loss nll -epochs 100 -savefile model_100_local_parikh | tee log_100_local_parikh.txt`
  
