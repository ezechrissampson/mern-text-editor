const { createApp } = require('./app');
const connectDB = require('./config/db');
const env = require('./config/env');

async function bootstrap() {
  await connectDB();
  const app = createApp();
  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`[server] Enterprise Editor Module running on port ${env.PORT} (${env.NODE_ENV})`);
  });
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[bootstrap] Failed to start:', err);
  process.exit(1);
});
