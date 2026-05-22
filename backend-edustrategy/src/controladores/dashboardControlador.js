import { getDashboardData } from '../servicios/dashboardServicio.js';

export async function getDashboard(req, res) {
  try {
    const { id_estudiante } = req.usuario;
    const data = await getDashboardData(id_estudiante);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ mensaje: error.message || 'Error interno del servidor' });
  }
}
