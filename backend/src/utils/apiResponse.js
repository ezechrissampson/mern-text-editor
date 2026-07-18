/**
 * Consistent JSON response envelope for the entire module's API surface.
 */
function success(res, { statusCode = 200, message = 'OK', data = null, meta = undefined }) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(meta ? { meta } : {}),
  });
}

function failure(res, { statusCode = 500, message = 'Something went wrong', details = undefined }) {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { details } : {}),
  });
}

module.exports = { success, failure };
