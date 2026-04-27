const { Router } = require('express');
const router = Router();

routes.use('/users', require('./user.routes'));
routes.use('/rol', require('./rol.routes'));
routes.use('/mouscleGroup', require('./mouscleGroup.routes'));
routes.use('/ejercice', require('./ejercice.routes'));
routes.use('/routine', require('./routine.routes'));
routes.use('/note', require('./note.routes'));
routes.use('/comment', require('./comment.routes'));
routes.use('/coachAthlete', require('./coachAthlete.routes'));
routes.use('/routineEjercice', require('./routineEjercice.routes'));
