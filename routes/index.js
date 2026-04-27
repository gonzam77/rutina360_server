const { Router } = require('express');
const router = Router();

routes.use('/users', require('./routes/usuario.routes'));
routes.use('/rol', require('./routes/rol.routes'));
routes.use('/mouscle_group', require('./routes/mouscle_group.routes'));
routes.use('/ejercice', require('./routes/ejercice.routes'));
routes.use('/routine', require('./routes/routine.routes'));
routes.use('/note', require('./routes/note.routes'));
routes.use('/comment', require('./routes/comment.routes'));
routes.use('/coach_athlete', require('./routes/coach_athlete.routes'));
routes.use('/routine_ejercice', require('./routes/routine_ejercice.routes'));
