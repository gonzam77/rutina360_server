const { Routine, RoutineAthlete, RoutineEjercice, User, sequelize, Ejercice, MuscleGroup } = require('../models');

module.exports = {
  async getRoutines(req, res) {
    try {
      const { idUser } = req.query;
      const where = {};
      if (idUser !== undefined) where.idUser = idUser;

      const routines = await Routine.findAll({
        where,
        include: [
          { model: User, as: 'creator', attributes: { exclude: ['password'] } },
          {
            model: RoutineEjercice,
            include: [
              {
                model: Ejercice,
                include: [{ model: MuscleGroup, attributes: ['id', 'name'] }],
              },
            ],
          },
        ],
      });

      return res.status(200).json({ data: routines });
    } catch (error) {
      console.error('Error getRoutines:', error);
      return res.status(500).json({ message: 'Error al obtener rutinas.' });
    }
  },

  async createRoutine(req, res) {
    try {
      const { name, idUser, order, time } = req.body;

      if (!name || !idUser) {
        return res.status(400).json({ message: 'Los campos name e idUser son obligatorios.' });
      }

      const routine = await Routine.create({ name, idUser, order, time });
      return res.status(201).json({ message: 'Rutina creada.', data: routine });
    } catch (error) {
      console.error('Error createRoutine:', error);
      return res.status(500).json({ message: 'Error al crear la rutina.' });
    }
  },

  async assignRoutine(req, res) {
    const t = await sequelize.transaction();
    try {
      const { idRoutine, idAthlete, idAthletes } = req.body;

      if (!idRoutine) {
        await t.rollback();
        return res.status(400).json({ message: 'El campo idRoutine es obligatorio.' });
      }

      const athleteIds = Array.isArray(idAthletes)
        ? idAthletes
        : idAthlete !== undefined
        ? [idAthlete]
        : [];

      if (athleteIds.length === 0) {
        await t.rollback();
        return res.status(400).json({ message: 'Debes enviar idAthlete o idAthletes.' });
      }

      const routine = await Routine.findByPk(idRoutine, { transaction: t });
      if (!routine) {
        await t.rollback();
        return res.status(404).json({ message: 'Rutina no encontrada.' });
      }

      const athletes = await User.findAll({
        where: { id: athleteIds },
        attributes: ['id'],
        transaction: t,
      });

      if (athletes.length !== athleteIds.length) {
        await t.rollback();
        return res.status(404).json({ message: 'Uno o más atletas no existen.' });
      }

      const assignments = [];
      for (const athleteId of athleteIds) {
        const existingAssignment = await RoutineAthlete.findOne({
          where: { idRoutine, idAthlete: athleteId },
          transaction: t,
        });

        if (existingAssignment) {
          await existingAssignment.update(
            { isActive: true, isDeleted: false },
            { transaction: t }
          );
          assignments.push(existingAssignment);
          continue;
        }

        const createdAssignment = await RoutineAthlete.create(
          {
            idRoutine,
            idAthlete: athleteId,
            isActive: true,
            isDeleted: false,
          },
          { transaction: t }
        );
        assignments.push(createdAssignment);
      }

      await t.commit();
      return res.status(201).json({
        message: 'Rutina asignada correctamente.',
        data: assignments,
      });
    } catch (error) {
      await t.rollback();
      console.error('Error assignRoutine:', error);
      return res.status(500).json({ message: 'Error al asignar la rutina.' });
    }
  },

  async unassignRoutine(req, res) {
    const t = await sequelize.transaction();
    try {
      const { idRoutine, idAthlete, idAthletes } = req.body;

      if (!idRoutine) {
        await t.rollback();
        return res.status(400).json({ message: 'El campo idRoutine es obligatorio.' });
      }

      const athleteIds = Array.isArray(idAthletes)
        ? idAthletes
        : idAthlete !== undefined
        ? [idAthlete]
        : [];

      if (athleteIds.length === 0) {
        await t.rollback();
        return res.status(400).json({ message: 'Debes enviar idAthlete o idAthletes.' });
      }

      const [updatedCount] = await RoutineAthlete.update(
        { isActive: false, isDeleted: true },
        {
          where: { idRoutine, idAthlete: athleteIds },
          transaction: t,
        }
      );

      await t.commit();
      return res.status(200).json({
        message: 'Relación rutina-atleta eliminada lógicamente.',
        data: { updatedCount },
      });
    } catch (error) {
      await t.rollback();
      console.error('Error unassignRoutine:', error);
      return res.status(500).json({ message: 'Error al desasignar la rutina.' });
    }
  },

  async getActiveAssignments(req, res) {
    try {
      const { idRoutine, idAthlete } = req.query;
      const where = { isActive: true, isDeleted: false };

      if (idRoutine !== undefined) where.idRoutine = idRoutine;
      if (idAthlete !== undefined) where.idAthlete = idAthlete;

      const assignments = await RoutineAthlete.findAll({
        where,
        include: [
          { model: Routine, attributes: ['id', 'name', 'idUser', 'order', 'time'] },
          { model: User, as: 'athlete', attributes: { exclude: ['password'] } },
        ],
      });

      return res.status(200).json({ data: assignments });
    } catch (error) {
      console.error('Error getActiveAssignments:', error);
      return res.status(500).json({ message: 'Error al obtener asignaciones activas.' });
    }
  },

  async getActiveAssignmentsByRoutine(req, res) {
    try {
      const { idRoutine } = req.params;
      const assignments = await RoutineAthlete.findAll({
        where: { idRoutine, isActive: true, isDeleted: false },
        include: [{ model: User, as: 'athlete', attributes: { exclude: ['password'] } }],
      });
      return res.status(200).json({ data: assignments });
    } catch (error) {
      console.error('Error getActiveAssignmentsByRoutine:', error);
      return res.status(500).json({ message: 'Error al obtener asignaciones por rutina.' });
    }
  },

  async getActiveAssignmentsByAthlete(req, res) {
    try {
      const { idAthlete } = req.params;
      const assignments = await RoutineAthlete.findAll({
        where: { idAthlete, isActive: true, isDeleted: false },
        include: [{ model: Routine, attributes: ['id', 'name', 'idUser', 'order', 'time'] }],
      });
      return res.status(200).json({ data: assignments });
    } catch (error) {
      console.error('Error getActiveAssignmentsByAthlete:', error);
      return res.status(500).json({ message: 'Error al obtener asignaciones por atleta.' });
    }
  },

  async deleteRoutine(req, res) {

    try {
      const { id } = req.params;
      const routine = await Routine.findByPk(id);

      if (!routine) { 
        return res.status(404).json({ message: 'Rutina no encontrada.' });
      }

      await routine.destroy();

    } catch (error) {
      return res.status(500).json({ message: 'Error al eliminar la rutina.' });
    }

  }
};
