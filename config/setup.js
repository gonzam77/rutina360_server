const db = require("../models"); // Donde exportas db.User, db.Rol, etc.
const initialRoles = require("../src/seeders/roles");
const initialGroups = require("../src/seeders/muscularGroup");
const initialEjercices = require("../src/seeders/ejercices");

const setupDatabase = async () => {
  try {
    // Insertar Roles
    await db.Rol.bulkCreate(initialRoles, { ignoreDuplicates: true });
    
    // Insertar Grupos Musculares
    await db.MuscleGroup.bulkCreate(initialGroups, { ignoreDuplicates: true });
    
    // Insertar Ejercicios (Relacionados)
    await db.Ejercice.bulkCreate(initialEjercices, { ignoreDuplicates: true });
    
    // Aquí puedes buscar el ID del grupo e insertar los ejercicios correspondientes
    console.log(">> Datos iniciales cargados con éxito.");

  } catch (error) {
    console.error(">> Error cargando datos iniciales:", error);
  }
};

module.exports = setupDatabase;