const express = require('express');
const router = express.Router();

const routineController = require('../controllers/routineController');

router.post('/', routineController.createRoutine);
router.post('/assign', routineController.assignRoutine);
router.get('/assign', routineController.getActiveAssignments);
router.get('/assign/routine/:idRoutine', routineController.getActiveAssignmentsByRoutine);
router.get('/assign/athlete/:idAthlete', routineController.getActiveAssignmentsByAthlete);
router.patch('/assign', routineController.unassignRoutine);

module.exports = router;
