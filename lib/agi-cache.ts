// AGI Result Caching System - Credit Efficient Demo Strategy
import fs from 'fs';
import path from 'path';

interface CachedSearchResult {
  query: string;
  searchType: 'producthunt' | 'google' | 'cost_effective';
  results: any[];
  timestamp: number;
  source: 'agi' | 'mock';
}

export type CachedSearch = {
  query: string;
  searchType: "producthunt" | "cost_effective";
  results: Array<{
    name: string;
    url: string;
    description: string;
    upvotes?: number;
  }>;
  timestamp: number;
  source: "mock" | "agi";
};

function loadCache(): Record<string, CachedSearch> {
  try {
    const cacheFile = path.join(process.cwd(), 'agi-cache.json');
    if (fs.existsSync(cacheFile)) {
      const cacheData = fs.readFileSync(cacheFile, 'utf8');
      return JSON.parse(cacheData);
    }
  } catch (error) {
    console.warn('[Cache] Failed to load cache:', error);
  }
  return {};
}

export function getCachedSearchOnly(
  searchType: "producthunt" | "cost_effective",
  rawQuery: string
): CachedSearch | null {
  const cache = loadCache();
  const key = `${searchType}:${rawQuery.trim()}`;
  const entry = cache[key];
  return entry ?? null;
}

class AGICacheManager {
  private cacheFile = path.join(process.cwd(), 'agi-cache.json');
  private cache: Record<string, CachedSearchResult> = {};
  private forceRealAGI = true; // Set to true for one live demo run

  constructor() {
    this.loadCache();
  }

  /**
   * Load existing cache from disk
   */
  private loadCache(): void {
    try {
      if (fs.existsSync(this.cacheFile)) {
        const cacheData = fs.readFileSync(this.cacheFile, 'utf8');
        this.cache = JSON.parse(cacheData);
        console.log(`[Cache] Loaded ${Object.keys(this.cache).length} cached results`);
      }
    } catch (error) {
      console.warn('[Cache] Failed to load cache:', error);
      this.cache = {};
    }
  }

  /**
   * Save cache to disk
   */
  private saveCache(): void {
    try {
      fs.writeFileSync(this.cacheFile, JSON.stringify(this.cache, null, 2));
      console.log(`[Cache] Saved ${Object.keys(this.cache).length} results to cache`);
    } catch (error) {
      console.error('[Cache] Failed to save cache:', error);
    }
  }

  /**
   * Get cache key for search query
   */
  private getCacheKey(query: string, searchType: string): string {
    return `${searchType}:${query.toLowerCase().trim()}`;
  }

  /**
   * Check if cached result exists and is valid (less than 24 hours old)
   */
  private isValidCache(cached: CachedSearchResult): boolean {
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    return (Date.now() - cached.timestamp) < maxAge;
  }

  /**
   * Get cached search result or return null
   */
  getCachedResult(query: string, searchType: 'producthunt' | 'google' | 'cost_effective'): any[] | null {
    const key = this.getCacheKey(query, searchType);
    const cached = this.cache[key];

    if (cached && this.isValidCache(cached)) {
      console.log(`[Cache] ${cached.source.toUpperCase()} HIT for ${searchType}: "${query}"`);
      return cached.results;
    }

    if (cached) {
      console.log(`[Cache] EXPIRED for ${searchType}: "${query}"`);
      delete this.cache[key];
    }

    return null;
  }

  /**
   * Cache search results
   */
  cacheResult(query: string, searchType: 'producthunt' | 'google' | 'cost_effective', results: any[], source: 'agi' | 'mock'): void {
    const key = this.getCacheKey(query, searchType);
    
    this.cache[key] = {
      query,
      searchType,
      results,
      timestamp: Date.now(),
      source
    };

    this.saveCache();
    console.log(`[Cache] CACHED ${results.length} ${source.toUpperCase()} results for ${searchType}: "${query}"`);
  }

  /**
   * Force real AGI API usage (for live demo)
   */
  setForceRealAGI(force: boolean): void {
    this.forceRealAGI = force;
    console.log(`[Cache] Force real AGI: ${force}`);
  }

