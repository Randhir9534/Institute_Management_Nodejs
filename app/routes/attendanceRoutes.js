const express = require('express');
const { authorizeRoles, protect } = require('../middlewares/authMiddleware');
const router = express.Router();
const  AttendanceController= require('../controllers/attendanceController')


router.get('/view', protect, AttendanceController.viewAttendance);
router.use(protect,authorizeRoles("Teacher"))
router.post('/mark',AttendanceController.markAttendance);

module.exports = router;
