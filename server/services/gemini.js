import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI;

function initGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
    console.log('Gemini AI service initialized');
  } else {
    console.log('Gemini API key not set - AI analysis disabled');
  }
}

async function analyzeReport(decryptedText) {
  if (!genAI) {
    return {
      isSpam: false,
      urgencyScore: 5,
      category: 'other',
      credibilityScore: 5,
      reasoning: 'AI analysis not available',
      suggestedAction: 'investigate'
    };
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `You are a content moderator for an anonymous crime reporting platform.
Analyze this report and respond with JSON only:

Report:
"""
${decryptedText}
"""

Respond with this exact JSON structure:
{
  "isSpam": boolean,
  "urgencyScore": number (1-10, 10 = most urgent),
  "category": "theft" | "assault" | "harassment" | "fraud" | "other",
  "credibilityScore": number (1-10),
  "reasoning": "brief explanation",
  "suggestedAction": "verify" | "investigate" | "reject"
}`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Parse JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Gemini analysis error:', error);
  }
  
  return {
    isSpam: false,
    urgencyScore: 5,
    category: 'other',
    credibilityScore: 5,
    reasoning: 'Unable to analyze',
    suggestedAction: 'investigate'
  };
}

export {
  initGemini,
  analyzeReport
};
