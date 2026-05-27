const express = require('express');
const router = express.Router();
const { authorizeRoles, protect } = require('../middlewares/authMiddleware');
const enrollmentController = require('../controllers/enrollmentController');

router.use( protect,authorizeRoles("Student"));
router.post('/enroll', enrollmentController.enrollStudent);

module.exports = router;

