import {
  listarTiposActividad,
  listarHitosPorAsignatura,
  crearHitoDB,
  actualizarHitoDB,
  eliminarHitoDB,
} from '../consultas/hitoConsultas.js';

/**
 * Devuelve la lista de todos los tipos de actividad disponibles (quiz, parcial, proyecto, etc.).
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
export const getTiposActividad = async (req, res) => {
  try {
    const tipos = await listarTiposActividad();
    res.json(tipos);
  } catch (error) {
    console.error('[getTiposActividad]', error);
    res.status(500).json({ mensaje: error.message });
  }
};

/**
 * Lista todos los hitos de una asignatura del estudiante autenticado.
 * @param {import('express').Request} req - Params: { idAsignatura }
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
export const listarHitos = async (req, res) => {
  try {
    const { id_estudiante } = req.usuario;
    const { idAsignatura } = req.params;

    const hitos = await listarHitosPorAsignatura(idAsignatura, id_estudiante);
    res.json(hitos);
  } catch (error) {
    console.error('[listarHitos]', error);
    res.status(500).json({ mensaje: error.message });
  }
};

/**
 * Crea un hito para una asignatura del estudiante autenticado.
 * Valida campos obligatorios, rango de horas, rango de fechas y rango de nota (0-5).
 * Responde 400 en validaciones fallidas, 404 si la asignatura no existe, 201 si tiene exito.
 * @param {import('express').Request} req - Params: { idAsignatura }; Body: { id_tipo_actividad, fecha_inicio, fecha_cierre, horas_dedicadas, nota? }
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
export const crearHito = async (req, res) => {
  try {
    const { id_estudiante } = req.usuario;
    const { idAsignatura } = req.params;
    const { id_tipo_actividad, fecha_inicio, fecha_cierre, horas_dedicadas, nota } = req.body;

    if (!id_tipo_actividad || !fecha_inicio || !fecha_cierre || !horas_dedicadas) {
      return res.status(400).json({
        mensaje: 'Tipo de actividad, fecha de inicio, fecha de cierre y horas dedicadas son obligatorios',
      });
    }

    if (Number(horas_dedicadas) <= 0) {
      return res.status(400).json({ mensaje: 'Las horas dedicadas deben ser mayores a 0' });
    }

    if (new Date(fecha_cierre) < new Date(fecha_inicio)) {
      return res.status(400).json({ mensaje: 'La fecha de cierre debe ser posterior o igual a la de inicio' });
    }

    const notaValor = nota !== undefined && nota !== null && nota !== '' ? parseFloat(nota) : null;
    if (notaValor !== null && (notaValor < 0 || notaValor > 5)) {
      return res.status(400).json({ mensaje: 'La nota debe estar entre 0.00 y 5.00' });
    }

    const hito = await crearHitoDB(
      idAsignatura,
      id_estudiante,
      id_tipo_actividad,
      fecha_inicio,
      fecha_cierre,
      horas_dedicadas,
      notaValor
    );

    if (!hito) {
      return res.status(404).json({ mensaje: 'Asignatura no encontrada' });
    }

    res.status(201).json({
      mensaje: 'Hito creado correctamente',
      hito,
    });
  } catch (error) {
    console.error('[crearHito]', error);
    res.status(500).json({ mensaje: error.message });
  }
};

/**
 * Actualiza un hito del estudiante autenticado aplicando las mismas validaciones que crearHito.
 * Responde 404 si el hito no existe o no pertenece al estudiante.
 * @param {import('express').Request} req - Params: { idHito }; Body: { id_tipo_actividad, fecha_inicio, fecha_cierre, horas_dedicadas, nota? }
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
export const actualizarHito = async (req, res) => {
  try {
    const { id_estudiante } = req.usuario;
    const { idHito } = req.params;
    const { id_tipo_actividad, fecha_inicio, fecha_cierre, horas_dedicadas, nota } = req.body;

    if (!id_tipo_actividad || !fecha_inicio || !fecha_cierre || !horas_dedicadas) {
      return res.status(400).json({
        mensaje: 'Tipo de actividad, fecha de inicio, fecha de cierre y horas dedicadas son obligatorios',
      });
    }

    if (Number(horas_dedicadas) <= 0) {
      return res.status(400).json({ mensaje: 'Las horas dedicadas deben ser mayores a 0' });
    }

    if (new Date(fecha_cierre) < new Date(fecha_inicio)) {
      return res.status(400).json({ mensaje: 'La fecha de cierre debe ser posterior o igual a la de inicio' });
    }

    const notaValor = nota !== undefined && nota !== null && nota !== '' ? parseFloat(nota) : null;
    if (notaValor !== null && (notaValor < 0 || notaValor > 5)) {
      return res.status(400).json({ mensaje: 'La nota debe estar entre 0.00 y 5.00' });
    }

    const hito = await actualizarHitoDB(
      idHito,
      id_estudiante,
      id_tipo_actividad,
      fecha_inicio,
      fecha_cierre,
      horas_dedicadas,
      notaValor
    );

    if (!hito) {
      return res.status(404).json({ mensaje: 'Hito no encontrado' });
    }

    res.json({
      mensaje: 'Hito actualizado correctamente',
      hito,
    });
  } catch (error) {
    console.error('[actualizarHito]', error);
    res.status(500).json({ mensaje: error.message });
  }
};

/**
 * Elimina un hito del estudiante autenticado.
 * Responde 404 si el hito no existe o no pertenece al estudiante.
 * @param {import('express').Request} req - Params: { idHito }
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
export const eliminarHito = async (req, res) => {
  try {
    const { id_estudiante } = req.usuario;
    const { idHito } = req.params;

    const hito = await eliminarHitoDB(idHito, id_estudiante);

    if (!hito) {
      return res.status(404).json({ mensaje: 'Hito no encontrado' });
    }

    res.json({ mensaje: 'Hito eliminado correctamente' });
  } catch (error) {
    console.error('[eliminarHito]', error);
    res.status(500).json({ mensaje: error.message });
  }
};
