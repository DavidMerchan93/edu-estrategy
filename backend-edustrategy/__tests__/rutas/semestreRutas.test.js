import { jest, describe, test, expect } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';

jest.unstable_mockModule('../../src/consultas/semestreConsultas.js', () => ({
  desactivarSemestresActivosDB: jest.fn(),
  crearSemestreDB: jest.fn(),
}));

const app = express();
app.use(express.json());
const semestreRutas = (await import('../../src/rutas/semestreRutas.js')).default;
app.use('/api/semestres', semestreRutas);

const { crearSemestreDB } = await import('../../src/consultas/semestreConsultas.js');

const tokenValido = jwt.sign({ id_estudiante: 1 }, process.env.JWT_SECRET);
const auth = () => ({ Authorization: `Bearer ${tokenValido}` });

describe('Rutas /api/semestres', () => {
  test('401 sin token', async () => {
    const res = await request(app).post('/api/semestres').send({});
    expect(res.status).toBe(401);
  });

  test('POST / -> 201 cuando crea el semestre', async () => {
    crearSemestreDB.mockResolvedValueOnce({ id_semestre: 1, nombre: '2026-1' });
    const res = await request(app)
      .post('/api/semestres')
      .set(auth())
      .send({
        nombre: '2026-1',
        fecha_inicio: '2026-01-01',
        fecha_fin: '2026-06-30',
        activo: true,
      });
    expect(res.status).toBe(201);
  });
});
