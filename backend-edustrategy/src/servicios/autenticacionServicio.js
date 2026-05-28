import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../configuracion/baseDatos.js';

/**
 * Registra un nuevo estudiante en la base de datos.
 * Valida que todos los campos esten presentes, verifica que el correo no exista,
 * hashea la contrasena con bcrypt y crea los registros en `credencial` y `estudiante`.
 * @param {Object} data - Datos del formulario de registro
 * @param {string} data.nombre_completo
 * @param {string} data.email
 * @param {string} data.password
 * @param {string} data.identificacion
 * @param {string} data.carrera
 * @param {number} data.semestre_actual
 * @param {string} data.fecha_ingreso - Formato ISO (YYYY-MM-DD)
 * @returns {Promise<Object>} Fila del estudiante recien creado
 * @throws {{ statusCode: 400 }} Si faltan campos obligatorios
 * @throws {{ statusCode: 409 }} Si el correo ya esta registrado
 */
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

/**
 * Autentica a un estudiante y devuelve un token JWT.
 * Verifica credenciales, controla el bloqueo por intentos fallidos (maximo 3)
 * y genera un JWT con expiracion de 1 hora.
 * @param {Object} params
 * @param {string} params.email
 * @param {string} params.password
 * @returns {Promise<{ token: string, usuario: Object }>} Token JWT y datos basicos del usuario
 * @throws {{ statusCode: 400 }} Si el correo o la contrasena estan vacios
 * @throws {{ statusCode: 401 }} Si las credenciales son invalidas
 * @throws {{ statusCode: 403 }} Si la cuenta esta bloqueada
 */
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
    usuario: {
      id_estudiante: user.id_estudiante,
      nombre_completo: user.nombre_completo,
      email: user.email,
      carrera: user.carrera,
      semestre_actual: user.semestre_actual,
      fecha_ingreso: user.fecha_ingreso,
      rol: user.rol,
    },
  };
};