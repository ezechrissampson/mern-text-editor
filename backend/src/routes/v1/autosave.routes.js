const router = require('express').Router();
const controller = require('../../controllers/autosave.controller');
const { permit } = require('../../middlewares/permit');
const { autosaveLimiter } = require('../../middlewares/rateLimiter');
const { handleValidation } = require('../../validators/common.validator');
const { autosaveRules } = require('../../validators/autosave.validator');
const { EDITOR_PERMISSIONS } = require('../../constants/roles');

const requirePerm = permit(EDITOR_PERMISSIONS.CONTENT_EDIT_OWN, EDITOR_PERMISSIONS.CONTENT_EDIT_ANY);

router.put('/:documentId', autosaveLimiter, requirePerm, autosaveRules, handleValidation, controller.save);
router.get('/:documentId', requirePerm, controller.get);
router.delete('/:documentId', requirePerm, controller.clear);

module.exports = router;
