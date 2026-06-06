import { jest, describe, test, expect } from '@jest/globals';
import request from 'supertest';
import express from 'express';

jest.unstable_mockModule('../../src/configuracion/baseDatos.js', () => ({
  pool: { query: jest.fn().mockResolvedValue({ rows: [] }) },
}));

const app = express();
const saludRutas = (await import('../../src/rutas/saludRutas.js')).default;
app.use('/api/salud', saludRutas);

describe('Rutas /api/salud', () => {
  test('GET / responde 200 con estado OK', async () => {
    const res = await request(app).get('/api/salud');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      estado: 'OK',
      mensaje: 'Servidor EDU-STRATEGY funcionando correctamente',
    });
  });

  test('GET /base-datos responde 200 cuando la conexion es exitosa', async () => {
    const { pool } = await import('../../src/configuracion/baseDatos.js');
    pool.query.mockResolvedValueOnce({ rows: [{ now: '2026-01-01T00:00:00Z' }] });
    const res = await request(app).get('/api/salud/base-datos');
    expect(res.status).toBe(200);
    expect(res.body.estado).toBe('OK');
    expect(res.body.fechaServidor).toBe('2026-01-01T00:00:00Z');
  });

  test('GET /base-datos responde 500 cuando falla la consulta', async () => {
    const { pool } = await import('../../src/configuracion/baseDatos.js');
    pool.query.mockRejectedValueOnce(new Error('connection refused'));
    const res = await request(app).get('/api/salud/base-datos');
    expect(res.status).toBe(500);
    expect(res.body.estado).toBe('ERROR');
  });
});
