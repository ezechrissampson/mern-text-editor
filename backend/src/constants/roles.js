/**
 * The host application owns real RBAC. These are the permission *names*
 * this module checks for via req.user.permissions (populated by the
 * host app's existing auth/RBAC middleware). See middlewares/permit.js.
 */
const EDITOR_PERMISSIONS = Object.freeze({
  CONTENT_CREATE: 'content:create',
  CONTENT_EDIT_OWN: 'content:edit:own',
  CONTENT_EDIT_ANY: 'content:edit:any',
  CONTENT_DELETE: 'content:delete',
  CONTENT_PUBLISH: 'content:publish',
  CONTENT_REVIEW: 'content:review',
  CONTENT_ARCHIVE: 'content:archive',
});

module.exports = { EDITOR_PERMISSIONS };
