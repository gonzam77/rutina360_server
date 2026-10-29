const crypto = require('crypto');
const { Op } = require('sequelize');
const { SharedRoutine, User } = require('../models');

// Compartir rutinas entre usuarios con un codigo.
//
// Cualquier usuario logueado puede compartir una rutina suya: se guarda una
// copia (snapshot) y se devuelve un codigo corto para mandar por WhatsApp.
// Quien recibe el codigo lo ingresa en la app y se lleva una copia propia.
// No hace falta conocer el email ni el id del otro usuario.

const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sin 0/O ni 1/I
const LARGO_CODIGO = 8;
const DIAS_VIGENCIA = 30;
const MAX_EJERCICIOS = 60;
const MAX_POR_DIA = 30;

function generarCodigo() {
  const bytes = crypto.randomBytes(LARGO_CODIGO);
  let codigo = '';
  for (let i = 0; i < LARGO_CODIGO; i += 1) {
    codigo += ALFABETO[bytes[i] % ALFABETO.length];
  }
  return codigo;
}

// Acepta "abcd-efgh", "ABCD EFGH", etc.
function normalizarCodigo(valor) {
  return String(valor || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function formatearCodigo(codigo) {
  return `${codigo.slice(0, 4)}-${codigo.slice(4)}`;
}

function texto(valor, max) {
  if (valor === undefined || valor === null) return '';
  return String(valor).trim().slice(0, max);
}

function entero(valor, min, max) {
  const numero = Math.round(Number(valor));
  if (!Number.isFinite(numero)) return null;
  return Math.min(max, Math.max(min, numero));
}

// Limpia lo que manda el cliente: solo pasan campos conocidos y con rangos sanos.
function sanitizarEjercicios(lista) {
  if (!Array.isArray(lista)) return null;

  const ejercicios = lista.slice(0, MAX_EJERCICIOS).map((item) => {
    const idEjercice = entero(item?.idEjercice, 1, Number.MAX_SAFE_INTEGER);
    return {
      idEjercice: idEjercice || null,
      name: texto(item?.name, 120),
      category: texto(item?.category, 60),
      series: entero(item?.series, 1, 50),
      restSeconds: entero(item?.restSeconds, 0, 3600) ?? 0,
      executionSeconds: entero(item?.executionSeconds, 1, 600) ?? 40,
      note: texto(item?.note, 500),
    };
  });

  const validos = ejercicios.every((e) => e.name && e.series);
  return validos ? ejercicios : null;
}

module.exports = {
  // POST /routine/share  { name, exercises: [...] }
  async createShare(req, res) {
    try {
      const idOwner = Number(req.authUser?.id);
      if (!idOwner) return res.status(401).json({ message: 'Usuario no autenticado.' });

      const name = texto(req.body?.name, 120);
      const exercises = sanitizarEjercicios(req.body?.exercises);

      if (!name) return res.status(400).json({ message: 'La rutina necesita un nombre.' });
      if (!exercises || exercises.length === 0) {
        return res.status(400).json({ message: 'La rutina tiene que tener al menos un ejercicio valido.' });
      }

      const desde = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const compartidasHoy = await SharedRoutine.count({
        where: { idOwner, createdAt: { [Op.gte]: desde } },
      });
      if (compartidasHoy >= MAX_POR_DIA) {
        return res.status(429).json({ message: 'Llegaste al limite de rutinas compartidas por hoy.' });
      }

      const expiresAt = new Date(Date.now() + DIAS_VIGENCIA * 24 * 60 * 60 * 1000);

      // El codigo es aleatorio; ante una colision (muy improbable) se reintenta.
      for (let intento = 0; intento < 5; intento += 1) {
        const code = generarCodigo();
        const existe = await SharedRoutine.findOne({ where: { code }, attributes: ['id'] });
        if (existe) continue;

        await SharedRoutine.create({ code, idOwner, name, payload: { exercises }, expiresAt });
        return res.status(201).json({
          message: 'Rutina lista para compartir.',
          data: { code: formatearCodigo(code), expiresAt },
        });
      }

      return res.status(500).json({ message: 'No se pudo generar el codigo. Proba de nuevo.' });
    } catch (error) {
      console.error('Error createShare:', error);
      return res.status(500).json({ message: 'Error al compartir la rutina.' });
    }
  },

  // GET /routine/share/:code
  async getShare(req, res) {
    try {
      const code = normalizarCodigo(req.params.code);
      if (code.length !== LARGO_CODIGO) {
        return res.status(400).json({ message: 'El codigo no es valido.' });
      }

      const compartida = await SharedRoutine.findOne({
        where: { code, isDeleted: false, expiresAt: { [Op.gt]: new Date() } },
        include: [{ model: User, as: 'owner', attributes: ['id', 'username'] }],
      });

      if (!compartida) {
        return res.status(404).json({ message: 'No encontramos una rutina con ese codigo, o ya vencio.' });
      }

      await compartida.increment('timesUsed');

      return res.status(200).json({
        data: {
          code: formatearCodigo(compartida.code),
          name: compartida.name,
          exercises: compartida.payload?.exercises || [],
          owner: compartida.owner ? { username: compartida.owner.username } : null,
          isOwn: Number(compartida.idOwner) === Number(req.authUser?.id),
          createdAt: compartida.createdAt,
          expiresAt: compartida.expiresAt,
        },
      });
    } catch (error) {
      console.error('Error getShare:', error);
      return res.status(500).json({ message: 'Error al buscar la rutina compartida.' });
    }
  },

  // DELETE /routine/share/:code  (solo el autor; deja de funcionar el codigo)
  async deleteShare(req, res) {
    try {
      const code = normalizarCodigo(req.params.code);
      const compartida = await SharedRoutine.findOne({ where: { code, isDeleted: false } });

      if (!compartida) return res.status(404).json({ message: 'Codigo no encontrado.' });
      if (Number(compartida.idOwner) !== Number(req.authUser?.id)) {
        return res.status(403).json({ message: 'Solo quien compartio la rutina puede anular el codigo.' });
      }

      await compartida.update({ isDeleted: true });
      return res.status(200).json({ message: 'Codigo anulado.' });
    } catch (error) {
      console.error('Error deleteShare:', error);
      return res.status(500).json({ message: 'Error al anular el codigo.' });
    }
  },
};
