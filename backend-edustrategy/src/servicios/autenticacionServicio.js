import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../configuracion/baseDatos.js';

export const registrarUsuario = async (data) => {
  const {
    nombre_completo,
    email,
    password,
    identificacion,
    carrera,
    semestre_actual,
    fecha_ingreso,
  } = data;

  if (
    !nombre_completo ||
    !email ||
    !password ||
    !identificacion ||
    !carrera ||
    !semestre_actual ||
    !fecha_ingreso
  ) {
    throw { statusCode: 400, message: 'Todos los campos son obligatorios' };
  }

  const existe = await pool.query(
    'SELECT id_credencial FROM credencial WHERE email = $1',
    [email]
  );

  if (existe.rows.length > 0) {
    throw { statusCode: 409, message: 'El correo ya está registrado' };
  }

  const hash = await bcrypt.hash(password, 10);

  const credencial = await pool.query(
    `INSERT INTO credencial 
    (email, password_hash, rol, intentos_login, bloqueado)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id_credencial`,
    [email, hash, 'estudiante', 0, false]
  );

  const idCredencial = credencial.rows[0].id_credencial;

  const estudiante = await pool.query(
    `INSERT INTO estudiante
    (id_credencial, identificacion, nombre_completo, carrera, semestre_actual, fecha_ingreso)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *`,
    [
      idCredencial,
      identificacion,
      nombre_completo,
      carrera,
      semestre_actual,
      fecha_ingreso,
    ]
  );

  return estudiante.rows[0];
};

export const iniciarSesion = async ({ email, password }) => {
  if (!email || !password) {
    throw { statusCode: 400, message: 'Correo y contraseña obligatorios' };
  }

  const result = await pool.query(
    `SELECT e.*, c.email, c.password_hash, c.rol, c.intentos_login, c.bloqueado
     FROM estudiante e
     JOIN credencial c ON e.id_credencial = c.id_credencial
     WHERE c.email = $1`,
    [email]
  );

  if (result.rows.length === 0) {
    throw { statusCode: 401, message: 'Credenciales inválidas' };
  }

  const user = result.rows[0];

  if (user.bloqueado) {
    throw { statusCode: 403, message: 'Usuario bloqueado' };
  }

  const valida = await bcrypt.compare(password, user.password_hash);

  if (!valida) {
    await pool.query(
      `UPDATE credencial 
       SET intentos_login = intentos_login + 1,
           bloqueado = CASE WHEN intentos_login + 1 >= 3 THEN true ELSE bloqueado END
       WHERE id_credencial = $1`,
      [user.id_credencial]
    );

    throw { statusCode: 401, message: 'Credenciales inválidas' };
  }

  await pool.query(
    `UPDATE credencial SET intentos_login = 0 WHERE id_credencial = $1`,
    [user.id_credencial]
  );

  const token = jwt.sign(
    {
      id_estudiante: user.id_estudiante,
      email: user.email,
      rol: user.rol,
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  return {
    token,
    usuario: user,
  };
};