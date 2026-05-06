const db = require('../models');
const bcrypt = require('bcrypt');
const initialRoles = require('../src/seeders/roles');
const initialGroups = require('../src/seeders/muscularGroup');
const initialEjercices = require('../src/seeders/ejercices');

async function ensureSuperAdmin() {
  const superAdminUser = (process.env.SUPERADMIN_USER || '').trim();
  const superAdminPass = (process.env.SUPERADMIN_PASS || '').trim();

  if (!superAdminUser || !superAdminPass) {
    console.warn('>> SUPERADMIN_USER o SUPERADMIN_PASS no definidos en .env. No se creo superadmin.');
    return;
  }

  const hashedPassword = await bcrypt.hash(superAdminPass, 10);
  const defaultEmail = 'gonzam77@gmail.com';

  const superAdminPayload = {
    username: superAdminUser,
    email: defaultEmail,
    password: hashedPassword,
    idRole: 1,
    idAdminOwner: null,
    birthDate: new Date('1990-01-01'),
    gender: 'No especificado',
    isActive: true,
    isVerified: true,
    isDeleted: false,
  };

  const existingSuperAdmin = await db.User.findOne({ where: { username: superAdminUser } });

  if (!existingSuperAdmin) {
    await db.User.create(superAdminPayload);
    console.log('>> Superadmin creado correctamente.');
    return;
  }

  await existingSuperAdmin.update({
    ...superAdminPayload,
    email: existingSuperAdmin.email || defaultEmail,
  });
  console.log('>> Superadmin actualizado correctamente.');
}

const setupDatabase = async () => {
  try {
    await db.Rol.bulkCreate(initialRoles, { ignoreDuplicates: true });
    await db.MuscleGroup.bulkCreate(initialGroups, { ignoreDuplicates: true });
    await db.Ejercice.bulkCreate(initialEjercices, { ignoreDuplicates: true });

    await ensureSuperAdmin();

    console.log('>> Datos iniciales cargados con exito.');
  } catch (error) {
    console.error('>> Error cargando datos iniciales:', error);
  }
};

module.exports = setupDatabase;
