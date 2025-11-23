// TypeScript test file for API functionality
import { NextRequest, NextResponse } from 'next/server';
import { analyzeCompetition } from './lib/analysis';

interface TestResult {
  name: string;
  status: 'passed' | 'failed';
  message: string;
  duration?: number;
}

async function runAPITests(): Promise<TestResult[]> {
  const tests: TestResult[] = [];
  
  // Test 1: Basic AGI analysis
  try {
    const startTime = Date.now();
    const result = await analyzeCompetition([], [], 'test query');
    const duration = Date.now() - startTime;
    
    tests.push({
      name: 'AGI Analysis',
      status: 'passed',
      message: `Analysis completed in ${duration}ms`,
      duration
    });
  } catch (error) {
    tests.push({
      name: 'AGI Analysis',
      status: 'failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
  
  // Test 2: Environment configuration
  try {
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }
    
    tests.push({
      name: 'Environment Config',
      status: 'passed',
      message: 'Environment variables properly configured'
    });
  } catch (error) {
    tests.push({
      name: 'Environment Config',
      status: 'failed',
      message: error instanceof Error ? error.message : 'Configuration error'
    });
  }
  
  // Test 3: Module imports
  try {
    const agiCache = await import('./lib/agi-cache');
    const agiSearch = await import('./lib/agi-search');
    
    tests.push({
      name: 'Module Imports',
      status: 'passed',
      message: 'All required modules imported successfully'
    });
  } catch (error) {
    tests.push({
      name: 'Module Imports',
      status: 'failed',
      message: error instanceof Error ? error.message : 'Import error'
    });
  }
  
  return tests;
}

// Test API endpoint
export async function GET() {
  try {
    const results = await runAPITests();
    
    const passed = results.filter(r => r.status === 'passed').length;
    const failed = results.filter(r => r.status === 'failed').length;
    
    return NextResponse.json({
      status: failed === 0 ? 'success' : 'partial',
      summary: {
        passed,
        failed,
        total: results.length
      },
      results
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Test API endpoint with POST
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testType } = body;
    
    if (testType === 'real-api') {
      // Test with real API call
      const result = await analyzeCompetition([], [], 'Real API test query');
      return NextResponse.json({
        status: 'success',
        message: 'Real API test completed',
        result
      });
    }
    
    return NextResponse.json({
      status: 'error',
      message: 'Unknown test type'
    }, { status: 400 });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Test failed'
    }, { status: 500 });
  }
}

if (require.main === module) {
  runAPITests().then(results => {
    console.log('Test Results:');
    results.forEach(result => {
      console.log(`${result.status === 'passed' ? '✓' : '❌'} ${result.name}: ${result.message}`);
    });
  });
}
