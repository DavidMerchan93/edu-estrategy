import { pool } from '../configuracion/baseDatos.js';

/**
 * Devuelve todos los tipos de actividad disponibles (quiz, parcial, proyecto, etc.).
 * @returns {Promise<Array<{ id_tipo: number, nombre: string }>>}
 */
export async function listarTiposActividad() {
  const { rows } = await pool.query(
    'SELECT id_tipo, nombre FROM tipo_actividad ORDER BY nombre'
  );
  return rows;
}

/**
 * Lista todos los hitos de una asignatura verificando que pertenece al estudiante.
 * Los resultados incluyen el nombre del tipo de actividad.
 * @param {number} idAsignatura
 * @param {number} idEstudiante
 * @returns {Promise<Array<Object>>}
 */
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

/**
 * Crea un hito verificando que la asignatura pertenece al estudiante mediante un SELECT EXISTS.
 * @param {number} idAsignatura
 * @param {number} idEstudiante
 * @param {number} idTipoActividad
 * @param {string} fechaInicio - Formato ISO (YYYY-MM-DD)
 * @param {string} fechaCierre - Formato ISO (YYYY-MM-DD)
 * @param {number} horasDedicadas
 * @param {number | null} nota - Valor entre 0 y 5, o null si aun no tiene nota
 * @returns {Promise<Object | null>} Hito creado, o null si la asignatura no existe o no pertenece al estudiante
 */
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

/**
 * Actualiza un hito verificando que pertenece al estudiante mediante JOIN con semestre.
 * @param {number} idHito
 * @param {number} idEstudiante
 * @param {number} idTipoActividad
 * @param {string} fechaInicio - Formato ISO (YYYY-MM-DD)
 * @param {string} fechaCierre - Formato ISO (YYYY-MM-DD)
 * @param {number} horasDedicadas
 * @param {number | null} nota
 * @returns {Promise<Object | null>} Hito actualizado, o null si no se encontro
 */
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

/**
 * Elimina un hito verificando que pertenece al estudiante.
 * @param {number} idHito
 * @param {number} idEstudiante
 * @returns {Promise<Object | null>} Hito eliminado, o null si no se encontro
 */
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
