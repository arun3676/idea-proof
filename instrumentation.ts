export async function register() {
  console.log('🔍 ENV CHECK (Instrumentation):');
  console.log('SENTRY_DSN:', process.env.SENTRY_DSN);
  console.log('NEXT_PUBLIC_SENTRY_DSN:', process.env.NEXT_PUBLIC_SENTRY_DSN);

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('🔍 Registering Sentry Server Config...');
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    console.log('🔍 Registering Sentry Edge Config...');
    await import('./sentry.client.config');
  }
}
