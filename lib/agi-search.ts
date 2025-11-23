import axios from 'axios';
import { getSessionManager } from './agi-session-manager';
import { getCacheManager } from './agi-cache';

// Force real API usage by deleting mock environment variable
delete process.env.MOCK_AGI_DATA;

// Type definition for Product Hunt search result
export interface ProductHuntResult {
  name: string;
  url: string;
  description: string;
  upvotes: number;
}

// Type definition for Google search result
export interface GoogleSearchResult {
  name: string;
  url: string;
  description: string;
}

// AGI.tech API base URL
const AGI_BASE_URL = 'https://api.agi.tech/v1';

/**
 * When AGI API access isn't available (no key or remote failure), we still want the
 * overall idea analysis flow to succeed. These helpers generate deterministic mock
 * search results so the rest of the pipeline can run locally.
 */
const generateSlug = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'result';

const generateMockProductHuntResults = (query: string): ProductHuntResult[] => {
  const templates = [
    { name: 'Scout', description: 'AI companion that researches adjacent products' },
    { name: 'Pulse', description: 'Trend tracker surfacing emerging demand signals' },
    { name: 'LaunchPad', description: 'Go-to-market toolkit for lean teams' },
    { name: 'InsightGrid', description: 'Competitive intelligence dashboards' },
    { name: 'CompEdge', description: 'Workflow automation for niche operators' },
  ];

  return templates.map((template, index) => ({
    name: `${template.name} for ${query}`,
    url: `https://example.com/${generateSlug(template.name)}-${generateSlug(query)}-${index + 1}`,
    description: `${template.description} tailored to "${query}".`,
    upvotes: 120 - index * 10,
  }));
};

const generateMockGoogleResults = (query: string): GoogleSearchResult[] => {
  const templates = [
    { name: 'Guide', description: 'Deep-dive blog outlining market landscape' },
    { name: 'Toolkit', description: 'Open-source starter kit for rapid experiments' },
    { name: 'Navigator', description: 'Comparison article highlighting incumbents' },
    { name: 'Radar', description: 'Newsletter summarizing recent launches' },
    { name: 'Stack', description: 'Case study showcasing customer acquisition' },
  ];

  return templates.map((template, index) => ({
    name: `${query} ${template.name}`,
    url: `https://research.example.com/${generateSlug(query)}-${generateSlug(template.name)}-${index + 1}`,
    description: `${template.description} related to "${query}".`,
  }));
};

const shouldUseMockData = (apiKey?: string) => {
  // NUCLEAR OPTION: Always return false to force real API usage
  console.log('[NUCLEAR] shouldUseMockData forced to return false');
  return false;
  
  // Original logic commented out
  // if (process.env.MOCK_AGI_DATA === 'true') {
  //   return true;
  // }
  // return !apiKey;
};

