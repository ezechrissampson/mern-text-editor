const router = require('express').Router();
const controller = require('../../controllers/document.controller');
const { permit, permitOwnerOr } = require('../../middlewares/permit');
const { handleValidation } = require('../../validators/common.validator');
const {
  createDocumentRules,
  updateDocumentRules,
  idParamRule,
  listQueryRules,
} = require('../../validators/document.validator');
const { EDITOR_PERMISSIONS } = require('../../constants/roles');

router.get('/dashboard', permit(EDITOR_PERMISSIONS.CONTENT_EDIT_OWN, EDITOR_PERMISSIONS.CONTENT_EDIT_ANY), controller.dashboard);
router.get('/search', permit(EDITOR_PERMISSIONS.CONTENT_EDIT_OWN, EDITOR_PERMISSIONS.CONTENT_EDIT_ANY), controller.search);

router.get('/', listQueryRules, handleValidation, permit(EDITOR_PERMISSIONS.CONTENT_EDIT_OWN, EDITOR_PERMISSIONS.CONTENT_EDIT_ANY), controller.list);

router.post(
  '/',
  permit(EDITOR_PERMISSIONS.CONTENT_CREATE),
  createDocumentRules,
  handleValidation,
  controller.create
);

router.get('/:id', idParamRule, handleValidation, permit(EDITOR_PERMISSIONS.CONTENT_EDIT_OWN, EDITOR_PERMISSIONS.CONTENT_EDIT_ANY), controller.getOne);

router.patch(
  '/:id',
  permitOwnerOr(EDITOR_PERMISSIONS.CONTENT_EDIT_ANY),
  updateDocumentRules,
  handleValidation,
  controller.update
);

router.delete('/:id', idParamRule, handleValidation, permit(EDITOR_PERMISSIONS.CONTENT_DELETE), controller.remove);

router.post('/:id/duplicate', idParamRule, handleValidation, permit(EDITOR_PERMISSIONS.CONTENT_CREATE), controller.duplicate);
router.post('/:id/archive', idParamRule, handleValidation, permit(EDITOR_PERMISSIONS.CONTENT_ARCHIVE), controller.archive);
router.post('/:id/restore', idParamRule, handleValidation, permit(EDITOR_PERMISSIONS.CONTENT_EDIT_ANY, EDITOR_PERMISSIONS.CONTENT_EDIT_OWN), controller.restore);

module.exports = router;
