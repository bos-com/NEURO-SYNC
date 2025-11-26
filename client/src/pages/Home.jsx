import React from "react";
import VoiceRecorder from "../components/VoiceRecorder";
import ChatBox from "../components/ChatBoxClean";
import BrainAnimation from "../components/BrainAnimationClean";

export default function Home() {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 flex flex-col gap-4">
        <VoiceRecorder />
        <ChatBox />
      </div>
      <div className="flex justify-center items-center">
        <BrainAnimation />
      </div>
    </div>
  );
}
