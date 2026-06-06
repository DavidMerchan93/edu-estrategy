import { jest, describe, test, expect } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';

jest.unstable_mockModule('../../src/servicios/dashboardServicio.js', () => ({
  getDashboardData: jest.fn(),
}));

const app = express();
app.use(express.json());
const dashboardRutas = (await import('../../src/rutas/dashboardRutas.js')).default;
app.use('/api/dashboard', dashboardRutas);

const { getDashboardData } = await import('../../src/servicios/dashboardServicio.js');

const tokenValido = jwt.sign({ id_estudiante: 1 }, process.env.JWT_SECRET);
const auth = () => ({ Authorization: `Bearer ${tokenValido}` });

describe('Rutas /api/dashboard', () => {
  test('401 sin token', async () => {
    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBe(401);
  });

  test('GET / -> 200 con datos del dashboard', async () => {
    getDashboardData.mockResolvedValueOnce({ semestreActivo: '2026-1' });
    const res = await request(app).get('/api/dashboard').set(auth());
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ semestreActivo: '2026-1' });
  });
});
