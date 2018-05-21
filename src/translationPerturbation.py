##### using translation to generate paraphrased sentences #####
class translationPerturbation:
    def __init__(self, authFilePath):
        self.jsonPath = authFilePath
        self.explicitAuth()

    def perturbSentence(self, inputSentence):
        pass


    def explicitAuth(self):
        from google.cloud import translate

        # Explicitly use service account credentials by specifying the private key
        # file.
        translate_client = translate.Client.from_service_account_json(
            self.jsonPath)

        # The text to translate
        text = u'Hello, world!'
        # The target language
        target = 'ru'

        # Translates some text into Russian
        translation = translate_client.translate(
            text,
            target_language=target)

        print u'Text: {}'.format(text)
        print u'Translation: {}'.format(translation['translatedText'])

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
