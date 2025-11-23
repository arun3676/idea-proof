// Test script specifically for mock functionality
const { 
  autoAnalysis, 
  autoSearch, 
  autoCacheManager, 
  getImplementationStatus 
} = require('./lib/mock-factory');

async function testMockFunctionality() {
  console.log('🧪 Testing Mock Functionality\n');
  
  // Show implementation status
  const status = getImplementationStatus();
  console.log('=== Implementation Status ===');
  console.log(`Mock Mode: ${status.isMockMode}`);
  console.log(`OpenAI Key Available: ${status.openAIKeyAvailable}`);
  console.log(`Environment: ${status.environment}`);
  console.log(`USE_MOCK_API: ${status.useMockApi}`);
  console.log('');
  
  const tests = [
    {
      name: 'Mock Analysis Function',
      test: async () => {
        console.log('Testing mock analysis...');
        const result = await autoAnalysis([], [], 'test market analysis');
        
        if (!result || !result.totalCompetitors) {
          throw new Error('Analysis result missing required fields');
        }
        
        console.log(`✓ Analysis completed - ${result.totalCompetitors} competitors found`);
        console.log(`  Opportunity Score: ${result.opportunityScore}`);
        console.log(`  Market Gaps: ${result.marketGaps.length}`);
        
        return { success: true, result };
      }
    },
    {
      name: 'Mock Search Function',
      test: async () => {
        console.log('Testing mock search...');
        const result = await autoSearch('how to use this application');
        
        if (!result || !result.results) {
          throw new Error('Search result missing required fields');
        }
        
        console.log(`✓ Search completed - ${result.totalResults} results found`);
        console.log(`  Query: "${result.query}"`);
        console.log(`  Source: ${result.source}`);
        
        return { success: true, result };
      }
    },
    {
      name: 'Mock Cache Functions',
      test: async () => {
        console.log('Testing mock cache...');
        
        // Test cache set
        await autoCacheManager.setCachedResult('test-key', { message: 'test data' });
        console.log('✓ Cache set successful');
        
        // Test cache get
        const cached = await autoCacheManager.getCachedResult('test-key');
        if (!cached || cached.message !== 'test data') {
          throw new Error('Cache get failed');
        }
        console.log('✓ Cache get successful');
        
        // Test cache delete
        await autoCacheManager.deleteCachedResult('test-key');
        const deleted = await autoCacheManager.getCachedResult('test-key');
        if (deleted) {
          throw new Error('Cache delete failed');
        }
        console.log('✓ Cache delete successful');
        
        return { success: true };
      }
    },
    {
      name: 'Mock Data Variations',
      test: async () => {
        console.log('Testing mock data variations...');
        
        // Test different query types
        const queries = [
          'high competition market',
          'low opportunity area',
          'standard analysis query'
        ];
        
        for (const query of queries) {
          const result = await autoAnalysis([], [], query);
          console.log(`  Query: "${query}" -> Score: ${result.opportunityScore}, Competitors: ${result.totalCompetitors}`);
        }
        
        return { success: true, testedQueries: queries.length };
      }
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      console.log(`\n--- ${test.name} ---`);
      const result = await test.test();
      console.log(`✅ ${test.name}: PASSED`);
      passed++;
    } catch (error) {
      console.log(`❌ ${test.name}: FAILED - ${error.message}`);
      failed++;
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('🏁 MOCK FUNCTIONALITY TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total: ${passed + failed}`);
  
  if (failed === 0) {
    console.log('\n🎉 ALL MOCK TESTS PASSED!');
    console.log('✅ Mock system is working correctly');
    console.log('✅ Ready for development and testing');
    console.log('✅ Can be used when real APIs are unavailable');
  } else {
    console.log(`\n⚠️  ${failed} mock test(s) failed. Check the mock implementation.`);
  }
  
  return { passed, failed, total: passed + failed };
}

// Test mock performance
async function testMockPerformance() {
  console.log('\n=== Mock Performance Test ===');
  
  const iterations = 5;
  const times = [];
  
  for (let i = 0; i < iterations; i++) {
    const startTime = Date.now();
    await autoAnalysis([], [], `performance test ${i}`);
    const duration = Date.now() - startTime;
    times.push(duration);
    console.log(`Iteration ${i + 1}: ${duration}ms`);
  }
  
  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  
  console.log(`\nPerformance Summary:`);
  console.log(`  Average: ${avgTime.toFixed(2)}ms`);
  console.log(`  Min: ${minTime}ms`);
  console.log(`  Max: ${maxTime}ms`);
  
  return { avgTime, minTime, maxTime, iterations };
}

if (require.main === module) {
  testMockFunctionality()
    .then(() => testMockPerformance())
    .then((perf) => {
      console.log('\n🚀 Mock functionality testing completed!');
      console.log(`Performance: ${perf.avgTime.toFixed(2)}ms average response time`);
    })
    .catch(error => {
      console.error('\n💥 Mock functionality test failed:', error);
      process.exit(1);
    });
}

module.exports = { 
  testMockFunctionality, 
  testMockPerformance 
};
