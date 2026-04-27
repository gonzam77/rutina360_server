const express = require('express');
const router = express.Router();

const mouscleGroupController = require('../controllers/muscularGroupController');

router.post('/', mouscleGroupController.createMuscularGroup);
router.get('/', mouscleGroupController.getMuscularGroups);
router.get('/:id', mouscleGroupController.getMuscularGroupById);
router.put('/:id', mouscleGroupController.updateMuscularGroup);
router.delete('/:id', mouscleGroupController.deleteMuscularGroup);

module.exports = router;