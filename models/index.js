const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const db = {};

db.sequelize = sequelize;
db.Sequelize = require("sequelize");

//Modelos
db.User = require("../models/user.model")(sequelize, DataTypes);
db.Rol = require("../models/rol.model")(sequelize, DataTypes);  
db.Note = require("../models/note.model")(sequelize, DataTypes);
db.Comment = require("../models/comment.model")(sequelize, DataTypes);
db.Ejercice = require("../models/ejercice.model")(sequelize, DataTypes);
db.MuscleGroup = require("../models/muscleGroup.model")(sequelize, DataTypes);
db.Routine = require("../models/routine.model")(sequelize, DataTypes);
db.RoutineEjercice = require("./routineEjercice.model")(sequelize, DataTypes);
db.RoutineAthlete = require("./routineAthlete.model")(sequelize, DataTypes);
db.CoachAthlete = require("./coachAthlete.model")(sequelize, DataTypes);


//Relaciones de tablas
db.Rol.hasMany(db.User, { foreignKey: 'idRole' });
db.User.belongsTo(db.Rol, { foreignKey: 'idRole' });

db.Comment.belongsTo(db.Note, { foreignKey: 'idNote' });
db.Note.hasMany(db.Comment, { foreignKey: 'idNote' });

db.Note.belongsTo(db.User, { foreignKey: 'idUser' });
db.User.hasMany(db.Note, { foreignKey: 'idUser' });

db.Ejercice.belongsTo(db.MuscleGroup, { foreignKey: 'idMuscleGroup' });
db.MuscleGroup.hasMany(db.Ejercice, { foreignKey: 'idMuscleGroup' });

db.RoutineEjercice.belongsTo(db.Ejercice, { foreignKey: 'idEjercice' });
db.Ejercice.hasMany(db.RoutineEjercice, { foreignKey: 'idEjercice' });

db.RoutineEjercice.belongsTo(db.Routine, { foreignKey: 'idRoutine' });
db.Routine.hasMany(db.RoutineEjercice, { foreignKey: 'idRoutine' });

db.Routine.belongsTo(db.User, { foreignKey: 'idUser', as: 'creator' });
db.User.hasMany(db.Routine, { foreignKey: 'idUser', as: 'createdRoutines' });

db.RoutineAthlete.belongsTo(db.Routine, { foreignKey: 'idRoutine' });
db.Routine.hasMany(db.RoutineAthlete, { foreignKey: 'idRoutine' });

db.RoutineAthlete.belongsTo(db.User, { foreignKey: 'idAthlete', as: 'athlete' });
db.User.hasMany(db.RoutineAthlete, { foreignKey: 'idAthlete', as: 'routineAssignments' });

db.CoachAthlete.belongsTo(db.User, { foreignKey: 'idCoach' });
db.User.hasMany(db.CoachAthlete, { foreignKey: 'idCoach' });

db.CoachAthlete.belongsTo(db.User, { foreignKey: 'idAthlete' });
db.User.hasMany(db.CoachAthlete, { foreignKey: 'idAthlete' });

module.exports = db;

