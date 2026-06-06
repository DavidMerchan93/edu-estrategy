import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';

jest.unstable_mockModule('../../src/consultas/hitoConsultas.js', () => ({
  listarTiposActividad: jest.fn(),
  listarHitosPorAsignatura: jest.fn(),
  crearHitoDB: jest.fn(),
  actualizarHitoDB: jest.fn(),
  eliminarHitoDB: jest.fn(),
}));

const app = express();
app.use(express.json());
const hitoRutas = (await import('../../src/rutas/hitoRutas.js')).default;
app.use('/api/hitos', hitoRutas);

const {
  listarTiposActividad,
  listarHitosPorAsignatura,
  crearHitoDB,
  actualizarHitoDB,
  eliminarHitoDB,
} = await import('../../src/consultas/hitoConsultas.js');

const tokenValido = jwt.sign({ id_estudiante: 1 }, process.env.JWT_SECRET);
const auth = () => ({ Authorization: `Bearer ${tokenValido}` });

describe('Rutas /api/hitos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('401 sin token en GET /tipos', async () => {
    const res = await request(app).get('/api/hitos/tipos');
    expect(res.status).toBe(401);
  });

  test('GET /tipos -> 200 con tipos', async () => {
    listarTiposActividad.mockResolvedValueOnce([{ id_tipo: 1, nombre: 'Parcial' }]);
    const res = await request(app).get('/api/hitos/tipos').set(auth());
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id_tipo: 1, nombre: 'Parcial' }]);
  });

  test('GET /:idAsignatura -> 200 con hitos', async () => {
    listarHitosPorAsignatura.mockResolvedValueOnce([{ id_hito: 1 }]);
    const res = await request(app).get('/api/hitos/2').set(auth());
    expect(res.status).toBe(200);
  });

  test('POST /:idAsignatura -> 201 cuando crea', async () => {
    crearHitoDB.mockResolvedValueOnce({ id_hito: 1 });
    const res = await request(app)
      .post('/api/hitos/2')
      .set(auth())
      .send({
        id_tipo_actividad: 1,
        fecha_inicio: '2024-01-01',
        fecha_cierre: '2024-01-10',
        horas_dedicadas: 5,
        nota: 4.0,
      });
    expect(res.status).toBe(201);
  });

  test('PUT /:idHito -> 200 cuando actualiza', async () => {
    actualizarHitoDB.mockResolvedValueOnce({ id_hito: 1 });
    const res = await request(app)
      .put('/api/hitos/1')
      .set(auth())
      .send({
        id_tipo_actividad: 1,
        fecha_inicio: '2024-01-01',
        fecha_cierre: '2024-01-10',
        horas_dedicadas: 5,
      });
    expect(res.status).toBe(200);
  });

  test('DELETE /:idHito -> 200 cuando elimina', async () => {
    eliminarHitoDB.mockResolvedValueOnce({ id_hito: 1 });
    const res = await request(app).delete('/api/hitos/1').set(auth());
    expect(res.status).toBe(200);
  });
});
