const multer = require('multer');
const { textToSpeech } = require('../services/speechServices');
const { detectEmotion, getSuggestions } = require('../services/emotionService');

// Configure multer for audio file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Accept audio files
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'), false);
    }
  }
});

async function analyzeVoice(req, res) {
  try {
    // For now, we'll accept text from voice transcription (done on client side)
    // In the future, we can add server-side speech-to-text here
    const { text, language = 'en' } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text from voice transcription is required' });
    }

    // Process the message (same as text message) - now uses external API if available
    const emotionData = await detectEmotion(text);
    const suggestions = getSuggestions(emotionData.emotion);

    // Generate response
    let response = '';
    switch (emotionData.emotion.toLowerCase()) {
      case 'happy':
        response = `I'm glad you're feeling happy! ${suggestions[0]}`;
        break;
      case 'sad':
        response = `I'm sorry you're feeling down. ${suggestions[0]} Remember, it's okay to feel this way.`;
        break;
      case 'angry':
        response = `I understand you're feeling frustrated. ${suggestions[0]} Let's work through this together.`;
        break;
      case 'anxious':
        response = `It sounds like you're feeling anxious. ${suggestions[0]} Take your time, I'm here to listen.`;
        break;
      default:
        response = `I hear you. ${suggestions[0]}`;
    }
    response += ` How else can I help you today?`;

    // Generate text-to-speech audio
    let audioBuffer;
    try {
      audioBuffer = await textToSpeech(response, language);
    } catch (ttsError) {
      console.error('TTS Error:', ttsError);
      // Return response without audio if TTS fails
      return res.json({
        message: response,
        emotion: emotionData.emotion,
        confidence: emotionData.confidence,
        suggestions: suggestions,
        audioUrl: null
      });
    }

    // Convert audio buffer to base64 for sending to client
    const audioBase64 = audioBuffer.toString('base64');
    const audioDataUrl = `data:audio/mpeg;base64,${audioBase64}`;

    res.json({
      message: response,
      emotion: emotionData.emotion,
      confidence: emotionData.confidence,
      suggestions: suggestions,
      audioUrl: audioDataUrl
    });
  } catch (error) {
    console.error('Error analyzing voice:', error);
    res.status(500).json({ error: 'Failed to process voice input' });
  }
}

async function getAudioResponse(req, res) {
  try {
    const { text, language = 'en' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const audioBuffer = await textToSpeech(text, language);
    const audioBase64 = audioBuffer.toString('base64');
    const audioDataUrl = `data:audio/mpeg;base64,${audioBase64}`;

    res.json({ audioUrl: audioDataUrl });
  } catch (error) {
    console.error('Error generating audio:', error);
    res.status(500).json({ error: 'Failed to generate audio' });
  }
}

module.exports = {
  analyzeVoice,
  getAudioResponse,
  upload
};

