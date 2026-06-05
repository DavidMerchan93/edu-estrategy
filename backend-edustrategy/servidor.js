/**
 * @module servidor
 * @description Punto de entrada principal del backend. Configura Express, CORS,
 * el parser JSON, la documentacion Swagger y monta todas las rutas de la API
 * bajo el prefijo /api.
 */
import { config } from 'dotenv';
config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import swaggerUi from "swagger-ui-express";
import { pool } from "./src/configuracion/baseDatos.js";

import swaggerSpec from "./src/configuracion/swagger.js";
import saludRutas from "./src/rutas/saludRutas.js";
import autenticacionRutas from "./src/rutas/autenticacionRutas.js";
import usuarioRutas from "./src/rutas/usuarioRutas.js";
import asignaturaRutas from "./src/rutas/asignaturaRutas.js";
import semestreRutas from "./src/rutas/semestreRutas.js";
import hitoRutas from "./src/rutas/hitoRutas.js";
import dashboardRutas from "./src/rutas/dashboardRutas.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api-docs", ...swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api-docs.json", (req, res) => res.json(swaggerSpec));

app.use("/api/salud", saludRutas);
app.use("/api/autenticacion", autenticacionRutas);
app.use("/api/usuario", usuarioRutas);
app.use("/api/asignaturas", asignaturaRutas);
app.use("/api/semestres", semestreRutas);
app.use("/api/hitos", hitoRutas);
app.use("/api/dashboard", dashboardRutas);

const PORT = process.env.PORT || 3000;

Promise.all([
  pool.query(`ALTER TABLE estudiante ADD COLUMN IF NOT EXISTS foto_url VARCHAR(500)`),
  pool.query(`ALTER TABLE credencial ADD COLUMN IF NOT EXISTS verificado BOOLEAN DEFAULT false`),
])
  .then(() => {
    console.log("Columnas foto_url y verificado verificadas/agregadas.");
  })
  .catch((err) => {
    console.error("Error al verificar columnas:", err.message);
  });

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
