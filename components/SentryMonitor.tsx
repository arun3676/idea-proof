'use client';

import { useState, useEffect } from 'react';
import { Activity, TrendingUp, Clock, CheckCircle, AlertTriangle, AlertCircle, Info, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';

type SentryLog = {
  id: string;
  title: string;
  message: string;
  level: "error" | "warning" | "info";
  events?: number;
  timestamp: string;
  environment?: string;
  url?: string;
};

type SentryStats = {
  systemHealth: "healthy" | "degraded" | "critical";
  successRate: number;
  avgResponseTime: number;
  totalValidations: number;
  uptime: number;
  lastUpdated: string;
  logs: SentryLog[];
};

export function SentryMonitor() {
  const [stats, setStats] = useState<SentryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/sentry-stats");
      if (!res.ok) throw new Error(`Failed to load stats: ${res.status}`);
      const data = await res.json();
      
      // Transform API response to match required types
      const transformedData: SentryStats = {
        ...data,
        systemHealth: data.systemHealth === 'down' ? 'critical' : data.systemHealth,
        logs: data.logs?.map((log: any) => ({
          ...log,
          events: log.count, // Map count to events
        })) || []
      };
      
      setStats(transformedData);
    } catch (err: any) {
      console.error("Failed to fetch Sentry stats", err);
      setError(err.message ?? "Failed to load system monitoring");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const id = setInterval(fetchStats, 30_000); // refresh every 30s
    return () => clearInterval(id);
  }, []);

  const getLevelIcon = (level: "error" | "warning" | "info") => {
    switch (level) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-600" />;
      default:
        return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  const getLevelColor = (level: "error" | "warning" | "info") => {
    switch (level) {
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'info':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 animate-pulse">
        <div className="h-48 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 shadow-lg border border-purple-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" />
            System Monitoring
          </h3>
        </div>
        <div className="text-center text-red-600 py-8">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 animate-pulse">
        <div className="h-48 bg-gray-200 rounded"></div>
      </div>
    );
  }

  const healthColor = stats.systemHealth === 'healthy' 
    ? 'text-green-600' 
    : stats.systemHealth === 'degraded' 
    ? 'text-yellow-600' 
    : 'text-red-600';

  const healthBg = stats.systemHealth === 'healthy' 
    ? 'bg-green-100' 
    : stats.systemHealth === 'degraded' 
    ? 'bg-yellow-100' 
    : 'bg-red-100';

  const healthLabel =
    stats.systemHealth === 'healthy' ? 'HEALTHY' :
    stats.systemHealth === 'degraded' ? 'DEGRADED' :
    'CRITICAL';

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 shadow-lg border border-purple-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-600" />
          System Monitoring
        </h3>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${healthBg} ${healthColor}`}>
            {healthLabel}
          </span>
          <a 
            href="https://sentry.io" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-purple-600 hover:text-purple-800 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-xs font-medium text-gray-600">Success Rate</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.successRate.toFixed(1)}%</p>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-gray-600">Avg Response</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.avgResponseTime}ms</p>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-medium text-gray-600">Total Validations</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalValidations.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-medium text-gray-600">Uptime</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.uptime.toFixed(1)}%</p>
        </div>
      </div>

      {/* Sentry Logs Section */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-800">Recent Issues</h4>
        </div>
        
        {loading && (
          <div className="text-xs text-muted-foreground py-4">
            Loading latest issues…
          </div>
        )}

        {error && !loading && (
          <div className="text-xs text-red-500 py-4">
            {error}
          </div>
        )}

        {!loading && !error && stats && stats.logs.length === 0 && (
          <div className="text-xs text-muted-foreground py-4">
            No recent issues. System is stable.
          </div>
        )}

        {!loading && !error && stats && stats.logs.length > 0 && (
          <div className="divide-y divide-gray-200">
            {stats.logs.map((log) => (
              <li
                key={log.id}
                className="flex flex-col gap-1 rounded-xl border bg-white/40 px-4 py-3 list-none"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getLevelIcon(log.level)}
                    <span className="text-sm font-medium">
                      {log.title}
                    </span>
                  </div>
                  {log.events && (
                    <span className="rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide">
                      {log.events} events
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {log.message}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  {log.environment && <span>• {log.environment}</span>}
                  {log.url && (
                    <>
                      <span>•</span>
                      <a
                        href={log.url}
                        target="_blank"
                        rel="noreferrer"
                        className="underline underline-offset-2"
                      >
                        View in Sentry
                      </a>
                    </>
                  )}
                </div>
              </li>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Last updated: {new Date(stats.lastUpdated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </div>
    </div>
  );
}
