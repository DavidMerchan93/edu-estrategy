import { pool } from "../configuracion/baseDatos.js";

/**
 * @openapi
 * /api/usuario/perfil:
 *   get:
 *     tags:
 *       - Usuario
 *     summary: Obtiene el perfil del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Perfil obtenido
 *                 usuario:
 *                   type: object
 *                   properties:
 *                     nombre_completo:
 *                       type: string
 *                     carrera:
 *                       type: string
 *                     semestre_actual:
 *                       type: integer
 *                     email:
 *                       type: string
 *       401:
 *         description: Token requerido o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               mensaje: Token requerido
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               mensaje: Usuario no encontrado
 */
export const obtenerPerfil = async (req, res) => {
  try {
    const id = req.usuario.id_estudiante;

    const resultado = await pool.query(
      `SELECT e.nombre_completo, e.carrera, e.semestre_actual, c.email
       FROM estudiante e
       JOIN credencial c ON e.id_credencial = c.id_credencial
       WHERE e.id_estudiante = $1`,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensaje: "Usuario no encontrado",
      });
    }

    return res.json({
      mensaje: "Perfil obtenido",
      usuario: resultado.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      mensaje: "Error al obtener perfil",
      error: error.message,
    });
  }
};

/**
 * @openapi
 * /api/usuario/perfil:
 *   put:
 *     tags:
 *       - Usuario
 *     summary: Actualiza el perfil del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ActualizarPerfilRequest'
 *     responses:
 *       200:
 *         description: Perfil actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Perfil actualizado correctamente
 *                 usuario:
 *                   $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Campos obligatorios faltantes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               mensaje: Nombre completo, carrera y semestre actual son obligatorios
 *       401:
 *         description: Token requerido o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               mensaje: Token requerido
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               mensaje: Usuario no encontrado
 */
export const actualizarPerfil = async (req, res) => {
  try {
    const id = req.usuario.id_estudiante;
    const { nombre_completo, carrera, semestre_actual } = req.body;

    if (!nombre_completo || !carrera || !semestre_actual) {
      return res.status(400).json({
        mensaje: "Nombre completo, carrera y semestre actual son obligatorios",
      });
    }

    const resultado = await pool.query(
      `UPDATE estudiante
       SET nombre_completo = $1,
           carrera = $2,
           semestre_actual = $3
       WHERE id_estudiante = $4
       RETURNING id_estudiante, identificacion, nombre_completo, carrera, semestre_actual, fecha_ingreso`,
      [nombre_completo, carrera, semestre_actual, id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensaje: "Usuario no encontrado",
      });
    }

    return res.json({
      mensaje: "Perfil actualizado correctamente",
      usuario: resultado.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      mensaje: "Error al actualizar perfil",
      error: error.message,
    });
  }
};