import OpenAI from 'openai';

// Type definition for competitor input
interface Competitor {
  name: string;
  url: string;
  description: string;
}

// Type definition for advisor responses
export interface AdvisorResponses {
  optimist: string;
  realist: string;
}

/**
 * Generates advisor responses from two AI personalities (Optimist and Realist) analyzing a startup idea
 * @param idea - The user's startup idea
 * @param totalCompetitors - Number of competitors found
 * @param topCompetitors - Array of top competitors with name, url, and description
 * @returns Promise resolving to AdvisorResponses object with optimist and realist responses
 * @throws Error if the API request fails, API key is missing, or JSON parsing fails
 */
export async function generateAdvisorResponses(
  idea: string,
  totalCompetitors: number,
  topCompetitors: Competitor[]
): Promise<AdvisorResponses> {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    console.log('[Personalities] Generating advisor responses...');
    console.log(`[Personalities] Idea: "${idea}"`);
    console.log(`[Personalities] Total competitors: ${totalCompetitors}`);
    console.log(`[Personalities] Top competitors: ${topCompetitors.length}`);

    if (!apiKey) {
      const errorMsg = 'OPENAI_API_KEY environment variable is not set';
      console.error(`[Personalities] ❌ ${errorMsg}`);
      throw new Error(errorMsg);
    }
    
    console.log(`[Personalities] OPENAI_API_KEY is set (${apiKey.substring(0, 10)}...)`);

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    // System prompt
    const systemPrompt = `You are two AI business advisors analyzing a startup idea.

Advisor 1 (Optimist): You find opportunities and suggest pivots. Be encouraging but realistic. Focus on gaps in the market.

Advisor 2 (Realist): You point out challenges honestly. Be measured and analytical. Focus on real obstacles.

CRITICAL: Return ONLY a valid JSON object with EXACTLY these two fields:
{
  "optimist": "your optimistic response here (100-150 words)",
  "realist": "your realistic response here (100-150 words)"
}

Requirements:
- Both fields must be present and non-empty
- Each response should be 100-150 words
- NO markdown formatting, NO code blocks, NO explanations
- Return ONLY the JSON object, nothing else`;

    // Build user prompt with idea, competitor count, and top competitor names
    const competitorNames = topCompetitors.map((c) => c.name).join(', ');
    const userPrompt = `Idea: ${idea}

Number of competitors found: ${totalCompetitors}

Top competitors: ${competitorNames || 'None found'}`;

    // Call OpenAI API with timeout and retry
    console.log('[Personalities] Calling OpenAI API to generate advisor responses...');
    
    let lastError: Error | null = null;
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[Personalities] Attempt ${attempt}/${maxRetries}`);
        const startTime = Date.now();
        
        // Use Promise.race to add timeout
        const completion = await Promise.race([
          openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            max_tokens: 400,
            temperature: 0.7,
            response_format: { type: 'json_object' },
          }),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('OpenAI API request timed out after 60 seconds')), 60000)
          )
        ]);
        
        const duration = Date.now() - startTime;
        console.log(`[Personalities] OpenAI API call completed in ${duration}ms`);

        const responseContent = completion.choices[0]?.message?.content;

        if (!responseContent) {
          throw new Error('No response content received from OpenAI');
        }

        // Log raw response for debugging
        console.log('[Personalities] Raw OpenAI response:', responseContent);

        // Parse JSON response with better error handling
        try {
          let cleanedContent = responseContent.trim();
          
          // Remove markdown code blocks if present
          if (cleanedContent.startsWith('```json')) {
            cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/```\s*$/, '');
          } else if (cleanedContent.startsWith('```')) {
            cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/```\s*$/, '');
          }
          
          console.log('[Personalities] Cleaned content for parsing:', cleanedContent);
          
          const parsed = JSON.parse(cleanedContent) as { optimist?: string; realist?: string };

          if (!parsed.optimist || !parsed.realist) {
            console.log('[Personalities] Parsed object:', parsed);
            throw new Error('Invalid response format: missing optimist or realist fields');
          }

          console.log(`[Personalities] ✅ Success on attempt ${attempt}`);
          return {
            optimist: parsed.optimist,
            realist: parsed.realist,
          };
        } catch (parseError) {
          console.error('[Personalities] JSON parse error details:', parseError);
          console.error('[Personalities] Failed to parse content:', responseContent);
          throw new Error(`Failed to parse JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`[Personalities] ❌ Attempt ${attempt} failed:`, lastError.message);
        
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
          console.log(`[Personalities] Retrying in ${delay/1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // All attempts failed
    throw lastError || new Error('Failed to generate advisor responses after multiple attempts');
  } catch (error) {
    console.error('[Personalities] Error generating advisor responses:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Unexpected error: ${String(error)}`);
  }
}

