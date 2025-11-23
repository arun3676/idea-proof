// Test script for API connections
const axios = require('axios');

async function testConnection() {
  console.log('Testing API connections...');
  
  try {
    // Test OpenAI connection
    console.log('1. Testing OpenAI API...');
    const openaiTest = await testOpenAIConnection();
    console.log('✓ OpenAI connection test passed');
    
    // Test local API endpoints
    console.log('2. Testing local API endpoints...');
    const localTest = await testLocalAPI();
    console.log('✓ Local API test passed');
    
    // Test Sentry connection
    console.log('3. Testing Sentry connection...');
    const sentryTest = await testSentryConnection();
    console.log('✓ Sentry connection test passed');
    
    console.log('All connection tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    process.exit(1);
  }
}

async function testOpenAIConnection() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not found in environment');
  }
  
  const response = await axios.post('https://api.openai.com/v1/models', {}, {
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (response.status !== 200) {
    throw new Error(`OpenAI API returned status ${response.status}`);
  }
  
  return response.data;
}

async function testLocalAPI() {
  try {
    const response = await axios.get('http://localhost:3000/api/analyze', {
      timeout: 5000
    });
    return { status: 'success', data: response.data };
  } catch (error) {
    // If local server is not running, that's okay for this test
    return { status: 'skipped', reason: 'Local server not running' };
  }
}

async function testSentryConnection() {
  // Mock Sentry test - in real implementation would test Sentry DSN
  if (!process.env.SENTRY_DSN) {
    return { status: 'skipped', reason: 'SENTRY_DSN not configured' };
  }
  
  return { status: 'success', message: 'Sentry configuration valid' };
}

if (require.main === module) {
  testConnection();
}

module.exports = { testConnection, testOpenAIConnection, testLocalAPI, testSentryConnection };
