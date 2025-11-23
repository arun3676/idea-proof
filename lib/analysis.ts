import OpenAI from 'openai';

// Type definition for competitor input (from Product Hunt or Google)
interface CompetitorInput {
  name: string;
  url: string;
  description: string;
}

// Type definition for competitor in the analysis result
interface Competitor {
  name: string;
  url: string;
  description: string;
}

// Type definition for market gap analysis
interface MarketGap {
  category: string;
  opportunity: string;
  reason: string;
}

// Type definition for threat assessment
interface ThreatAssessment {
  level: 'low' | 'medium' | 'high';
  description: string;
  mitigatingFactors: string[];
}

// Enhanced type definition for the analysis result
export interface CompetitionAnalysis {
  totalCompetitors: number;
  opportunityScore: number;
  topCompetitors: Competitor[];
  marketGaps: MarketGap[];
  threatAssessment: ThreatAssessment;
  positioningOpportunities: string[];
  recommendedStrategy: string;
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Uses OpenAI to analyze competitor data and generate deep insights
 * @param competitors - Array of competitor information
 * @param query - The original search query
 * @returns Promise resolving to AI-generated market analysis
 */
async function generateAIAnalysis(
  competitors: CompetitorInput[],
  query: string
): Promise<{
  marketGaps: MarketGap[];
  threatAssessment: ThreatAssessment;
  positioningOpportunities: string[];
  recommendedStrategy: string;
}> {
  try {
    const competitorData = competitors.map(c => 
      `• ${c.name}: ${c.description} (${c.url})`
    ).join('\n');

    const prompt = `
You are a expert market analyst. Analyze the following competitor data for "${query}" and provide strategic insights.

Competitors:
${competitorData}

Provide a JSON response with these exact keys:
{
  "marketGaps": [
    {"category": "string", "opportunity": "string", "reason": "string"}
  ],
  "threatAssessment": {
    "level": "low|medium|high", 
    "description": "string",
    "mitigatingFactors": ["string"]
  },
  "positioningOpportunities": ["string"],
  "recommendedStrategy": "string"
}

Focus on actionable insights, market positioning, and strategic opportunities.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in OpenAI response');
    }

    const analysis = JSON.parse(jsonMatch[0]);
    return analysis;
  } catch (error) {
    console.error('OpenAI analysis failed:', error);
    // Fallback to basic analysis
    return {
      marketGaps: [{
        category: 'General',
        opportunity: 'Market entry opportunity exists',
        reason: 'Analysis unavailable - using fallback'
      }],
      threatAssessment: {
        level: 'medium' as const,
        description: 'Unable to assess threats due to analysis failure',
        mitigatingFactors: ['Further research needed']
      },
      positioningOpportunities: ['Differentiation through unique features'],
      recommendedStrategy: 'Conduct deeper market research before proceeding'
    };
  }
}

/**
 * Analyzes competition by combining Product Hunt and Google search results with AI insights
 * @param productHuntResults - Array of competitors from Product Hunt search
 * @param googleResults - Array of competitors from Google search
 * @param query - The original search query for context
 * @returns Promise resolving to enhanced CompetitionAnalysis with AI-generated insights
 */
export async function analyzeCompetition(
  productHuntResults: CompetitorInput[],
  googleResults: CompetitorInput[],
  query: string
): Promise<CompetitionAnalysis> {
  // Combine both arrays
  const allCompetitors: Competitor[] = [
    ...productHuntResults.map((item) => ({
      name: item.name,
      url: item.url,
      description: item.description,
    })),
    ...googleResults.map((item) => ({
      name: item.name,
      url: item.url,
      description: item.description,
    })),
  ];

  // Count total competitors (remove duplicates based on URL)
  const uniqueCompetitors = Array.from(
    new Map(allCompetitors.map((item) => [item.url, item])).values()
  );
  const totalCompetitors = uniqueCompetitors.length;

  // Calculate opportunity score based on competitor count
  let opportunityScore: number;
  if (totalCompetitors <= 10) {
    opportunityScore = 9;
  } else if (totalCompetitors <= 25) {
    opportunityScore = 7;
  } else if (totalCompetitors <= 50) {
    opportunityScore = 5;
  } else {
    opportunityScore = 3;
  }

  // Get top 5 competitors
  const topCompetitors = uniqueCompetitors.slice(0, 5);

  // Generate AI-powered analysis
  const aiAnalysis = await generateAIAnalysis(uniqueCompetitors, query);

  return {
    totalCompetitors,
    opportunityScore,
    topCompetitors,
    ...aiAnalysis,
  };
}

