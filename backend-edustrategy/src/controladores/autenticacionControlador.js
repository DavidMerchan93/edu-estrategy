import {
  registrarUsuario,
  iniciarSesion,
} from '../servicios/autenticacionServicio.js';

/**
 * @openapi
 * /api/autenticacion/registro:
 *   post:
 *     tags:
 *       - Autenticación
 *     summary: Registra un nuevo usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegistroRequest'
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Usuario registrado correctamente
 *                 usuario:
 *                   $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Campos obligatorios faltantes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               mensaje: Todos los campos son obligatorios
 *       409:
 *         description: El correo ya está registrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               mensaje: El correo ya está registrado
 */
/**
 * @param {import('express').Request} req - Body: campos de registro del estudiante
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
export const registro = async (req, res) => {
  try {
    const usuario = await registrarUsuario(req.body);

    res.status(201).json({
      mensaje: 'Usuario registrado correctamente',
      usuario,
    });
  } catch (error) {
    console.error('[registro] error:', error);
    res.status(error.statusCode || 500).json({
      mensaje: error.message,
    });
  }
};

/**
 * @openapi
 * /api/autenticacion/login:
 *   post:
 *     tags:
 *       - Autenticación
 *     summary: Inicia sesión y obtiene un token JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Inicio de sesión exitoso
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIs...
 *                 usuario:
 *                   $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Correo y contraseña obligatorios
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               mensaje: Correo y contraseña obligatorios
 *       401:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               mensaje: Credenciales inválidas
 *       403:
 *         description: Usuario bloqueado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               mensaje: Usuario bloqueado
 */
/**
 * @param {import('express').Request} req - Body: { email, password }
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
export const login = async (req, res) => {
  try {
    const data = await iniciarSesion(req.body);

    res.status(200).json({
      mensaje: 'Inicio de sesión exitoso',
      token: data.token,
      usuario: data.usuario,
    });
  } catch (error) {
    console.error('[login] error:', error);
    res.status(error.statusCode || 500).json({
      mensaje: error.message,
    });
  }
};