  /**
   * Check if we should use real AGI or cached results
   */
  shouldUseRealAGI(query: string, searchType: 'producthunt' | 'google' | 'cost_effective'): boolean {
    if (this.forceRealAGI) {
      console.log(`[Cache] Using REAL AGI (force mode) for ${searchType}: "${query}"`);
      return true;
    }

    const cached = this.cache[this.getCacheKey(query, searchType)];
    if (cached && this.isValidCache(cached)) {
      console.log(`[Cache] Using CACHED ${cached.source.toUpperCase()} results for ${searchType}: "${query}"`);
      return false;
    }

    console.log(`[Cache] No valid cache - using REAL AGI for ${searchType}: "${query}"`);
    return true;
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { total: number; agi: number; mock: number } {
    const stats = { total: 0, agi: 0, mock: 0 };
    
    for (const cached of Object.values(this.cache)) {
      if (this.isValidCache(cached)) {
        stats.total++;
        if (cached.source === 'agi') stats.agi++;
        if (cached.source === 'mock') stats.mock++;
      }
    }

    return stats;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache = {};
    if (fs.existsSync(this.cacheFile)) {
      fs.unlinkSync(this.cacheFile);
    }
    console.log('[Cache] Cache cleared');
  }

  /**
   * Export cache for demo
   */
  exportCache(): string {
    return JSON.stringify(this.cache, null, 2);
  }
}

// Singleton instance
let cacheManager: AGICacheManager | null = null;

export function getCacheManager(): AGICacheManager {
  if (!cacheManager) {
    cacheManager = new AGICacheManager();
  }
  return cacheManager;
}

export { AGICacheManager };

// Comprehensive Mock Competitor Data for Demo
export const MOCK_COMPETITOR_DATA: Record<string, Array<{name: string, url: string, description: string}>> = {
  "ai_job_search": [
    {
      "name": "AutoApply 2.0 (2025 Edition)",
      "url": "https://autoapply.ai",
      "description": "Fully autonomous job agent that applies to 500+ niche job boards daily using verified digital identity credentials."
    },
    {
      "name": "ResumeGPT Live",
      "url": "https://resumegpt.io",
      "description": "Real-time resume tailoring engine that A/B tests your CV against live ATS algorithms from major ATS providers like Greenhouse and Lever."
    },
    {
      "name": "LinkedIn Outreach Agent",
      "url": "https://linkedagent.pro",
      "description": "AI agent that automates personalized connection requests and DMs to recruiters at target companies with 45% response rate."
    },
    {
      "name": "InterviewCo-Pilot",
      "url": "https://interviewcopilot.com",
      "description": "AR-based real-time interview assistant that listens to interviewer questions and projects suggested answers on your screen."
    },
    {
      "name": "CareerFlow OS",
      "url": "https://careerflow.ai",
      "description": "End-to-one career operating system that tracks applications, manages networking, and predicts salary negotiation leverage."
    },
    {
      "name": "JobSolv 2025",
      "url": "https://jobsolv.com",
      "description": "AI-first placement service guaranteeing interviews by bypassing standard portals and applying directly via internal recruiter APIs."
    },
    {
      "name": "HiringBot Reverse",
      "url": "https://hiringbot.com",
      "description": "Reverse-recruiting platform where AI agents pitch your profile to 10,000+ verified hiring managers automatically."
    },
    {
      "name": "SalaryPredictr",
      "url": "https://salarypredictr.com",
      "description": "Real-time compensation intelligence using live offer letter data to generate precise salary negotiation scripts."
    },
    {
      "name": "CultureFit AI",
      "url": "https://culturefit.io",
      "description": "Deep analysis tool scanning company Glassdoor, Blind, and internal reviews to score team culture alignment before you apply."
    },
    {
      "name": "NetworkGrapher",
      "url": "https://networkgrapher.com",
      "description": "Visualizes your 2nd and 3rd-degree connections at target companies and drafts warm introduction emails for your mutual contacts."
    }
  ],
  "ai_diet_planner": [
    {
      "name": "Eat This Much",
      "url": "https://www.eatthismuch.com",
      "description": "Automatic meal planner creating personalized plans based on food preferences, budget, and schedule"
    },
    {
      "name": "PlateJoy",
      "url": "https://www.platejoy.com",
      "description": "Custom meal planning service with 50+ data points for personalized recipes and grocery lists"
    },
    {
      "name": "Strongr Fastr",
      "url": "https://www.strongrfastr.com",
      "description": "Nutrition AI generating customizable meal plans with macro tracking and grocery list integration"
    },
    {
      "name": "MealPrepPro",
      "url": "https://www.mealpreppro.com",
      "description": "Healthy meal plans tailored to calories and macros with keto, vegetarian, and plant-based options"
    },
    {
      "name": "AI Meal Planner",
      "url": "https://ai-mealplan.com",
      "description": "AI-powered weekly menu generator with macro tracking supporting multiple diet types and IF windows"
    },
    {
      "name": "Yummery",
      "url": "https://yummery.app",
      "description": "AI meal planner with personalized plans, nutrition tracking, shopping lists, and custom recipes"
    },
    {
      "name": "OH, a potato!",
      "url": "https://ohapotato.com",
      "description": "ChatGPT-powered zero-waste meal planner saving recipes from anywhere including social media"
    },
    {
      "name": "eMeals",
      "url": "https://www.emeals.com",
      "description": "Budget-friendly meal planning with 15+ diet plans and grocery delivery integration"
    },
    {
      "name": "Mealime",
      "url": "https://www.mealime.com",
      "description": "Personalized meal plans with step-by-step cooking instructions and smart grocery lists"
    },
    {
      "name": "Prepear",
      "url": "https://www.prepear.com",
      "description": "Recipe organizer and meal planner with family-friendly features and meal prep tools"
    }
  ],
  "ai_fitness_coach": [
    {
      "name": "Freeletics",
      "url": "https://www.freeletics.com",
      "description": "AI-powered bodyweight HIIT workouts with Coach+ for 24/7 personalized training and motivation"
    },
    {
      "name": "Fitbod",
      "url": "https://www.fitbod.me",
      "description": "AI workout builder creating personalized strength training routines analyzing performance data"
    },
    {
      "name": "FitnessAI",
      "url": "https://www.fitnessai.com",
      "description": "Intelligent workout app optimizing sets, reps, and weight using machine learning algorithms"
    },
    {
      "name": "Zing Coach",
      "url": "https://www.zingcoach.com",
      "description": "AI fitness coach with motion tracking, real-time form corrections, and personalized daily routines"
    },
    {
      "name": "Coachify.AI",
      "url": "https://coachify.ai",
      "description": "All-in-one fitness app with home/gym workouts, macro tracking, and AI-powered progress monitoring"
    },
    {
      "name": "Evolve AI",
      "url": "https://www.evolveai.app",
      "description": "Elite AI coaching for powerlifting and bodybuilding with workout readiness rating and nutrition"
    },
    {
      "name": "Aaptiv",
      "url": "https://aaptiv.com",
      "description": "Audio and video AI workouts tailored to user preferences with expert trainer guidance"
    },
    {
      "name": "Alpha Progression",
      "url": "https://alphaprogression.com",
      "description": "AI-powered progressive overload training with detailed exercise tracking and form videos"
    },
    {
      "name": "Athlytic",
      "url": "https://www.athlytic.ai",
      "description": "Performance optimization AI analyzing recovery metrics, HRV, and sleep for athletes"
    },
    {
      "name": "Future",
      "url": "https://www.future.co",
      "description": "Personal training app pairing users with certified coaches using AI for program customization"
    }
  ],
  "ai_real_estate_agent": [
    {
      "name": "Redfin",
      "url": "https://www.redfin.com",
      "description": "AI-powered conversational home search with natural language queries and personalized recommendations"
    },
    {
      "name": "Zillow",
      "url": "https://www.zillow.com",
      "description": "AI-driven Zestimate valuations, natural language search, and personalized home matching"
    },
    {
      "name": "Realtor.com",
      "url": "https://www.realtor.com",
      "description": "AI-powered lead generation and listing recommendations connecting buyers with partner agents"
    },
    {
      "name": "Trulia",
      "url": "https://www.trulia.com",
      "description": "AI marketplace learning user preferences for customized property recommendations and insights"
    },
    {
      "name": "Compass",
      "url": "https://www.compass.com",
      "description": "AI-enhanced real estate platform with market insights, CRM tools, and predictive analytics"
    },
    {
      "name": "Flyhomes",
      "url": "https://flyhomes.com",
      "description": "AI-powered home search portal trained on 1000+ data points with Flyhomes AI assistant"
    },
    {
      "name": "Rex",
      "url": "https://www.rexhomes.com",
      "description": "AI CRM platform for agents automating marketing with chatbots and data-driven insights"
    },
    {
      "name": "HouseCanary",
      "url": "https://www.housecanary.com",
      "description": "AI-powered property valuations and market forecasting for real estate professionals"
    },
    {
      "name": "Skyline AI",
      "url": "https://www.skyline.ai",
      "description": "AI platform for commercial real estate investment decisions and property analytics"
    },
    {
      "name": "Roof.ai",
      "url": "https://www.roof.ai",
      "description": "Computer vision AI for property damage assessment and real estate inspection automation"
    }
  ],
  "ai_resume_builder": [
    {
      "name": "Rezi",
      "url": "https://www.rezi.ai",
      "description": "Award-winning AI resume builder with ATS optimization, keyword targeting, and real-time feedback"
    },
    {
      "name": "Kickresume",
      "url": "https://www.kickresume.com",
      "description": "GPT-4 powered resume builder with 35+ templates, LinkedIn import, and career coaching features"
    },
    {
      "name": "Enhancv",
      "url": "https://enhancv.com",
      "description": "AI resume builder with modern templates, content analysis, and interactive elements for creatives"
    },
    {
      "name": "Zety",
      "url": "https://zety.com",
      "description": "AI-driven resume builder with Smart Apply technology, 20+ templates, and expert guidance"
    },
    {
      "name": "Resume Genius",
      "url": "https://resumegenius.com",
      "description": "AI resume generator with extensive pre-written bullet points and industry-specific examples"
    },
    {
      "name": "Teal",
      "url": "https://www.tealhq.com",
      "description": "Career tools platform with AI resume builder, job tracker, and Chrome extension for applications"
    },
    {
      "name": "Jobscan",
      "url": "https://www.jobscan.co",
      "description": "AI-powered ATS resume optimizer with keyword matching and application tracking"
    },
    {
      "name": "Resume.io",
      "url": "https://resume.io",
      "description": "Professional AI resume templates with content recommendations tailored to career goals"
    },
    {
      "name": "Novoresume",
      "url": "https://novoresume.com",
      "description": "Modern resume builder with AI writing assistance and ATS-optimized templates"
    },
    {
      "name": "VisualCV",
      "url": "https://www.visualcv.com",
      "description": "Online resume builder with analytics showing who viewed your resume and when"
    }
  ]
};
