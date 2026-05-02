import { pool } from '../configuracion/baseDatos.js';

export const verificarServidor = (req, res) => {
  res.json({
    estado: 'OK',
    mensaje: 'Servidor EDU-STRATEGY funcionando correctamente',
  });
};

export const verificarBaseDatos = async (req, res) => {
  try {
    const resultado = await pool.query('SELECT NOW()');

    res.json({
      estado: 'OK',
      mensaje: 'Conexión exitosa a PostgreSQL',
      fechaServidor: resultado.rows[0].now,
    });
  } catch (error) {
    res.status(500).json({
      estado: 'ERROR',
      mensaje: 'Error al conectar con PostgreSQL',
      detalle: error.message,
    });
  }
};