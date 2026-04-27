const { Router } = require('express');
const router = Router();

routes.use('/users', require('./routes/usuario.routes'));
routes.use('/rol', require('./routes/rol.routes'));
routes.use('/mouscleGroup', require('./routes/mouscleGroup.routes'));
routes.use('/ejercice', require('./routes/ejercice.routes'));
routes.use('/routine', require('./routes/routine.routes'));
routes.use('/note', require('./routes/note.routes'));
routes.use('/comment', require('./routes/comment.routes'));
routes.use('/coachAthlete', require('./routes/coachAthlete.routes'));
routes.use('/routineEjercice', require('./routes/routineEjercice.routes'));
