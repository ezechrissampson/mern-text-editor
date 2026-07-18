const express = require('express');
const morgan = require('morgan');
const env = require('./config/env');
const applySecurity = require('./middlewares/security');
const { apiLimiter } = require('./middlewares/rateLimiter');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');
const v1Routes = require('./routes/v1');

/**
 * NOTE ON INTEGRATION:
 * This module exports an Express Router (not a full app) intended to be
 * mounted inside an existing MERN application, AFTER the host app's own
 * authentication + RBAC middleware populates req.user. See README.md
 * "Integration Guide" for the exact mount snippet.
 *
 * createApp() below is provided for standalone running/dev/testing only.
 */

function createApp() {
  const app = express();

  applySecurity(app);
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));
  if (env.NODE_ENV !== 'test') app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));

  app.use(env.API_PREFIX, apiLimiter, v1Routes);

  app.get('/health', (req, res) => res.json({ status: 'ok', module: 'enterprise-editor-module' }));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp, editorRouter: v1Routes };
