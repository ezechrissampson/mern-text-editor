const { createClient } = require('redis');
const env = require('./env');

let client = null;

/**
 * Redis is optional. If disabled or unreachable, callers must fall back
 * to MongoDB-backed autosave (see autosave.service.js).
 */
async function getRedisClient() {
  if (!env.REDIS_ENABLED) return null;
  if (client && client.isOpen) return client;

  client = createClient({ url: env.REDIS_URL });
  client.on('error', (err) => {
    // eslint-disable-next-line no-console
    console.error('[redis] connection error, falling back to Mongo autosave:', err.message);
  });

  try {
    await client.connect();
    // eslint-disable-next-line no-console
    console.log('[redis] connected');
    return client;
  } catch (err) {
    client = null;
    return null;
  }
}

module.exports = { getRedisClient };
