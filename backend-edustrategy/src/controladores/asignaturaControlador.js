import {
  getSemestreActivoPorEstudiante,
  crearAsignaturaDB,
  actualizarAsignaturaDB,
  eliminarAsignaturaDB,
} from '../consultas/asignaturaConsultas.js';

/**
 * Crea una asignatura en el semestre activo del estudiante autenticado.
 * Responde 400 si faltan campos, 404 si no hay semestre activo, 201 si tiene exito.
 * @param {import('express').Request} req - Body: { nombre, docente }
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
export const crearAsignatura = async (req, res) => {
  try {
    const { id_estudiante } = req.usuario;
    const { nombre, docente } = req.body;

    if (!nombre || !docente) {
      return res
        .status(400)
        .json({ mensaje: 'Nombre y docente son obligatorios' });
    }

    const semestre = await getSemestreActivoPorEstudiante(id_estudiante);
    if (!semestre) {
      return res.status(404).json({ mensaje: 'No tienes un semestre activo' });
    }

    const asignatura = await crearAsignaturaDB(
      semestre.id_semestre,
      nombre.trim(),
      docente.trim()
    );

    res.status(201).json({
      mensaje: 'Asignatura creada correctamente',
      asignatura,
    });
  } catch (error) {
    console.error('[crearAsignatura]', error);
    res.status(500).json({ mensaje: error.message });
  }
};

/**
 * Actualiza el nombre y el docente de una asignatura del estudiante autenticado.
 * Responde 400 si faltan campos, 404 si no existe o no pertenece al estudiante.
 * @param {import('express').Request} req - Params: { id }; Body: { nombre, docente }
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
export const actualizarAsignatura = async (req, res) => {
  try {
    const { id_estudiante } = req.usuario;
    const { id } = req.params;
    const { nombre, docente } = req.body;

    if (!nombre || !docente) {
      return res
        .status(400)
        .json({ mensaje: 'Nombre y docente son obligatorios' });
    }

    const asignatura = await actualizarAsignaturaDB(
      id,
      id_estudiante,
      nombre.trim(),
      docente.trim()
    );

    if (!asignatura) {
      return res.status(404).json({ mensaje: 'Asignatura no encontrada' });
    }

    res.status(200).json({
      mensaje: 'Asignatura actualizada correctamente',
      asignatura,
    });
  } catch (error) {
    console.error('[actualizarAsignatura]', error);
    res.status(500).json({ mensaje: error.message });
  }
};

/**
 * Elimina una asignatura del estudiante autenticado.
 * Responde 404 si no existe o no pertenece al estudiante.
 * @param {import('express').Request} req - Params: { id }
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
export const eliminarAsignatura = async (req, res) => {
  try {
    const { id_estudiante } = req.usuario;
    const { id } = req.params;

    const asignatura = await eliminarAsignaturaDB(id, id_estudiante);

    if (!asignatura) {
      return res.status(404).json({ mensaje: 'Asignatura no encontrada' });
    }

    res.status(200).json({ mensaje: 'Asignatura eliminada correctamente' });
  } catch (error) {
    console.error('[eliminarAsignatura]', error);
    res.status(500).json({ mensaje: error.message });
  }
};
