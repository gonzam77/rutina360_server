const express = require('express');
const router = express.Router();

const routineController = require('../controllers/routineController');

router.get('/', routineController.getRoutines); //Traer rutina por coach
router.post('/', routineController.createRoutine); //Crear rutinas por coach
router.delete('/:id', routineController.deleteRoutine); //Eliminar rutina
router.post('/assign', routineController.assignRoutine); // Asignar rutina a atleta
router.get('/assign', routineController.getActiveAssignments); // Traer rutinas activas
router.get('/assign/routine/:idRoutine', routineController.getActiveAssignmentsByRoutine); //Traer rutinas por idRutina
router.get('/assign/athlete/:idAthlete', routineController.getActiveAssignmentsByAthlete); //Traer rutinas por Atleta
router.patch('/assign', routineController.unassignRoutine); // Desasignar rutina a atleta

module.exports = router;
