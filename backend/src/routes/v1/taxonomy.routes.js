const router = require('express').Router();
const { categories, tags } = require('../../controllers/taxonomy.controller');
const { permit } = require('../../middlewares/permit');
const { EDITOR_PERMISSIONS } = require('../../constants/roles');

const canWrite = permit(EDITOR_PERMISSIONS.CONTENT_CREATE, EDITOR_PERMISSIONS.CONTENT_EDIT_ANY);
const canRead = permit(EDITOR_PERMISSIONS.CONTENT_EDIT_OWN, EDITOR_PERMISSIONS.CONTENT_EDIT_ANY);

router.get('/categories', canRead, categories.list);
router.post('/categories', canWrite, categories.create);
router.patch('/categories/:id', canWrite, categories.update);
router.delete('/categories/:id', canWrite, categories.remove);

router.get('/tags', canRead, tags.list);
router.post('/tags', canWrite, tags.create);
router.patch('/tags/:id', canWrite, tags.update);
router.delete('/tags/:id', canWrite, tags.remove);

module.exports = router;
