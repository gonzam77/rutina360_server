const path = require('path');
const dotenv = require('dotenv');

// Carga de variables de entorno.
//
// - `npm run dev` / `npm start`: usa .env (como siempre).
// - `npm run dev:local`: usa SOLO .env.local, para probar contra una base local
//   sin tocar .env. Ver .env.local.example.
//
// En modo local se exige que la base sea local: el .env de esta carpeta apunta
// a una base remota, y al arrancar el servidor corre migraciones y carga datos.

const ES_LOCAL = process.argv.includes('--local');
const RAIZ = path.join(__dirname, '..');

if (!global.__rutina360EnvCargado) {
  global.__rutina360EnvCargado = true;

  if (ES_LOCAL) {
    const resultado = dotenv.config({ path: path.join(RAIZ, '.env.local'), quiet: true });
    if (resultado.error) {
      console.error('>> Falta .env.local. Copia .env.local.example a .env.local y completalo.');
      process.exit(1);
    }

    const destino = process.env.DATABASE_URL || process.env.DB_HOST || '';
    let host = destino;
    try {
      host = new URL(destino).hostname;
    } catch (_) {
      // DB_HOST puede ser solo un nombre de host.
    }

    if (!['localhost', '127.0.0.1', '::1'].includes(String(host).toLowerCase())) {
      console.error(`>> Modo local: la base tiene que ser local y apunta a "${host || '(vacio)'}". No se arranca.`);
      process.exit(1);
    }

    console.log('>> Modo local: usando .env.local');
  } else {
    dotenv.config({ path: path.join(RAIZ, '.env') });
  }
}

module.exports = { ES_LOCAL };
