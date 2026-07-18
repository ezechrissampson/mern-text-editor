const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const env = require('../config/env');

/**
 * Bundled security middleware applied at the app level:
 *  - helmet: sensible security headers, CSP-compatible (host app can extend CSP)
 *  - cors: locked to configured client origin
 *  - compression: gzip responses
 *  - mongoSanitize: strips $/. operators from req.body/query/params (NoSQL injection)
 *  - hpp: guards against HTTP Parameter Pollution on query strings
 */
function applySecurity(app) {
  app.use(
    helmet({
      contentSecurityPolicy: false, // host app owns CSP; this module stays compatible with it
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );
  app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
  app.use(compression());
  app.use(mongoSanitize());
  app.use(hpp());
}

module.exports = applySecurity;
