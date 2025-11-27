import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { sendVoiceData } from "../services/api";

export default function VoiceRecorder({ onVoiceSent }) {
  const { t, i18n } = useTranslation();
  const recognitionRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [text, setText] = useState("");
  const [processing, setProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef(null);

  const handleRecord = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech Recognition not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!recording) {
      // Start recording
      const recog = new SpeechRecognition();
      const langMap = {
        'en': 'en-US',
        'es': 'es-ES',
        'fr': 'fr-FR',
        'sw': 'sw-TZ',
        'lg': 'lg-UG'
      };
      recog.lang = langMap[i18n.language] || 'en-US';
      recog.continuous = true;
      recog.interimResults = true;
      
      recog.onresult = (e) => {
        const transcript = Array.from(e.results)
          .map((r) => r[0].transcript)
          .join(" ");
        setText(transcript);
      };

      recog.onend = () => {
        if (recording && text.trim()) {
          handleSendVoice(text.trim());
        }
        setRecording(false);
        setRecordingTime(0);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };

      recog.onerror = (e) => {
        console.error('Speech recognition error:', e);
        setRecording(false);
      };

      recog.start();
      recognitionRef.current = recog;
      setRecording(true);
      setText("");
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      // Stop recording
      recognitionRef.current?.stop();
      setRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (text.trim()) {
        handleSendVoice(text.trim());
      }
      setRecordingTime(0);
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleSendVoice = async (transcribedText) => {
    if (!transcribedText.trim()) return;

    setProcessing(true);
    try {
      const response = await sendVoiceData(transcribedText, i18n.language);
      
      // Notify parent component (ChatBox) about the voice message
      if (onVoiceSent) {
        onVoiceSent({
          userText: transcribedText,
          aiResponse: response.message,
          audioUrl: response.audioUrl,
          emotion: response.emotion,
          confidence: response.confidence,
          suggestions: response.suggestions
        });
      }
      
      setText("");
    } catch (error) {
      console.error("Error processing voice:", error);
      const errorMsg = error.message || 'Server not responding';
      alert(`NeuroSync: Error processing voice - ${errorMsg}`);
    } finally {
      setProcessing(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-800 p-4 rounded-2xl shadow">
      <h2 className="text-xl font-semibold mb-2">🎤 {t('voiceRecorder.title')}</h2>
      {recording && (
        <div className="mb-2 p-2 bg-red-900/30 rounded text-sm flex items-center gap-2">
          <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
          <span className="font-mono font-bold">{formatTime(recordingTime)}</span>
        </div>
      )}
      {text && (
        <div className="mb-2 p-2 bg-gray-700 rounded text-sm">
          📝 <span className="font-semibold">Transcribed:</span> {text}
        </div>
      )}
      <button
        onClick={handleRecord}
        disabled={processing}
        className={`px-6 py-2 rounded-lg font-medium disabled:opacity-50 ${
          recording ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {processing ? t('chat.thinking') : recording ? t('voiceRecorder.stop') : t('voiceRecorder.start')}
      </button>
      {recording && (
        <div className="mt-2 text-sm text-red-400 animate-pulse">🔴 Recording... Speak now!</div>
      )}
    </div>
  );
}
