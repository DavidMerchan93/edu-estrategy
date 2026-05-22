import { pool } from '../configuracion/baseDatos.js';

export async function listarTiposActividad() {
  const { rows } = await pool.query(
    'SELECT id_tipo, nombre FROM tipo_actividad ORDER BY nombre'
  );
  return rows;
}

export async function listarHitosPorAsignatura(idAsignatura, idEstudiante) {
  const { rows } = await pool.query(
    `SELECT h.*, t.nombre AS tipo_nombre
     FROM hito h
     JOIN tipo_actividad t ON t.id_tipo = h.id_tipo_actividad
     JOIN asignatura a ON a.id_asignatura = h.id_asignatura
     JOIN semestre s ON s.id_semestre = a.id_semestre
     WHERE h.id_asignatura = $1 AND s.id_estudiante = $2
     ORDER BY h.fecha_inicio DESC`,
    [idAsignatura, idEstudiante]
  );
  return rows;
}

export async function crearHitoDB(
  idAsignatura,
  idEstudiante,
  idTipoActividad,
  fechaInicio,
  fechaCierre,
  horasDedicadas,
  nota
) {
  const { rows } = await pool.query(
    `INSERT INTO hito (id_asignatura, id_tipo_actividad, fecha_inicio, fecha_cierre, horas_dedicadas, nota)
     SELECT $1, $2, $3, $4, $5, $6
     WHERE EXISTS (
       SELECT 1 FROM asignatura a
       JOIN semestre s ON s.id_semestre = a.id_semestre
       WHERE a.id_asignatura = $7 AND s.id_estudiante = $8
     )
     RETURNING *`,
    [idAsignatura, idTipoActividad, fechaInicio, fechaCierre, horasDedicadas, nota, idAsignatura, idEstudiante]
  );
  return rows[0] || null;
}

export async function actualizarHitoDB(
  idHito,
  idEstudiante,
  idTipoActividad,
  fechaInicio,
  fechaCierre,
  horasDedicadas,
  nota
) {
  const { rows } = await pool.query(
    `UPDATE hito h
     SET id_tipo_actividad = $1,
         fecha_inicio = $2,
         fecha_cierre = $3,
         horas_dedicadas = $4,
         nota = $5
     FROM asignatura a
     JOIN semestre s ON s.id_semestre = a.id_semestre
     WHERE h.id_hito = $6
       AND h.id_asignatura = a.id_asignatura
       AND s.id_estudiante = $7
     RETURNING h.*`,
    [idTipoActividad, fechaInicio, fechaCierre, horasDedicadas, nota, idHito, idEstudiante]
  );
  return rows[0] || null;
}

export async function eliminarHitoDB(idHito, idEstudiante) {
  const { rows } = await pool.query(
    `DELETE FROM hito h
     USING asignatura a, semestre s
     WHERE h.id_hito = $1
       AND h.id_asignatura = a.id_asignatura
       AND a.id_semestre = s.id_semestre
       AND s.id_estudiante = $2
     RETURNING h.*`,
    [idHito, idEstudiante]
  );
  return rows[0] || null;
}
