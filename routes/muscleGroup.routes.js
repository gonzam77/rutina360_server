const express = require('express');
const router = express.Router();

const muscleGroupController = require('../controllers/muscleGroupController');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');

router.post('/', authenticateJWT, authorizeRoles(), muscleGroupController.createMuscleGroup);
router.get('/', muscleGroupController.getMuscleGroups);
router.get('/:id', muscleGroupController.getMuscleGroupById);
router.put('/:id', authenticateJWT, authorizeRoles(), muscleGroupController.updateMuscleGroup);
router.delete('/:id', authenticateJWT, authorizeRoles(), muscleGroupController.deleteMuscleGroup);

module.exports = router;
