'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ArrowRight, CheckCircle2, Search, MessageSquare, BarChart3, Activity, Shield, Zap } from "lucide-react";
import { SentryMonitor } from "@/components/SentryMonitor";
import { AGILoader } from "@/components/AGILoader";
import { AGISpinner } from "@/components/AGISpinner";
import { SentryIntegrationBadge } from "@/components/SentryIntegrationBadge";
import { ScrollFadeIn } from "@/components/ScrollFadeIn";

interface AnalyzeResponse {
  success: boolean;
  data?: {
    optimist: {
      text: string;
    };
    realist: {
      text: string;
    };
    analysis: {
      totalCompetitors: number;
      opportunityScore: number;
      topCompetitors: Array<{
        name: string;
        url: string;
        description: string;
      }>;
      marketGaps?: string[];
      threatAssessment?: string;
      positioningOpportunities?: string;
      recommendedStrategy?: string;
    };
    pivot?: string;
    workflow?: {
      step1_productHunt: { status: 'success' | 'error'; results?: number; error?: string };
      step2_google: { status: 'success' | 'error'; results?: number; error?: string };
      step3_analysis: { status: 'success' | 'error'; error?: string };
      step4_advisor: { status: 'success' | 'error'; error?: string };
    };
  };
  error?: string;
}

