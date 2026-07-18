const env = require('../config/env');
const { failure } = require('../utils/apiResponse');

/**
 * Centralized error handler. Every thrown/next(err) in the module lands
 * here. Never leaks stack traces or internal details in production.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational === true;

  if (!isOperational) {
    // eslint-disable-next-line no-console
    console.error('[unhandled error]', err);
  }

  return failure(res, {
    statusCode,
    message: isOperational ? err.message : 'Internal server error',
    details: isOperational ? err.details : undefined,
    ...(env.NODE_ENV === 'development' && !isOperational ? { stack: err.stack } : {}),
  });
}

module.exports = errorHandler;
