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
db.Muscle_Group = require("../models/muscle_group.model")(sequelize, DataTypes);
db.Routine = require("../models/routine.model")(sequelize, DataTypes);
db.Routine_Ejercice = require("../models/routine_ejercice.model")(sequelize, DataTypes);
db.Coach_Athlete = require("../models/coach_athlete.model")(sequelize, DataTypes);

module.exports = db;

