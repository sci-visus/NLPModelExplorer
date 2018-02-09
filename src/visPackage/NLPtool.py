from nltk.parse.stanford import StanfordDependencyParser
import hashlib

class dependencyTree:
    def __init__(self):
        self.cache = {}

    def hashSentence(self, sentence):
        string = " ".join(sentence)
        hex_dig = hashlib.sha1(string).hexdigest()
        print(hex_dig)
        return hex_dig

    def getDependencyTree(self, sentence):
        # return {}
        hashKey = self.hashSentence(sentence)
        if hashKey in self.cache.keys():
            print "found:", sentence
            return self.cache[hashKey]
        else:
            path_to_jar = '../data/stanford-corenlp-3.9.0.jar'
            path_to_models_jar = '../data/stanford-corenlp-3.9.0-models.jar'
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

            self.cache[hashKey] = dep_json
            return dep_json
        #return list(g.triples())
