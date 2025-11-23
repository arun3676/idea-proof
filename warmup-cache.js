// Cache warmup script for production deployment
const { autoCacheManager } = require('./lib/mock-factory');
const { autoAnalysis } = require('./lib/mock-factory');

async function warmupCache() {
  console.log('🔥 Warming up cache for production...\n');
  
  const warmupQueries = [
    {
      key: 'welcome-message',
      query: 'Generate a welcome message for a new user',
      description: 'Welcome message cache'
    },
    {
      key: 'help-instructions',
      query: 'Provide help instructions for using this application',
      description: 'Help instructions cache'
    },
    {
      key: 'error-message',
      query: 'Generate a user-friendly error message',
      description: 'Error message cache'
    },
    {
      key: 'sample-analysis',
      query: 'Analyze this sample text for demonstration purposes',
      description: 'Sample analysis cache'
    }
  ];
  
  let successCount = 0;
  let failCount = 0;
  
  for (const query of warmupQueries) {
    try {
      console.log(`Warming up: ${query.description}...`);
      
      // Generate the content
      const result = await autoAnalysis([], [], query.query);
      
      // Cache the result
      await autoCacheManager.setCachedResult(query.key, {
        data: result,
        timestamp: Date.now(),
        query: query.query,
        description: query.description,
        implementation: process.env.OPENAI_API_KEY ? 'real' : 'mock'
      });
      
      console.log(`✓ ${query.description} cached successfully (${process.env.OPENAI_API_KEY ? 'real' : 'mock'} implementation)`);
      successCount++;
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`❌ ${query.description} failed: ${error.message}`);
      failCount++;
    }
  }
  
  console.log(`\n=== Cache Warmup Summary ===`);
  console.log(`Successfully cached: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  console.log(`Total queries: ${successCount + failCount}`);
  
  if (failCount === 0) {
    console.log('\n🎉 Cache warmup completed successfully!');
    console.log('Your application is optimized for production.');
  } else {
    console.log(`\n⚠️  ${failCount} queries failed to cache. Check your API configuration.`);
  }
  
  return { successCount, failCount };
}

// Warmup search cache
async function warmupSearchCache() {
  console.log('\n🔍 Warming up search cache...');
  
  const searchQueries = [
    'how to use this application',
    'getting started guide',
    'features and capabilities',
    'troubleshooting common issues'
  ];
  
  const { searchWithAGI } = require('./lib/agi-search');
  
  for (const query of searchQueries) {
    try {
      console.log(`Caching search for: "${query}"...`);
      
      const result = await searchWithAGI(query);
      
      console.log(`✓ Search cached for: "${query}"`);
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`❌ Search cache failed for "${query}": ${error.message}`);
    }
  }
}

// Verify cache is working
async function verifyCache() {
  console.log('\n🔍 Verifying cache integrity...');
  
  const { getCachedResult } = require('./lib/agi-cache');
  
  const testKeys = [
    'welcome-message',
    'help-instructions',
    'sample-analysis'
  ];
  
  let verifiedCount = 0;
  
  for (const key of testKeys) {
    try {
      const result = await getCachedResult(key);
      
      if (result && result.data) {
        console.log(`✓ Cache verified for: ${key}`);
        verifiedCount++;
      } else {
        console.log(`❌ Cache missing or empty for: ${key}`);
      }
    } catch (error) {
      console.log(`❌ Cache verification failed for ${key}: ${error.message}`);
    }
  }
  
  console.log(`\nCache verification: ${verifiedCount}/${testKeys.length} entries valid`);
  
  return verifiedCount === testKeys.length;
}

if (require.main === module) {
  warmupCache()
    .then(() => warmupSearchCache())
    .then(() => verifyCache())
    .then((isVerified) => {
      if (isVerified) {
        console.log('\n🚀 Cache warmup and verification completed successfully!');
        console.log('Your application is ready for production deployment.');
      } else {
        console.log('\n⚠️  Cache verification failed. Please check the cache system.');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n💥 Cache warmup failed:', error);
      process.exit(1);
    });
}

module.exports = { 
  warmupCache, 
  warmupSearchCache, 
  verifyCache 
};
