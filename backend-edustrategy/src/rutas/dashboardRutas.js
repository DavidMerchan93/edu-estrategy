import { Router } from 'express';
import { validarToken } from '../middlewares/validarToken.js';
import { getDashboard } from '../controladores/dashboardControlador.js';

const router = Router();

router.get('/', validarToken, getDashboard);

export default router;
