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

async function analyzeReport(decryptedText, webContext = null) {
  if (!genAI) {
    return {
      isSpam: false,
      urgencyScore: 5,
      category: 'other',
      credibilityScore: 5,
      possibilityScore: 50,
      verdict: 'AI analysis not available. Manual review required.',
      reasoning: 'AI analysis not available',
      suggestedAction: 'investigate',
      webSearchUsed: false
    };
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    // Build prompt with optional web context
    let contextSection = '';
    if (webContext && webContext.success && webContext.context) {
      contextSection = `
Web Search Context (from Tavily):
"""
${webContext.answer || ''}

Related Sources:
${webContext.context}
"""

Use this web context to verify claims in the report if relevant. If the web search found related news or information, factor it into your credibility assessment.
`;
    }

    const prompt = `You are a content moderator for an anonymous crime reporting platform.
Analyze this crime report and respond with JSON only:

Report:
"""
${decryptedText}
"""
${contextSection}
Analyze the report for:
1. Whether it appears to be spam or a false report
2. The urgency level (how quickly should authorities respond)
3. The crime category
4. How credible the report seems based on detail and consistency
5. The likelihood (0-100%) that this is a genuine, truthful report
6. A brief verdict summarizing your assessment
${webContext?.success ? '7. Whether the web search context supports or contradicts the report claims' : ''}

Respond with this exact JSON structure:
{
  "isSpam": boolean,
  "urgencyScore": number (1-10, 10 = most urgent),
  "category": "theft" | "assault" | "harassment" | "fraud" | "corruption" | "drugs" | "cybercrime" | "other",
  "credibilityScore": number (1-10),
  "possibilityScore": number (0-100, percentage likelihood the report is genuine),
  "verdict": "1-2 sentence summary of your assessment",
  "reasoning": "brief explanation of your analysis",
  "suggestedAction": "verify" | "investigate" | "reject"${webContext?.success ? ',\n  "webContextRelevance": "how the web search context relates to the report"' : ''}
}`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Parse JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      parsed.webSearchUsed = webContext?.success || false;
      return parsed;
    }
  } catch (error) {
    console.error('Gemini analysis error:', error);
  }
  
  return {
    isSpam: false,
    urgencyScore: 5,
    category: 'other',
    credibilityScore: 5,
    possibilityScore: 50,
    verdict: 'Unable to analyze report. Manual review recommended.',
    reasoning: 'Unable to analyze',
    suggestedAction: 'investigate',
    webSearchUsed: false
  };
}

export {
  initGemini,
  analyzeReport
};
