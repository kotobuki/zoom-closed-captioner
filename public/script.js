window.SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
let recognition;
let isRecognizing = false;
let isListening = false;

const startListeningLabel = "音声認識を開始する";
const stopListeningLabel = "音声認識を終了する";

const autoSubmitCheckbox = document.getElementById("autoSubmitCheckbox");
let isAutoSubmitEnabled = autoSubmitCheckbox.checked;
autoSubmitCheckbox.addEventListener("change", () => {
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

const submitCaptionButton = document.getElementById("submitCaptionButton");

submitCaptionButton.addEventListener("click", () => {
  document.forms["caption"].submit();
  if (recognizedText.textContent.length > 0) {
    captionText.value = recognizedText.textContent;
    recognizedText.textContent = "";
  } else {
    captionText.value = "";
  }

  if (!isAutoSubmitEnabled) {
    captionText.focus();
  }
});

const languageMenu = document.getElementById("language");

// https://cloud.google.com/speech-to-text#section-2
const languages = {
  "日本語 (日本)": "ja-JP",
  "English (Great Britain)": "en-GB",
  "English (United States)": "en-US",
};
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

const captionText = document.getElementById("captionText");
const recognizedText = document.getElementById("recognizedText");
const resultText = document.getElementById("resultText");
const status = document.getElementById("status");

function startRecognition() {
  recognition = new webkitSpeechRecognition();
  recognition.interimResults = true;
  recognition.continuous = true;
  recognition.lang = language;

  recognition.onsoundstart = function () {
    status.textContent = "認識中";
  };

  recognition.onnomatch = function () {
    status.textContent = "もう一度試してください";
  };

  recognition.onerror = function (event) {
    if (event.error === "aborted") {
      status.textContent = "停止中";
    } else {
      status.textContent = `エラー：${event.error}`;
    }
    if (isListening && isRecognizing == false) startRecognition();
  };

  recognition.onsoundend = function () {
    status.textContent = "停止中";
    if (isListening) {
      startRecognition();
    }
  };

  recognition.onresult = function (event) {
    var results = event.results;
    for (var i = event.resultIndex; i < results.length; i++) {
      if (results[i].isFinal) {
        resultText.textContent = "";

        const captionTextHasFocus =
          document.activeElement.id === captionText.id &&
          captionText.value.length > 0;

        if (!captionTextHasFocus) {
          captionText.value = results[i][0].transcript;
          if (isAutoSubmitEnabled) {
            document.forms["caption"].submit();
          }
        } else {
          recognizedText.insertAdjacentText(
            "beforeend",
            results[i][0].transcript
          );
        }
        if (isListening) {
          startRecognition();
        }
      } else {
        resultText.textContent = "［認識中］" + results[i][0].transcript;
        isRecognizing = true;
      }
    }
  };

  isRecognizing = false;
  status.textContent = "待機中";
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
