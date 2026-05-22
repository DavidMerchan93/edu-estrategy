import { pool } from '../configuracion/baseDatos.js';

export async function desactivarSemestresActivosDB(idEstudiante) {
  await pool.query(
    `UPDATE semestre SET activo = FALSE
     WHERE id_estudiante = $1 AND activo = TRUE`,
    [idEstudiante]
  );
}

export async function crearSemestreDB(idEstudiante, nombre, fechaInicio, fechaFin, activo) {
  const { rows } = await pool.query(
    `INSERT INTO semestre (id_estudiante, nombre, fecha_inicio, fecha_fin, activo)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [idEstudiante, nombre, fechaInicio, fechaFin, activo]
  );
  return rows[0];
}
