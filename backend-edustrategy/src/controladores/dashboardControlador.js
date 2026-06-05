import { getDashboardData } from '../servicios/dashboardServicio.js';

/**
 * Devuelve los datos agregados del tablero para el semestre activo del estudiante autenticado.
 * Delega la logica de agregacion al servicio `getDashboardData`.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
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
