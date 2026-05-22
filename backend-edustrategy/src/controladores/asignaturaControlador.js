import { pool } from '../configuracion/baseDatos.js';

export const obtenerAsignaturas = async (req, res) => {
  try {
    const { id: usuarioId } = req.usuario;

    const resultado = await pool.query(
      'SELECT * FROM asignaturas WHERE usuario_id = $1 ORDER BY id ASC',
      [usuarioId]
    );

    res.status(200).json({ asignaturas: resultado.rows });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

export const crearAsignatura = async (req, res) => {
  try {
    const { id: usuarioId } = req.usuario;
    const { nombre, docente, semestre } = req.body;

    if (!nombre || !docente || !semestre) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
    }

    const codigo = nombre.slice(0, 3).toUpperCase();

    const resultado = await pool.query(
      `INSERT INTO asignaturas (nombre, codigo, docente, semestre, nota, tiempo, hitos, usuario_id)
       VALUES ($1, $2, $3, $4, 0, 0, 0, $5)
       RETURNING *`,
      [nombre, codigo, docente, semestre, usuarioId]
    );

    res.status(201).json({
      mensaje: 'Asignatura creada correctamente',
      asignatura: resultado.rows[0],
    });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

export const actualizarAsignatura = async (req, res) => {
  try {
    const { id: usuarioId } = req.usuario;
    const { id } = req.params;
    const { nombre, docente, semestre } = req.body;

    if (!nombre || !docente || !semestre) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
    }

    const codigo = nombre.slice(0, 3).toUpperCase();

    const resultado = await pool.query(
      `UPDATE asignaturas
       SET nombre = $1, codigo = $2, docente = $3, semestre = $4
       WHERE id = $5 AND usuario_id = $6
       RETURNING *`,
      [nombre, codigo, docente, semestre, id, usuarioId]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Asignatura no encontrada' });
    }

    res.status(200).json({
      mensaje: 'Asignatura actualizada correctamente',
      asignatura: resultado.rows[0],
    });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

export const eliminarAsignatura = async (req, res) => {
  try {
    const { id: usuarioId } = req.usuario;
    const { id } = req.params;

    const resultado = await pool.query(
      'DELETE FROM asignaturas WHERE id = $1 AND usuario_id = $2 RETURNING *',
      [id, usuarioId]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Asignatura no encontrada' });
    }

    res.status(200).json({ mensaje: 'Asignatura eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};