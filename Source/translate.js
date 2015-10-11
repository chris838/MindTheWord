function translateOneRequestPerFewWords(words, prefs, callback) {
    //console.debug("words: " + JSON.stringify(words));
    var concatWords = "";
    var length = 0;
    var maxLength = 800;
    var concatWordsArray = {};
    var cWALength = 1;

    for (word in words) {
        //console.debug("word: " + word);
        concatWords += word + ". ";
        //console.debug("concatWords: " + concatWords);
        concatWordsArray[cWALength] = concatWords;
        length += encodeURIComponent(word + ". ").length;

        if (length > maxLength) {
            cWALength++;
            concatWords = "";
            length = 0;
        }
    }
    var tMap = {};
    translateORPFWRec(concatWordsArray, 1, cWALength, tMap, prefs, callback);
}

var translator = {
    translate: function (prefs, word) {
    }
};

var googleTranslator = function () {
};
googleTranslator.prototype = Object.create(translator);

var yandexTranslator = function () {
};
yandexTranslator.prototype = Object.create(translator);

/**
 * @desc Constructs google translate url
 * @params User saved preferences
 * @params word to be translated
 * @return Google Translate query from source to destination language
 */
googleTranslator.prototype.translate = function (prefs, word, callback) {
    var url = 'http://translate.google.com/translate_a/t?client=f&otf=1&pc=0&hl=en';
    var sL = prefs["sourceLanguage"];
    if (sL != 'auto') {
        url += '&sl=' + sL;
    }
    url += '&tl=' + prefs["targetLanguage"];
    url += '&text=';
    url += word;

    getData(url, function (result) {
        var tMap = {};
        for (var i in result.sentences) {
            var orig = result.sentences[i].orig;
            var origT = orig.substring(0, orig.length - 1);
            var trans = result.sentences[i].trans;
            var transT = trans.replace(/[.\u3002]/, ""); // removes punctuation
            tMap[origT] = transT;
        }
        callback(tMap);
    });
};

yandexTranslator.prototype.translate = function (prefs, word, callback) {
    var apikey = prefs["yandexTranslatorApiKey"];

    var url = "https://translate.yandex.net/api/v1.5/tr.json/translate?key=" + apikey;
    url += "&lang=" + prefs["sourceLanguage"] + "-" + prefs["targetLanguage"];

    // currently a hack to create array of words, ideally it would be better to passdown an array of words.
    var words = word.split('.');
    for (var i = 0; i < words.length; i++) {
        url += "&text=" + words[i].trim(' ');
    }

    getData(url, function (result) {
        var tMap = {};
        for (var i = 0; i < words.length; i++) {
            var origT = words[i].trim(' ');
            var transT = result.text[i];
            tMap[origT] = transT;
        }
        callback(tMap);
    });
};

var TranslatorFactory = {
    getTranslator: function (type) {
    }
};

var ConcreteTranslatorFactory = function () {
};

ConcreteTranslatorFactory.prototype = Object.create(TranslatorFactory);
ConcreteTranslatorFactory.prototype.getTranslator = function (type) {
    if (type === "Google Translate") {
        return new googleTranslator();
    }
    return new yandexTranslator();
};

function translateORPFWRec(concatWordsArray, index, length, tMap, prefs, callback) {
    console.log("translateORPFWRec");
    console.debug("concatWordsArray: " + JSON.stringify(concatWordsArray));
    console.debug("index: " + index + "; length: " + length);
    if (index > length) callback(tMap);
    else {
        new new ConcreteTranslatorFactory().getTranslator(prefs.translatorService).translate(prefs, concatWordsArray[index],
            function (pMap) {
                for (var key in pMap) {
                    if (pMap.hasOwnProperty(key)) {
                        tMap[key] = pMap[key];
                    }
                }
                translateORPFWRec(concatWordsArray, index + 1, length, tMap, prefs, callback);
            });
    }
}