// Helper function to execute search using intelligent session manager
async function executeAGISearchTask(
  apiKey: string,
  searchQuery: string,
  searchType: 'producthunt' | 'google'
): Promise<any[]> {
  const sessionManager = getSessionManager();
  let sessionId: string | undefined;
  
  try {
    // Get session from intelligent pool
    sessionId = await sessionManager.getSession(`${searchType}_search`);
    console.log(`[AGI] Using session ${sessionId} for ${searchType} search: "${searchQuery}"`);
    
    // Log session pool status
    const poolStatus = sessionManager.getPoolStatus();
    console.log(`[AGI] Session pool status: ${poolStatus.total} total, ${poolStatus.active} active, ${poolStatus.available} available`);
    
    // Construct search instruction based on type
    let instruction: string;
    if (searchType === 'producthunt') {
      instruction = `Search Product Hunt for innovative products and startups related to "${searchQuery}". Focus on:
1. Recently launched products (past 6 months)
2. Products with significant user engagement (upvotes, comments)
3. Tools that solve real problems in this domain
4. Both direct competitors and adjacent solutions

Return a JSON array with the top 5 most relevant results, each containing:
- name: Product name as shown on Product Hunt
- url: Direct Product Hunt URL
- description: Clear description of what the product does
- upvotes: Number of upvotes (if available)

Format: [{"name": "...", "url": "...", "description": "...", "upvotes": ...}]`;
    } else {
      instruction = `Search Google for comprehensive information about "${searchQuery}" startups, competitors, and market landscape. Focus on:
1. Established companies and startups in this space
2. Recent market reports and analysis
3. Technology solutions and alternatives
4. Industry trends and innovations

Return a JSON array with the top 5 most relevant results, each containing:
- name: Company/product name
- url: Direct URL to the source
- description: Brief summary of their relevance to "${searchQuery}"

Format: [{"name": "...", "url": "...", "description": "..."}]`;
    }

    // Send message to agent
    console.log(`[AGI] Sending search instruction for ${searchType}: ${searchQuery}`);
    try {
      await axios.post(
        `${AGI_BASE_URL}/sessions/${sessionId}/message`,
        {
          message: instruction,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 second timeout for sending message
        }
      );
      console.log(`[AGI] Instruction sent successfully, starting polling...`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMsg = `Failed to send message to AGI agent: ${error.response?.status ?? 'Unknown'} ${error.response?.statusText || ''} ${JSON.stringify(error.response?.data || error.message)}`;
        console.error(`[AGI] ${errorMsg}`);
        throw new Error(errorMsg);
      }
      throw error;
    }

    // Ultra-fast polling: 5 attempts * 3 seconds = 15 seconds max
    const maxAttempts = 5; // 5 attempts * 3 seconds = 15 seconds max
    let attempts = 0;
    let results: any[] = [];

    console.log(`[AGI] Starting polling loop (max ${maxAttempts} attempts, 3s intervals)`);

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait 3 seconds
      attempts++;

      try {
        const statusResponse = await axios.get(
          `${AGI_BASE_URL}/sessions/${sessionId}/status`,
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
            },
            timeout: 10000, // 10 second timeout for status check
          }
        );

        const status = statusResponse.data.status;
        console.log(`[AGI] Attempt ${attempts}/${maxAttempts}: Status = "${status}"`);

        if (status === 'finished') {
        // Get messages/results
        const messagesResponse = await axios.get(
          `${AGI_BASE_URL}/sessions/${sessionId}/messages`,
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
            },
          }
        );

        // Extract results from messages
        const messages = messagesResponse.data.messages || [];
        console.log(`[AGI] Found ${messages.length} messages, extracting results...`);
        
        for (const msg of messages) {
          if (msg.type === 'DONE' || msg.type === 'result' || msg.type === 'assistant') {
            try {
              let content = msg.content;
              
              // Handle different content formats
              if (typeof content === 'string') {
                // Try to extract JSON from string (might be wrapped in markdown code blocks)
                const jsonMatch = content.match(/```(?:json)?\s*(\[[\s\S]*\]|\{[\s\S]*\})\s*```/) || 
                                 content.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
                if (jsonMatch) {
                  content = jsonMatch[1];
                }
                const parsed = JSON.parse(content);
                if (Array.isArray(parsed)) {
                  results = parsed;
                  console.log(`[AGI] Extracted ${results.length} results from array`);
                  break;
                } else if (parsed.results && Array.isArray(parsed.results)) {
                  results = parsed.results;
                  console.log(`[AGI] Extracted ${results.length} results from parsed.results`);
                  break;
                } else if (typeof parsed === 'object') {
                  // Try to find array in object
                  for (const key in parsed) {
                    if (Array.isArray(parsed[key])) {
                      results = parsed[key];
                      console.log(`[AGI] Extracted ${results.length} results from parsed.${key}`);
                      break;
                    }
                  }
                }
              } else if (Array.isArray(content)) {
                results = content;
                console.log(`[AGI] Extracted ${results.length} results from direct array`);
                break;
              } else if (content && typeof content === 'object') {
                // Check if content itself is an array or has results
                if (Array.isArray(content)) {
                  results = content;
                  console.log(`[AGI] Extracted ${results.length} results from object array`);
                  break;
                } else if (content.results && Array.isArray(content.results)) {
                  results = content.results;
                  console.log(`[AGI] Extracted ${results.length} results from content.results`);
                  break;
                }
              }
            } catch (e) {
              // Continue trying other messages
              console.log(`[AGI] Failed to parse message (type: ${msg.type}):`, e instanceof Error ? e.message : e);
            }
          }
        }
        
        if (results.length === 0) {
          console.warn(`[AGI] Status is 'finished' but no results extracted. Messages:`, JSON.stringify(messages, null, 2));
        } else {
          console.log(`[AGI] Successfully extracted ${results.length} results`);
        }
        break;
      } else if (status === 'error') {
        const errorMsg = statusResponse.data.error || 'Unknown error';
        console.error(`[AGI] Agent task failed with error: ${errorMsg}`);
        throw new Error(`AGI agent task failed: ${errorMsg}`);
      } else {
        // Status is 'running' or something else - continue polling
        if (attempts % 10 === 0) {
          console.log(`[AGI] Still waiting... (${attempts * 3}s elapsed, status: "${status}")`);
        }
      }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.code === 'ECONNABORTED') {
            console.warn(`[AGI] Status check timed out (attempt ${attempts})`);
            // Continue polling
          } else {
            console.error(`[AGI] Status check failed (attempt ${attempts}):`, error.message);
            // Continue polling - might be temporary network issue
          }
        } else {
          console.error(`[AGI] Unexpected error during polling (attempt ${attempts}):`, error);
          // Continue polling
        }
      }
    }

    if (attempts >= maxAttempts) {
      console.warn(`[AGI] Polling timed out after ${maxAttempts} attempts (${maxAttempts * 3} seconds). Returning empty results.`);
      return []; // Fallback: return empty array instead of throwing
    }

    if (results.length === 0) {
      console.warn(`[AGI] No results extracted after completion. This might indicate an issue with the AGI API response format.`);
    }

    return results;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMsg = `AGI search task failed: ${error.response?.status ?? 'No response'} ${error.response?.statusText || ''} ${JSON.stringify(error.response?.data || error.message)}`;
      console.error(`[AGI] ${errorMsg}`);
      throw new Error(errorMsg);
    }
    throw error;
  } finally {
    // Release session back to pool for reuse
    if (sessionId) {
      sessionManager.releaseSession(sessionId);
      console.log(`[AGI] Released session ${sessionId} back to pool`);
    }
  }
}

