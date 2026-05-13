const db = require('../models');
const bcrypt = require('bcrypt');
const initialRoles = require('../src/seeders/roles');
const initialGroups = require('../src/seeders/muscularGroup');
const initialEjercices = require('../src/seeders/ejercices');

async function alignIdSequence(model) {
  const tableNameMeta = model.getTableName();
  const tableName = typeof tableNameMeta === 'string' ? tableNameMeta : tableNameMeta.tableName;
  const schemaName =
    typeof tableNameMeta === 'string'
      ? null
      : tableNameMeta.schema && tableNameMeta.schema !== 'public'
      ? tableNameMeta.schema
      : null;

  const quoteIdent = (value) => `"${String(value).replace(/"/g, '""')}"`;
  const fullTableName = schemaName ? `${quoteIdent(schemaName)}.${quoteIdent(tableName)}` : quoteIdent(tableName);
  const tableRefForSequence = schemaName
    ? `${quoteIdent(schemaName)}.${quoteIdent(tableName)}`
    : quoteIdent(tableName);

  await db.sequelize.query(`
    SELECT setval(
      pg_get_serial_sequence('${tableRefForSequence}', 'id'),
      COALESCE((SELECT MAX(id) FROM ${fullTableName}), 1),
      (SELECT COUNT(*) > 0 FROM ${fullTableName})
    );
  `);
}

async function ensureSuperAdmin() {
  const superAdminUser = (process.env.SUPERADMIN_USER || 'SUPERADMIN').trim();
  const superAdminEmail = (process.env.SUPERADMIN_EMAIL || 'gonzam77@gmail.com').trim().toLowerCase();
  const superAdminPass = (process.env.SUPERADMIN_PASS || '').trim();

  if (!superAdminUser || !superAdminEmail || !superAdminPass) {
    console.warn('>> SUPERADMIN_USER, SUPERADMIN_EMAIL o SUPERADMIN_PASS no definidos en .env. No se creo superadmin.');
    return;
  }

  const hashedPassword = await bcrypt.hash(superAdminPass, 10);

  const superAdminPayload = {
    id: 1,
    username: superAdminUser,
    email: superAdminEmail,
    dni: null,
    password: hashedPassword,
    idRole: 1,
    idAdminOwner: null,
    birthDate: new Date('1989-04-26'),
    gender: 'Masculino',
    isActive: true,
    isVerified: true,
    isDeleted: false,
  };

  const existingSuperAdmin = await db.User.findOne({ where: { email: superAdminEmail } });

  if (!existingSuperAdmin) {
    await db.User.create(superAdminPayload);
    console.log('>> Superadmin creado correctamente.');
    return;
  }

  await existingSuperAdmin.update({
    ...superAdminPayload,
    email: existingSuperAdmin.email || superAdminEmail,
  });
  console.log('>> Superadmin actualizado correctamente.');
}

const setupDatabase = async () => {
  try {
    await db.Rol.bulkCreate(initialRoles, { ignoreDuplicates: true });
    await db.MuscleGroup.bulkCreate(initialGroups, { ignoreDuplicates: true });
    await db.Ejercice.bulkCreate(initialEjercices, { ignoreDuplicates: true });
    await alignIdSequence(db.Rol);
    await alignIdSequence(db.MuscleGroup);
    await alignIdSequence(db.Ejercice);

    await ensureSuperAdmin();

    console.log('>> Datos iniciales cargados con exito.');
  } catch (error) {
    console.error('>> Error cargando datos iniciales:', error);
  }
};

module.exports = setupDatabase;
