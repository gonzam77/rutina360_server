const { Rol } = require('../models');

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
  return 'Error interno.';
}

module.exports = {
  async createRol(req, res) {
    try {
      const rol = await Rol.create(req.body);
      return res.status(201).json({ message: 'Rol creado.', data: rol });
    } catch (error) {
      console.error('Error createRol:', error);
      return res.status(getErrorStatus(error)).json({ message: getErrorMessage(error) });
    }
  },

  async getRols(req, res) {
    try {
      const rols = await Rol.findAll();
      return res.status(200).json({ data: rols });
    } catch (error) {
      console.error('Error getRols:', error);
      return res.status(getErrorStatus(error)).json({ message: getErrorMessage(error) });
    }
  },

  async getRolById(req, res) {
    try {
      const { id } = req.params;
      const rol = await Rol.findByPk(id);

      if (!rol) {
        return res.status(404).json({ message: 'Rol no encontrado.' });
      }

      return res.status(200).json({ data: rol });
    } catch (error) {
      console.error('Error getRolById:', error);
      return res.status(getErrorStatus(error)).json({ message: getErrorMessage(error) });
    }
  },

  async updateRol(req, res) {
    try {
      const { id } = req.params;
      const rol = await Rol.findByPk(id);

      if (!rol) {
        return res.status(404).json({ message: 'Rol no encontrado.' });
      }

      await rol.update(req.body);
      return res.status(200).json({ message: 'Rol actualizado.', data: rol });
    } catch (error) {
      console.error('Error updateRol:', error);
      return res.status(getErrorStatus(error)).json({ message: getErrorMessage(error) });
    }
  },

  async deleteRol(req, res) {
    try {
      const { id } = req.params;
      const rol = await Rol.findByPk(id);

      if (!rol) {
        return res.status(404).json({ message: 'Rol no encontrado.' });
      }

      await rol.destroy();
      return res.status(200).json({ message: 'Rol eliminado.' });
    } catch (error) {
      console.error('Error deleteRol:', error);
      return res.status(getErrorStatus(error)).json({ message: getErrorMessage(error) });
    }
  },
};
