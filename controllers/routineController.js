const { Routine, RoutineAthlete, RoutineEjercice, User, sequelize, Ejercice, MuscleGroup } = require('../models');
const { Op } = require('sequelize');
const ROLE_SUPER_ADMIN = 1;
const ROLE_ADMIN = 5;
const ROLE_COACH = 3;
const ROLE_ATHLETE = 4;
const ROLE_GYM = 2;
const ROUTINE_CREATOR_ROLES = [ROLE_COACH, ROLE_GYM];

const ROUTINE_FIELDS = ['name', 'order', 'time'];
const ROUTINE_EXERCISE_FIELDS = ['idEjercice', 'series', 'rest', 'comments'];

function pickDefinedFields(source, fields) {
  return fields.reduce((payload, field) => {
    if (source[field] !== undefined) payload[field] = source[field];
    return payload;
  }, {});
}

function getUniqueDefined(values) {
  return [...new Set(values.filter((value) => value !== undefined && value !== null))];
}

function hasDefinedValue(value) {
  return value !== undefined && value !== null;
}

function shouldDeleteRoutineExercise(exercise) {
  return (
    exercise._delete === true ||
    exercise.delete === true ||
    exercise.deleted === true ||
    exercise.isDeleted === true ||
    exercise.action === 'delete'
  );
}

function isRoutineCreatorRole(roleId) {
  return ROUTINE_CREATOR_ROLES.includes(Number(roleId));
}

