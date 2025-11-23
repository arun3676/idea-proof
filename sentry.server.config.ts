import * as Sentry from "@sentry/nextjs";

console.log('[Sentry] Initializing server config...');
console.log('[Sentry] DSN:', process.env.SENTRY_DSN ? 'SET' : 'NOT SET');
console.log('[Sentry] Full DSN value:', process.env.SENTRY_DSN);

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  debug: true, // Enable debug mode
  environment: process.env.NODE_ENV,
});

console.log('[Sentry] Server config initialized successfully');
