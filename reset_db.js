// reset_db.js en la raíz del proyecto
require('dotenv').config(); // IMPORTANTE: Carga las variables del .env
const { sequelize } = require('./config/db.config'); // Asegúrate de que apunte bien a donde exportas sequelize

async function reset() {
  try {
    console.log("Conectando a:", process.env.DATABASE_URL); // Debug para ver si lee el env
    
    // force: true DROPEA las tablas y las crea según tus modelos actuales
    await sequelize.sync({ force: true });
    
    console.log("\n✅ Éxito: Las tablas han sido reseteadas en Render.");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error al resetear la base de datos:");
    console.error(error);
    process.exit(1);
  }
}

reset();