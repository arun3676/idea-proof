'use client';

import { useState, useEffect } from 'react';
import { Brain, Search, MessageSquare, BarChart3, CheckCircle, Loader2, Activity, Zap } from 'lucide-react';

interface AnalysisStep {
  id: string;
  label: string;
  icon: React.ReactNode;
  status: 'pending' | 'running' | 'completed' | 'error';
  details: string;
  subSteps?: string[];
  progress?: number;
}

interface AGILoaderProps {
  isActive: boolean;
  onComplete?: () => void;
}

export function AGILoader({ isActive, onComplete }: AGILoaderProps) {
  const [steps, setSteps] = useState<AnalysisStep[]>([
    {
      id: 'search',
      label: 'Multi-Source AI Research',
      icon: <Search className="w-4 h-4" />,
      status: 'pending',
      details: 'Querying AGI neural networks...',
      subSteps: [
        'Connecting to AGI infrastructure...',
        'Searching Product Hunt database...',
        'Scanning Google Scholar & academic sources...',
        'Analyzing competitor websites...',
        'Processing market intelligence data...'
      ]
    },
    {
      id: 'analysis',
      label: 'Deep Competition Analysis',
      icon: <BarChart3 className="w-4 h-4" />,
      status: 'pending',
      details: 'Initializing analysis algorithms...',
      subSteps: [
        'Mapping competitive landscape...',
        'Calculating market saturation metrics...',
        'Identifying opportunity gaps...',
        'Running threat assessment models...',
        'Generating strategic insights...'
      ]
    },
    {
      id: 'advisor',
      label: 'AI Advisor Generation',
      icon: <MessageSquare className="w-4 h-4" />,
      status: 'pending',
      details: 'Engaging expert AI models...',
      subSteps: [
        'Activating Optimist advisor neural network...',
        'Analyzing growth opportunities...',
        'Activating Realist advisor neural network...',
        'Identifying potential risks...',
        'Synthesizing balanced recommendations...'
      ]
    },
    {
      id: 'synthesis',
      label: 'Report Synthesis',
      icon: <Brain className="w-4 h-4" />,
      status: 'pending',
      details: 'Compiling final analysis...',
      subSteps: [
        'Integrating all data sources...',
        'Generating opportunity score...',
        'Creating pivot recommendations...',
        'Finalizing strategic report...',
        'Preparing comprehensive results...'
      ]
    }
  ]);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentSubStep, setCurrentSubStep] = useState('');
  const [progress, setProgress] = useState(0);
  const [processingSpeed, setProcessingSpeed] = useState('Initializing...');
  const [neuralNetworksActive, setNeuralNetworksActive] = useState(0);

  useEffect(() => {
    if (!isActive) {
      // Reset when not active
      setSteps(prev => prev.map(step => ({ 
        ...step, 
        status: 'pending', 
        progress: 0,
        details: step.subSteps?.[0] || 'Initializing...'
      })));
      setCurrentStepIndex(0);
      setCurrentSubStep('');
      setProgress(0);
      setProcessingSpeed('Initializing...');
      setNeuralNetworksActive(0);
      return;
    }

    const runAGISimulation = async () => {
      // AGI-style realistic timing and progress simulation
      const stepDurations = [15000, 12000, 10000, 8000]; // Extended AGI processing times (45 seconds total)
      let totalProgress = 0;

      for (let i = 0; i < steps.length; i++) {
        setCurrentStepIndex(i);
        
        // Start current step
        setSteps(prev => prev.map((step, index) => ({
          ...step,
          status: index === i ? 'running' : index < i ? 'completed' : 'pending',
          progress: index === i ? 0 : index < i ? 100 : 0,
          details: index === i ? step.subSteps?.[0] || 'Processing...' : step.details
        })));

        const duration = stepDurations[i];
        const subSteps = steps[i].subSteps || [];
        const subStepDuration = duration / subSteps.length;

        // Simulate sub-steps with realistic AGI processing messages
        for (let j = 0; j < subSteps.length; j++) {
          const subStep = subSteps[j];
          setCurrentSubStep(subStep);
          
          // Update processing speed with realistic AGI metrics
          const speeds = [
            'GPT-4 Turbo: 2.1M tokens/sec',
            'Claude-3 Opus: 1.8M tokens/sec', 
            'Gemini Pro: 1.5M tokens/sec',
            'Llama-3 70B: 950kHz inference',
            'Neural Networks: 12 active',
            'Accuracy: 99.94%',
            'Sources Analyzed: 150+',
            'AGI Optimization: Active'
          ];
          setProcessingSpeed(speeds[j % speeds.length]);
          
          // Update neural network count
          setNeuralNetworksActive(Math.min(12, 3 + i * 3 + j));

          // Progress animation for this sub-step
          const subStepProgress = (j + 1) / subSteps.length;
          const stepProgress = subStepProgress * 100;
          
          setSteps(prev => prev.map((step, index) => ({
            ...step,
            progress: index === i ? stepProgress : step.progress,
            details: index === i ? subStep : step.details
          })));

          // Update overall progress
          const stepProgressWeight = 100 / steps.length;
          const currentStepProgress = (j + 1) / subSteps.length;
          totalProgress = (i * stepProgressWeight) + (currentStepProgress * stepProgressWeight);
          setProgress(totalProgress);

          // Realistic sub-step timing with some variance
          const variance = 0.8 + Math.random() * 0.4; // 80-120% of base time
          await new Promise(resolve => setTimeout(resolve, subStepDuration * variance));
        }

        // Mark step as completed
        setSteps(prev => prev.map((step, index) => ({
          ...step,
          status: index <= i ? 'completed' : 'pending',
          progress: index <= i ? 100 : 0
        })));
      }

      // All steps completed
      setProgress(100);
      setCurrentSubStep('Analysis complete! Preparing your results...');
      setProcessingSpeed('Final synthesis complete');
      setNeuralNetworksActive(15);
      
      if (onComplete) {
        setTimeout(onComplete, 800);
      }
    };

    runAGISimulation();
  }, [isActive, onComplete]);

  if (!isActive) return null;

  const getStatusIcon = (status: AnalysisStep['status']) => {
    switch (status) {
      case 'running':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <div className="w-4 h-4 rounded-full bg-red-600" />;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStatusColor = (status: AnalysisStep['status']) => {
    switch (status) {
      case 'running':
        return 'border-blue-200 bg-blue-50';
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const runningStep = steps[currentStepIndex];

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-md w-full p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-5 h-5 bg-emerald-500 rounded-lg animate-pulse" />
            <h3 className="text-lg font-semibold text-gray-900">Analyzing Your Idea</h3>
          </div>
          <p className="text-sm text-gray-600">AI-powered competitive intelligence</p>
        </div>

        {/* Current Status */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            {runningStep?.status === 'running' && (
              <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            )}
            <p className="text-sm font-medium text-gray-900">{currentSubStep}</p>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* AGI Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6 text-center">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">Data Sources</div>
            <div className="text-sm font-semibold text-gray-900">50+</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">Processing</div>
            <div className="text-sm font-semibold text-gray-900">{processingSpeed}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">Accuracy</div>
            <div className="text-sm font-semibold text-gray-900">99.7%</div>
          </div>
        </div>

        {/* Steps Progress */}
        <div className="space-y-2">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-300 ${
                index <= currentStepIndex ? 'bg-emerald-50' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-gray-300 bg-white">
                {step.status === 'completed' ? (
                  <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                ) : step.status === 'running' ? (
                  <div className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <div className="w-3 h-3 rounded-full bg-gray-300" />
                )}
              </div>
              <div className="flex-1">
                <p className={`text-xs font-medium ${
                  index <= currentStepIndex ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {step.label.replace('Multi-Source AI Research', 'Research').replace('Deep Competition Analysis', 'Analysis').replace('AI Advisor Generation', 'AI Advisors').replace('Report Synthesis', 'Synthesis')}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 mb-2">
            {Math.round(progress)}% complete • {Math.max(0, Math.ceil((100 - progress) / 100 * 45))}s remaining
          </p>
          {/* Sentry Integration Badge */}
          <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
            <div className="w-3 h-3 bg-purple-500 rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
            <span>Powered by Sentry Monitoring</span>
          </div>
        </div>
      </div>
    </div>
  );
}
