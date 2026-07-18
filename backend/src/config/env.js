/**
 * Centralized, validated environment configuration.
 * Fails fast on boot if required variables are missing/invalid.
 */
require('dotenv').config();

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`[env] Missing required environment variable: ${name}`);
  }
  return value;
}

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5001', 10),
  API_PREFIX: process.env.API_PREFIX || '/api/v1',

  MONGO_URI: required('MONGO_URI'),

  REDIS_ENABLED: process.env.REDIS_ENABLED === 'true',
  REDIS_URL: process.env.REDIS_URL || 'redis://127.0.0.1:6379',

  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:5173',

  AUTOSAVE_INTERVAL_MS: parseInt(process.env.AUTOSAVE_INTERVAL_MS || '15000', 10),
  AUTOSAVE_TTL_SECONDS: parseInt(process.env.AUTOSAVE_TTL_SECONDS || '86400', 10),

  ALLOWED_IFRAME_HOSTS: (process.env.ALLOWED_IFRAME_HOSTS || '')
    .split(',')
    .map((h) => h.trim())
    .filter(Boolean),

  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '120', 10),
};

module.exports = env;
