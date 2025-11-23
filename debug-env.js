// Debug script to check environment variables and configuration
require('dotenv').config();

function debugEnvironment() {
  console.log('=== Environment Debug Information ===\n');
  
  // Check required environment variables
  const requiredVars = [
    'OPENAI_API_KEY',
    'NEXT_PUBLIC_APP_URL',
    'NODE_ENV'
  ];
  
  console.log('Required Environment Variables:');
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    const status = value ? '✓' : '❌';
    const displayValue = value ? `${value.substring(0, 10)}...` : 'MISSING';
    console.log(`  ${status} ${varName}: ${displayValue}`);
  });
  
  console.log('\nOptional Environment Variables:');
  const optionalVars = [
    'SENTRY_DSN',
    'NEXT_PUBLIC_SENTRY_DSN',
    'VERCEL_URL'
  ];
  
  optionalVars.forEach(varName => {
    const value = process.env[varName];
    const status = value ? '✓' : '-';
    const displayValue = value ? `${value.substring(0, 10)}...` : 'not set';
    console.log(`  ${status} ${varName}: ${displayValue}`);
  });
  
  console.log('\n=== System Information ===');
  console.log(`Node.js version: ${process.version}`);
  console.log(`Platform: ${process.platform}`);
  console.log(`Architecture: ${process.arch}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  console.log('\n=== Build Information ===');
  try {
    const nextConfig = require('./next.config.js');
    console.log('Next.js config loaded successfully');
    console.log(`Environment variable exposure: ${nextConfig.env ? 'configured' : 'not configured'}`);
  } catch (error) {
    console.log('❌ Next.js config not found or invalid');
  }
  
  console.log('\n=== Package Dependencies ===');
  try {
    const packageJson = require('./package.json');
    console.log(`Project: ${packageJson.name} v${packageJson.version}`);
    console.log(`Next.js: ${packageJson.dependencies.next}`);
    console.log(`React: ${packageJson.dependencies.react}`);
    console.log(`OpenAI: ${packageJson.dependencies.openai}`);
    console.log(`Sentry: ${packageJson.dependencies['@sentry/nextjs']}`);
  } catch (error) {
    console.log('❌ Package.json not found or invalid');
  }
}

function checkFileStructure() {
  console.log('\n=== File Structure Check ===');
  
  const fs = require('fs');
  const path = require('path');
  
  const requiredFiles = [
    'package.json',
    'next.config.js',
    'tailwind.config.ts',
    'app/layout.tsx',
    'app/page.tsx',
    'lib/agi-cache.ts',
    'lib/analysis.ts'
  ];
  
  requiredFiles.forEach(file => {
    const exists = fs.existsSync(path.join(__dirname, file));
    const status = exists ? '✓' : '❌';
    console.log(`  ${status} ${file}`);
  });
}

if (require.main === module) {
  debugEnvironment();
  checkFileStructure();
}

module.exports = { debugEnvironment, checkFileStructure };
