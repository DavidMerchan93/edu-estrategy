import {
  listarTiposActividad,
  listarHitosPorAsignatura,
  crearHitoDB,
  actualizarHitoDB,
  eliminarHitoDB,
} from '../consultas/hitoConsultas.js';

export const getTiposActividad = async (req, res) => {
  try {
    const tipos = await listarTiposActividad();
    res.json(tipos);
  } catch (error) {
    console.error('[getTiposActividad]', error);
    res.status(500).json({ mensaje: error.message });
  }
};

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

export const crearHito = async (req, res) => {
  try {
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
      id_tipo_actividad,
      fecha_inicio,
      fecha_cierre,
      horas_dedicadas,
      notaValor
    );

    res.status(201).json({
      mensaje: 'Hito creado correctamente',
      hito,
    });
  } catch (error) {
    console.error('[crearHito]', error);
    res.status(500).json({ mensaje: error.message });
  }
};

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
