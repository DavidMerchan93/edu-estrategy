import { pool } from '../configuracion/baseDatos.js';

export async function getHistorialSemestresDB(idEstudiante) {
  const { rows } = await pool.query(
    `SELECT
       s.id_semestre,
       s.nombre,
       s.activo,
       COUNT(DISTINCT a.id_asignatura)::int AS total_asignaturas,
       COALESCE(AVG(h.nota), 0)::numeric(4,2) AS promedio,
       COALESCE(SUM(h.horas_dedicadas), 0)::int AS tiempo_total
     FROM semestre s
     LEFT JOIN asignatura a ON a.id_semestre = s.id_semestre
     LEFT JOIN hito h ON h.id_asignatura = a.id_asignatura
     WHERE s.id_estudiante = $1
     GROUP BY s.id_semestre, s.nombre, s.activo, s.fecha_inicio
     ORDER BY s.fecha_inicio DESC`,
    [idEstudiante]
  );
  return rows;
}
