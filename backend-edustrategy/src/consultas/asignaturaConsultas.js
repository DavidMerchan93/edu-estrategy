import { pool } from '../configuracion/baseDatos.js';

/**
 * Devuelve el semestre activo del estudiante, o null si no tiene ninguno.
 * @param {number} idEstudiante
 * @returns {Promise<{ id_semestre: number } | null>}
 */
export async function getSemestreActivoPorEstudiante(idEstudiante) {
  const { rows } = await pool.query(
    `SELECT id_semestre FROM semestre
     WHERE id_estudiante = $1 AND activo = TRUE
     LIMIT 1`,
    [idEstudiante]
  );
  return rows[0] || null;
}

/**
 * Inserta una nueva asignatura en la base de datos.
 * @param {number} idSemestre
 * @param {string} nombre
 * @param {string} nombreDocente
 * @returns {Promise<Object>} Fila de la asignatura creada
 */
export async function crearAsignaturaDB(idSemestre, nombre, nombreDocente) {
  const { rows } = await pool.query(
    `INSERT INTO asignatura (id_semestre, nombre, nombre_docente)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [idSemestre, nombre, nombreDocente]
  );
  return rows[0];
}

/**
 * Actualiza el nombre y el docente de una asignatura verificando que pertenece al estudiante.
 * El JOIN con `semestre` garantiza la propiedad del recurso.
 * @param {number} idAsignatura
 * @param {number} idEstudiante
 * @param {string} nombre
 * @param {string} nombreDocente
 * @returns {Promise<Object | null>} Fila actualizada, o null si no se encontro o no pertenece al estudiante
 */
export async function actualizarAsignaturaDB(
  idAsignatura,
  idEstudiante,
  nombre,
  nombreDocente
) {
  const { rows } = await pool.query(
    `UPDATE asignatura a
     SET nombre = $1, nombre_docente = $2
     FROM semestre s
     WHERE a.id_asignatura = $3
       AND a.id_semestre = s.id_semestre
       AND s.id_estudiante = $4
     RETURNING a.*`,
    [nombre, nombreDocente, idAsignatura, idEstudiante]
  );
  return rows[0] || null;
}

/**
 * Elimina una asignatura verificando que pertenece al estudiante.
 * @param {number} idAsignatura
 * @param {number} idEstudiante
 * @returns {Promise<Object | null>} Fila eliminada, o null si no se encontro o no pertenece al estudiante
 */
export async function eliminarAsignaturaDB(idAsignatura, idEstudiante) {
  const { rows } = await pool.query(
    `DELETE FROM asignatura a
     USING semestre s
     WHERE a.id_asignatura = $1
       AND a.id_semestre = s.id_semestre
       AND s.id_estudiante = $2
     RETURNING a.*`,
    [idAsignatura, idEstudiante]
  );
  return rows[0] || null;
}
