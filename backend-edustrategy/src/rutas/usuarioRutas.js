import { Router } from "express";
import {
  obtenerPerfil,
  actualizarPerfil,
  subirFoto,
  eliminarCuenta,
  obtenerHistorialSemestres,
} from "../controladores/usuarioControlador.js";
import { validarToken } from "../middlewares/validarToken.js";

const router = Router();

router.get("/prueba", (req, res) => {
  res.json({ mensaje: "Ruta de usuario funcionando" });
});

router.get("/perfil", validarToken, obtenerPerfil);
router.put("/perfil", validarToken, actualizarPerfil);
router.get("/semestres", validarToken, obtenerHistorialSemestres);
router.put("/foto", validarToken, subirFoto);
router.delete("/cuenta", validarToken, eliminarCuenta);

export default router;
