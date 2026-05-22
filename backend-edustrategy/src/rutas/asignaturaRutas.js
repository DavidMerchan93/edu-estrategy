import { Router } from 'express';
import {
  obtenerAsignaturas,
  crearAsignatura,
  actualizarAsignatura,
  eliminarAsignatura,
} from '../controladores/asignaturaControlador.js';
import { validarToken } from '../middlewares/validarToken.js';

const router = Router();

router.get('/', validarToken, obtenerAsignaturas);
router.post('/', validarToken, crearAsignatura);
router.put('/:id', validarToken, actualizarAsignatura);
router.delete('/:id', validarToken, eliminarAsignatura);

export default router;