module.exports = {
  async getRoutines(req, res) {
    try {
      const { idUser } = req.query;
      const where = {};
      if (idUser !== undefined) where.idUser = idUser;

      const requesterRole = Number(req.authUser?.idRole);
      const requesterId = Number(req.authUser?.id);

      if (requesterRole === ROLE_ADMIN) {
        const coaches = await User.findAll({
          where: { idRole: { [Op.in]: ROUTINE_CREATOR_ROLES }, idAdminOwner: requesterId, isDeleted: false },
          attributes: ['id'],
        });
        const coachIds = coaches.map((coach) => coach.id);
        where.idUser = where.idUser !== undefined
          ? Number(where.idUser)
          : { [Op.in]: coachIds.length > 0 ? coachIds : [-1] };
      }

      if (requesterRole === ROLE_COACH || requesterRole === ROLE_GYM) {
        where.idUser = requesterId;
      }

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
    const t = await sequelize.transaction();
    try {
      const { name, order, time, exercises } = req.body;
      const requesterRole = Number(req.authUser?.idRole);
      const requesterId = Number(req.authUser?.id);

      if (!name) {
        await t.rollback();
        return res.status(400).json({ message: 'El campo name es obligatorio.' });
      }

      if (!isRoutineCreatorRole(requesterRole)) {
        await t.rollback();
        return res.status(403).json({ message: 'Solo un coach o gym puede crear rutinas.' });
      }

      const creator = await User.findByPk(requesterId, { transaction: t });
      if (!creator || !isRoutineCreatorRole(creator.idRole)) {
        await t.rollback();
        return res.status(400).json({ message: 'El creador de la rutina debe ser un coach o gym valido.' });
      }

      const routine = await Routine.create({ name, idUser: requesterId, order, time }, { transaction: t });

      let createdExercises = [];
      if (Array.isArray(exercises) && exercises.length > 0) {
        const exerciseIds = exercises.map((exercise) => exercise.idEjercice);
        const existingExercises = await Ejercice.findAll({
          where: { id: exerciseIds },
          attributes: ['id'],
          transaction: t,
        });

        if (existingExercises.length !== exerciseIds.length) {
          await t.rollback();
          return res.status(404).json({ message: 'Uno o más ejercicios no existen.' });
        }

        const routineExercisePayload = exercises.map((exercise) => ({
          idRoutine: routine.id,
          idEjercice: exercise.idEjercice,
          series: exercise.series,
          rest: exercise.rest,
          comments: exercise.comments,
        }));

        createdExercises = await RoutineEjercice.bulkCreate(routineExercisePayload, {
          transaction: t,
          validate: true,
        });
      }

      await t.commit();
      return res.status(201).json({
        message: 'Rutina creada.',
        data: {
          ...routine.toJSON(),
          exercises: createdExercises,
        },
      });
    } catch (error) {
      await t.rollback();
      console.error('Error createRoutine:', error);
      return res.status(500).json({ message: 'Error al crear la rutina.' });
    }
  },

  async updateRoutine(req, res) {
    const t = await sequelize.transaction();
    try {
      const { id } = req.params;
      const {
        exercises,
        deletedExerciseIds,
        deleteExerciseIds,
        exercisesToDelete,
        replaceExercises,
      } = req.body;

      const routine = await Routine.findByPk(id, { transaction: t });
      const requesterRole = Number(req.authUser?.idRole);
      const requesterId = Number(req.authUser?.id);

      if (!routine) {
        await t.rollback();
        return res.status(404).json({ message: 'Rutina no encontrada.' });
      }

      const coach = await User.findByPk(routine.idUser, { transaction: t });
      if (!coach || !isRoutineCreatorRole(coach.idRole)) {
        await t.rollback();
        return res.status(400).json({ message: 'La rutina no pertenece a un coach o gym valido.' });
      }

      if ((requesterRole === ROLE_COACH || requesterRole === ROLE_GYM) && routine.idUser !== requesterId) {
        await t.rollback();
        return res.status(403).json({ message: 'Solo puedes editar tus propias rutinas.' });
      }

      if (requesterRole === ROLE_ADMIN && coach.idAdminOwner !== requesterId) {
        await t.rollback();
        return res.status(403).json({ message: 'Solo puedes editar rutinas de coachs de tu grupo.' });
      }

      if (exercises !== undefined && !Array.isArray(exercises)) {
        await t.rollback();
        return res.status(400).json({ message: 'El campo exercises debe ser un array.' });
      }

      const routinePayload = pickDefinedFields(req.body, ROUTINE_FIELDS);
      if (Object.keys(routinePayload).length > 0) {
        await routine.update(routinePayload, { transaction: t });
      }

      const shouldProcessExercises =
        Array.isArray(exercises) ||
        Array.isArray(deletedExerciseIds) ||
        Array.isArray(deleteExerciseIds) ||
        Array.isArray(exercisesToDelete);

      if (shouldProcessExercises) {
        const incomingExercises = Array.isArray(exercises) ? exercises : [];
        // El front envia la lista final al editar; replaceExercises false conserva el modo incremental.
        const shouldReplaceExercises = Array.isArray(exercises) && replaceExercises !== false;
        const exercisesMarkedForDelete = incomingExercises.filter(shouldDeleteRoutineExercise);
        const idsFromBody = [
          ...(Array.isArray(deletedExerciseIds) ? deletedExerciseIds : []),
          ...(Array.isArray(deleteExerciseIds) ? deleteExerciseIds : []),
          ...(Array.isArray(exercisesToDelete) ? exercisesToDelete : []),
          ...exercisesMarkedForDelete.map((exercise) => exercise.id),
        ];
        const routineExerciseIdsToDelete = getUniqueDefined(idsFromBody);
        const ejerciceIdsMarkedForDelete = getUniqueDefined(
          exercisesMarkedForDelete
            .filter((exercise) => !hasDefinedValue(exercise.id))
            .map((exercise) => exercise.idEjercice)
        );

        if (
          exercisesMarkedForDelete.some(
            (exercise) => !hasDefinedValue(exercise.id) && !hasDefinedValue(exercise.idEjercice)
          )
        ) {
          await t.rollback();
          return res.status(400).json({
            message: 'Para eliminar un ejercicio de la rutina debes enviar el id del ejercicio_rutina o idEjercice.',
          });
        }

        const routineExerciseIdsToDeleteSet = new Set(
          routineExerciseIdsToDelete.map((exerciseId) => String(exerciseId))
        );
        const ejerciceIdsMarkedForDeleteSet = new Set(
          ejerciceIdsMarkedForDelete.map((exerciseId) => String(exerciseId))
        );

        const exercisesToUpsert = incomingExercises.filter((exercise) => {
          if (shouldDeleteRoutineExercise(exercise)) return false;
          if (!hasDefinedValue(exercise.id)) return true;
          return !routineExerciseIdsToDeleteSet.has(String(exercise.id));
        });

        const referencedEjerciceIds = getUniqueDefined(
          exercisesToUpsert.map((exercise) => exercise.idEjercice)
        );

        if (referencedEjerciceIds.length > 0) {
          const existingExercises = await Ejercice.findAll({
            where: { id: referencedEjerciceIds },
            attributes: ['id'],
            transaction: t,
          });

          if (existingExercises.length !== referencedEjerciceIds.length) {
            await t.rollback();
            return res.status(404).json({ message: 'Uno o mas ejercicios no existen.' });
          }
        }

        for (const exercise of exercisesToUpsert) {
          if (!hasDefinedValue(exercise.id) && !hasDefinedValue(exercise.idEjercice)) {
            await t.rollback();
            return res.status(400).json({
              message: 'Para agregar un ejercicio a la rutina debes enviar idEjercice.',
            });
          }
        }

        const currentRoutineExercises = await RoutineEjercice.findAll({
          where: { idRoutine: id },
          transaction: t,
        });
        const currentRoutineExercisesById = new Map();
        const currentRoutineExercisesByEjerciceId = new Map();

        for (const routineExercise of currentRoutineExercises) {
          currentRoutineExercisesById.set(String(routineExercise.id), routineExercise);

          if (!currentRoutineExercisesByEjerciceId.has(String(routineExercise.idEjercice))) {
            currentRoutineExercisesByEjerciceId.set(String(routineExercise.idEjercice), routineExercise);
          }
        }

        if (
          routineExerciseIdsToDelete.some(
            (routineExerciseId) => !currentRoutineExercisesById.has(String(routineExerciseId))
          )
        ) {
          await t.rollback();
          return res.status(404).json({
            message: 'Uno o mas ejercicios de la rutina no existen o no pertenecen a esta rutina.',
          });
        }

        const routineExerciseIdsDeleted = new Set();
        const routineExercisesToDelete = currentRoutineExercises.filter(
          (routineExercise) =>
            routineExerciseIdsToDeleteSet.has(String(routineExercise.id)) ||
            ejerciceIdsMarkedForDeleteSet.has(String(routineExercise.idEjercice))
        );

        for (const routineExercise of routineExercisesToDelete) {
          await routineExercise.destroy({ transaction: t });
          routineExerciseIdsDeleted.add(String(routineExercise.id));
        }

        if (ejerciceIdsMarkedForDelete.length > 0) {
          const deletedEjerciceIds = new Set(
            routineExercisesToDelete.map((routineExercise) => String(routineExercise.idEjercice))
          );

          if (
            ejerciceIdsMarkedForDelete.some(
              (exerciseId) => !deletedEjerciceIds.has(String(exerciseId))
            )
          ) {
            await t.rollback();
            return res.status(404).json({
              message: 'Uno o mas ejercicios de la rutina no existen o no pertenecen a esta rutina.',
            });
          }
        }

        const routineExerciseIdsToKeep = [];
        const usedRoutineExerciseIds = new Set();

        for (const exercise of exercisesToUpsert) {
          const exercisePayload = pickDefinedFields(exercise, ROUTINE_EXERCISE_FIELDS);

          if (hasDefinedValue(exercise.id)) {
            const routineExercise = currentRoutineExercisesById.get(String(exercise.id));

            if (!routineExercise || routineExerciseIdsDeleted.has(String(routineExercise.id))) {
              await t.rollback();
              return res.status(404).json({
                message: 'Uno o mas ejercicios de la rutina no existen o no pertenecen a esta rutina.',
              });
            }

            if (Object.keys(exercisePayload).length > 0) {
              await routineExercise.update(exercisePayload, { transaction: t });
            }
            routineExerciseIdsToKeep.push(routineExercise.id);
            usedRoutineExerciseIds.add(String(routineExercise.id));
            continue;
          }

          const existingRoutineExercise = currentRoutineExercisesByEjerciceId.get(String(exercise.idEjercice));
          if (
            existingRoutineExercise &&
            !routineExerciseIdsDeleted.has(String(existingRoutineExercise.id)) &&
            !usedRoutineExerciseIds.has(String(existingRoutineExercise.id))
          ) {
            if (Object.keys(exercisePayload).length > 0) {
              await existingRoutineExercise.update(exercisePayload, { transaction: t });
            }
            routineExerciseIdsToKeep.push(existingRoutineExercise.id);
            usedRoutineExerciseIds.add(String(existingRoutineExercise.id));
            continue;
          }

          const createdRoutineExercise = await RoutineEjercice.create(
            {
              idRoutine: id,
              ...exercisePayload,
            },
            { transaction: t, validate: true }
          );
          routineExerciseIdsToKeep.push(createdRoutineExercise.id);
          usedRoutineExerciseIds.add(String(createdRoutineExercise.id));
        }

        if (shouldReplaceExercises) {
          const routineExerciseIdsToKeepSet = new Set(
            routineExerciseIdsToKeep.map((exerciseId) => String(exerciseId))
          );
          const routineExercisesToRemove = currentRoutineExercises.filter(
            (exercise) =>
              !routineExerciseIdsDeleted.has(String(exercise.id)) &&
              !routineExerciseIdsToKeepSet.has(String(exercise.id))
          );

          for (const exercise of routineExercisesToRemove) {
            await exercise.destroy({ transaction: t });
          }
        }
      }

      const updatedRoutine = await Routine.findByPk(id, {
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
        transaction: t,
      });

      await t.commit();
      return res.status(200).json({ message: 'Rutina actualizada.', data: updatedRoutine });
    } catch (error) {
      await t.rollback();
      console.error('Error updateRoutine:', error);
      return res.status(500).json({ message: 'Error al actualizar la rutina.' });
    }
  },

  async assignRoutine(req, res) {
    const t = await sequelize.transaction();
    try {
      const { idRoutine, idAthlete, idAthletes } = req.body;
      const requesterRole = Number(req.authUser?.idRole);
      const requesterId = Number(req.authUser?.id);

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

      const coach = await User.findByPk(routine.idUser, { transaction: t });
      if (!coach || !isRoutineCreatorRole(coach.idRole)) {
        await t.rollback();
        return res.status(400).json({ message: 'La rutina no pertenece a un coach o gym valido.' });
      }

      if ((requesterRole === ROLE_COACH || requesterRole === ROLE_GYM) && routine.idUser !== requesterId) {
        await t.rollback();
        return res.status(403).json({ message: 'Solo puedes asignar tus propias rutinas.' });
      }

      if (requesterRole === ROLE_ADMIN && coach.idAdminOwner !== requesterId) {
        await t.rollback();
        return res.status(403).json({ message: 'Solo puedes asignar rutinas de coachs de tu grupo.' });
      }

      const athletes = await User.findAll({
        where: { id: athleteIds, idRole: ROLE_ATHLETE },
        attributes: ['id', 'idAdminOwner'],
        transaction: t,
      });

      if (athletes.length !== athleteIds.length) {
        await t.rollback();
        return res.status(404).json({ message: 'Uno o mas atletas no existen.' });
      }

      if (requesterRole === ROLE_ADMIN) {
        const outOfScope = athletes.some((athlete) => athlete.idAdminOwner !== requesterId);
        if (outOfScope) {
          await t.rollback();
          return res.status(403).json({ message: 'Solo puedes asignar atletas de tu grupo.' });
        }
      }

      if (requesterRole === ROLE_COACH || requesterRole === ROLE_GYM) {
        const outOfScope = athletes.some((athlete) => athlete.idAdminOwner !== req.authUser.idAdminOwner);
        if (outOfScope) {
          await t.rollback();
          return res.status(403).json({ message: 'Solo puedes asignar atletas de tu grupo.' });
        }
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
      const requesterRole = Number(req.authUser?.idRole);
      const requesterId = Number(req.authUser?.id);

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

      const coach = await User.findByPk(routine.idUser, { transaction: t });
      if (!coach || !isRoutineCreatorRole(coach.idRole)) {
        await t.rollback();
        return res.status(400).json({ message: 'La rutina no pertenece a un coach o gym valido.' });
      }

      if ((requesterRole === ROLE_COACH || requesterRole === ROLE_GYM) && routine.idUser !== requesterId) {
        await t.rollback();
        return res.status(403).json({ message: 'Solo puedes desasignar tus propias rutinas.' });
      }

      if (requesterRole === ROLE_ADMIN && coach.idAdminOwner !== requesterId) {
        await t.rollback();
        return res.status(403).json({ message: 'Solo puedes desasignar rutinas de coachs de tu grupo.' });
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
        message: 'Relacion rutina-atleta eliminada logicamente.',
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
      const requesterRole = Number(req.authUser?.idRole);
      const requesterId = Number(req.authUser?.id);

      if (idRoutine !== undefined) where.idRoutine = idRoutine;
      if (idAthlete !== undefined) where.idAthlete = idAthlete;

      if (requesterRole === ROLE_COACH || requesterRole === ROLE_GYM) {
        const ownRoutines = await Routine.findAll({
          where: { idUser: requesterId },
          attributes: ['id'],
        });
        where.idRoutine = { [Op.in]: ownRoutines.map((routine) => routine.id).concat([-1]) };
      }

      if (requesterRole === ROLE_ADMIN) {
        const coaches = await User.findAll({
          where: { idRole: { [Op.in]: ROUTINE_CREATOR_ROLES }, idAdminOwner: requesterId, isDeleted: false },
          attributes: ['id'],
        });
        const coachIds = coaches.map((coach) => coach.id);
        const allowedRoutines = await Routine.findAll({
          where: { idUser: { [Op.in]: coachIds.length ? coachIds : [-1] } },
          attributes: ['id'],
        });
        where.idRoutine = { [Op.in]: allowedRoutines.map((routine) => routine.id).concat([-1]) };
      }

      const assignments = await RoutineAthlete.findAll({
        where,
        include: [
          {
            model: Routine,
            attributes: ['id', 'name', 'idUser', 'order', 'time'],
            include: [
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
          },
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
      const requesterRole = Number(req.authUser?.idRole);
      const requesterId = Number(req.authUser?.id);
      const routine = await Routine.findByPk(idRoutine);
      if (!routine) {
        return res.status(404).json({ message: 'Rutina no encontrada.' });
      }
      const coach = await User.findByPk(routine.idUser);
      if (!coach || !isRoutineCreatorRole(coach.idRole)) {
        return res.status(400).json({ message: 'La rutina no pertenece a un coach o gym valido.' });
      }
      if ((requesterRole === ROLE_COACH || requesterRole === ROLE_GYM) && routine.idUser !== requesterId) {
        return res.status(403).json({ message: 'No puedes consultar rutinas de otros usuarios.' });
      }
      if (requesterRole === ROLE_ADMIN && coach.idAdminOwner !== requesterId) {
        return res.status(403).json({ message: 'No puedes consultar rutinas de otro administrador.' });
      }
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
      const requesterRole = Number(req.authUser?.idRole);
      const requesterId = Number(req.authUser?.id);
      const athlete = await User.findByPk(idAthlete);
      if (!athlete || Number(athlete.idRole) !== ROLE_ATHLETE) {
        return res.status(404).json({ message: 'Atleta no encontrado.' });
      }
      if (requesterRole === ROLE_COACH && athlete.idAdminOwner !== req.authUser.idAdminOwner) {
        return res.status(403).json({ message: 'No puedes consultar atletas de otro grupo.' });
      }
      if (requesterRole === ROLE_ADMIN && athlete.idAdminOwner !== requesterId) {
        return res.status(403).json({ message: 'No puedes consultar atletas de otro administrador.' });
      }
      const assignments = await RoutineAthlete.findAll({
        where: { idAthlete, isActive: true, isDeleted: false },
        include: [
          {
            model: Routine,
            attributes: ['id', 'name', 'idUser', 'order', 'time'],
            include: [
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
          },
          {
            model: User,
            as: 'athlete',
            attributes: { exclude: ['password'] }
          }
        ],
      });
      return res.status(200).json({ data: assignments });
    } catch (error) {
      console.error('Error getActiveAssignmentsByAthlete:', error);
      return res.status(500).json({ message: 'Error al obtener asignaciones por atleta.' });
    }
  },

  async deleteRoutine(req, res) {
    const t = await sequelize.transaction();
    try {
      const { id } = req.params;
      const requesterRole = Number(req.authUser?.idRole);
      const requesterId = Number(req.authUser?.id);
      const routine = await Routine.findByPk(id, { transaction: t });

      if (!routine) { 
        await t.rollback();
        return res.status(404).json({ message: 'Rutina no encontrada.' });
      }

      const coach = await User.findByPk(routine.idUser, { transaction: t });
      if (!coach || !isRoutineCreatorRole(coach.idRole)) {
        await t.rollback();
        return res.status(400).json({ message: 'La rutina no pertenece a un coach o gym valido.' });
      }

      if ((requesterRole === ROLE_COACH || requesterRole === ROLE_GYM) && routine.idUser !== requesterId) {
        await t.rollback();
        return res.status(403).json({ message: 'Solo puedes eliminar tus propias rutinas.' });
      }

      if (requesterRole === ROLE_ADMIN && coach.idAdminOwner !== requesterId) {
        await t.rollback();
        return res.status(403).json({ message: 'Solo puedes eliminar rutinas de coachs de tu grupo.' });
      }

      await RoutineEjercice.destroy({
        where: { idRoutine: id },
        transaction: t,
      });

      await RoutineAthlete.destroy({
        where: { idRoutine: id },
        transaction: t,
      });

      await routine.destroy({ transaction: t });

      await t.commit();
      return res.status(200).json({ message: 'Rutina eliminada correctamente.' });

    } catch (error) {
      await t.rollback();
      return res.status(500).json({ message: 'Error al eliminar la rutina.' });
    }

  }
};
