import { Router } from 'express';
import {
  getTiposActividad,
  listarHitos,
  crearHito,
  actualizarHito,
  eliminarHito,
} from '../controladores/hitoControlador.js';
import { validarToken } from '../middlewares/validarToken.js';

const router = Router();

router.get('/tipos', validarToken, getTiposActividad);
router.get('/:idAsignatura', validarToken, listarHitos);
router.post('/:idAsignatura', validarToken, crearHito);
router.put('/:idHito', validarToken, actualizarHito);
router.delete('/:idHito', validarToken, eliminarHito);

export default router;
