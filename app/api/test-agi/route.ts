import { NextRequest, NextResponse } from 'next/server';
import { testAGIConnection } from '@/lib/agi-search';

export async function GET(request: NextRequest) {
  try {
    const isConnected = await testAGIConnection();
    
    if (isConnected) {
      return NextResponse.json({ 
        status: 'success',
        message: 'AGI API is connected and working',
        connected: true 
      });
    } else {
      return NextResponse.json({ 
        status: 'error',
        message: 'AGI API connection failed',
        connected: false 
      });
    }
  } catch (error) {
    return NextResponse.json({ 
      status: 'error',
      message: 'Test failed with error',
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
