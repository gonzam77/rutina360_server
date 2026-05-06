const { User, Rol, CoachAthlete } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';
const ROLE_SUPER_ADMIN = 1;
const ROLE_ADMIN = 2;
const ROLE_COACH = 3;
const ROLE_ATHLETE = 4;

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

async function checkPassword(user, password) {
  if (!user?.password || !password) return false;

  try {
    return await bcrypt.compare(password, user.password);
  } catch (_error) {
    return user.password === password;
  }
}

function buildAuthResponse(user) {
  const payload = {
    id: user.id,
    username: user.username,
    idRole: user.idRole,
    idAdminOwner: user.idAdminOwner,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      idRole: user.idRole,
      idAdminOwner: user.idAdminOwner,
      Rol: user.Rol,
    },
  };
}

function getUsersScopeWhereByAuthUser(authUser) {
  if (!authUser?.id || !authUser?.idRole) return {};

  if (authUser.idRole === ROLE_SUPER_ADMIN) {
    return {};
  }

  if (authUser.idRole === ROLE_ADMIN) {
    return {
      isDeleted: false,
      [Op.or]: [
        { id: authUser.id },
        { idAdminOwner: authUser.id },
      ],
    };
  }

  return {
    isDeleted: false,
    id: authUser.id,
  };
}

function resolveAdminOwnerForCreate(payload, authUser) {
  const payloadRole = Number(payload.idRole);
  const payloadAdminOwner = payload.idAdminOwner !== undefined && payload.idAdminOwner !== null
    ? Number(payload.idAdminOwner)
    : null;

  if (payloadRole === ROLE_SUPER_ADMIN) {
    return null;
  }

  if (payloadRole === ROLE_ADMIN) {
    if (authUser?.idRole === ROLE_SUPER_ADMIN && payloadAdminOwner) return payloadAdminOwner;
    return null;
  }

  if (payloadRole === ROLE_COACH || payloadRole === ROLE_ATHLETE) {
    if (authUser?.idRole === ROLE_ADMIN) return authUser.id;
    if (authUser?.idRole === ROLE_SUPER_ADMIN && payloadAdminOwner) return payloadAdminOwner;
    return payloadAdminOwner;
  }

  return payloadAdminOwner;
}

