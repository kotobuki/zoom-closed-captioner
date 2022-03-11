const startListeningLabel = '音声認識を開始する';
const stopListeningLabel = '音声認識を終了する';

const toggleListeningButton = document.getElementById("toggleListeningButton");
toggleListeningButton.value = startListeningLabel;
toggleListeningButton.addEventListener("click", updateButton);

function updateButton() {
  if (toggleListeningButton.value === startListeningLabel) {
    toggleListeningButton.value = stopListeningLabel;
    startRecognition();
  } else {
    stopRecognition();
    toggleListeningButton.value = startListeningLabel;
  }
}

window.SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
let recognition;
let isRecognizing = false;
let isListening = false;

function startRecognition() {
  recognition = new webkitSpeechRecognition();
  recognition.interimResults = true;
  recognition.continuous = true;
  recognition.lang = "ja";

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
        document.forms["caption"].submit();
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
}

function stopRecognition() {
  isListening = false;
  recognition.stop();
}
