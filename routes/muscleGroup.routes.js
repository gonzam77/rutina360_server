const express = require('express');
const router = express.Router();

const muscleGroupController = require('../controllers/muscleGroupController');

router.post('/', muscleGroupController.createMuscleGroup);
router.get('/', muscleGroupController.getMuscleGroups);
router.get('/:id', muscleGroupController.getMuscleGroupById);
router.put('/:id', muscleGroupController.updateMuscleGroup);
router.delete('/:id', muscleGroupController.deleteMuscleGroup);

module.exports = router;
