const router = require('express').Router();

router.use('/documents', require('./document.routes'));
router.use('/documents', require('./revision.routes')); // adds /:documentId/revisions*
router.use('/autosave', require('./autosave.routes'));
router.use('/taxonomy', require('./taxonomy.routes'));

module.exports = router;
