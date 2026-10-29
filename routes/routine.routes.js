const express = require('express');
const router = express.Router();

const routineController = require('../controllers/routineController');
const sharedRoutineController = require('../controllers/sharedRoutineController');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');

// Compartir rutinas por codigo: cualquier usuario logueado (incluye atletas).
router.post('/share', authenticateJWT, sharedRoutineController.createShare);
router.get('/share/:code', authenticateJWT, sharedRoutineController.getShare);
router.delete('/share/:code', authenticateJWT, sharedRoutineController.deleteShare);

router.get('/', authenticateJWT, authorizeRoles(2, 3), routineController.getRoutines); //Traer rutina por coach
router.post('/', authenticateJWT, authorizeRoles(2, 3), routineController.createRoutine); //Crear rutinas por coach
router.put('/:id', authenticateJWT, authorizeRoles(2, 3), routineController.updateRoutine); //Modificar rutina
router.delete('/:id', authenticateJWT, authorizeRoles(2, 3), routineController.deleteRoutine); //Eliminar rutina
router.post('/assign', authenticateJWT, authorizeRoles(2, 3), routineController.assignRoutine); // Asignar rutina a atleta
router.get('/assign', authenticateJWT, authorizeRoles(2, 3), routineController.getActiveAssignments); // Traer rutinas activas
router.get('/assign/routine/:idRoutine', authenticateJWT, authorizeRoles(2, 3), routineController.getActiveAssignmentsByRoutine); //Traer rutinas por idRutina
router.get('/assign/athlete/:idAthlete', authenticateJWT, authorizeRoles(2, 3, 4), routineController.getActiveAssignmentsByAthlete); //Traer rutinas por Atleta
router.patch('/assign', authenticateJWT, authorizeRoles(2, 3), routineController.unassignRoutine); // Desasignar rutina a atleta

module.exports = router;
