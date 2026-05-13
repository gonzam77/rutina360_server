const express = require('express');
const router = express.Router();

const ejerciceController = require('../controllers/ejerciceController');
const { authenticateJWT } = require('../middleware/auth.middleware');

router.post('/', authenticateJWT, ejerciceController.createEjercice);
router.get('/', ejerciceController.getEjercices);
router.get('/:id', ejerciceController.getEjerciceById);
router.put('/:id', authenticateJWT, ejerciceController.updateEjercice);
router.delete('/:id', authenticateJWT, ejerciceController.deleteEjercice);

module.exports = router;
