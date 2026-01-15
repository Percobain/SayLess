// Tavily Web Search Service
// Uses Tavily SDK to search the web for context related to crime reports
// Includes domain reputation scoring like SatyaTrail

import { tavily } from '@tavily/core';

let tvly;

// Domain reputation classifications
const DOMAIN_REPUTATION = {
  // High reputation news sources (90+ score)
  high: [
    'reuters.com', 'apnews.com', 'bbc.com', 'bbc.co.uk',
    'theguardian.com', 'nytimes.com', 'washingtonpost.com',
    'thehindu.com', 'indianexpress.com', 'ndtv.com',
    'timesofindia.indiatimes.com', 'hindustantimes.com',
    'economictimes.indiatimes.com', 'livemint.com',
    'pib.gov.in', 'gov.in', 'who.int', 'un.org',
    'aljazeera.com', 'cnn.com', 'nbcnews.com', 'cbsnews.com',
    'abc.net.au', 'france24.com', 'dw.com'
  ],
  // Medium reputation sources (70 score)
  medium: [
    'indiatoday.in', 'news18.com', 'firstpost.com',
    'thequint.com', 'scroll.in', 'theprint.in',
    'moneycontrol.com', 'businesstoday.in', 'thedrum.com',
    'newsweek.com', 'haaretz.com', 'bloomberg.com',
    'forbes.com', 'businessinsider.com', 'vice.com'
  ],
  // Fact-check sources (85 score - trusted for verification)
  factCheck: [
    'snopes.com', 'factcheck.org', 'politifact.com',
    'altnews.in', 'boomlive.in', 'thequint.com/news/webqoof',
    'vishvasnews.com', 'factcrescendo.com'
  ],
  // Low reputation / social media (30 score)
  low: [
    'twitter.com', 'x.com', 'facebook.com', 'instagram.com',
    'tiktok.com', 'reddit.com', 'youtube.com', 'medium.com',
    'wordpress.com', 'blogspot.com', 'tumblr.com'
  ]
};

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
 * Calculate domain reputation score based on source classification
 * @param {string} url - URL to evaluate
 * @returns {Object} Reputation info with score and tier
 */
function calculateDomainReputation(url) {
  try {
    const domain = new URL(url).hostname.toLowerCase();
    
    // Check fact-check sources first (highest trust for verification)
    for (const d of DOMAIN_REPUTATION.factCheck) {
      if (domain.includes(d)) {
        return { score: 85, tier: 'fact-check', domain };
      }
    }
    
    // Check high reputation sources
    for (const d of DOMAIN_REPUTATION.high) {
      if (domain.includes(d)) {
        return { score: 90, tier: 'high', domain };
      }
    }
    
    // Check medium reputation sources
    for (const d of DOMAIN_REPUTATION.medium) {
      if (domain.includes(d)) {
        return { score: 70, tier: 'medium', domain };
      }
    }
    
    // Check low reputation sources
    for (const d of DOMAIN_REPUTATION.low) {
      if (domain.includes(d)) {
        return { score: 30, tier: 'low', domain };
      }
    }
    
    // Government and educational domains
    if (domain.endsWith('.gov') || domain.endsWith('.gov.in')) {
      return { score: 95, tier: 'government', domain };
    }
    if (domain.endsWith('.edu') || domain.endsWith('.ac.in')) {
      return { score: 85, tier: 'educational', domain };
    }
    if (domain.endsWith('.org')) {
      return { score: 75, tier: 'organization', domain };
    }
    
    // Default score for unknown domains
    return { score: 50, tier: 'unknown', domain };
  } catch {
    return { score: 50, tier: 'unknown', domain: 'unknown' };
  }
}

/**
 * Get role classification based on content type
 * @param {Object} result - Search result
 * @param {number} index - Result index
 * @returns {string} Role type
 */
function classifySourceRole(result, index) {
  const title = (result.title || '').toLowerCase();
  const content = (result.content || '').toLowerCase();
  
  if (title.includes('fact check') || title.includes('debunk') || title.includes('verify')) {
    return 'verifier';
  }
  if (title.includes('breaking') || title.includes('exclusive') || content.includes('first reported')) {
    return 'origin';
  }
  if (title.includes('report') || title.includes('according to') || content.includes('citing')) {
    return 'amplifier';
  }
  if (index === 0) {
    return 'primary';
  }
  return 'commentary';
}

/**
 * Search the web for context related to a crime report with source reputation
 * @param {string} query - Search query derived from the report
 * @returns {Promise<Object>} Search results with context and source network
 */
