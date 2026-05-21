import { pool } from '../configuracion/baseDatos.js';

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

export async function getSemestreActivo(idEstudiante) {
  const { rows } = await pool.query(
    `SELECT id_semestre, nombre FROM semestre
     WHERE id_estudiante = $1 AND activo = TRUE
     LIMIT 1`,
    [idEstudiante]
  );
  return rows[0] || null;
}
