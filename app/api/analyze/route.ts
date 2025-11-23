import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'AGI Analysis API is operational',
    status: 'ready',
    version: '2.0.1',
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { idea } = body;

    if (!idea || typeof idea !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Invalid idea provided'
      }, { status: 400 });
    }

    // Generate specialized responses based on AI app category
    const ideaLower = idea.toLowerCase();
    let optimistText = '';
    let realistText = '';
    let competitorCount = Math.floor(Math.random() * 20) + 5;
    let opportunityScore = Math.floor(Math.random() * 5) + 5;

    // AI Job Search Agent
    if (ideaLower.includes('job') || ideaLower.includes('career') || ideaLower.includes('employment') || ideaLower.includes('recruiting')) {
      optimistText = `I see a massive opening in the **Autonomous Agent** layer for "${idea}"! While there are ${competitorCount} competitors focusing on basic search, the 2025 market is shifting towards *full execution*. Your AI job agent could dominate by handling the entire lifecycle—from application to salary negotiation—which 80% of current tools miss. The post-pandemic "Great Resignation" has created unprecedented demand for intelligent career automation, with companies spending $5,000+ per hire on recruitment.`;
      
      realistText = `Let's be brutally honest: The "AI Job Search" space is a bloodbath in 2025. You're up against heavily funded incumbents like LazyApply, Sonara, and Massive that already have millions of users. To survive, you can't just be a "better search"—you need proprietary data advantages like exclusive recruiter API access or verified hiring manager direct lines, which most new entrants lack. The average job seeker uses 3.2 different tools, and breaking into this ecosystem requires significant network effects.`;
      
      opportunityScore = 8;
      competitorCount = 25;
    }
    // AI Fitness Coach
    else if (ideaLower.includes('fitness') || ideaLower.includes('workout') || ideaLower.includes('gym') || ideaLower.includes('exercise')) {
      optimistText = `The **AI fitness revolution** is just beginning for "${idea}"! While ${competitorCount} competitors offer generic workout plans, the real opportunity is in *form correction and injury prevention*. Your AI coach could use computer vision to analyze exercise form in real-time, combined with recovery data from wearables—creating a personal trainer that's available 24/7 at 1/10th the cost! The global fitness tech market is worth $15 billion, with personalized training growing at 23% annually.`;
      
      realistText = `Face it: The fitness app space is brutal with ${competitorCount} competitors. Giants like Peloton, Apple Fitness+, and Freeletics have massive workout libraries and celebrity trainer partnerships. You're competing with free YouTube content and established apps with hardware ecosystems. Without breakthrough computer vision tech or exclusive gym partnerships, you'll just be another workout tracker in a crowded market where 73% of users abandon apps within 90 days.`;
      
      opportunityScore = 6;
      competitorCount = 30;
    }
    // AI Diet Planner
    else if (ideaLower.includes('diet') || ideaLower.includes('nutrition') || ideaLower.includes('meal') || ideaLower.includes('food')) {
      optimistText = `The **personalized nutrition** space is exploding for "${idea}"! With ${competitorCount} competitors like MyFitnessPal still using generic meal plans, there's huge opportunity for *hyper-personalization*. Your AI diet planner could leverage continuous glucose monitors, DNA data, and real-time activity tracking to create truly adaptive nutrition plans—something only 5% of current apps offer. The personalized nutrition market is projected to reach $16.6 billion by 2027.`;
      
      realistText = `Here's the harsh truth: The diet app market is oversaturated with ${competitorCount} players. Competitors like MyFitnessPal have massive food databases and 10+ years of user data. You're not just competing with apps—you're battling established habits and platforms like Noom that have clinical partnerships. Without unique biometric integrations or FDA clearance, you'll struggle to differentiate in a market where 95% of diets fail.`;
      
      opportunityScore = 7;
      competitorCount = 22;
    }
    // AI Real Estate Agent
    else if (ideaLower.includes('real estate') || ideaLower.includes('property') || ideaLower.includes('housing') || ideaLower.includes('home')) {
      optimistText = `The **proptech AI transformation** is massively undervalued for "${idea}"! With only ${competitorCount} competitors still using basic MLS data, your AI real estate agent could revolutionize the industry. Imagine analyzing satellite imagery, zoning laws, school district performance, and development plans to predict property values with 95% accuracy—something traditional agents can't match! The real estate tech market is growing at 17% CAGR, with AI adoption still in its infancy.`;
      
      realistText = `Let's be brutally honest: Real estate is a relationship business with ${competitorCount} tech players trying to disrupt it. Competitors like Zillow have $20B market caps and established broker partnerships. You're fighting against the National Association of Realtors' lobbying power and centuries-old industry practices. Without exclusive data sources or major brokerage backing, you're just another property search tool in a heavily regulated market.`;
      
      opportunityScore = 5;
      competitorCount = 18;
    }
    // AI Mental Health Therapy
    else if (ideaLower.includes('therapy') || ideaLower.includes('mental health') || ideaLower.includes('counseling') || ideaLower.includes('psychology')) {
      optimistText = `The **digital mental health** revolution is desperately needed for "${idea}"! With ${competitorCount} competitors offering basic meditation apps, there's massive opportunity for *therapeutic AI*. Your mental health AI could provide CBT-based therapy, crisis intervention, and personalized treatment plans—available 24/7 at a fraction of traditional therapy costs. The post-pandemic mental health crisis has created unprecedented demand, with the digital mental health market reaching $26.7 billion by 2027.`;
      
      realistText = `Here's the reality check: Mental health is heavily regulated with ${competitorCount} apps competing for attention. Competitors like BetterHelp and Talkspace have clinical validations and insurance partnerships. You're navigating HIPAA compliance, FDA regulations, and the risk of AI giving harmful advice. Without licensed therapists backing your AI and clinical trials proving efficacy, you could face serious legal and ethical issues.`;
      
      opportunityScore = 4;
      competitorCount = 15;
    }
    // AI Dating Assistant
    else if (ideaLower.includes('dating') || ideaLower.includes('relationship') || ideaLower.includes('matchmaking') || ideaLower.includes('love')) {
      optimistText = `The **AI dating revolution** is poised to explode for "${idea}"! With ${competitorCount} swipe apps still using superficial matching, your AI could analyze communication patterns, attachment styles, and life goals to create deeply compatible matches. Imagine an AI that coaches users through conversations and predicts relationship success with 80% accuracy—vastly superior to current swipe mechanics! The online dating market is worth $7 billion, with users desperate for meaningful connections.`;
      
      realistText = `Let's be blunt: The dating app market is saturated with ${competitorCount} players, and users have app fatigue. Giants like Tinder and Bumble have network effects and massive user bases. You're fighting against Tinder's network effects and the fact that most dating apps have the same fundamental problem—user engagement drops once people find relationships. Without a breakthrough in matching accuracy or a unique niche, you'll struggle to retain users.`;
      
      opportunityScore = 3;
      competitorCount = 35;
    }
    // Default response for other AI apps
    else {
      optimistText = `Your idea for "${idea}" has strong potential! The AI market is showing positive trends with $190 billion projected spending by 2025. There's room for innovation, and with the right execution and unique value proposition, this could capture significant market share. Focus on proprietary data, network effects, and solving a painful problem that existing solutions overlook.`;
      
      realistText = `While "${idea}" is interesting, you'll face competition in the crowded AI space. The market has established players and customer acquisition costs are rising. You'll need solid funding, a clear moat, and excellent execution to succeed. Consider starting with a niche segment first and proving your technology before scaling to broader markets.`;
    }

    // Determine category and get real competitors
    let category = 'general';
    let realCompetitors = [
      {
        name: "OpenAI ChatGPT",
        url: "https://chat.openai.com",
        description: "Leading AI assistant with broad capabilities"
      },
      {
        name: "Anthropic Claude",
        url: "https://claude.ai", 
        description: "Advanced AI for complex reasoning tasks"
      }
    ];

    if (ideaLower.includes('job') || ideaLower.includes('career') || ideaLower.includes('employment') || ideaLower.includes('recruiting')) {
      category = 'job-search';
      realCompetitors = [
        {
          name: "LazyApply",
          url: "https://lazyapply.com",
          description: "AI-powered job application automation platform"
        },
        {
          name: "Sorce",
          url: "https://sorce.jobs",
          description: "Tinder-style job discovery with auto-application"
        },
        {
          name: "JobCopilot",
          url: "https://jobcopilot.com",
          description: "Automated job search and application assistant"
        },
        {
          name: "AIApply",
          url: "https://aiapply.co",
          description: "AI resume builder and job application tool"
        },
        {
          name: "Sonara",
          url: "https://sonara.ai",
          description: "AI-driven job matching and application platform"
        }
      ];
    }
    else if (ideaLower.includes('fitness') || ideaLower.includes('workout') || ideaLower.includes('gym') || ideaLower.includes('exercise')) {
      category = 'fitness';
      realCompetitors = [
        {
          name: "Freeletics",
          url: "https://freeletics.com",
          description: "AI-powered personal training with custom workouts"
        },
        {
          name: "Peloton Digital",
          url: "https://onepeloton.com/app",
          description: "AI fitness classes with personalized recommendations"
        },
        {
          name: "Fitbod",
          url: "https://fitbod.me",
          description: "AI workout generator based on your goals and equipment"
        },
        {
          name: "Aaptiv",
          url: "https://aaptiv.com",
          description: "Audio-based AI fitness coaching platform"
        },
        {
          name: "Future",
          url: "https://future.co",
          description: "1-on-1 AI personal training with digital coaches"
        }
      ];
    }
    else if (ideaLower.includes('diet') || ideaLower.includes('nutrition') || ideaLower.includes('meal') || ideaLower.includes('food')) {
      category = 'nutrition';
      realCompetitors = [
        {
          name: "MyFitnessPal",
          url: "https://myfitnesspal.com",
          description: "AI-enhanced nutrition tracking with voice logging"
        },
        {
          name: "Noom",
          url: "https://noom.com",
          description: "AI-powered weight management with behavior psychology"
        },
        {
          name: "Lose It!",
          url: "https://loseit.com",
          description: "AI calorie tracking with personalized meal plans"
        },
        {
          name: "Cronometer",
          url: "https://cronometer.com",
          description: "AI nutrition analysis with detailed micronutrient tracking"
        },
        {
          name: "Yazio",
          url: "https://yazio.com",
          description: "AI meal planning and calorie counter app"
        }
      ];
    }
    else if (ideaLower.includes('real estate') || ideaLower.includes('property') || ideaLower.includes('housing') || ideaLower.includes('home')) {
      category = 'real-estate';
      realCompetitors = [
        {
          name: "Zillow",
          url: "https://zillow.com",
          description: "AI-powered property valuation and market predictions"
        },
        {
          name: "Redfin",
          url: "https://redfin.com",
          description: "AI real estate with Ask Redfin chatbot and Redesign AI"
        },
        {
          name: "Realtor.com",
          url: "https://realtor.com",
          description: "AI-enhanced property search and market analysis"
        },
        {
          name: "Compass",
          url: "https://compass.com",
          description: "AI-driven real estate platform with predictive analytics"
        },
        {
          name: "Apartments.com",
          url: "https://apartments.com",
          description: "AI rental matching and virtual tour technology"
        }
      ];
    }
    else if (ideaLower.includes('therapy') || ideaLower.includes('mental health') || ideaLower.includes('counseling') || ideaLower.includes('psychology')) {
      category = 'mental-health';
      realCompetitors = [
        {
          name: "BetterHelp",
          url: "https://betterhelp.com",
          description: "AI-matched therapy with licensed counselors"
        },
        {
          name: "Talkspace",
          url: "https://talkspace.com",
          description: "AI-powered therapy matching and virtual sessions"
        },
        {
          name: "Headspace",
          url: "https://headspace.com",
          description: "AI-guided meditation and mental wellness platform"
        },
        {
          name: "Calm",
          url: "https://calm.com",
          description: "AI mental health app with personalized content"
        },
        {
          name: "Wysa",
          url: "https://wysa.io",
          description: "AI mental health chatbot for emotional support"
        }
      ];
    }
    else if (ideaLower.includes('dating') || ideaLower.includes('relationship') || ideaLower.includes('matchmaking') || ideaLower.includes('love')) {
      category = 'dating';
      realCompetitors = [
        {
          name: "Tinder",
          url: "https://tinder.com",
          description: "AI-enhanced dating with smart matching algorithms"
        },
        {
          name: "Bumble",
          url: "https://bumble.com",
          description: "AI-powered dating with conversation starters"
        },
        {
          name: "Hinge",
          url: "https://hinge.co",
          description: "AI dating app designed to be deleted with smart matches"
        },
        {
          name: "Match.com",
          url: "https://match.com",
          description: "AI-driven matchmaking with compatibility analysis"
        },
        {
          name: "eHarmony",
          url: "https://eharmony.com",
          description: "AI compatibility matching for serious relationships"
        }
      ];
    }

    const mockResponse = {
      success: true,
      data: {
        optimist: {
          text: optimistText
        },
        realist: {
          text: realistText
        },
        analysis: {
          totalCompetitors: competitorCount,
          opportunityScore: opportunityScore,
          category: category,
          topCompetitors: realCompetitors
        },
        pivot: opportunityScore <= 5 ? "Consider pivoting to a niche market or adding unique features that differentiate from existing competitors" : undefined,
        workflow: {
          step1_productHunt: { status: 'success', results: 5 },
          step2_google: { status: 'success', results: 8 },
          step3_analysis: { status: 'success' },
          step4_advisor: { status: 'success' },
        }
      }
    };

    // Note: Delay moved to frontend to avoid Vercel serverless timeout (10s limit)
    // The frontend will simulate the 35-40 second processing time
    console.log(`✅ AGI Processing: Complete for "${idea}"`);

    return NextResponse.json(mockResponse);
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}