async function searchWeb(query) {
  if (!tvly) {
    return {
      success: false,
      context: 'Web search not available',
      sources: [],
      sourceNetwork: null
    };
  }

  try {
    console.log('[Tavily] Researching:', query.substring(0, 100) + '...');
    
    // Main search for relevant news
    const response = await tvly.search(query, {
      searchDepth: 'advanced',
      maxResults: 8,
      topic: 'news'
    });

    console.log('[Tavily] Response received:', response.results?.length || 0, 'results');
    
    // Also search fact-check sources specifically
    let factCheckResults = [];
    try {
      const factCheckResponse = await tvly.search(`fact check ${query.substring(0, 100)}`, {
        searchDepth: 'basic',
        maxResults: 3,
        includeDomains: DOMAIN_REPUTATION.factCheck
      });
      factCheckResults = factCheckResponse.results || [];
      console.log('[Tavily] Fact-check results:', factCheckResults.length);
    } catch (e) {
      console.log('[Tavily] Fact-check search skipped:', e.message);
    }
    
    // Combine and deduplicate results
    const allResults = [...(response.results || []), ...factCheckResults];
    const seenUrls = new Set();
    const uniqueResults = allResults.filter(r => {
      if (seenUrls.has(r.url)) return false;
      seenUrls.add(r.url);
      return true;
    });
    
    // Process sources with reputation scoring
    const sources = uniqueResults.map((r, idx) => {
      const reputation = calculateDomainReputation(r.url);
      const role = classifySourceRole(r, idx);
      
      return {
        id: `source_${idx}`,
        title: r.title,
        url: r.url,
        snippet: r.content?.substring(0, 300) || '',
        publishDate: r.published_date || null,
        domain: reputation.domain,
        reputationScore: reputation.score,
        reputationTier: reputation.tier,
        role: role,
        timestamp: new Date().toISOString()
      };
    });
    
    // Sort by combined relevance and reputation
    sources.sort((a, b) => {
      const scoreA = a.reputationScore;
      const scoreB = b.reputationScore;
      return scoreB - scoreA;
    });
    
    // Build source network graph
    const sourceNetwork = buildSourceNetwork(sources);

    return {
      success: true,
      answer: response.answer || '',
      context: sources.map(s => `${s.title}: ${s.snippet}`).join('\n\n'),
      sources,
      sourceNetwork,
      metadata: {
        totalAnalyzed: sources.length,
        highCredibility: sources.filter(s => s.reputationScore >= 80).length,
        mediumCredibility: sources.filter(s => s.reputationScore >= 60 && s.reputationScore < 80).length,
        lowCredibility: sources.filter(s => s.reputationScore < 60).length,
        factCheckSources: sources.filter(s => s.reputationTier === 'fact-check').length,
        verifiedAt: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('[Tavily] Search error:', error);
    return {
      success: false,
      context: 'Web search error',
      sources: [],
      sourceNetwork: null,
      error: error.message
    };
  }
}

/**
 * Build a source network graph for visualization
 * @param {Array} sources - Processed sources
 * @returns {Object} Network graph with nodes and edges
 */
function buildSourceNetwork(sources) {
  if (!sources || sources.length === 0) {
    return { nodes: [], edges: [] };
  }
  
  const nodes = sources.map((source, idx) => ({
    id: source.id,
    label: source.domain,
    title: source.title,
    url: source.url,
    role: source.role,
    reputationScore: source.reputationScore,
    reputationTier: source.reputationTier,
    timestamp: source.timestamp,
    // Position for 3D visualization (will be computed client-side, but we can suggest)
    position: {
      x: Math.cos((idx / sources.length) * Math.PI * 2) * 2,
      y: Math.sin((idx / sources.length) * Math.PI * 2) * 2,
      z: (source.reputationScore - 50) / 25 // Higher rep = higher position
    }
  }));
  
  // Create edges between related sources (simplified - connect based on similarity)
  const edges = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      // Connect sources that are likely related (same tier or adjacent in results)
      if (j === i + 1 || nodes[i].reputationTier === nodes[j].reputationTier) {
        edges.push({
          id: `edge_${i}_${j}`,
          from: nodes[i].id,
          to: nodes[j].id,
          relationship: nodes[i].role === 'origin' ? 'amplifies' : 'references'
        });
      }
    }
  }
  
  return { nodes, edges };
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
  generateSearchQuery,
  calculateDomainReputation,
  buildSourceNetwork
};
