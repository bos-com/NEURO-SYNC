import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import { useTranslation } from "react-i18next";
import { sendTextMessage, getAudioResponse } from "../services/api";

const ChatBox = forwardRef(function ChatBox(props, ref) {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState([
    { sender: "ai", text: t('chat.greeting') },
  ]);

  // Update greeting when language changes
  useEffect(() => {
    setMessages((prev) => {
      const updated = [...prev];
      if (updated[0] && updated[0].sender === 'ai') {
        updated[0] = { ...updated[0], text: t('chat.greeting') };
      }
      return updated;
    });
  }, [i18n.language, t]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(null);
  const audioRef = useRef(null);

  // Play audio from data URL
  const playAudio = (audioUrl) => {
    if (!audioUrl) return;
    
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    
    audio.onended = () => {
      setPlayingAudio(null);
    };
    
    audio.onerror = () => {
      console.error("Error playing audio");
      setPlayingAudio(null);
    };
    
    audio.play().catch(err => {
      console.error("Error playing audio:", err);
      setPlayingAudio(null);
    });
    
    setPlayingAudio(audioUrl);
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const handleSend = async (textToSend = null, useVoice = false) => {
    const messageText = textToSend || input.trim();
    if (!messageText) return;

    const userMsg = { sender: "user", text: messageText };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const res = await sendTextMessage(messageText);
      const aiMsg = { 
        sender: "ai", 
        text: res.message || "...",
        audioUrl: null,
        emotion: res.emotion,
        confidence: res.confidence,
        suggestions: res.suggestions
      };
      setMessages((prev) => [...prev, aiMsg]);
      
      // Always get audio response (for both voice and text)
      try {
        const audioRes = await getAudioResponse(res.message, i18n.language);
        if (audioRes.audioUrl) {
          // Update message with audio URL
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1].audioUrl = audioRes.audioUrl;
            return updated;
          });
          // Auto-play if voice mode, otherwise just make it available
          if (useVoice) {
            playAudio(audioRes.audioUrl);
          }
        }
      } catch (audioErr) {
        console.error("Error getting audio:", audioErr);
      }
    } catch (err) {
      console.error("API Error:", err);
      const errorMsg = err.message || 'Server not responding';
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: `NeuroSync: ${t('chat.error')} - ${errorMsg}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    addMessage: (message) => {
      setMessages((prev) => [...prev, message]);
      if (message.audioUrl) {
        playAudio(message.audioUrl);
      }
    }
  }));

  return (
    <div className="bg-gray-800 p-4 rounded-2xl shadow-lg flex flex-col h-96">
      <h2 className="text-xl font-semibold mb-3">💬 Chat</h2>
      <div className="flex-1 overflow-y-auto space-y-2 mb-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg max-w-[80%] ${
              msg.sender === "user"
                ? "bg-blue-600 self-end text-right ml-auto"
                : "bg-gray-700 text-left"
            }`}
          >
            {msg.emotion && (
              <div className="text-xs mb-1 opacity-75">
                🎭 Detected: <span className="font-semibold">{msg.emotion}</span>
                {msg.confidence && (
                  <span className="ml-1">({Math.round(msg.confidence * 100)}% confidence)</span>
                )}
              </div>
            )}
            <p className="text-sm">{msg.text}</p>
            {msg.suggestions && msg.suggestions.length > 0 && (
              <div className="mt-2 text-xs opacity-75">
                💡 Suggestions: {msg.suggestions.slice(0, 2).join(", ")}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="text-sm text-gray-400 animate-pulse">{t('chat.thinking')}</div>
        )}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your message..."
          className="flex-1 bg-gray-700 text-white p-2 rounded-lg outline-none"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading}
          className="bg-cyan-600 hover:bg-cyan-700 px-4 rounded-lg font-semibold disabled:opacity-50"
        >
          {t('chat.send')}
        </button>
      </div>
      {messages.filter(msg => msg.audioUrl).length > 0 && (
        <div className="mt-2 flex gap-2 flex-wrap">
          {messages.map((msg, i) => 
            msg.audioUrl && (
              <button
                key={`audio-${i}`}
                onClick={() => playAudio(msg.audioUrl)}
                className="text-xs bg-purple-600 hover:bg-purple-700 px-2 py-1 rounded"
              >
                🔊 Play {msg.sender === 'ai' ? 'AI' : 'Response'}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
});

export default ChatBox;