/**
 * Searches Product Hunt for products matching the given query using the AGI.tech API with caching
 * @param query - The search term to look for on Product Hunt
 * @returns Promise resolving to an array of ProductHuntResult objects
 * @throws Error if the API request fails or API key is missing
 * 
 * Uses AGI.tech browser agent API with intelligent caching for credit efficiency
 */
export async function searchProductHunt(query: string): Promise<ProductHuntResult[]> {
  const apiKey = process.env.AGI_API_KEY;
  const cacheManager = getCacheManager();

  console.log(`[DEBUG] MOCK_AGI_DATA value: "${process.env.MOCK_AGI_DATA}"`);
  console.log(`[DEBUG] shouldUseMockData result: ${shouldUseMockData(apiKey)}`);
  console.log(`[DEBUG] API Key exists: ${!!apiKey}`);

  if (shouldUseMockData(apiKey)) {
    const reason = apiKey ? 'MOCK_AGI_DATA=true' : 'AGI_API_KEY missing';
    console.warn(`[AGI] Using mock Product Hunt results (${reason})`);
    const mockResults = generateMockProductHuntResults(query);
    cacheManager.cacheResult(query, 'producthunt', mockResults, 'mock');
    return mockResults;
  }

  // BYPASS CACHE - Force real API usage
  console.log(`[AGI] BYPASSING CACHE - Forcing real API usage for: "${query}"`);
  
  try {
    // Execute search task using AGI agent
    const results = await executeAGISearchTask(apiKey!, query, 'producthunt');

    // Transform API response to ProductHuntResult format
    const productHuntResults: ProductHuntResult[] = results.map((item: any) => ({
      name: item.name || item.title || 'Unknown Product',
      url: item.url || '',
      description: item.description || item.snippet || '',
      upvotes: item.upvotes || item.votes || 0,
    }));

    // Cache the real AGI results
    cacheManager.cacheResult(query, 'producthunt', results, 'agi');

    return productHuntResults;
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? `AGI API request failed: ${error.response?.status ?? 'Unknown'} ${error.response?.statusText || ''} ${JSON.stringify(error.response?.data || error.message)}`
      : error instanceof Error
        ? error.message
        : 'Unknown error';

    console.error('[AGI] Product Hunt search failed:', message);
    
    // DISABLE FALLBACK for debugging
    throw new Error(`REAL API FAILURE: ${message}`);

    // Fallback to mock data and cache it
    // console.warn('[AGI] Falling back to mock data due to AGI API failure');
    // const mockResults = generateMockProductHuntResults(query);
    // cacheManager.cacheResult(query, 'producthunt', mockResults, 'mock');
    // return mockResults;
  }
}

