import { config } from 'dotenv';
config();

import express from 'express';
import cors from 'cors';

import saludRutas from './src/rutas/saludRutas.js';
import autenticacionRutas from './src/rutas/autenticacionRutas.js';
import usuarioRutas from './src/rutas/usuarioRutas.js';
import asignaturaRutas from './src/rutas/asignaturaRutas.js';
import dashboardRutas from './src/rutas/dashboardRutas.js';

console.log('[DEBUG] DATABASE_URL presente:', !!process.env.DATABASE_URL);

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/salud', saludRutas);
app.use('/api/autenticacion', autenticacionRutas);
app.use('/api/usuario', usuarioRutas);
app.use('/api/asignaturas', asignaturaRutas);
app.use('/api/dashboard', dashboardRutas);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});