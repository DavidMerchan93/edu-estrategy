import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from "../configuracion/baseDatos.js";
import { getHistorialSemestresDB } from "../consultas/usuarioConsultas.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const nombre = `foto_${req.usuario.id_estudiante}_${Date.now()}${ext}`;
    cb(null, nombre);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const permitidos = /jpeg|jpg|png|gif|webp/;
    const extOk = permitidos.test(path.extname(file.originalname).toLowerCase());
    const mimeOk = permitidos.test(file.mimetype.split('/')[1]);
    if (extOk && mimeOk) return cb(null, true);
    cb(new Error('Solo se permiten imágenes (jpg, png, gif, webp).'));
  },
});

export const obtenerHistorialSemestres = async (req, res) => {
  try {
    const id = req.usuario.id_estudiante;
    const semestres = await getHistorialSemestresDB(id);
    return res.json({ semestres });
  } catch (error) {
    return res.status(500).json({
      mensaje: "Error al obtener historial de semestres",
      error: error.message,
    });
  }
};

export const subirFoto = [
  upload.single('foto'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ mensaje: 'No se envió ninguna imagen.' });
      }

      const fotoUrl = `/uploads/${req.file.filename}`;
      const id = req.usuario.id_estudiante;

      const resultado = await pool.query(
        `UPDATE estudiante SET foto_url = $1 WHERE id_estudiante = $2 RETURNING foto_url`,
        [fotoUrl, id]
      );

      return res.json({
        mensaje: 'Foto actualizada correctamente',
        foto_url: resultado.rows[0].foto_url,
      });
    } catch (error) {
      return res.status(500).json({
        mensaje: 'Error al subir foto',
        error: error.message,
      });
    }
  },
];

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
/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
export const obtenerPerfil = async (req, res) => {
  try {
    const id = req.usuario.id_estudiante;

    const resultado = await pool.query(
      `SELECT e.nombre_completo, e.carrera, e.semestre_actual, e.foto_url, e.fecha_ingreso, c.email, c.verificado
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
/**
 * @param {import('express').Request} req - Body: { nombre_completo, carrera, semestre_actual }
 * @param {import('express').Response} res
 * @returns {Promise<void>}
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
       RETURNING id_estudiante, identificacion, nombre_completo, carrera, semestre_actual, fecha_ingreso, foto_url`,
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

export const eliminarCuenta = async (req, res) => {
  try {
    const id = req.usuario.id_estudiante;

    const cliente = await pool.connect();
    try {
      await cliente.query('BEGIN');

      await cliente.query(
        `DELETE FROM hito
         WHERE id_asignatura IN (
           SELECT a.id_asignatura FROM asignatura a
           JOIN semestre s ON a.id_semestre = s.id_semestre
           WHERE s.id_estudiante = $1
         )`,
        [id]
      );

      await cliente.query(
        `DELETE FROM asignatura
         WHERE id_semestre IN (
           SELECT id_semestre FROM semestre WHERE id_estudiante = $1
         )`,
        [id]
      );

      await cliente.query(
        `DELETE FROM semestre WHERE id_estudiante = $1`,
        [id]
      );

      const credencial = await cliente.query(
        `DELETE FROM estudiante WHERE id_estudiante = $1 RETURNING id_credencial`,
        [id]
      );

      if (credencial.rows.length === 0) {
        await cliente.query('ROLLBACK');
        return res.status(404).json({ mensaje: "Usuario no encontrado" });
      }

      await cliente.query(
        `DELETE FROM credencial WHERE id_credencial = $1`,
        [credencial.rows[0].id_credencial]
      );

      await cliente.query('COMMIT');
      return res.json({ mensaje: "Cuenta eliminada correctamente" });
    } catch (err) {
      await cliente.query('ROLLBACK');
      throw err;
    } finally {
      cliente.release();
    }
  } catch (error) {
    return res.status(500).json({
      mensaje: "Error al eliminar cuenta",
      error: error.message,
    });
  }
};
