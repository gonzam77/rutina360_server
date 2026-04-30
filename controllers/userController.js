const { User, Rol, CoachAthlete } = require('../models');

function getErrorStatus(error) {
  const sequelizeErrorNames = [
    'SequelizeValidationError',
    'SequelizeUniqueConstraintError',
    'SequelizeForeignKeyConstraintError',
  ];
  return sequelizeErrorNames.includes(error?.name) ? 400 : 500;
}

function getErrorMessage(error) {
  if (Array.isArray(error?.errors) && error.errors.length > 0) {
    return error.errors.map((e) => e.message).join(', ');
  }
  if (error?.message) {
    return error.message;
  }
  return 'Error interno.';
}

function toNullableString(value) {
  if (value === undefined || value === null) return null;
  const normalized = String(value).trim();
  return normalized === '' ? null : normalized;
}

function toNullableFloat(value) {
  if (value === undefined || value === null || value === '') return null;
  const normalized = String(value).replace(',', '.').trim();
  const parsed = Number.parseFloat(normalized);
  return Number.isNaN(parsed) ? null : parsed;
}

function normalizeUserPayload(payload = {}) {
  const normalized = { ...payload };

  if (Object.prototype.hasOwnProperty.call(payload, 'phone')) {
    normalized.phone = toNullableString(payload.phone);
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'address')) {
    normalized.address = toNullableString(payload.address);
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'goal')) {
    normalized.goal = toNullableString(payload.goal);
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'weeklyAvailability')) {
    normalized.weeklyAvailability = toNullableString(payload.weeklyAvailability);
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'height')) {
    normalized.height = toNullableFloat(payload.height);
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'weight')) {
    normalized.weight = toNullableFloat(payload.weight);
  }

  return normalized;
}

module.exports = {
  async getUsers(req, res) {
    try {
      const users = await User.findAll({
        attributes: { exclude: ['password'] },
        include: [{ model: Rol, attributes: ['id', 'name'] }],
      });

      return res.status(200).json({ data: users });
    } catch (error) {
      console.error('Error getUsers:', error);
      return res.status(getErrorStatus(error)).json({ message: getErrorMessage(error) });
    }
  },

  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id, {
        attributes: { exclude: ['password'] },
        include: [{ model: Rol, attributes: ['id', 'name'] }],
      });

      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado.' });
      }

      return res.status(200).json({ data: user });
    } catch (error) {
      console.error('Error getUserById:', error);
      return res.status(getErrorStatus(error)).json({ message: getErrorMessage(error) });
    }
  },

  async createUser(req, res) {
    try {
      const normalizedPayload = normalizeUserPayload(req.body);
      const user = await User.create(normalizedPayload);
      const createdUser = await User.findByPk(user.id, { attributes: { exclude: ['password'] } });
      return res.status(201).json({ data: createdUser });
    } catch (error) {
      console.error('Error createUser:', error);
      return res.status(getErrorStatus(error)).json({ message: getErrorMessage(error) });
    }
  },

  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);
      if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });
      const normalizedPayload = normalizeUserPayload(req.body);
      await user.update(normalizedPayload);
      const updatedUser = await User.findByPk(id, { attributes: { exclude: ['password'] } });
      return res.status(200).json({ data: updatedUser });
    } catch (error) {
      return res.status(getErrorStatus(error)).json({ message: getErrorMessage(error) });
    }
  },

  async getCoachAthletes(req, res) {
    try {
      const { idCoach, idAthlete } = req.query;
      const where = {};
      if (idCoach) where.idCoach = idCoach;
      if (idAthlete) where.idAthlete = idAthlete;

      const relations = await CoachAthlete.findAll({
        where,
        include: [
          { model: User, as: 'coach', attributes: { exclude: ['password'] } },
          { model: User, as: 'athlete', attributes: { exclude: ['password'] } },
        ],
      });

      return res.status(200).json({ data: relations });
    } catch (error) {
      console.error('Error getCoachAthletes:', error);
      return res.status(getErrorStatus(error)).json({ message: getErrorMessage(error) });
    }
  },

  async linkAthleteToCoach(req, res) {
    try {
      const { idCoach, idAthlete } = req.body;
      const relation = await CoachAthlete.create({ idCoach, idAthlete });
      return res.status(201).json({ message: 'Atleta vinculado con éxito.', data: relation });
    } catch (error) {
      console.error('Error linkAthleteToCoach:', error);
      return res.status(getErrorStatus(error)).json({ message: getErrorMessage(error) });
    }
  },

  async unlinkAthleteFromCoach(req, res) {
    try {
      const { idCoach, idAthlete } = req.body;
      await CoachAthlete.destroy({ where: { idCoach, idAthlete } });
      return res.status(200).json({ message: 'Vínculo eliminado.' });
    } catch (error) {
      return res.status(500).json({ message: 'Error al desvincular.' });
    }
  },

  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findOne({
        where: {
          id: id,
          isDeleted: false
        }
      });

      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado.' });
        
      }
      await user.update({ isDeleted: true });
      await user.update({ isActive: false });
      // await user.destroy();
      return res.status(200).json({ message: 'Usuario eliminado.' });
    } catch (error) {
      return res.status(getErrorStatus(error)).json({ message: getErrorMessage(error) });
    }
  }
};
