window.SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
let recognition;
let isRecognizing = false;
let isListening = false;

const startListeningLabel = "音声認識を開始する";
const stopListeningLabel = "音声認識を終了する";

const autoSubmitCheckbox = document.getElementById("enableAutoSubmit");
let isAutoSubmitEnabled = autoSubmitCheckbox.checked;
autoSubmitCheckbox.addEventListener("change", () => {
  console.log(autoSubmitCheckbox.checked);
  isAutoSubmitEnabled = autoSubmitCheckbox.checked;
});

const toggleListeningButton = document.getElementById("toggleListeningButton");
toggleListeningButton.addEventListener("click", () => {
  if (!isListening) {
    startRecognition();
  } else {
    stopRecognition();
  }
});
updateButton();

function updateButton() {
  if (isListening) {
    toggleListeningButton.value = stopListeningLabel;
  } else {
    toggleListeningButton.value = startListeningLabel;
  }
}

const languageMenu = document.getElementById("language");

// https://cloud.google.com/speech-to-text#section-2
const languages = { 日本語: "ja-JP", "English (Great Britain)": "en-GB" };
for (let label of Object.keys(languages)) {
  let option = document.createElement("option");
  option.text = label;
  languageMenu.add(option);
}
languageMenu.selectedIndex = 0;
languageMenu.addEventListener("change", updateLanguage);

let language;
updateLanguage();

function updateLanguage() {
  language = languages[languageMenu.value];
  stopRecognition();
}

function startRecognition() {
  recognition = new webkitSpeechRecognition();
  recognition.interimResults = true;
  recognition.continuous = true;
  recognition.lang = language;

  recognition.onsoundstart = function () {
    document.getElementById("status").innerHTML = "認識中";
  };

  recognition.onnomatch = function () {
    document.getElementById("status").innerHTML = "もう一度試してください";
  };

  recognition.onerror = function (event) {
    if (event.error === "aborted") {
      document.getElementById("status").innerHTML = "停止中";
    } else {
      document.getElementById("status").innerHTML = `エラー：${event.error}`;
    }
    if (isListening && isRecognizing == false) startRecognition();
  };

  recognition.onsoundend = function () {
    document.getElementById("status").innerHTML = "停止中";
    if (isListening) {
      startRecognition();
    }
  };

  recognition.onresult = function (event) {
    var results = event.results;
    for (var i = event.resultIndex; i < results.length; i++) {
      if (results[i].isFinal) {
        document.getElementById("resultText").innerHTML =
          results[i][0].transcript;
        document.getElementById("captionText").value = results[i][0].transcript;
        if (isAutoSubmitEnabled) {
          document.forms["caption"].submit();
        }
        if (isListening) {
          startRecognition();
        }
      } else {
        document.getElementById("resultText").innerHTML =
          "［認識中］" + results[i][0].transcript;
        isRecognizing = true;
      }
    }
  };

  isRecognizing = false;
  document.getElementById("status").innerHTML = "待機中";
  recognition.start();
  isListening = true;
  updateButton();
}

function stopRecognition() {
  if (!isListening) {
    return;
  }

  isListening = false;
  recognition.stop();
  updateButton();
}
