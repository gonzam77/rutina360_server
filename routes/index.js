const { Router } = require('express');
const router = Router();

router.use('/users', require('./user.routes'));
router.use('/rol', require('./rol.routes'));
router.use('/mouscleGroup', require('./mouscleGroup.routes'));
router.use('/ejercice', require('./ejercice.routes'));
router.use('/routine', require('./routine.routes'));
router.use('/note', require('./note.routes'));


module.exports = router;
