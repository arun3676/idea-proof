// Simple cache warmup script for quick deployment
const { setCachedResult } = require('./lib/agi-cache');

async function simpleWarmup() {
  console.log('🔥 Simple cache warmup starting...\n');
  
  // Basic cache entries that should always be available
  const basicCache = {
    'app-status': {
      status: 'ready',
      message: 'Application is running and ready to use',
      version: '1.0.0'
    },
    'help-text': {
      title: 'How to Use This Application',
      content: 'This application provides AI-powered analysis and search capabilities. Simply enter your query or text to get started.'
    },
    'error-template': {
      title: 'Something Went Wrong',
      message: 'We apologize for the inconvenience. Please try again or contact support if the problem persists.'
    }
  };
  
  let successCount = 0;
  
  for (const [key, value] of Object.entries(basicCache)) {
    try {
      await setCachedResult(key, {
        ...value,
        cachedAt: Date.now()
      });
      
      console.log(`✓ Cached: ${key}`);
      successCount++;
      
    } catch (error) {
      console.log(`❌ Failed to cache ${key}: ${error.message}`);
    }
  }
  
  console.log(`\nSimple warmup completed: ${successCount}/${Object.keys(basicCache).length} entries cached`);
  
  return successCount === Object.keys(basicCache).length;
}

if (require.main === module) {
  simpleWarmup()
    .then((success) => {
      if (success) {
        console.log('\n✅ Simple warmup completed successfully!');
      } else {
        console.log('\n⚠️  Some cache entries failed. Check your configuration.');
      }
    })
    .catch(error => {
      console.error('Simple warmup failed:', error);
      process.exit(1);
    });
}

module.exports = { simpleWarmup };
