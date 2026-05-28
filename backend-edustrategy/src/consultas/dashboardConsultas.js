import { pool } from '../configuracion/baseDatos.js';

/**
 * Obtiene todas las asignaturas de un semestre con sus metricas agregadas
 * (cantidad de hitos, nota promedio y total de horas dedicadas).
 * @param {number} idSemestre
 * @returns {Promise<Array<{
 *   id_asignatura: number, nombre: string, nombre_docente: string,
 *   hitos: string, nota: string, tiempo: string
 * }>>}
 */
export async function getAsignaturasPorSemestre(idSemestre) {
  const { rows } = await pool.query(
    `SELECT
       a.id_asignatura,
       a.nombre,
       a.nombre_docente,
       COUNT(h.id_hito)                           AS hitos,
       COALESCE(AVG(h.nota), 0)::numeric(4,2)     AS nota,
       COALESCE(SUM(h.horas_dedicadas), 0)         AS tiempo
     FROM asignatura a
     LEFT JOIN hito h ON h.id_asignatura = a.id_asignatura
     WHERE a.id_semestre = $1
     GROUP BY a.id_asignatura, a.nombre, a.nombre_docente
     ORDER BY a.nombre`,
    [idSemestre]
  );
  return rows;
}

/**
 * Devuelve el semestre marcado como activo para un estudiante, o null si no existe.
 * @param {number} idEstudiante
 * @returns {Promise<{ id_semestre: number, nombre: string } | null>}
 */
export async function getSemestreActivo(idEstudiante) {
  const { rows } = await pool.query(
    `SELECT id_semestre, nombre FROM semestre
     WHERE id_estudiante = $1 AND activo = TRUE
     LIMIT 1`,
    [idEstudiante]
  );
  return rows[0] || null;
}
