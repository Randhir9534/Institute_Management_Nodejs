const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');
const UserImage = require('../../helper/UserImg');

router.post('/signup',UserImage.single('profilePicture'),AuthController.signup );
router.get('/verify/:token', AuthController.verifyEmail);
router.post('/login', AuthController.login);
router.get('/get/profile', protect, AuthController.getProfile);
router.put('/profile', protect, AuthController.editProfile);
router.use( protect,authorizeRoles("Admin"));
router.get('/list', AuthController.listUsersByRole);

module.exports = router;
