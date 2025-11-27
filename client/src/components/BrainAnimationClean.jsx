import React from "react";

export default function BrainAnimation({ emotion = "Neutral" }) {
  const colorMap = {
    Happy: "from-yellow-400 to-orange-500",
    Sad: "from-blue-500 to-indigo-700",
    Angry: "from-red-600 to-pink-700",
    Anxious: "from-purple-500 to-purple-800",
    Neutral: "from-cyan-500 to-blue-700",
  };

  const emojiMap = {
    Happy: "😊",
    Sad: "😢",
    Angry: "😠",
    Anxious: "😰",
    Neutral: "🌀",
  };

  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg flex flex-col items-center">
      <h2 className="text-xl font-semibold mb-4">🧠 Brain Activity</h2>
      <div
        className={`w-40 h-40 bg-gradient-to-tr ${colorMap[emotion] || colorMap.Neutral} rounded-full flex items-center justify-center text-4xl font-bold text-white animate-pulse`}
        style={{
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        }}
      >
        {emojiMap[emotion] || emojiMap.Neutral}
      </div>
      <p className="mt-4 text-gray-400 text-sm">Emotion: {emotion}</p>
    </div>
  );
}
