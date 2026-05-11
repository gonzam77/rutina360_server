const { User, Rol, CoachAthlete } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

const ROLE_SUPER_ADMIN = 1;
const ROLE_GYM = 2;
const ROLE_COACH = 3;
const ROLE_ATHLETE = 4;
const ROLE_ADMIN = 5;
const ATHLETE_PROFILE_FIELDS = [
  'username',
  'email',
  'birthDate',
  'gender',
  'phone',
  'height',
  'weight',
  'address',
  'goal',
  'weeklyAvailability',
];
const SELF_PROFILE_FIELDS = [...ATHLETE_PROFILE_FIELDS, 'password'];

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

  if (Object.prototype.hasOwnProperty.call(payload, 'username')) {
    const username = toNullableString(payload.username);
    normalized.username = username ? username.toUpperCase() : username;
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'email')) {
    const email = toNullableString(payload.email);
    normalized.email = email ? email.toLowerCase() : email;
  }
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

function pickFields(source, fields) {
  return fields.reduce((payload, field) => {
    if (Object.prototype.hasOwnProperty.call(source, field)) {
      payload[field] = source[field];
    }
    return payload;
  }, {});
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
  const userData = user.toJSON();
  delete userData.password;

  const payload = {
    id: user.id,
    username: user.username,
    idRole: user.idRole,
    idAdminOwner: user.idAdminOwner,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  return {
    token,
    user: userData,
  };
}

const roleInclude = { model: Rol, attributes: ['id', 'name'] };
const adminOwnerInclude = {
  model: User,
  as: 'adminOwner',
  attributes: ['id', 'username', 'email', 'idRole'],
};

function getUsersScopeWhereByAuthUser(authUser) {
  if (!authUser?.id || !authUser?.idRole) return {};

  if (authUser.idRole === ROLE_SUPER_ADMIN) {
    return {};
  }

  // Gym y Admin comparten alcance de owner
  if (authUser.idRole === ROLE_GYM || authUser.idRole === ROLE_ADMIN) {
    return {
      isDeleted: false,
      [Op.or]: [{ id: authUser.id }, { idAdminOwner: authUser.id }],
    };
  }

  if (authUser.idRole === ROLE_COACH) {
    return {
      isDeleted: false,
      [Op.or]: [
        { id: authUser.id },
        { idRole: ROLE_ATHLETE, idAdminOwner: authUser.idAdminOwner },
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
  const payloadAdminOwner =
    payload.idAdminOwner !== undefined && payload.idAdminOwner !== null
      ? Number(payload.idAdminOwner)
      : null;

  if (payloadRole === ROLE_SUPER_ADMIN) {
    return null;
  }

  if (payloadRole === ROLE_GYM || payloadRole === ROLE_ADMIN) {
    if (authUser?.idRole === ROLE_SUPER_ADMIN && payloadAdminOwner) return payloadAdminOwner;
    return null;
  }

  if (payloadRole === ROLE_COACH || payloadRole === ROLE_ATHLETE) {
    if (authUser?.idRole === ROLE_GYM || authUser?.idRole === ROLE_ADMIN) return authUser.id;
    if (authUser?.idRole === ROLE_COACH) return authUser.idAdminOwner || null;
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
        include: [roleInclude, adminOwnerInclude],
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
      const login = (username || name || '').trim().toUpperCase();

      if (!login || !password) {
        return res.status(400).json({ message: 'Usuario y contraseña son obligatorios.' });
      }

      const user = await User.findOne({
        where: { username: login, isActive: true, isDeleted: false },
        include: [roleInclude, adminOwnerInclude],
      });

      if (!user) {
        return res.status(401).json({ message: 'Credenciales inválidas.' });
      }

      const isValidPassword = await checkPassword(user, password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Credenciales inválidas.' });
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
        include: [roleInclude, adminOwnerInclude],
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
        include: [roleInclude, adminOwnerInclude],
      });

      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado.' });
      }

      if (req.authUser?.idRole === ROLE_GYM || req.authUser?.idRole === ROLE_ADMIN) {
        if (user.id !== req.authUser.id && user.idAdminOwner !== req.authUser.id) {
          return res.status(403).json({ message: 'No puedes acceder a usuarios de otro owner.' });
        }
      }

      if (req.authUser?.idRole === ROLE_COACH) {
        if (user.id !== req.authUser.id && user.idAdminOwner !== req.authUser.idAdminOwner) {
          return res.status(403).json({ message: 'No puedes acceder a usuarios fuera de tu grupo.' });
        }
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
      const requesterRole = Number(req.authUser?.idRole);
      const targetRole = Number(normalizedPayload.idRole);

      if ((requesterRole === ROLE_GYM || requesterRole === ROLE_ADMIN) && ![ROLE_COACH, ROLE_ATHLETE].includes(targetRole)) {
        return res.status(403).json({ message: 'Como gym/admin solo puedes crear coach o atletas.' });
      }

      if (requesterRole === ROLE_COACH && targetRole !== ROLE_ATHLETE) {
        return res.status(403).json({ message: 'Como coach solo puedes crear atletas.' });
      }

      normalizedPayload.idAdminOwner = resolveAdminOwnerForCreate(normalizedPayload, req.authUser);

      if (
        (targetRole === ROLE_COACH || targetRole === ROLE_ATHLETE) &&
        !normalizedPayload.idAdminOwner
      ) {
        return res.status(400).json({
          message: 'Para crear coach o atleta debes indicar idAdminOwner o autenticarte como gym/admin.',
        });
      }

      const payloadWithHashedPassword = await hashPasswordIfPresent(normalizedPayload);
      const user = await User.create(payloadWithHashedPassword);

      if ((Number(user.idRole) === ROLE_GYM || Number(user.idRole) === ROLE_ADMIN) && !user.idAdminOwner) {
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

      const requesterRole = Number(req.authUser?.idRole);
      const requesterId = Number(req.authUser?.id);

      if (requesterRole === ROLE_ATHLETE) {
        if (Number(id) !== requesterId || Number(user.idRole) !== ROLE_ATHLETE) {
          return res.status(403).json({ message: 'Como atleta solo puedes editar tus propios datos personales.' });
        }

        const normalizedPayload = normalizeUserPayload(req.body);
        const profilePayload = pickFields(normalizedPayload, ATHLETE_PROFILE_FIELDS);

        if (Object.keys(profilePayload).length === 0) {
          return res.status(400).json({ message: 'No enviaste campos personales editables.' });
        }

        await user.update(profilePayload);

        const updatedUser = await User.findByPk(id, {
          attributes: { exclude: ['password'] },
          include: [roleInclude, adminOwnerInclude],
        });
        return res.status(200).json({ data: updatedUser });
      }

      if (requesterRole === ROLE_GYM || requesterRole === ROLE_ADMIN) {
        const isSelfEdit = Number(id) === requesterId;

        if (requesterRole === ROLE_GYM && isSelfEdit) {
          const normalizedPayload = normalizeUserPayload(req.body);
          const selfPayload = pickFields(normalizedPayload, SELF_PROFILE_FIELDS);
          const payloadWithHashedPassword = await hashPasswordIfPresent(selfPayload);

          if (Object.keys(payloadWithHashedPassword).length === 0) {
            return res.status(400).json({ message: 'No enviaste campos personales editables.' });
          }

          await user.update(payloadWithHashedPassword);

          const updatedUser = await User.findByPk(id, {
            attributes: { exclude: ['password'] },
            include: [roleInclude, adminOwnerInclude],
          });
          return res.status(200).json({ data: updatedUser });
        }

        if (![ROLE_COACH, ROLE_ATHLETE].includes(Number(user.idRole)) || user.idAdminOwner !== req.authUser.id) {
          return res.status(403).json({ message: 'Solo puedes editar tus datos o coach/atletas de tu grupo.' });
        }
      }

      if (requesterRole === ROLE_COACH) {
        if (Number(user.idRole) !== ROLE_ATHLETE || user.idAdminOwner !== req.authUser.idAdminOwner) {
          return res.status(403).json({ message: 'Solo puedes editar atletas de tu grupo.' });
        }
      }

      const normalizedPayload = normalizeUserPayload(req.body);
      const payloadWithHashedPassword = await hashPasswordIfPresent(normalizedPayload);
      await user.update(payloadWithHashedPassword);

      const updatedUser = await User.findByPk(id);
      return res.status(200).json({ data: updatedUser });
    } catch (error) {
      return res.status(getErrorStatus(error)).json({ message: getErrorMessage(error) });
    }
  },

  async getCoachAthletes(req, res) {
    try {
      if (![ROLE_SUPER_ADMIN, ROLE_GYM, ROLE_ADMIN, ROLE_COACH, ROLE_ATHLETE].includes(Number(req.authUser?.idRole))) {
        return res.status(403).json({ message: 'No tienes permisos para ver vínculos coach-atleta.' });
      }

      const { idCoach, idAthlete } = req.query;
      const where = {};
      if (idCoach) where.idCoach = idCoach;
      if (idAthlete) where.idAthlete = idAthlete;

      const includeCoach = { model: User, as: 'coach' };
      const includeAthlete = { model: User, as: 'athlete' };

      if (req.authUser?.idRole === ROLE_GYM || req.authUser?.idRole === ROLE_ADMIN) {
        includeCoach.where = { idAdminOwner: req.authUser.id };
        includeAthlete.where = { idAdminOwner: req.authUser.id };
      }

      if (req.authUser?.idRole === ROLE_COACH) {
        where.idCoach = req.authUser.id;
        includeAthlete.where = { idAdminOwner: req.authUser.idAdminOwner };
      }

      if (req.authUser?.idRole === ROLE_ATHLETE) {
        if (idAthlete && Number(idAthlete) !== Number(req.authUser.id)) {
          return res.status(403).json({ message: 'Como atleta solo puedes consultar tus propios vinculos.' });
        }
        where.idAthlete = req.authUser.id;
      }

      const relations = await CoachAthlete.findAll({
        where,
        include: [includeCoach, includeAthlete],
      });

      return res.status(200).json({ data: relations });
    } catch (error) {
      console.error('Error getCoachAthletes:', error);
      return res.status(getErrorStatus(error)).json({ message: getErrorMessage(error) });
    }
  },

  async linkAthleteToCoach(req, res) {
    try {
      if (![ROLE_SUPER_ADMIN, ROLE_GYM, ROLE_ADMIN, ROLE_COACH].includes(Number(req.authUser?.idRole))) {
        return res.status(403).json({ message: 'No tienes permisos para vincular atleta-coach.' });
      }

      const { idCoach, idAthlete } = req.body;
      const [coach, athlete] = await Promise.all([User.findByPk(idCoach), User.findByPk(idAthlete)]);

      if (!coach || !athlete) {
        return res.status(404).json({ message: 'Coach o atleta no encontrado.' });
      }

      if (Number(coach.idRole) !== ROLE_COACH || Number(athlete.idRole) !== ROLE_ATHLETE) {
        return res.status(400).json({ message: 'Los IDs enviados no corresponden a coach y atleta.' });
      }

      if (!coach.idAdminOwner || !athlete.idAdminOwner || coach.idAdminOwner !== athlete.idAdminOwner) {
        return res.status(400).json({ message: 'Coach y atleta deben pertenecer al mismo owner.' });
      }

      if ((req.authUser?.idRole === ROLE_GYM || req.authUser?.idRole === ROLE_ADMIN) && coach.idAdminOwner !== req.authUser.id) {
        return res.status(403).json({ message: 'No puedes vincular usuarios de otro owner.' });
      }

      if (req.authUser?.idRole === ROLE_COACH) {
        if (Number(idCoach) !== Number(req.authUser.id)) {
          return res.status(403).json({ message: 'Como coach solo puedes vincular atletas a tu propio perfil.' });
        }
        if (coach.idAdminOwner !== req.authUser.idAdminOwner || athlete.idAdminOwner !== req.authUser.idAdminOwner) {
          return res.status(403).json({ message: 'Solo puedes vincular atletas de tu mismo owner.' });
        }
      }

      const relation = await CoachAthlete.create({ idCoach, idAthlete });
      return res.status(201).json({ message: 'Atleta vinculado con éxito.', data: relation });
    } catch (error) {
      console.error('Error linkAthleteToCoach:', error);
      return res.status(getErrorStatus(error)).json({ message: getErrorMessage(error) });
    }
  },

  async unlinkAthleteFromCoach(req, res) {
    try {
      if (![ROLE_SUPER_ADMIN, ROLE_GYM, ROLE_ADMIN, ROLE_COACH].includes(Number(req.authUser?.idRole))) {
        return res.status(403).json({ message: 'No tienes permisos para desvincular atleta-coach.' });
      }

      const { idCoach, idAthlete } = req.body;

      if (req.authUser?.idRole === ROLE_COACH && Number(idCoach) !== Number(req.authUser.id)) {
        return res.status(403).json({ message: 'Como coach solo puedes desvincular atletas de tu propio perfil.' });
      }

      if ((req.authUser?.idRole === ROLE_GYM || req.authUser?.idRole === ROLE_ADMIN)) {
        const [coach, athlete] = await Promise.all([User.findByPk(idCoach), User.findByPk(idAthlete)]);
        if (!coach || !athlete || coach.idAdminOwner !== req.authUser.id || athlete.idAdminOwner !== req.authUser.id) {
          return res.status(403).json({ message: 'No puedes desvincular usuarios de otro owner.' });
        }
      }

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
          id,
          isDeleted: false,
        },
      });

      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado.' });
      }

      if (req.authUser?.idRole === ROLE_GYM || req.authUser?.idRole === ROLE_ADMIN) {
        const targetRole = Number(user.idRole);
        if (![ROLE_COACH, ROLE_ATHLETE].includes(targetRole) || user.idAdminOwner !== req.authUser.id) {
          return res.status(403).json({ message: 'Solo puedes eliminar coach/atletas de tu grupo.' });
        }
      }

      if (req.authUser?.idRole === ROLE_COACH) {
        return res.status(403).json({ message: 'Como coach no puedes eliminar usuarios.' });
      }

      await user.update({ isDeleted: true, isActive: false });
      return res.status(200).json({ message: 'Usuario eliminado.' });
    } catch (error) {
      return res.status(getErrorStatus(error)).json({ message: getErrorMessage(error) });
    }
  },

  async permanentlyDeleteUser(req, res) {
    try {
      if (Number(req.authUser?.idRole) !== ROLE_SUPER_ADMIN) {
        return res.status(403).json({ message: 'Solo el superadministrador puede eliminar permanentemente.' });
      }

      const { id } = req.params;
      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado.' });
      }

      await user.destroy();
      return res.status(200).json({ message: 'Usuario eliminado permanentemente.' });
    } catch (error) {
      return res.status(getErrorStatus(error)).json({ message: getErrorMessage(error) });
    }
  },
};
