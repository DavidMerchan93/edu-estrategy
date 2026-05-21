import { Router } from 'express';
import {
  verificarServidor,
  verificarBaseDatos,
} from '../controladores/saludControlador.js';

const router = Router();

router.get('/', verificarServidor);
router.get('/base-datos', verificarBaseDatos);

export default router;