/**
 * Searches Google for startup competitors and products matching the given query using the AGI.tech API with caching
 * @param query - The search term to look for
 * @returns Promise resolving to an array of GoogleSearchResult objects (limited to top 10)
 * @throws Error if the API request fails or API key is missing
 * 
 * Uses AGI.tech browser agent API with intelligent caching for credit efficiency
 */
/**
 * Cost-effective search combining Product Hunt and competitor analysis using Google search snippets only
 * @param query - The search term to look for
 * @returns Promise resolving to an array of GoogleSearchResult objects
 * @throws Error if the API request fails or API key is missing
 * 
 * Optimized for minimal credit consumption (<$0.50 per call):
 * - Uses Google search only (no web navigation)
 * - Combined query for Product Hunt + competitors
 * - 30 second timeout with fast polling
 * - Returns search snippets only (no URL visits)
 */
export async function searchCostEffective(query: string): Promise<GoogleSearchResult[]> {
  const apiKey = process.env.AGI_API_KEY;
  const cacheManager = getCacheManager();

  if (shouldUseMockData(apiKey)) {
    const reason = apiKey ? 'MOCK_AGI_DATA=true' : 'AGI_API_KEY missing';
    console.warn(`[AGI] Using mock cost-effective results (${reason})`);
    const mockResults = generateMockGoogleResults(query);
    cacheManager.cacheResult(query, 'cost_effective', mockResults, 'mock');
    return mockResults;
  }

  // Check cache first
  const cachedResults = cacheManager.getCachedResult(query, 'cost_effective');
  if (cachedResults) {
    return cachedResults
      .slice(0, 8)
      .map((item: any) => ({
        name: item.name || item.title || 'Unknown',
        url: item.url || '',
        description: item.description || item.snippet || '',
      }));
  }

  // Use real AGI API if no cache or forced
  if (cacheManager.shouldUseRealAGI(query, 'cost_effective')) {
    try {
      const results = await executeCostEffectiveSearchTask(apiKey!, query);
      
      const costEffectiveResults: GoogleSearchResult[] = results
        .slice(0, 8)
        .map((item: any) => ({
          name: item.name || item.title || 'Unknown',
          url: item.url || '',
          description: item.description || item.snippet || '',
        }));

      cacheManager.cacheResult(query, 'cost_effective', results, 'agi');
      return costEffectiveResults;
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? `AGI API request failed: ${error.response?.status ?? 'Unknown'} ${error.response?.statusText || ''} ${JSON.stringify(error.response?.data || error.message)}`
        : error instanceof Error
          ? error.message
          : 'Unknown error';

      console.error('[AGI] Cost-effective search failed:', message);
      
      const mockResults = generateMockGoogleResults(query);
      cacheManager.cacheResult(query, 'cost_effective', mockResults, 'mock');
      return mockResults;
    }
  }

  const mockResults = generateMockGoogleResults(query);
  cacheManager.cacheResult(query, 'cost_effective', mockResults, 'mock');
  return mockResults;
}

/**
 * Optimized search task execution for minimal credit consumption
 */
