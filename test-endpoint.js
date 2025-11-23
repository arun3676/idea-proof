// Test script for API endpoints
const axios = require('axios');

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function testEndpoints() {
  console.log(`Testing API endpoints at ${BASE_URL}...\n`);
  
  const endpoints = [
    {
      name: 'Health Check',
      path: '/api/analyze',
      method: 'GET',
      expectedStatus: 200
    },
    {
      name: 'Analysis POST',
      path: '/api/analyze',
      method: 'POST',
      data: { input: 'Test input for endpoint testing' },
      expectedStatus: 200
    },
    {
      name: 'Streaming Endpoint',
      path: '/api/analyze-stream',
      method: 'POST',
      data: { input: 'Test streaming input' },
      expectedStatus: 200
    }
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing: ${endpoint.name}...`);
      
      const config = {
        method: endpoint.method,
        url: `${BASE_URL}${endpoint.path}`,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      if (endpoint.data) {
        config.data = endpoint.data;
      }
      
      const startTime = Date.now();
      const response = await axios(config);
      const duration = Date.now() - startTime;
      
      if (response.status === endpoint.expectedStatus) {
        console.log(`✓ ${endpoint.name}: PASSED (${duration}ms)`);
        results.push({
          name: endpoint.name,
          status: 'passed',
          duration,
          response: response.data
        });
      } else {
        console.log(`❌ ${endpoint.name}: FAILED - Expected ${endpoint.expectedStatus}, got ${response.status}`);
        results.push({
          name: endpoint.name,
          status: 'failed',
          error: `Wrong status code: ${response.status}`
        });
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: FAILED - ${error.message}`);
      results.push({
        name: endpoint.name,
        status: 'failed',
        error: error.message
      });
    }
  }
  
  // Summary
  const passed = results.filter(r => r.status === 'passed').length;
  const failed = results.filter(r => r.status === 'failed').length;
  
  console.log(`\n=== Endpoint Test Results ===`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total: ${results.length}`);
  
  if (failed > 0) {
    console.log('\nFailed tests:');
    results.filter(r => r.status === 'failed').forEach(result => {
      console.log(`  - ${result.name}: ${result.error}`);
    });
  }
  
  return results;
}

// Test streaming endpoint specifically
async function testStreamingEndpoint() {
  console.log('\nTesting streaming endpoint specifically...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/analyze-stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ input: 'Test streaming functionality' })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let chunks = [];
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      chunks.push(chunk);
      process.stdout.write('.');
    }
    
    console.log('\n✓ Streaming test completed successfully');
    console.log(`Received ${chunks.length} chunks`);
    
    return { status: 'success', chunks: chunks.length };
  } catch (error) {
    console.log(`❌ Streaming test failed: ${error.message}`);
    return { status: 'failed', error: error.message };
  }
}

if (require.main === module) {
  testEndpoints()
    .then(() => testStreamingEndpoint())
    .then(() => {
      console.log('\nAll endpoint tests completed!');
    })
    .catch(error => {
      console.error('Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = { testEndpoints, testStreamingEndpoint };
