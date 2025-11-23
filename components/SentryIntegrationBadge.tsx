'use client';

import { Shield, Activity, Zap, CheckCircle } from 'lucide-react';

export function SentryIntegrationBadge() {
  return (
    <div className="fixed bottom-6 right-6 z-40 font-inter">
      <div className="bg-emerald-600 text-white rounded-full px-4 py-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Shield className="w-4 h-4" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          </div>
          <span className="text-xs font-semibold">Sentry</span>
          <div className="w-px h-3 bg-white/30" />
          <Activity className="w-3 h-3 text-green-300" />
        </div>
        
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl font-inter">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-3 h-3 text-green-400" />
              <span className="font-semibold">Monitoring Active</span>
            </div>
            <div className="text-gray-300">Error tracking & performance</div>
            <div className="absolute bottom-0 right-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900" />
          </div>
        </div>
      </div>
    </div>
  );
}
