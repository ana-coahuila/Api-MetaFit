const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const auth = require('../middleware/auth'); 

router.post('/', auth, progressController.createProgress);
router.get('/', auth, progressController.getAllProgress);
router.get('/latest', auth, progressController.getLatestProgress);
router.put('/:id', auth, progressController.updateProgress);
router.delete('/:id', auth, progressController.deleteProgress);

module.exports = router;