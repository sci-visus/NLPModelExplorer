from nltk.parse.stanford import StanfordDependencyParser

def getDependencyTree(sentence):
    path_to_jar = '/Users/lizhimin/Desktop/NLPModelExplorer/data/snli_1.0/stanford-corenlp-3.8.0.jar'
    path_to_models_jar = '/Users/lizhimin/Desktop/NLPModelExplorer/data/snli_1.0/stanford-corenlp-3.8.0-models.jar'
    dependency_parser = StanfordDependencyParser(path_to_jar=path_to_jar, path_to_models_jar=path_to_models_jar)
    
    
    rs = dependency_parser.raw_parse(sentence)
    
    dep = rs.next()
    
    print sentence
    return list(dep.triples())