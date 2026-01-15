// Tavily Web Search Service
// Uses Tavily SDK to search the web for context related to crime reports

import { tavily } from '@tavily/core';

let tvly;

function initTavily() {
  const apiKey = process.env.TAVILY_API_KEY;
  if (apiKey) {
    tvly = tavily({ apiKey });
    console.log('Tavily search service initialized');
  } else {
    console.log('Tavily API key not set - web search disabled');
  }
}

/**
 * Search the web for context related to a crime report
 * @param {string} query - Search query derived from the report
 * @returns {Promise<Object>} Search results with context
 */
async function searchWeb(query) {
  if (!tvly) {
    return {
      success: false,
      context: 'Web search not available',
      sources: []
    };
  }

  try {
    console.log('[Tavily] Researching:', query.substring(0, 100) + '...');
    const response = await tvly.search(query, {
      searchDepth: 'basic',
      maxResults: 5
    });

    console.log('[Tavily] Response received:', response.results?.length || 0, 'results');
    
    // Extract relevant information
    const sources = (response.results || []).map(r => ({
      title: r.title,
      url: r.url,
      snippet: r.content?.substring(0, 200) || ''
    }));

    return {
      success: true,
      answer: response.answer || '',
      context: sources.map(s => `${s.title}: ${s.snippet}`).join('\n\n'),
      sources
    };

  } catch (error) {
    console.error('[Tavily] Search error:', error);
    return {
      success: false,
      context: 'Web search error',
      sources: []
    };
  }
}

/**
 * Generate a search query from a crime report
 * @param {string} reportText - The decrypted report text
 * @returns {string} A search query
 */
function generateSearchQuery(reportText) {
  // Extract key details from the report to create a search query
  // Focus on location, crime type, and any specific names/places mentioned
  const words = reportText.split(/\s+/).slice(0, 30).join(' ');
  return `crime report news ${words}`.substring(0, 200);
}

export {
  initTavily,
  searchWeb,
  generateSearchQuery
};
