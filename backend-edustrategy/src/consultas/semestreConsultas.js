import { pool } from '../configuracion/baseDatos.js';

/**
 * Marca todos los semestres activos de un estudiante como inactivos.
 * Se llama antes de activar un nuevo semestre para garantizar unicidad.
 * @param {number} idEstudiante
 * @returns {Promise<void>}
 */
export async function desactivarSemestresActivosDB(idEstudiante) {
  await pool.query(
    `UPDATE semestre SET activo = FALSE
     WHERE id_estudiante = $1 AND activo = TRUE`,
    [idEstudiante]
  );
}

/**
 * Inserta un nuevo semestre en la base de datos.
 * @param {number} idEstudiante
 * @param {string} nombre - Identificador del semestre (ej. "2026-1")
 * @param {string} fechaInicio - Formato ISO (YYYY-MM-DD)
 * @param {string} fechaFin - Formato ISO (YYYY-MM-DD)
 * @param {boolean} activo
 * @returns {Promise<Object>} Fila del semestre creado
 */
export async function crearSemestreDB(idEstudiante, nombre, fechaInicio, fechaFin, activo) {
  const { rows } = await pool.query(
    `INSERT INTO semestre (id_estudiante, nombre, fecha_inicio, fecha_fin, activo)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [idEstudiante, nombre, fechaInicio, fechaFin, activo]
  );
  return rows[0];
}
