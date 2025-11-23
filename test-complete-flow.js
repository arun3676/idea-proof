// Complete integration test for the entire application flow
const { testConnection } = require('./test-connection');
const { testRealAPI } = require('./test-real-api');
const { testEndpoints } = require('./test-endpoint');

async function runCompleteFlowTest() {
  console.log('🚀 Starting complete application flow test...\n');
  
  const testSuites = [
    {
      name: 'Environment & Connection Tests',
      runner: testConnection
    },
    {
      name: 'Real API Tests',
      runner: testRealAPI
    },
    {
      name: 'Endpoint Tests',
      runner: testEndpoints
    }
  ];
  
  let overallPassed = 0;
  let overallFailed = 0;
  
  for (const suite of testSuites) {
    console.log(`\n=== ${suite.name} ===`);
    try {
      await suite.runner();
      console.log(`✓ ${suite.name} completed successfully`);
      overallPassed++;
    } catch (error) {
      console.log(`❌ ${suite.name} failed: ${error.message}`);
      overallFailed++;
    }
  }
  
  // Additional integration tests
  console.log('\n=== Integration Tests ===');
  
  const integrationTests = [
    {
      name: 'Cache System Integration',
      test: async () => {
        const { getCachedResult, setCachedResult } = require('./lib/agi-cache');
        
        const testKey = 'test-integration';
        const testData = { result: 'success', timestamp: Date.now() };
        
        await setCachedResult(testKey, testData);
        const retrieved = await getCachedResult(testKey);
        
        if (!retrieved || retrieved.result !== testData.result) {
          throw new Error('Cache integration failed');
        }
        
        return { status: 'success', message: 'Cache system working correctly' };
      }
    },
    {
      name: 'Search Integration',
      test: async () => {
        const { searchWithAGI } = require('./lib/agi-search');
        
        const result = await searchWithAGI('test query');
        
        if (!result) {
          throw new Error('Search integration failed');
        }
        
        return { status: 'success', message: 'Search system working correctly' };
      }
    },
    {
      name: 'Session Management',
      test: async () => {
        const { createSession, getSession } = require('./lib/agi-session-manager');
        
        const sessionId = await createSession();
        const session = await getSession(sessionId);
        
        if (!session || !sessionId) {
          throw new Error('Session management failed');
        }
        
        return { status: 'success', message: 'Session management working correctly' };
      }
    }
  ];
  
  for (const test of integrationTests) {
    try {
      console.log(`Running: ${test.name}...`);
      const result = await test.test();
      console.log(`✓ ${test.name}: ${result.message}`);
      overallPassed++;
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
      overallFailed++;
    }
  }
  
  // Final summary
  console.log('\n' + '='.repeat(50));
  console.log('🏁 COMPLETE FLOW TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`Test Suites Passed: ${overallPassed}`);
  console.log(`Test Suites Failed: ${overallFailed}`);
  console.log(`Total Tests: ${overallPassed + overallFailed}`);
  
  if (overallFailed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Your application is ready for deployment!');
    console.log('✅ Environment configured correctly');
    console.log('✅ API connections working');
    console.log('✅ All endpoints responding');
    console.log('✅ Integration tests passing');
  } else {
    console.log(`\n⚠️  ${overallFailed} test(s) failed. Please review and fix issues before deployment.`);
    process.exit(1);
  }
}

// Performance test
async function runPerformanceTest() {
  console.log('\n=== Performance Tests ===');
  
  const { analyzeCompetition } = require('./lib/analysis');
  
  const testInputs = [
    { query: 'Short test query', description: 'Short test input' },
    { query: 'Medium length test query with more content to process', description: 'Medium length test input with more content' },
    { query: 'Long test query with significant amount of content that should take more time to process and analyze through the AGI system', description: 'Long test input with significant content' }
  ];
  
  for (const input of testInputs) {
    try {
      console.log(`Testing performance for: "${input.query.substring(0, 30)}..."`);
      
      const startTime = Date.now();
      const result = await analyzeCompetition([], [], input.query);
      const duration = Date.now() - startTime;
      
      console.log(`✓ Completed in ${duration}ms`);
      console.log(`  Query: ${input.description}`);
      console.log(`  Response length: ${JSON.stringify(result).length} characters`);
      
    } catch (error) {
      console.log(`❌ Performance test failed: ${error.message}`);
    }
  }
}

if (require.main === module) {
  runCompleteFlowTest()
    .then(() => runPerformanceTest())
    .then(() => {
      console.log('\n🚀 All tests completed successfully!');
    })
    .catch(error => {
      console.error('\n💥 Complete flow test failed:', error);
      process.exit(1);
    });
}

module.exports = { 
  runCompleteFlowTest, 
  runPerformanceTest 
};
