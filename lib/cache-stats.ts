// Cache Statistics for API Response
import { getCacheManager } from './agi-cache';

export interface CacheStats {
  totalCached: number;
  agiResults: number;
  mockResults: number;
  sources: {
    productHunt: 'agi' | 'mock' | 'none';
    google: 'agi' | 'mock' | 'none';
  };
}

export function getCacheStatsForResponse(query: string): CacheStats {
  const cacheManager = getCacheManager();
  const stats = cacheManager.getCacheStats();
  
  // Check what sources were used for this query
  const productHuntCached = cacheManager.getCachedResult(query, 'producthunt');
  const googleCached = cacheManager.getCachedResult(query, 'google');
  
  return {
    totalCached: stats.total,
    agiResults: stats.agi,
    mockResults: stats.mock,
    sources: {
      productHunt: productHuntCached ? 'agi' : 'none',
      google: googleCached ? 'agi' : 'none'
    }
  };
}
