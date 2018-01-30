from nltk.parse.stanford import StanfordDependencyParser

def getDependencyTree(sentence):
    path_to_jar = '/Users/lizhimin/Desktop/NLPModelExplorer/data/snli_1.0/stanford-corenlp-3.8.0.jar'
    path_to_models_jar = '/Users/lizhimin/Desktop/NLPModelExplorer/data/snli_1.0/stanford-corenlp-3.8.0-models.jar'
    dependency_parser = StanfordDependencyParser(path_to_jar=path_to_jar, path_to_models_jar=path_to_models_jar)
    
    g = dependency_parser.raw_parse(sentence).next()
    
    
    dep_json = []
    
    for _, node in sorted(g.nodes.items()):
        if node['word'] is not None:
            for key in node['deps']:
                if len(node['deps'][key]) == 0:
                    continue
                else:
                    for v in node['deps'][key]:
                        dep_json.append([node['address'], key, v])
           
    return dep_json      
    #return list(g.triples())