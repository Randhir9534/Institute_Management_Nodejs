const express = require('express');
const { authorizeRoles, protect } = require('../middlewares/authMiddleware');
const examController = require('../controllers/examController');
const router = express.Router();

router.get('/result',protect, examController.fetchResults);

router.use( protect,authorizeRoles('Admin','Teacher'))
router.post('/create',examController.createExam);

router.use( protect,authorizeRoles('Teacher'))
router.put('/marks',examController.assignMarks);
router.put('/update/:id', examController.updateExam);

module.exports = router;
