const express = require('express');
const router = express.Router();

const ejerciceController = require('../controllers/ejerciceController');

router.post('/', ejerciceController.createEjercice);
router.get('/', ejerciceController.getEjercices);
router.get('/:id', ejerciceController.getEjerciceById);
router.put('/:id', ejerciceController.updateEjercice);
router.delete('/:id', ejerciceController.deleteEjercice);

module.exports = router;