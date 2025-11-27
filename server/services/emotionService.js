const natural = require('natural');
const { SentimentAnalyzer, PorterStemmer } = natural;
const axios = require('axios');

// Initialize sentiment analyzer (removed negation - not supported in this version)
let analyzer;
try {
  analyzer = new SentimentAnalyzer('English', PorterStemmer, []);
} catch (err) {
  console.warn('Sentiment analyzer failed, using keyword detection only:', err.message);
  analyzer = null;
}

// Emotion keywords mapping
const emotionKeywords = {
  happy: ['happy', 'joy', 'excited', 'great', 'wonderful', 'amazing', 'love', 'glad', 'pleased', 'fantastic', 'awesome'],
  sad: ['sad', 'depressed', 'down', 'unhappy', 'miserable', 'lonely', 'hurt', 'crying', 'upset', 'disappointed'],
  angry: ['angry', 'mad', 'furious', 'annoyed', 'frustrated', 'irritated', 'rage', 'hate'],
  anxious: ['anxious', 'worried', 'nervous', 'stressed', 'scared', 'afraid', 'fear', 'panic'],
  neutral: ['okay', 'fine', 'alright', 'normal', 'nothing', 'meh']
};

// Try to use external emotion detection API (Hugging Face)
async function detectEmotionWithAPI(text) {
  try {
    // Option 1: Hugging Face Emotion Detection (Free, no API key needed for inference)
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base',
      { inputs: text },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000 // 5 second timeout
      }
    );

    if (response.data && Array.isArray(response.data) && response.data[0]) {
      const emotions = response.data[0];
      // Find the emotion with highest score
      const topEmotion = emotions.reduce((max, emotion) => 
        emotion.score > max.score ? emotion : max
      );

      // Map Hugging Face emotions to our emotion categories
      const emotionMap = {
        'joy': 'Happy',
        'sadness': 'Sad',
        'anger': 'Angry',
        'fear': 'Anxious',
        'surprise': 'Happy',
        'disgust': 'Angry',
        'neutral': 'Neutral'
      };

      const mappedEmotion = emotionMap[topEmotion.label] || 'Neutral';
      
      return {
        emotion: mappedEmotion,
        confidence: topEmotion.score,
        source: 'huggingface',
        raw: emotions
      };
    }
  } catch (error) {
    console.log('External API not available, using local detection:', error.message);
    return null;
  }
}

// Local emotion detection (fallback)
function detectEmotionLocal(text) {
  if (!text || typeof text !== 'string') {
    return { emotion: 'Neutral', confidence: 0.5, source: 'local' };
  }

  const lowerText = text.toLowerCase();
  const scores = {};
  
  // Count keyword matches
  Object.keys(emotionKeywords).forEach(emotion => {
    scores[emotion] = emotionKeywords[emotion].reduce((count, keyword) => {
      return count + (lowerText.includes(keyword) ? 1 : 0);
    }, 0);
  });

  // Use sentiment analysis
  if (analyzer) {
    try {
      const sentiment = analyzer.getSentiment(text.split(' '));
      
      // Combine keyword matching with sentiment
      if (sentiment > 0.3) {
        scores.happy = (scores.happy || 0) + 2;
      } else if (sentiment < -0.3) {
        scores.sad = (scores.sad || 0) + 2;
        scores.angry = (scores.angry || 0) + 1;
      }
    } catch (err) {
      console.error('Sentiment analysis error:', err);
    }
  }

  // Find dominant emotion
  const maxScore = Math.max(...Object.values(scores));
  const detectedEmotion = Object.keys(scores).find(
    emotion => scores[emotion] === maxScore
  ) || 'neutral';

  const confidence = Math.min(maxScore / 5, 1.0);

  return {
    emotion: detectedEmotion.charAt(0).toUpperCase() + detectedEmotion.slice(1),
    confidence: confidence,
    source: 'local',
    scores: scores
  };
}

// Main emotion detection function - tries API first, falls back to local
async function detectEmotion(text) {
  // Try external API first
  const apiResult = await detectEmotionWithAPI(text);
  if (apiResult) {
    return apiResult;
  }
  
  // Fallback to local detection
  return detectEmotionLocal(text);
}

function getSuggestions(emotion) {
  const suggestions = {
    Happy: [
      "That's wonderful! Keep spreading positivity!",
      "Consider journaling about what made you happy today",
      "Share your joy with someone you care about"
    ],
    Sad: [
      "I'm here for you. Consider talking to a friend or therapist",
      "Try some light exercise or a walk in nature",
      "Listen to uplifting music or watch something comforting"
    ],
    Angry: [
      "Take deep breaths and count to ten",
      "Try physical activity to release tension",
      "Consider what's really bothering you and address it calmly"
    ],
    Anxious: [
      "Practice deep breathing exercises",
      "Try meditation or mindfulness",
      "Break down what's worrying you into smaller, manageable steps"
    ],
    Neutral: [
      "How can I help you feel better today?",
      "Is there something specific on your mind?",
      "Would you like to talk about anything?"
    ]
  };

  return suggestions[emotion] || suggestions.Neutral;
}

module.exports = { detectEmotion, getSuggestions };
