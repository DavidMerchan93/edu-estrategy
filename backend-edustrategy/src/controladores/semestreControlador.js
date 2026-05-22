import {
  desactivarSemestresActivosDB,
  crearSemestreDB,
} from '../consultas/semestreConsultas.js';

export const crearSemestre = async (req, res) => {
  try {
    const { id_estudiante } = req.usuario;
    const { nombre, fecha_inicio, fecha_fin, activo } = req.body;

    if (!nombre || !fecha_inicio || !fecha_fin) {
      return res.status(400).json({
        mensaje: 'Nombre, fecha de inicio y fecha de fin son obligatorios',
      });
    }

    const esActivo = activo === true;

    if (esActivo) {
      await desactivarSemestresActivosDB(id_estudiante);
    }

    const semestre = await crearSemestreDB(
      id_estudiante,
      nombre.trim(),
      fecha_inicio,
      fecha_fin,
      esActivo
    );

    res.status(201).json({
      mensaje: 'Semestre creado correctamente',
      semestre,
    });
  } catch (error) {
    console.error('[crearSemestre]', error);
    res.status(500).json({ mensaje: error.message });
  }
};
