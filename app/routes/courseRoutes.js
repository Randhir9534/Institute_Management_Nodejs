const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authorizeRoles, protect } = require('../middlewares/authMiddleware');

router.get('/list',protect, courseController.listCourses);

router.use( protect,authorizeRoles("Admin"));

router.post('/add', courseController.addCourse );
router.put('/edit/:id', courseController.editCourse);
router.delete('/delete/:id', courseController.deleteCourse);

module.exports = router;
