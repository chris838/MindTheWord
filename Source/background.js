console.log("Starting up MindTheWord background page");
var storage = chrome.storage.local;

// defaultStorage is used if the storage has not been initialized yet.
var defaultStorage = {
    initialized: true,
    activation: true,
    blacklist: "(stackoverflow.com|github.com|code.google.com|developer.*.com|duolingo.com)",
    savedPatterns: JSON.stringify([[["en", "English"], ["it", "Italian"], "25", true],
        [["en", "English"], ["la", "Latin"], "15", false]]),
    sourceLanguage: "en",
    targetLanguage: "it",
    translatedWordStyle: "font-style: inherit;\ncolor: rgba(255,153,0,1);\nbackground-color: rgba(256, 100, 50, 0);",
    userBlacklistedWords: "(this|that)",
    translationProbability: 15,
    minimumSourceWordLength: 3,
    ngramMin: 1,
    ngramMax: 1,
    userDefinedTranslations: '{"the":"the", "a":"a"}',
    translatorService: "Google Translate",
    yandexTranslatorApiKey: ""
};


/**
 * @desc initialize storage if needed
 */
function initializeStorage() {
    storage.get(null, function (storage) {
        if (JSON.stringify(storage) == "{}") {
            console.log("setting storage to defaultStorage: ");
            console.log(JSON.stringify(defaultStorage));
            storage.set(defaultStorage);
        }
    });
}
initializeStorage();

function getData(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            callback(JSON.parse(xhr.responseText));
        }
    };
    xhr.send();
}

function onMessage(request, sender, sendResponse) {
    console.log("onMessage ");
    console.log(request);
    if (request.wordsToBeTranslated) {
        console.log("words to be translated:", request.wordsToBeTranslated);
        storage.get(null, function (prefs) {
            translateOneRequestPerFewWords(request.wordsToBeTranslated, prefs, function (tMap) {
                console.log("translations:", tMap);
                sendResponse({translationMap: tMap});
            });
        });
        //console.log(length(request.wordsToBeTranslated));
    }
    else if (request.getOptions) {
        storage.get(null, function (data) {
            data.script = [chrome.extension.getURL("/assets/js/mtw.js")];
            console.log("sending getOptions data");
            console.log(data);
            sendResponse(data);
        });
    }
    else if (request.runMindTheWord) {
        chrome.tabs.onUpdated.addListener(function (tabId, info) { //Wait until page has finished loading
            if (info.status == "complete") {
                console.log(info.status);
                sendResponse(true);
            }
        })
    }
    return true;
}
chrome.runtime.onMessage.addListener(onMessage);

function browserActionClicked() {
    chrome.tabs.create({url: chrome.extension.getURL("options.html")});
}

google_analytics('UA-1471148-13');
console.log("Done setting up MindTheWord background page");
