import { pool } from '../configuracion/baseDatos.js';

/**
 * @openapi
 * /api/salud:
 *   get:
 *     tags:
 *       - Salud
 *     summary: Verifica que el servidor esté funcionando
 *     responses:
 *       200:
 *         description: Servidor funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 estado:
 *                   type: string
 *                   example: OK
 *                 mensaje:
 *                   type: string
 *                   example: Servidor EDU-STRATEGY funcionando correctamente
 */
/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {void}
 */
export const verificarServidor = (req, res) => {
  res.json({
    estado: 'OK',
    mensaje: 'Servidor EDU-STRATEGY funcionando correctamente',
  });
};

/**
 * @openapi
 * /api/salud/base-datos:
 *   get:
 *     tags:
 *       - Salud
 *     summary: Verifica la conexión a la base de datos PostgreSQL
 *     responses:
 *       200:
 *         description: Conexión exitosa a PostgreSQL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 estado:
 *                   type: string
 *                   example: OK
 *                 mensaje:
 *                   type: string
 *                   example: Conexión exitosa a PostgreSQL
 *                 fechaServidor:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Error de conexión
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               estado: ERROR
 *               mensaje: Error al conectar con PostgreSQL
 *               detalle: Connection refused
 */
/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
export const verificarBaseDatos = async (req, res) => {
  try {
    const resultado = await pool.query('SELECT NOW()');

    res.json({
      estado: 'OK',
      mensaje: 'Conexión exitosa a PostgreSQL',
      fechaServidor: resultado.rows[0].now,
    });
  } catch (error) {
    res.status(500).json({
      estado: 'ERROR',
      mensaje: 'Error al conectar con PostgreSQL',
      detalle: error.message,
    });
  }
};