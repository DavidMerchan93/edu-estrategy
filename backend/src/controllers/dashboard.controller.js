const { getDashboardData } = require('../services/dashboard.service');

async function getDashboard(req, res, next) {
  try {
    const { idEstudiante, idSemestre } = req.user;
    const data = await getDashboardData(idEstudiante, idSemestre);
    return res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = { getDashboard };
