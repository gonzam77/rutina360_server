const { Ejercice, ExerciseImage } = require('../models');

// Sirve las ilustraciones de ejercicios y grupos musculares.
//
// Son publicas (igual que el listado de ejercicios) para que la app y el
// dashboard las puedan usar directo en un <Image>/<img> sin mandar el token.
// Cache larga + ETag: la app las pide muchas veces y casi nunca cambian.

const CACHE = 'public, max-age=604800, stale-while-revalidate=86400';

function enviarImagen(req, res, imagen) {
  const etag = `"${imagen.hash}"`;
  res.set('ETag', etag);
  res.set('Cache-Control', CACHE);

  if (req.headers['if-none-match'] === etag) {
    return res.status(304).end();
  }

  res.type(imagen.mime || 'image/png');
  return res.send(imagen.data);
}

function idValido(valor) {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

module.exports = {
  // GET /ejercice/:id/image  -> imagen del ejercicio o, si no tiene, la de su grupo.
  async getEjerciceImage(req, res) {
    try {
      const id = idValido(req.params.id);
      if (!id) return res.status(400).json({ message: 'Id invalido.' });

      let imagen = await ExerciseImage.unscoped().findOne({ where: { idEjercice: id } });

      if (!imagen) {
        const ejercicio = await Ejercice.findByPk(id, { attributes: ['id', 'idMuscleGroup'] });
        if (!ejercicio) return res.status(404).json({ message: 'Ejercicio no encontrado.' });

        imagen = await ExerciseImage.unscoped().findOne({
          where: { idMuscleGroup: ejercicio.idMuscleGroup },
        });
      }

      if (!imagen) return res.status(404).json({ message: 'El ejercicio no tiene imagen.' });
      return enviarImagen(req, res, imagen);
    } catch (error) {
      console.error('Error getEjerciceImage:', error);
      return res.status(500).json({ message: 'Error al obtener la imagen.' });
    }
  },

  // GET /muscleGroup/:id/image
  async getMuscleGroupImage(req, res) {
    try {
      const id = idValido(req.params.id);
      if (!id) return res.status(400).json({ message: 'Id invalido.' });

      const imagen = await ExerciseImage.unscoped().findOne({ where: { idMuscleGroup: id } });
      if (!imagen) return res.status(404).json({ message: 'El grupo no tiene imagen.' });
      return enviarImagen(req, res, imagen);
    } catch (error) {
      console.error('Error getMuscleGroupImage:', error);
      return res.status(500).json({ message: 'Error al obtener la imagen.' });
    }
  },
};
