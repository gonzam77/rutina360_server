const express = require('express');
const router = express.Router();

const RoutineEjerciceController = require('../controllers/routineEjerciceController');

router.post('/', RoutineEjerciceController.createRoutineEjercice);
router.get('/', RoutineEjerciceController.getRoutineEjercices);
router.get('/:id', RoutineEjerciceController.getRoutineEjerciceById);
router.put('/:id', RoutineEjerciceController.updateRoutineEjercice);
router.delete('/:id', RoutineEjerciceController.deleteRoutineEjercice);

module.exports = router;