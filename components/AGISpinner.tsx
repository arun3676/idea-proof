'use client';

import { useState, useEffect } from 'react';
import { Brain, Activity, Zap, Cpu } from 'lucide-react';

interface AGISpinnerProps {
  isActive: boolean;
  message?: string;
}

export function AGISpinner({ isActive, message = "Initializing AGI neural networks..." }: AGISpinnerProps) {
  const [dots, setDots] = useState('');
  const [pulseIntensity, setPulseIntensity] = useState(1);
  const [activeNetwork, setActiveNetwork] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    // Animated dots
    const dotsInterval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 500);

    // Pulse intensity animation
    const pulseInterval = setInterval(() => {
      setPulseIntensity(prev => (prev % 3) + 1);
    }, 1000);

    // Network cycling animation
    const networkInterval = setInterval(() => {
      setActiveNetwork(prev => (prev + 1) % 4);
    }, 2000);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(pulseInterval);
      clearInterval(networkInterval);
    };
  }, [isActive]);

  if (!isActive) return null;

  const networks = [
    { icon: <Brain className="w-5 h-5" />, name: 'Neural Core', color: 'text-emerald-500' },
    { icon: <Activity className="w-5 h-5" />, name: 'Processing', color: 'text-blue-500' },
    { icon: <Zap className="w-5 h-5" />, name: 'Optimization', color: 'text-yellow-500' },
    { icon: <Cpu className="w-5 h-5" />, name: 'Compute', color: 'text-purple-500' }
  ];

  const currentNetwork = networks[activeNetwork];

  return (
    <div className="flex flex-col items-center justify-center py-12 px-8">
      {/* Main AGI Spinner */}
      <div className="relative mb-8">
        {/* Outer ring */}
        <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-gray-200"></div>
        
        {/* Animated rings */}
        <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" 
             style={{ animationDuration: '3s' }}></div>
        <div className="absolute inset-2 w-20 h-20 rounded-full border-4 border-blue-500 border-b-transparent animate-spin" 
             style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
        <div className="absolute inset-4 w-16 h-16 rounded-full border-4 border-purple-500 border-l-transparent animate-spin" 
             style={{ animationDuration: '1.5s' }}></div>
        
        {/* Center core */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center shadow-lg ${pulseIntensity === 1 ? 'scale-110' : pulseIntensity === 2 ? 'scale-100' : 'scale-95'} transition-transform duration-300`}>
            <Brain className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Pulsing particles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-emerald-400 rounded-full animate-pulse"
            style={{
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-40px)`,
              animationDelay: `${i * 0.2}s`,
              opacity: pulseIntensity === 1 ? 0.8 : pulseIntensity === 2 ? 0.4 : 0.1
            }}
          />
        ))}
      </div>

      {/* Network Status */}
      <div className="flex items-center gap-3 mb-6">
        <div className={`transition-all duration-500 ${currentNetwork.color}`}>
          {currentNetwork.icon}
        </div>
        <div className="text-sm font-medium text-gray-700">
          {currentNetwork.name} Active
        </div>
        <div className="flex gap-1">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === activeNetwork ? 'bg-emerald-500 scale-125' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Message */}
      <div className="text-center">
        <p className="text-base font-medium text-gray-800 mb-2">
          {message}{dots}
        </p>
        <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
          <span>AGI Processing</span>
          <span>•</span>
          <span>Neural Networks Active</span>
          <span>•</span>
          <span>Real-time Analysis</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-md mt-6">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 rounded-full animate-pulse"
               style={{
                 width: '60%',
               }}>
          </div>
        </div>
      </div>
    </div>
  );
}