import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';

jest.unstable_mockModule('../../src/consultas/asignaturaConsultas.js', () => ({
  getSemestreActivoPorEstudiante: jest.fn(),
  crearAsignaturaDB: jest.fn(),
  actualizarAsignaturaDB: jest.fn(),
  eliminarAsignaturaDB: jest.fn(),
}));

const app = express();
app.use(express.json());
const asignaturaRutas = (await import('../../src/rutas/asignaturaRutas.js')).default;
app.use('/api/asignaturas', asignaturaRutas);

const {
  getSemestreActivoPorEstudiante,
  crearAsignaturaDB,
  actualizarAsignaturaDB,
  eliminarAsignaturaDB,
} = await import('../../src/consultas/asignaturaConsultas.js');

const tokenValido = jwt.sign({ id_estudiante: 1 }, process.env.JWT_SECRET);
const auth = () => ({ Authorization: `Bearer ${tokenValido}` });

describe('Rutas /api/asignaturas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('401 sin token', async () => {
    const res = await request(app).post('/api/asignaturas').send({});
    expect(res.status).toBe(401);
  });

  test('POST / -> 201 cuando crea la asignatura', async () => {
    getSemestreActivoPorEstudiante.mockResolvedValueOnce({ id_semestre: 1 });
    crearAsignaturaDB.mockResolvedValueOnce({ id_asignatura: 1 });
    const res = await request(app)
      .post('/api/asignaturas')
      .set(auth())
      .send({ nombre: 'Mate', docente: 'Dr. X' });
    expect(res.status).toBe(201);
  });

  test('PUT /:id -> 200 cuando actualiza', async () => {
    actualizarAsignaturaDB.mockResolvedValueOnce({ id_asignatura: 1 });
    const res = await request(app)
      .put('/api/asignaturas/1')
      .set(auth())
      .send({ nombre: 'Mate', docente: 'Dr. X' });
    expect(res.status).toBe(200);
  });

  test('DELETE /:id -> 200 cuando elimina', async () => {
    eliminarAsignaturaDB.mockResolvedValueOnce({ id_asignatura: 1 });
    const res = await request(app).delete('/api/asignaturas/1').set(auth());
    expect(res.status).toBe(200);
  });
});
