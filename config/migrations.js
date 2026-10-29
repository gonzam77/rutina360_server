const db = require('../models');

// Migraciones idempotentes.
//
// sequelize.sync({ force: false }) crea las tablas que faltan pero NUNCA agrega
// columnas a una tabla existente. Cada cambio de esquema sobre una tabla que ya
// esta en produccion va aca: se fija si la columna existe y solo la agrega si
// falta, asi se puede correr en cada arranque sin riesgo.

async function agregarColumnaSiFalta(model, columna, definicion) {
  const qi = db.sequelize.getQueryInterface();
  const tabla = model.getTableName();
  const descripcion = await qi.describeTable(tabla);

  if (descripcion[columna]) {
    return false;
  }

  await qi.addColumn(tabla, columna, definicion);
  console.log(`>> Migracion: columna ${columna} agregada.`);
  return true;
}

const runMigrations = async () => {
  // 2026-10: descanso en segundos (antes solo minutos enteros).
  const agregada = await agregarColumnaSiFalta(db.RoutineEjercice, 'restSeconds', {
    type: db.Sequelize.INTEGER,
    allowNull: true,
  });

  // Backfill: toda fila sin segundos toma los minutos que ya tenia. Se corre
  // siempre (no solo al crear la columna) por si un cliente viejo inserto
  // filas por un camino que no paso por los hooks del modelo.
  const tabla = db.RoutineEjercice.getTableName();
  const tablaSql = db.sequelize.getQueryInterface().queryGenerator.quoteTable(tabla);
  const [, resultado] = await db.sequelize.query(
    `UPDATE ${tablaSql} SET "restSeconds" = "rest" * 60 WHERE "restSeconds" IS NULL`
  );
  const filas = resultado?.rowCount ?? 0;
  if (agregada || filas > 0) {
    console.log(`>> Migracion: restSeconds completado en ${filas} filas.`);
  }
};

module.exports = runMigrations;
