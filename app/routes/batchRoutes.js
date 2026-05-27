const express = require('express');
const { authorizeRoles, protect } = require('../middlewares/authMiddleware');
const batchController = require('../controllers/batchController');
const router = express.Router();

router.get('/get-batches',protect,batchController.listBatches);

router.use( protect,authorizeRoles("Admin","Teacher"));
router.post('/add', batchController.addBatch);
router.put('/update/:id', batchController.updateBatch);

router.use( protect,authorizeRoles("Admin"));
router.post('/assign-students', batchController.assignStudents);
router.delete('/delete/:id', batchController.deleteBatch);

module.exports = router;
