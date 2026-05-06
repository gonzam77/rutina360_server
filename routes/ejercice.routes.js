const express = require('express');
const router = express.Router();

const ejerciceController = require('../controllers/ejerciceController');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');

router.post('/', authenticateJWT, authorizeRoles(), ejerciceController.createEjercice);
router.get('/', ejerciceController.getEjercices);
router.get('/:id', ejerciceController.getEjerciceById);
router.put('/:id', authenticateJWT, authorizeRoles(), ejerciceController.updateEjercice);
router.delete('/:id', authenticateJWT, authorizeRoles(), ejerciceController.deleteEjercice);

module.exports = router;
