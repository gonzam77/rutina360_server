const { Note, Comment, sequelize } = require('../models');

const getErrorStatus = (error) => [
  'SequelizeValidationError',
  'SequelizeUniqueConstraintError',
  'SequelizeForeignKeyConstraintError',
].includes(error?.name) ? 400 : 500;

const getErrorMessage = (error) =>
  (Array.isArray(error?.errors) && error.errors.length > 0)
    ? error.errors.map((e) => e.message).join(', ')
    : 'Error interno.';

module.exports = {
  async createNote(req, res) {
    const t = await sequelize.transaction();
    try {
      const { name, idUser, initialComment } = req.body;
      const note = await Note.create({ name, idUser }, { transaction: t });

      if (initialComment) {
        await Comment.create({ idNote: note.id }, { transaction: t });
      }

      await t.commit();
      return res.status(201).json({ message: 'Nota creada.', data: note });
    } catch (error) {
      await t.rollback();
      return res.status(getErrorStatus(error)).json({ message: getErrorMessage(error) });
    }
  },

  async getNotes(req, res) {
    try {
      const notes = await Note.findAll({
        include: [{ model: Comment }],
      });
      return res.status(200).json({ data: notes });
    } catch (error) {
      return res.status(500).json({ message: 'Error al obtener notas.' });
    }
  },

  async addCommentToNote(req, res) {
    try {
      const { id } = req.params;
      const comment = await Comment.create({ idNote: id });
      return res.status(201).json({ message: 'Comentario añadido.', data: comment });
    } catch (error) {
      return res.status(getErrorStatus(error)).json({ message: getErrorMessage(error) });
    }
  },

  async getNoteById(req, res) {
    try {
      const { id } = req.params;
      const note = await Note.findByPk(id, {
        include: [{ model: Comment }],
      });
      if (!note) return res.status(404).json({ message: 'Nota no encontrada.' });
      return res.status(200).json({ data: note });
    } catch (error) {
      return res.status(500).json({ message: 'Error al obtener la nota.' });
    }
  },

  async updateNote(req, res) {
    try {
      const { id } = req.params;
      const note = await Note.findByPk(id);
      if (!note) return res.status(404).json({ message: 'Nota no encontrada.' });
      await note.update(req.body);
      return res.status(200).json({ message: 'Nota actualizada.', data: note });
    } catch (error) {
      return res.status(getErrorStatus(error)).json({ message: getErrorMessage(error) });
    }
  },

  async deleteNote(req, res) {
    try {
      const { id } = req.params;
      await Note.destroy({ where: { id } });
      return res.status(200).json({ message: 'Nota eliminada.' });
    } catch (error) {
      return res.status(500).json({ message: 'Error al eliminar.' });
    }
  },
};
