import * as Sentry from "@sentry/nextjs";

console.log('[Sentry] Initializing client config...');
console.log('[Sentry] DSN:', process.env.NEXT_PUBLIC_SENTRY_DSN ? 'SET' : 'NOT SET');

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  debug: true, // Enable debug mode
  environment: process.env.NODE_ENV,
});

console.log('[Sentry] Client config initialized successfully');
