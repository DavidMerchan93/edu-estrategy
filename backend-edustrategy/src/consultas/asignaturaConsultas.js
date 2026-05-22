import { pool } from '../configuracion/baseDatos.js';

export async function getSemestreActivoPorEstudiante(idEstudiante) {
  const { rows } = await pool.query(
    `SELECT id_semestre FROM semestre
     WHERE id_estudiante = $1 AND activo = TRUE
     LIMIT 1`,
    [idEstudiante]
  );
  return rows[0] || null;
}

export async function crearAsignaturaDB(idSemestre, nombre, nombreDocente) {
  const { rows } = await pool.query(
    `INSERT INTO asignatura (id_semestre, nombre, nombre_docente)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [idSemestre, nombre, nombreDocente]
  );
  return rows[0];
}

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
