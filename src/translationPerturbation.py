##### using translation to generate paraphrased sentences #####
from google.cloud import translate

class translationPerturbation:
    def __init__(self, authFilePath):

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

    def translate_text_with_model(target, text, model):
        """Translates text into the target language.

        Make sure your project is whitelisted.

        Target must be an ISO 639-1 language code.
        See https://g.co/cloud/translate/v2/translate-reference#supported_languages
        """
        translate_client = translate.Client()

        if isinstance(text, six.binary_type):
            text = text.decode('utf-8')

        # Text can also be a sequence of strings, in which case this method
        # will return a sequence of results for each text.
        result = translate_client.translate(
            text, target_language=target, model=model)

        print(u'Text: {}'.format(result['input']))
        print(u'Translation: {}'.format(result['translatedText']))
        print(u'Detected source language: {}'.format(
            result['detectedSourceLanguage']))
