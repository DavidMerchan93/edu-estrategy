import { Router } from "express";
import {
  obtenerPerfil,
  actualizarPerfil,
} from "../controladores/usuarioControlador.js";
import { validarToken } from "../middlewares/validarToken.js";

const router = Router();

router.get("/prueba", (req, res) => {
  res.json({ mensaje: "Ruta de usuario funcionando" });
});

router.get("/perfil", validarToken, obtenerPerfil);
router.put("/perfil", validarToken, actualizarPerfil);

export default router;