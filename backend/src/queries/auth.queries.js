const pool = require('../db/pool');

async function findCredencialByEmail(email) {
  const { rows } = await pool.query(
    `SELECT
       c.id_credencial,
       c.email,
       c.password_hash,
       c.rol,
       c.intentos_login,
       c.bloqueado,
       e.id_estudiante,
       e.identificacion,
       e.nombre_completo,
       e.carrera,
       e.semestre_actual,
       e.fecha_ingreso,
       s.id_semestre,
       s.nombre AS semestre_nombre
     FROM credencial c
     LEFT JOIN estudiante e ON e.id_credencial = c.id_credencial
     LEFT JOIN semestre s
       ON s.id_estudiante = e.id_estudiante AND s.activo = TRUE
     WHERE c.email = $1`,
    [email]
  );
  return rows[0] || null;
}

async function incrementarIntentosLogin(idCredencial) {
  await pool.query(
    `UPDATE credencial
     SET intentos_login = intentos_login + 1,
         bloqueado = (intentos_login + 1 >= 5)
     WHERE id_credencial = $1`,
    [idCredencial]
  );
}

async function resetearIntentosLogin(idCredencial) {
  await pool.query(
    `UPDATE credencial
     SET intentos_login = 0, bloqueado = FALSE
     WHERE id_credencial = $1`,
    [idCredencial]
  );
}

module.exports = {
  findCredencialByEmail,
  incrementarIntentosLogin,
  resetearIntentosLogin,
};
