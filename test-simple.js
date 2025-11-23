// Simple test script for basic functionality
const { analyzeCompetition } = require('./lib/analysis');

async function runSimpleTests() {
  console.log('Running simple functionality tests...\n');
  
  const tests = [
    {
      name: 'Basic analysis function',
      test: async () => {
        const result = await analyzeCompetition([], [], 'test query');
        if (!result) throw new Error('Basic functionality test failed');
        return result;
      }
    },
    {
      name: 'Environment variables',
      test: async () => {
        require('dotenv').config();
        if (!process.env.OPENAI_API_KEY) {
          throw new Error('OPENAI_API_KEY not configured');
        }
        return { status: 'success', message: 'Environment variables configured' };
      }
    },
    {
      name: 'Module imports',
      test: async () => {
        try {
          require('./lib/agi-cache');
          require('./lib/analysis');
          require('./lib/agi-search');
          return { status: 'success', message: 'All modules imported successfully' };
        } catch (error) {
          throw new Error(`Module import failed: ${error.message}`);
        }
      }
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      console.log(`Running: ${test.name}...`);
      const result = await test.test();
      console.log(`✓ ${test.name}: ${result.message || 'PASSED'}`);
      passed++;
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
      failed++;
    }
  }
  
  console.log(`\n=== Test Results ===`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total: ${passed + failed}`);
  
  if (failed > 0) {
    console.log('\nSome tests failed. Please check the configuration.');
    process.exit(1);
  } else {
    console.log('\nAll tests passed! 🎉');
  }
}

if (require.main === module) {
  runSimpleTests();
}

module.exports = { runSimpleTests };
