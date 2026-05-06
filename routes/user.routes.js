const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const { authenticateJWT } = require('../middleware/auth.middleware');

router.post('/', authenticateJWT, userController.createUser);
router.post('/auth', userController.getAuthUser);
router.get('/me', authenticateJWT, userController.getCurrentUser);
router.post('/link', authenticateJWT, userController.linkAthleteToCoach);
router.get('/link', authenticateJWT, userController.getCoachAthletes);
router.delete('/link', authenticateJWT, userController.unlinkAthleteFromCoach);
router.get('/', authenticateJWT, userController.getUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser); 
router.delete('/eliminar/:id', userController.permanentlyDeleteUser); 

module.exports = router;