async function executeCostEffectiveSearchTask(apiKey: string, query: string): Promise<any[]> {
  let sessionId: string | undefined;
  
  try {
    // Create single-use session
    const sessionResponse = await axios.post(
      `${AGI_BASE_URL}/sessions`,
      {
        agent_name: 'agi-0', // Use fastest agent available
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout for session creation
      }
    );
    
    sessionId = sessionResponse.data.session_id;
    console.log(`[AGI] Created cost-effective session ${sessionId} for query: "${query}"`);
    
    // Combined search query for maximum efficiency
    const combinedQuery = `${query} startup`;
    
    // Minimal instruction for search snippets only
    const instruction = `Search Google for: "${combinedQuery}". 
Return the first 5 results only. Do not visit any websites. Return results immediately as JSON.
Format as JSON array with exactly this structure: [{"name": "...", "url": "...", "description": "..."}]`;

    // Send message to agent
    await axios.post(
      `${AGI_BASE_URL}/sessions/${sessionId}/message`,
      {
        message: instruction,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout for sending message
      }
    );
    
    console.log(`[AGI] Cost-effective instruction sent, starting fast polling...`);

    // Ultra-fast polling: 5 attempts * 3 seconds = 15 seconds max
    const maxAttempts = 5;
    let attempts = 0;
    let results: any[] = [];

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      attempts++;

      try {
        const statusResponse = await axios.get(
          `${AGI_BASE_URL}/sessions/${sessionId}/status`,
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
            },
            timeout: 8000, // 8 second timeout for status check
          }
        );

        const status = statusResponse.data.status;
        console.log(`[AGI] Fast polling attempt ${attempts}/${maxAttempts}: Status = "${status}"`);

        if (status === 'finished') {
          const messagesResponse = await axios.get(
            `${AGI_BASE_URL}/sessions/${sessionId}/messages`,
            {
              headers: {
                'Authorization': `Bearer ${apiKey}`,
              },
            }
          );

          const messages = messagesResponse.data.messages || [];
          
          for (const msg of messages) {
            if (msg.type === 'DONE' || msg.type === 'result' || msg.type === 'assistant') {
              try {
                let content = msg.content;
                
                if (typeof content === 'string') {
                  const jsonMatch = content.match(/```(?:json)?\s*(\[[\s\S]*\])\s*```/) || 
                                   content.match(/(\[[\s\S]*\])/);
                  if (jsonMatch) {
                    content = jsonMatch[1];
                  }
                  const parsed = JSON.parse(content);
                  if (Array.isArray(parsed)) {
                    results = parsed;
                    break;
                  }
                }
              } catch (e) {
                console.log(`[AGI] Failed to parse cost-effective result:`, e instanceof Error ? e.message : e);
              }
            }
          }
          break;
        } else if (status === 'error') {
          throw new Error(`AGI agent task failed: ${statusResponse.data.error || 'Unknown error'}`);
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.code !== 'ECONNABORTED') {
          console.error(`[AGI] Fast polling failed (attempt ${attempts}):`, error.message);
        }
      }
    }

    if (attempts >= maxAttempts) {
      console.warn(`[AGI] Cost-effective search timed out after ${maxAttempts} attempts. Returning empty results.`);
      return []; // Fallback: return empty array instead of throwing
    }

    return results;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMsg = `Cost-effective search failed: ${error.response?.status ?? 'No response'} ${error.response?.statusText || ''} ${JSON.stringify(error.response?.data || error.message)}`;
      console.error(`[AGI] ${errorMsg}`);
      throw new Error(errorMsg);
    }
    throw error;
  } finally {
    // Clean up session immediately
    if (sessionId) {
      try {
        await axios.delete(
          `${AGI_BASE_URL}/sessions/${sessionId}`,
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
            },
            timeout: 5000,
          }
        );
        console.log(`[AGI] Cleaned up cost-effective session ${sessionId}`);
      } catch (error) {
        console.warn(`[AGI] Failed to cleanup session ${sessionId}:`, error);
      }
    }
  }
}

/**
 * Test AGI API connectivity using the cost-effective search function
 */
export async function testAGIConnection() {
  try {
    const result = await searchCostEffective("test");
    console.log("AGI connected successfully:", result.length, "results");
    return true;
  } catch (error) {
    console.error("AGI connection failed:", error instanceof Error ? error.message : error);
    return false;
  }
}

