// Test script for real API calls (not mocks)
const OpenAI = require('openai');
require('dotenv').config();

async function testRealAPI() {
  console.log('Testing real API connections...\n');
  
  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  
  const tests = [
    {
      name: 'OpenAI Chat Completion',
      test: async () => {
        console.log('Testing OpenAI chat completion...');
        
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "user", content: "Say 'Hello from real API!' in exactly 5 words." }
          ],
          max_tokens: 10,
        });
        
        const response = completion.choices[0].message.content;
        console.log(`✓ OpenAI Response: "${response}"`);
        
        return { 
          status: 'success', 
          response: response,
          usage: completion.usage 
        };
      }
    },
    {
      name: 'OpenAI Models List',
      test: async () => {
        console.log('Testing OpenAI models list...');
        
        const models = await openai.models.list();
        const modelCount = models.data.length;
        
        console.log(`✓ Found ${modelCount} available models`);
        
        return { 
          status: 'success', 
          modelCount: modelCount,
          firstModel: models.data[0]?.id 
        };
      }
    },
    {
      name: 'Streaming Test',
      test: async () => {
        console.log('Testing OpenAI streaming...');
        
        const stream = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "user", content: "Count from 1 to 3, one number per message." }
          ],
          stream: true,
        });
        
        let chunks = [];
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            chunks.push(content);
            process.stdout.write(content);
          }
        }
        
        console.log('\n✓ Streaming completed');
        
        return { 
          status: 'success', 
          chunks: chunks.length,
          content: chunks.join('')
        };
      }
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      console.log(`\n--- ${test.name} ---`);
      const result = await test.test();
      console.log(`✓ ${test.name}: PASSED`);
      passed++;
    } catch (error) {
      console.log(`❌ ${test.name}: FAILED - ${error.message}`);
      failed++;
    }
  }
  
  console.log(`\n=== Real API Test Results ===`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total: ${passed + failed}`);
  
  if (failed > 0) {
    console.log('\nSome API tests failed. Check your API key and connection.');
    process.exit(1);
  } else {
    console.log('\nAll real API tests passed! 🎉');
    console.log('Your OpenAI integration is working correctly.');
  }
}

if (require.main === module) {
  testRealAPI();
}

module.exports = { testRealAPI };
