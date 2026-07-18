const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

/**
 * Runs after express-validator's chain of checks; converts failures
 * into a single structured AppError handled by the centralized
 * error middleware (never leaks raw express-validator internals).
 */
function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    return next(AppError.badRequest('Validation failed', details));
  }
  return next();
}

module.exports = { handleValidation };
