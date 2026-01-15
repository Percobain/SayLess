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

/**
 * Analyze evidence files for AI-generated content detection
 * @param {Array} files - Array of decrypted files with dataUrl, type, filename
 * @returns {Promise<Array>} - Array of file analysis results
 */
async function analyzeEvidenceFiles(files) {
  if (!genAI || !files || files.length === 0) {
    return [];
  }
  
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const results = [];
  
  for (const file of files) {
    try {
      // Only analyze images and videos
      if (!file.type?.startsWith('image/') && !file.type?.startsWith('video/')) {
        results.push({
          filename: file.filename,
          type: file.type,
          isAnalyzable: false,
          verdict: 'Not an image or video - cannot analyze for AI generation',
          isAIGenerated: null,
          confidence: 0
        });
        continue;
      }
      
      // For images, use vision capabilities
      if (file.type?.startsWith('image/') && file.dataUrl) {
        // Extract base64 data from dataUrl
        const base64Data = file.dataUrl.split(',')[1];
        if (!base64Data) {
          results.push({
            filename: file.filename,
            type: file.type,
            isAnalyzable: false,
            verdict: 'Invalid image data',
            isAIGenerated: null,
            confidence: 0
          });
          continue;
        }
        
        const imagePart = {
          inlineData: {
            data: base64Data,
            mimeType: file.type
          }
        };
        
        const prompt = `You are a forensic evidence analyst for a crime reporting platform. Your job is to determine if submitted images are VALID EVIDENCE.

Analyze this image for:
1. AI GENERATION: Is this image generated by AI (DALL-E, Midjourney, Stable Diffusion, etc.)?
2. EVIDENCE VALIDITY: Is this a valid piece of evidence for a crime report?

IMPORTANT: An image is NOT VALID EVIDENCE if ANY of these are true:
- It has a WATERMARK (Shutterstock, Getty, iStock, Adobe Stock, etc.)
- It is a STOCK PHOTO (generic/staged professional photo)
- It is a CARTOON, ILLUSTRATION, or DRAWING
- It is a MEME or edited with text overlays
- It is a SCREENSHOT of another website or social media
- It appears to be downloaded from the internet (not original)
- It is clearly not related to documenting a real incident

An image IS VALID EVIDENCE only if:
- It appears to be an ORIGINAL photograph taken to document an incident
- It has no stock photo watermarks
- It looks like genuine documentation (not staged/professional)

Look for AI generation signs:
- Distorted faces, hands, or text
- Unnatural textures or patterns
- Inconsistent lighting/shadows
- AI artifacts

Respond with this exact JSON structure:
{
  "isAIGenerated": boolean (true if AI-generated),
  "confidence": number (0-100),
  "verdict": "1-2 sentence explanation",
  "artifacts": ["list of issues found"],
  "isValidEvidence": boolean (MUST be false for stock photos, cartoons, watermarked images, memes, illustrations),
  "evidenceAssessment": "why this is or isn't valid evidence"
}`;

        const result = await model.generateContent([prompt, imagePart]);
        const response = result.response.text();
        
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          results.push({
            filename: file.filename,
            type: file.type,
            isAnalyzable: true,
            ...parsed
          });
        } else {
          results.push({
            filename: file.filename,
            type: file.type,
            isAnalyzable: false,
            verdict: 'Could not parse AI analysis',
            isAIGenerated: null,
            confidence: 0
          });
        }
      } else if (file.type?.startsWith('video/')) {
        // For videos, we can only provide a note since Gemini has limited video analysis
        results.push({
          filename: file.filename,
          type: file.type,
          isAnalyzable: false,
          verdict: 'Video analysis requires frame extraction - manual review recommended',
          isAIGenerated: null,
          confidence: 0,
          isValidEvidence: null,
          evidenceAssessment: 'Video content requires manual verification'
        });
      }
    } catch (error) {
      console.error(`[Gemini] Error analyzing file ${file.filename}:`, error);
      results.push({
        filename: file.filename,
        type: file.type,
        isAnalyzable: false,
        verdict: 'Analysis failed: ' + error.message,
        isAIGenerated: null,
        confidence: 0
      });
    }
  }
  
  return results;
}

export {
  initGemini,
  analyzeReport,
  analyzeEvidenceFiles
};