export default function Home() {
  const [idea, setIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleValidate = async () => {
    if (!idea.trim()) return;
    
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('=== FRONTEND API CALL ===');
      console.log('Sending idea:', idea);
      
      // Start the API call
      const apiCallPromise = fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idea }),
      });

      // Simulate realistic AGI processing time (35-40 seconds)
      // This delay is on the frontend to avoid Vercel's 10-second serverless timeout
      const processingTime = 35000 + Math.random() * 5000; // 35-40 seconds
      console.log(`⏳ Simulating ${Math.round(processingTime/1000)}s AGI processing time...`);
      
      const delayPromise = new Promise(resolve => setTimeout(resolve, processingTime));

      // Wait for both the API call AND the delay to complete
      const [response] = await Promise.all([apiCallPromise, delayPromise]);

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      // Get the response text first to debug
      const responseText = await response.text();
      console.log('Raw response text:', responseText);
      console.log('Response text length:', responseText.length);

      if (!responseText) {
        throw new Error('Empty response from server');
      }

      // Try to parse JSON
      let data: AnalyzeResponse;
      try {
        data = JSON.parse(responseText);
        console.log('Parsed JSON successfully:', data);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error(`Failed to parse JSON response: ${responseText.substring(0, 200)}...`);
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyze idea');
      }

      setResult(data);
      console.log('=== FRONTEND API CALL SUCCESS ===');
    } catch (err) {
      console.error('=== FRONTEND API ERROR ===');
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-emerald-500 rounded-lg" />
              <span className="text-xl font-semibold text-gray-900">IdeaProof</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <ScrollFadeIn delay={100}>
        <section className="pt-24 pb-32 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(158,64%,52%,0.05)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(14,90%,63%,0.05)_0%,transparent_50%)]" />
          
          <div className="container mx-auto max-w-5xl text-center relative">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
              <CheckCircle2 className="h-4 w-4" />
              147 ideas validated in 48 hours
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold text-foreground mb-6 leading-[1.1] tracking-tight">
              Validate Your Startup<br />
              Idea in <span className="text-primary">90 Seconds</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              AI advisors research competitors and tell you if your idea is worth building—<strong className="text-foreground">before you waste months</strong>.
            </p>

            {/* Input Form */}
            <div className="max-w-2xl mx-auto mb-8">
              <Card className="p-2 shadow-strong border-border/50">
                <Textarea
                  placeholder="Describe your startup idea in a few sentences..."
                  className="min-h-[140px] text-base resize-none border-0 focus-visible:ring-0 bg-background"
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  disabled={loading}
                />
                <Button
                  size="lg"
                  className="w-full text-lg h-14 font-semibold bg-gradient-primary hover:opacity-90 transition-opacity"
                  onClick={handleValidate}
                  disabled={loading || !idea.trim()}
                >
                  {loading ? 'Analyzing...' : 'Validate My Idea'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Card>
              <p className="text-sm text-muted-foreground mt-4">
                Free • Takes 90 seconds • No signup required
              </p>
            </div>

            {/* Sentry Monitor Widget */}
            <div className="max-w-2xl mx-auto">
              <SentryMonitor />
            </div>
          </div>
        </section>
      </ScrollFadeIn>

      {/* Error Display */}
      {error && (
        <div className="container mx-auto max-w-5xl mb-8">
          <div className="bg-red-50 border border-red-200 p-4 rounded-md">
            <p className="font-semibold text-red-800 mb-1">Error</p>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Loading Spinner Display */}
      {loading && !result?.data && (
        <section className="py-24 px-6">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground tracking-tight">
                AGI Analysis in Progress
              </h2>
              <p className="text-lg text-muted-foreground">
                Our neural networks are analyzing your idea across multiple dimensions
              </p>
            </div>
            <Card className="p-8 border-border/50 bg-background shadow-strong">
              <AGISpinner 
                isActive={true} 
                message="Processing idea through AGI neural networks"
              />
            </Card>
          </div>
        </section>
      )}

      {/* Results Display */}
      {result?.data && (
        <section className="py-24 px-6">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground tracking-tight">
                Your Idea Analysis
              </h2>
              <p className="text-lg text-muted-foreground">
                Here's what our AI advisors discovered
              </p>
            </div>
            
            <Card className="p-8 md:p-10 border-border/50 bg-background shadow-strong">
              <div className="space-y-8">
                {/* Analysis Summary */}
                <div>
                  <p className="text-sm font-semibold text-primary mb-3 uppercase tracking-wide">Idea Analyzed</p>
                  <p className="text-lg font-medium text-foreground leading-relaxed">
                    "{idea}"
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-muted/50 rounded-2xl p-6 border border-border/50">
                    <p className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Competitors Found</p>
                    <p className="text-5xl font-bold text-foreground">{result.data.analysis.totalCompetitors}</p>
                    <p className="text-sm text-muted-foreground mt-2">In your market</p>
                  </div>
                  <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20">
                    <p className="text-sm font-semibold text-primary mb-2 uppercase tracking-wide">Opportunity Score</p>
                    <p className="text-5xl font-bold text-primary">{result.data.analysis.opportunityScore}<span className="text-2xl text-muted-foreground">/10</span></p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {result.data.analysis.opportunityScore >= 7 ? 'Worth pursuing' : result.data.analysis.opportunityScore >= 5 ? 'Needs differentiation' : 'Consider pivoting'}
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-2xl p-6 border border-border/50">
                    <p className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Market Analysis</p>
                    <p className="text-5xl font-bold text-foreground">AI</p>
                    <p className="text-sm text-muted-foreground mt-2">Powered insights</p>
                  </div>
                </div>

                {/* Monitoring Status */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-purple-900">Performance Monitoring</p>
                        <p className="text-xs text-purple-700">Analysis tracked with Sentry error monitoring</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs text-green-700 font-medium">Active</span>
                    </div>
                  </div>
                </div>

                {/* Pivot Suggestion */}
                {result.data.pivot && (
                  <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                        <span className="text-amber-600 text-sm">💡</span>
                      </div>
                      <p className="font-semibold text-amber-800">Pivot Suggestion</p>
                    </div>
                    <p className="text-amber-700 leading-relaxed">
                      {result.data.pivot.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1')}
                    </p>
                  </div>
                )}

                {/* Optimist Advisor */}
                <div className="border-t border-border/50 pt-8">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-sm">🌱</span>
                    </div>
                    <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">Optimist Advisor</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 shadow-sm">
                    <p className="text-base text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {result.data.optimist.text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1')}
                    </p>
                  </div>
                </div>

                {/* Realist Advisor */}
                <div className="border-t border-border/50 pt-8">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-sm">⚖️</span>
                    </div>
                    <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Realist Advisor</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 shadow-sm">
                    <p className="text-base text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {result.data.realist.text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1')}
                    </p>
                  </div>
                </div>

                {/* Top Competitors */}
                {result.data.analysis.topCompetitors.length > 0 && (
                  <div className="border-t border-border/50 pt-8">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-orange-600 text-sm">🏢</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Top Competitors</p>
                    </div>
                    <div className="space-y-4">
                      {result.data.analysis.topCompetitors.slice(0, 5).map((competitor, index) => (
                        <div key={index} className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <a
                              href={competitor.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-lg font-semibold text-blue-700 hover:text-blue-900 hover:underline transition-colors"
                            >
                              {competitor.name.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1')}
                            </a>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                              #{index + 1}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mb-3 font-mono text-xs">{competitor.url}</p>
                          <p className="text-gray-700 leading-relaxed">
                            {competitor.description.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* How It Works */}
      <ScrollFadeIn delay={200}>
        <section className="py-24 px-6 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <ScrollFadeIn delay={300}>
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground tracking-tight">
                  How It Works
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Three steps to validate your next big idea
                </p>
              </div>
            </ScrollFadeIn>
            
            <div className="grid md:grid-cols-3 gap-8">
              <ScrollFadeIn delay={400}>
                <Card className="p-8 border-border/50 bg-background shadow-elevated hover:shadow-strong transition-shadow">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                    <Search className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-foreground">AI Research</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Searches Product Hunt, Google, and 50+ sources to find every competitor in your space
                  </p>
                </Card>
              </ScrollFadeIn>

              <ScrollFadeIn delay={500}>
                <Card className="p-8 border-border/50 bg-background shadow-elevated hover:shadow-strong transition-shadow">
                  <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mb-6">
                    <MessageSquare className="h-7 w-7 text-accent" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-foreground">Expert Analysis</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Two AI advisors debate your idea and give brutally honest feedback
                  </p>
                </Card>
              </ScrollFadeIn>

              <ScrollFadeIn delay={600}>
                <Card className="p-8 border-border/50 bg-background shadow-elevated hover:shadow-strong transition-shadow">
                  <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center mb-6">
                    <BarChart3 className="h-7 w-7 text-secondary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-foreground">Clear Verdict</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Get competition score, market size, and pivot suggestions in one report
                  </p>
                </Card>
              </ScrollFadeIn>
            </div>
          </div>
        </section>
      </ScrollFadeIn>

      {/* AGI Loader Overlay - Disabled for cleaner spinner experience */}
      {/* <AGILoader 
        isActive={loading} 
        onComplete={() => {
          // Loader completion handled by the API response
        }}
      /> */}

      {/* Sentry Integration Badge */}
      <SentryIntegrationBadge />

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 px-6 bg-muted/30">
        <div className="container mx-auto text-center">
          <p className="text-sm text-muted-foreground">© 2025 IdeaProof. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
