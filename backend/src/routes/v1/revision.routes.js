const router = require('express').Router();
const controller = require('../../controllers/revision.controller');
const { permit } = require('../../middlewares/permit');
const { EDITOR_PERMISSIONS } = require('../../constants/roles');

router.get('/:documentId/revisions', permit(EDITOR_PERMISSIONS.CONTENT_EDIT_OWN, EDITOR_PERMISSIONS.CONTENT_EDIT_ANY), controller.list);
router.get('/:documentId/revisions/compare', permit(EDITOR_PERMISSIONS.CONTENT_EDIT_OWN, EDITOR_PERMISSIONS.CONTENT_EDIT_ANY), controller.compare);
router.post('/:documentId/revisions/:revisionNumber/restore', permit(EDITOR_PERMISSIONS.CONTENT_EDIT_ANY, EDITOR_PERMISSIONS.CONTENT_EDIT_OWN), controller.restore);

module.exports = router;
