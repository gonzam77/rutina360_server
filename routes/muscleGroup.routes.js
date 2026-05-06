const express = require('express');
const router = express.Router();

const muscleGroupController = require('../controllers/muscleGroupController');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');

router.post('/', authenticateJWT, authorizeRoles(), muscleGroupController.createMuscleGroup);
router.get('/', authenticateJWT, authorizeRoles(2, 3), muscleGroupController.getMuscleGroups);
router.get('/:id', authenticateJWT, authorizeRoles(2, 3), muscleGroupController.getMuscleGroupById);
router.put('/:id', authenticateJWT, authorizeRoles(), muscleGroupController.updateMuscleGroup);
router.delete('/:id', authenticateJWT, authorizeRoles(), muscleGroupController.deleteMuscleGroup);

module.exports = router;
