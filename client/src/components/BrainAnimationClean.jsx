import React from "react";
import { motion } from "framer-motion";

export default function BrainAnimation({ emotion = "Neutral" }) {
  const colorMap = {
    Happy: "from-yellow-400 to-orange-500",
    Sad: "from-blue-500 to-indigo-700",
    Angry: "from-red-600 to-pink-700",
    Fear: "from-purple-500 to-purple-800",
    Neutral: "from-cyan-500 to-blue-700",
  };

  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg flex flex-col items-center">
      <h2 className="text-xl font-semibold mb-4">🧠 Brain Activity</h2>
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          rotate: [0, 5, -5, 0],
          boxShadow: ["0 0 10px #00ffff", "0 0 25px #00ffff", "0 0 10px #00ffff"],
        }}
        transition={{ duration: 3, repeat: Infinity }}
        className={`w-40 h-40 bg-gradient-to-tr ${colorMap[emotion]} rounded-full flex items-center justify-center text-4xl font-bold text-white`}
      >
        {emotion === "Happy" ? "😊" : emotion === "Sad" ? "😢" : "🌀"}
      </motion.div>
      <p className="mt-4 text-gray-400 text-sm">Emotion: {emotion}</p>
    </div>
  );
}
