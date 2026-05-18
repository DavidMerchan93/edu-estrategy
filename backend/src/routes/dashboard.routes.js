const router = require('express').Router();
const verificarToken = require('../middleware/auth');
const { getDashboard } = require('../controllers/dashboard.controller');

router.get('/', verificarToken, getDashboard);

module.exports = router;
