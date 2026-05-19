import {
  registrarUsuario,
  iniciarSesion,
} from '../servicios/autenticacionServicio.js';

export const registro = async (req, res) => {
  try {
    const usuario = await registrarUsuario(req.body);

    res.status(201).json({
      mensaje: 'Usuario registrado correctamente',
      usuario,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      mensaje: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const data = await iniciarSesion(req.body);

    res.status(200).json({
      mensaje: 'Inicio de sesión exitoso',
      token: data.token,
      usuario: data.usuario,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      mensaje: error.message,
    });
  }
};