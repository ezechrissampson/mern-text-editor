/**
 * Wraps async route handlers/controllers so rejected promises are
 * forwarded to the centralized error handler instead of crashing
 * the process or requiring try/catch boilerplate everywhere.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
