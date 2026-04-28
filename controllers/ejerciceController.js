const { Ejercice } = require('../models');

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
  async createEjercice(req, res) {
    try {
      
      // 1. Verificamos si el body es un array (vienen varios)
      if (Array.isArray(data)) {
        // Usamos bulkCreate para inserción masiva
        const nuevosEjercicios = await Ejercicio.bulkCreate(data, { 
          validate: true // Esto asegura que cada objeto cumpla con las reglas del modelo
        });
        
        return res.status(201).json({
          message: 'Ejercicios creados con éxito',
          count: nuevosEjercicios.length,
          data: nuevosEjercicios
        });
      }

      // 2. Si no es un array, tratamos la petición como un solo objeto
      const ejercice = await Ejercice.create(req.body);
      return res.status(201).json({ message: 'Ejercicio creado.', data: ejercice });

    } catch (error) {
      console.error('Error createEjercice:', error);
      return res.status(getErrorStatus(error)).json({ message: getErrorMessage(error) });
    }
  },

  async getEjercices(req, res) {
    try {
      const exercices = await Ejercice.findAll();
      return res.status(200).json({ data: exercices });
    } catch (error) {
      console.error('Error getEjercices:', error);
      return res.status(getErrorStatus(error)).json({ message: getErrorMessage(error) });
    }
  },

  async getEjerciceById(req, res) {
    try {
      const { id } = req.params;
      const ejercice = await Ejercice.findByPk(id);

      if (!ejercice) {
        return res.status(404).json({ message: 'Ejercicio no encontrado.' });
      }

      return res.status(200).json({ data: ejercice });
    } catch (error) {
      console.error('Error getEjerciceById:', error);
      return res.status(getErrorStatus(error)).json({ message: getErrorMessage(error) });
    }
  },

  async updateEjercice(req, res) {
    try {
      const { id } = req.params;
      const ejercice = await Ejercice.findByPk(id);

      if (!ejercice) {
        return res.status(404).json({ message: 'Ejercicio no encontrado.' });
      }

      await ejercice.update(req.body);
      return res.status(200).json({ message: 'Ejercicio actualizado.', data: ejercice });
    } catch (error) {
      console.error('Error updateEjercice:', error);
      return res.status(getErrorStatus(error)).json({ message: getErrorMessage(error) });
    }
  },

  async deleteEjercice(req, res) {
    try {
      const { id } = req.params;
      const ejercice = await Ejercice.findByPk(id);

      if (!ejercice) {
        return res.status(404).json({ message: 'Ejercicio no encontrado.' });
      }

      await ejercice.destroy();
      return res.status(200).json({ message: 'Ejercicio eliminado.' });
    } catch (error) {
      console.error('Error deleteEjercice:', error);
      return res.status(getErrorStatus(error)).json({ message: getErrorMessage(error) });
    }
  },
};
