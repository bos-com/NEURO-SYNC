import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5001", // Node.js backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

// 🎙️ Send voice transcription for analysis (returns text + audio response)
export const sendVoiceData = async (text, language = 'en') => {
  try {
    const response = await API.post("/voice/analyze", { text, language });
    return response.data;
  } catch (error) {
    console.error("Error sending voice data:", error);
    throw error;
  }
};

// 🔊 Get audio response for text
export const getAudioResponse = async (text, language = 'en') => {
  try {
    const response = await API.post("/voice/speak", { text, language });
    return response.data;
  } catch (error) {
    console.error("Error getting audio response:", error);
    throw error;
  }
};

// 💬 Send text message to AI
export const sendTextMessage = async (text) => {
  try {
    const response = await API.post("/ai/message", { text });
    return response.data;
  } catch (error) {
    console.error("Error sending text message:", error);
    if (error.response) {
      // Server responded with error
      throw new Error(error.response.data?.error || `Server error: ${error.response.status}`);
    } else if (error.request) {
      // Request made but no response
      throw new Error("Cannot connect to server. Make sure the server is running on port 5001.");
    } else {
      // Something else happened
      throw new Error(error.message || "Failed to send message");
    }
  }
};

export default API;
