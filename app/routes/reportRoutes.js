const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authorizeRoles, protect } = require('../middlewares/authMiddleware');


router.get('/courses-enrollment', protect, authorizeRoles('Admin'), reportController.courseEnrollmentStats);
router.get('/batch/:batchId/performance', protect, authorizeRoles('Admin','Teacher'), reportController.batchPerformance);
router.get('/student/:studentId/performance', protect, reportController.studentPerformance);
router.post('/student/:studentId/email', protect, authorizeRoles('Admin','Teacher'), reportController.sendReportToEmail);

module.exports = router;
