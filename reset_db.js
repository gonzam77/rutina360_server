// reset_db.js
require('dotenv').config(); 
// QUITAMOS las llaves porque db.config exporta la instancia directamente
const sequelize = require('./config/db.config'); 

async function reset() {
  try {
    console.log("Conectando a:", process.env.DATABASE_URL);
    
    // IMPORTANTE: Si usas 'sequelize' a secas, solo se crearán tablas vacías.
    // Para que se creen TUS modelos (User, Exercise, etc.), necesitamos el archivo de modelos.
    const db = require('./models/index'); // O la ruta a tu archivo de modelos
    
    await db.sequelize.sync({ force: true });
    
    console.log("\n✅ Éxito: Las tablas han sido reseteadas en Render.");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error al resetear la base de datos:", error);
    process.exit(1);
  }
}

reset();