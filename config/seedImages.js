const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const db = require('../models');

// Carga en la base las ilustraciones generadas (tools/ilustraciones) que estan
// en src/seeders/imagenes. Es idempotente: compara el hash y solo escribe las
// que faltan o cambiaron. Nunca pisa una imagen cargada a mano (source 'upload').

const CARPETA = path.join(__dirname, '..', 'src', 'seeders', 'imagenes');

function leerCarpeta(subcarpeta) {
  const dir = path.join(CARPETA, subcarpeta);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((archivo) => /^\d+\.png$/i.test(archivo))
    .map((archivo) => {
      const data = fs.readFileSync(path.join(dir, archivo));
      return {
        id: Number(archivo.replace(/\.png$/i, '')),
        data,
        hash: crypto.createHash('sha1').update(data).digest('hex'),
      };
    });
}

async function sincronizar(archivos, campo, idsValidos) {
  let escritas = 0;
  for (const archivo of archivos) {
    if (!idsValidos.has(archivo.id)) continue;

    const existente = await db.ExerciseImage.findOne({ where: { [campo]: archivo.id } });
    if (existente && (existente.source !== 'seed' || existente.hash === archivo.hash)) continue;

    if (existente) {
      await existente.update({ data: archivo.data, hash: archivo.hash, mime: 'image/png' });
    } else {
      await db.ExerciseImage.create({
        [campo]: archivo.id,
        data: archivo.data,
        hash: archivo.hash,
        mime: 'image/png',
        source: 'seed',
      });
    }
    escritas += 1;
  }
  return escritas;
}

const seedImages = async () => {
  try {
    const ejercicios = await db.Ejercice.findAll({ attributes: ['id'] });
    const grupos = await db.MuscleGroup.findAll({ attributes: ['id'] });

    const deEjercicios = await sincronizar(
      leerCarpeta('ejercicios'),
      'idEjercice',
      new Set(ejercicios.map((e) => Number(e.id)))
    );
    const deGrupos = await sincronizar(
      leerCarpeta('grupos'),
      'idMuscleGroup',
      new Set(grupos.map((g) => Number(g.id)))
    );

    if (deEjercicios || deGrupos) {
      console.log(`>> Imagenes actualizadas: ${deEjercicios} de ejercicios, ${deGrupos} de grupos.`);
    }
  } catch (error) {
    // Las imagenes son un extra: si fallan, la API tiene que levantar igual.
    console.error('>> Error cargando imagenes de ejercicios:', error);
  }
};

module.exports = seedImages;
