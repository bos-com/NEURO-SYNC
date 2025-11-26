import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";

export default function VoiceRecorder() {
  const { t, i18n } = useTranslation();
  const recognitionRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [text, setText] = useState("");

  const handleRecord = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech Recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!recording) {
      // start
      const recog = new SpeechRecognition();
      recog.lang = i18n.language + "-US";
      recog.continuous = true;
      recog.interimResults = true;
      recog.onresult = (e) => {
        const transcript = Array.from(e.results)
          .map((r) => r[0].transcript)
          .join(" ");
        setText(transcript);
      };
      recog.start();
      recognitionRef.current = recog;
    } else {
      recognitionRef.current?.stop();
    }
    setRecording(!recording);
    // Later: integrate MediaRecorder + API
  };

  return (
    <div className="bg-gray-800 p-4 rounded-2xl shadow">
      <h2 className="text-xl font-semibold mb-2">🎤 {t('voiceRecorder.title')}</h2>
      <button
        onClick={handleRecord}
        className={`px-6 py-2 rounded-lg font-medium ${
          recording ? "bg-red-600" : "bg-green-600"
        }`}
      >
        {recording ? t('voiceRecorder.stop') : t('voiceRecorder.start')}
      </button>
    </div>
  );
}