async function hashPasswordIfPresent(payload = {}) {
  if (!Object.prototype.hasOwnProperty.call(payload, 'password')) {
    return payload;
  }

  const password = String(payload.password || '').trim();
  if (!password) {
    return payload;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  return {
    ...payload,
    password: hashedPassword,
  };
}

module.exports = {
  async getUsers(req, res) {
    try {
      const { idRole } = req.query;
      const where = getUsersScopeWhereByAuthUser(req.authUser);
      if (idRole !== undefined && idRole !== null && idRole !== '') {
        where.idRole = Number(idRole);
      }
      const users = await User.findAll({
        where,
        include: [{ model: Rol, attributes: ['id', 'name'] }],
      });

      return res.status(200).json({ data: users });
    } catch (error) {
      console.error('Error getUsers:', error);
      return res.status(getErrorStatus(error)).json({ message: getErrorMessage(error) });
    }
  },

  async getAuthUser(req, res) {
    try {
      const { username, name, password } = req.body;
      const login = (username || name || '').trim();

      if (!login || !password) {
        return res.status(400).json({ message: 'Usuario y contrase\u00f1a son obligatorios.' });
      }

      const user = await User.findOne({
        where: { username: login, isActive: true, isDeleted: false },
        include: [{ model: Rol, attributes: ['id', 'name'] }],
      });

      if (!user) {
        return res.status(401).json({ message: 'Credenciales inv\u00e1lidas.' });
      }

      const isValidPassword = await checkPassword(user, password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Credenciales inv\u00e1lidas.' });
      }

      return res.status(200).json({ data: buildAuthResponse(user) });
    } catch (error) {
      console.error('Error getAuthUser:', error);
      return res.status(getErrorStatus(error)).json({ message: getErrorMessage(error) });
    }
  },

  async getCurrentUser(req, res) {
    try {
      const userId = req.authUser?.id;
      const user = await User.findByPk(userId, {
        attributes: { exclude: ['password'] },
        include: [{ model: Rol, attributes: ['id', 'name'] }],
      });

      if (!user || user.isDeleted || !user.isActive) {
        return res.status(404).json({ message: 'Usuario no encontrado.' });
      }

      return res.status(200).json({ data: user });
    } catch (error) {
      console.error('Error getCurrentUser:', error);
      return res.status(getErrorStatus(error)).json({ message: getErrorMessage(error) });
    }
  },

  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id, {
        // attributes: { exclude: ['password'] },
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
      normalizedPayload.idAdminOwner = resolveAdminOwnerForCreate(normalizedPayload, req.authUser);

      if (
        (Number(normalizedPayload.idRole) === ROLE_COACH || Number(normalizedPayload.idRole) === ROLE_ATHLETE) &&
        !normalizedPayload.idAdminOwner
      ) {
        return res.status(400).json({
          message: 'Para crear coach o atleta debes indicar un administrador (idAdminOwner) o autenticarte como administrador.',
        });
      }

      const payloadWithHashedPassword = await hashPasswordIfPresent(normalizedPayload);
      const user = await User.create(payloadWithHashedPassword);

      if (Number(user.idRole) === ROLE_ADMIN && !user.idAdminOwner) {
        await user.update({ idAdminOwner: user.id });
      }

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
      const payloadWithHashedPassword = await hashPasswordIfPresent(normalizedPayload);
      await user.update(payloadWithHashedPassword);
      const updatedUser = await User.findByPk(
        id, 
        // { attributes: { exclude: ['password'] } }
      );
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

      const includeCoach = { model: User, as: 'coach' };
      const includeAthlete = { model: User, as: 'athlete' };

      if (req.authUser?.idRole === ROLE_ADMIN) {
        includeCoach.where = { idAdminOwner: req.authUser.id };
        includeAthlete.where = { idAdminOwner: req.authUser.id };
      }

      const relations = await CoachAthlete.findAll({
        where,
        include: [
          includeCoach,
          includeAthlete,
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
      const [coach, athlete] = await Promise.all([
        User.findByPk(idCoach),
        User.findByPk(idAthlete),
      ]);

      if (!coach || !athlete) {
        return res.status(404).json({ message: 'Coach o atleta no encontrado.' });
      }

      if (Number(coach.idRole) !== ROLE_COACH || Number(athlete.idRole) !== ROLE_ATHLETE) {
        return res.status(400).json({ message: 'Los IDs enviados no corresponden a coach y atleta.' });
      }

      if (!coach.idAdminOwner || !athlete.idAdminOwner || coach.idAdminOwner !== athlete.idAdminOwner) {
        return res.status(400).json({ message: 'Coach y atleta deben pertenecer al mismo administrador.' });
      }

      if (req.authUser?.idRole === ROLE_ADMIN && coach.idAdminOwner !== req.authUser.id) {
        return res.status(403).json({ message: 'No puedes vincular usuarios de otro administrador.' });
      }

      const relation = await CoachAthlete.create({ idCoach, idAthlete });
      return res.status(201).json({ message: 'Atleta vinculado con \u00e9xito.', data: relation });
    } catch (error) {
      console.error('Error linkAthleteToCoach:', error);
      return res.status(getErrorStatus(error)).json({ message: getErrorMessage(error) });
    }
  },

  async unlinkAthleteFromCoach(req, res) {
    try {
      const { idCoach, idAthlete } = req.body;
      await CoachAthlete.destroy({ where: { idCoach, idAthlete } });
      return res.status(200).json({ message: 'V\u00ednculo eliminado.' });
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
  },
  async permanentlyDeleteUser(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado.' });
      }

      await user.destroy();

      return res.status(200).json({ message: 'Usuario eliminado permanentemente.' });

    } catch (error) {
      return res
        .status(getErrorStatus(error))
        .json({ message: getErrorMessage(error) });
    }
  }
};
