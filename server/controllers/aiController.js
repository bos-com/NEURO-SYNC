const { detectEmotion, getSuggestions } = require('../services/emotionService');

async function handleMessage(req, res) {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text message is required' });
    }

    // Detect emotion from the message (now async - uses external API if available)
    const emotionData = await detectEmotion(text);
    const suggestions = getSuggestions(emotionData.emotion);

    // Generate a contextual response
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

    // Add a follow-up question
    response += ` How else can I help you today?`;

    res.json({
      message: response,
      emotion: emotionData.emotion,
      confidence: emotionData.confidence,
      suggestions: suggestions
    });
  } catch (error) {
    console.error('Error handling message:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
}

module.exports = { handleMessage };

