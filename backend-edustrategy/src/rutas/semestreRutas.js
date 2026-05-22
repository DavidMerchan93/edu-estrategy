import { Router } from 'express';
import { crearSemestre } from '../controladores/semestreControlador.js';
import { validarToken } from '../middlewares/validarToken.js';

const router = Router();

router.post('/', validarToken, crearSemestre);

export default router;
