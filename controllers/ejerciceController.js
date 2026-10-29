const { Ejercice, RoutineEjercice, RoutineAthlete, sequelize } = require('../models');

const ROLE_SUPER_ADMIN = 1;

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

module.exports = {
  async createEjercice(req, res) {
    try {
    const requesterRole = Number(req.authUser?.idRole);
    const requesterId = Number(req.authUser?.id);

    // El catalogo lo carga solo el super admin: cada ejercicio necesita su
    // ilustracion, y las imagenes se generan con una sola estetica.
    if (requesterRole !== ROLE_SUPER_ADMIN) {
      return res.status(403).json({ message: 'Solo el administrador general puede crear ejercicios.' });
    }

    const pickEjerciceFields = (payload = {}) => ({
      name: payload.name,
      idMuscleGroup: payload.idMuscleGroup,
      idOwner: requesterId,
    });

    const data = req.body;

    // 2. Verificamos si viene un array (inserción masiva)
    if (Array.isArray(data)) {
      // IMPORTANTE: Asegúrate de usar el nombre correcto del modelo (¿Ejercice o Ejercicio?)
      const payload = data.map((item) => pickEjerciceFields(item));
      const nuevosEjercicios = await Ejercice.bulkCreate(payload, {
        validate: true 
      });

      return res.status(201).json({
        message: 'Ejercicios creados con éxito',
        count: nuevosEjercicios.length,
        data: nuevosEjercicios
      });
    }

    // 3. Si es un solo objeto
    const payload = pickEjerciceFields(data);
    const ejercice = await Ejercice.create(payload);
    return res.status(201).json({ 
      message: 'Ejercicio creado.', 
      data: ejercice 
    });

    } catch (error) {
      console.error('Error createEjercice:', error);
      // Usamos tus funciones auxiliares de error
      return res.status(getErrorStatus(error)).json({ 
        message: getErrorMessage(error) 
      });
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

      const requesterRole = Number(req.authUser?.idRole);
      if (requesterRole !== ROLE_SUPER_ADMIN) {
        return res.status(403).json({ message: 'Solo el administrador general puede editar ejercicios.' });
      }

      const payload = {
        name: req.body?.name,
        idMuscleGroup: req.body?.idMuscleGroup,
      };
      await ejercice.update(payload);
      return res.status(200).json({ message: 'Ejercicio actualizado.', data: ejercice });
    } catch (error) {
      console.error('Error updateEjercice:', error);
      return res.status(getErrorStatus(error)).json({ message: getErrorMessage(error) });
    }
  },

  async deleteEjercice(req, res) {
    const t = await sequelize.transaction();
    try {
      const { id } = req.params;
      const ejercice = await Ejercice.findByPk(id, { transaction: t });
      const requesterRole = Number(req.authUser?.idRole);

      if (!ejercice) {
        await t.rollback();
        return res.status(404).json({ message: 'Ejercicio no encontrado.' });
      }

      if (requesterRole !== ROLE_SUPER_ADMIN) {
        await t.rollback();
        return res.status(403).json({ message: 'Solo el administrador general puede eliminar ejercicios.' });
      }

      const routineRelations = await RoutineEjercice.findAll({
        where: { idEjercice: id },
        attributes: ['idRoutine'],
        transaction: t,
      });

      const routineIds = [...new Set(routineRelations.map((relation) => Number(relation.idRoutine)))];

      if (routineIds.length > 0) {
        const activeAssignmentsCount = await RoutineAthlete.count({
          where: {
            idRoutine: routineIds,
            isActive: true,
            isDeleted: false,
          },
          transaction: t,
        });

        if (activeAssignmentsCount > 0) {
          await t.rollback();
          return res.status(409).json({
            message: 'No se puede eliminar el ejercicio porque esta en una rutina asignada a atletas.',
          });
        }
      }

      const deletedRoutineRelations = await RoutineEjercice.destroy({
        where: { idEjercice: id },
        transaction: t,
      });

      await ejercice.destroy({ transaction: t });

      await t.commit();
      return res.status(200).json({
        message: 'Ejercicio eliminado.',
        data: { deletedRoutineRelations },
      });
    } catch (error) {
      await t.rollback();
      console.error('Error deleteEjercice:', error);
      return res.status(getErrorStatus(error)).json({ message: getErrorMessage(error) });
    }
  },
};
