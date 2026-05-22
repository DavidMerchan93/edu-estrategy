import { config } from 'dotenv';
config();

import express from 'express';
import cors from 'cors';

import saludRutas from './src/rutas/saludRutas.js';
import autenticacionRutas from './src/rutas/autenticacionRutas.js';
import usuarioRutas from './src/rutas/usuarioRutas.js';
import asignaturaRutas from './src/rutas/asignaturaRutas.js';
import semestreRutas from './src/rutas/semestreRutas.js';
import hitoRutas from './src/rutas/hitoRutas.js';
import dashboardRutas from './src/rutas/dashboardRutas.js';
import { swaggerSpec } from './src/configuracion/swagger.js';

const app = express();

app.use(cors());
app.use(express.json());

const swaggerHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>EDU-STRATEGY API - Documentación</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: '/api-docs.json',
      dom_id: '#swagger-ui',
    });
  </script>
</body>
</html>`;

app.get('/api-docs', (req, res) => res.type('html').send(swaggerHtml));
app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));

app.use('/api/salud', saludRutas);
app.use('/api/autenticacion', autenticacionRutas);
app.use('/api/usuario', usuarioRutas);
app.use('/api/asignaturas', asignaturaRutas);
app.use('/api/semestres', semestreRutas);
app.use('/api/hitos', hitoRutas);
app.use('/api/dashboard', dashboardRutas);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});