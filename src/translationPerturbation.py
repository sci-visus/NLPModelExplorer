##### using translation to generate paraphrased sentences #####
from google.cloud import translate

class translationPerturbation:
    def __init__(self, authFilePath='../key/Paraphrasing-684a368e96ad.json'):
        self.translate_client = translate.Client.from_service_account_json(authFilePath)

    def perturbSentence(self, inputSentence):
        # The text to translate
        # text = u'Hello, world!'
        # The target language
        # targLangs = [entry["language"] for entry in self.translate_client.get_languages()]
        # print "Supported language: ", targLangs

        targLangs = [
        u'ar',
        u'zh',
        u'cs',
        u'da',
        u'nl',
        u'fr',
        u'de',
        u'iw',
        u'hi',
        u'it',
        u'ja',
        u'ko',
        u'tr'
        ]
        sentenceList = set()

        ### the default model is NMT
        for target in targLangs:
            # Translates some text into Russian
            translation = self.translate_client.translate(
                inputSentence,
                target_language=target)
            # print translation
            outputSentence = self.translate_client.translate(
                translation["translatedText"],
                source_language=target,
                target_language=u'en')
            # print outputSentence
            sentenceList.add(outputSentence["translatedText"])

        return list(sentenceList)
