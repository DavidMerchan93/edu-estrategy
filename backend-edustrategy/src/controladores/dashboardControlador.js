import { getDashboardData } from '../servicios/dashboardServicio.js';

/**
 * @openapi
 * /api/dashboard:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Obtiene los datos del dashboard del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del dashboard
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Datos agregados del dashboard
 *       401:
 *         description: Token requerido o inválido
 */
export async function getDashboard(req, res) {
  try {
    const { id_estudiante } = req.usuario;
    const data = await getDashboardData(id_estudiante);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ mensaje: error.message || 'Error interno del servidor' });
  }
}
