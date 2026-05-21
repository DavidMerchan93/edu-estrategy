import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import saludRutas from './src/rutas/saludRutas.js';
import autenticacionRutas from './src/rutas/autenticacionRutas.js';
import usuarioRutas from './src/rutas/usuarioRutas.js';
import asignaturaRutas from './src/rutas/asignaturaRutas.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/salud', saludRutas);
app.use('/api/autenticacion', autenticacionRutas);
app.use('/api/usuario', usuarioRutas);
app.use('/api/asignaturas', asignaturaRutas);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});