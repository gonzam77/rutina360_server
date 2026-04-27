const { Router } = require('express');
const router = Router();

router.use('/users', require('./user.routes'));
router.use('/rol', require('./rol.routes'));
router.use('/mouscleGroup', require('./mouscleGroup.routes'));
router.use('/ejercice', require('./ejercice.routes'));
router.use('/routine', require('./routine.routes'));
router.use('/note', require('./note.routes'));
router.use('/comment', require('./comment.routes'));
router.use('/coachAthlete', require('./coachAthlete.routes'));
router.use('/routineEjercice', require('./routineEjercice.routes'));


module.exports = router;