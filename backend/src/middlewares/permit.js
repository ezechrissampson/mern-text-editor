const AppError = require('../utils/AppError');

/**
 * Thin adapter over the HOST application's existing RBAC.
 * This module does NOT implement authentication or authorization itself -
 * it expects req.user (set by the host app's auth middleware) to expose
 * either req.user.permissions: string[] or req.user.hasPermission(name).
 *
 * Wire-up example (host app):
 *   router.use('/api/v1/editor', hostAuthMiddleware, hostRbacMiddleware, editorRoutes);
 */
function permit(...requiredPermissions) {
  return (req, res, next) => {
    const user = req.user;
    if (!user) return next(AppError.unauthorized('Authentication required'));

    const has = (perm) =>
      typeof user.hasPermission === 'function'
        ? user.hasPermission(perm)
        : Array.isArray(user.permissions) && user.permissions.includes(perm);

    const authorized = requiredPermissions.length === 0 || requiredPermissions.some(has);
    if (!authorized) return next(AppError.forbidden('You do not have permission to perform this action'));

    return next();
  };
}

/** Owner-or-permission check: allows the resource's creator OR someone with the override permission. */
function permitOwnerOr(overridePermission) {
  return (req, res, next) => {
    if (!req.user) return next(AppError.unauthorized('Authentication required'));
    req._editorPermitOwnerOr = overridePermission; // read by controller after fetching the resource
    next();
  };
}

module.exports = { permit, permitOwnerOr };
