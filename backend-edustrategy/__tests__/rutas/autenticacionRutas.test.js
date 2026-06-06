import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';

jest.unstable_mockModule('../../src/servicios/autenticacionServicio.js', () => ({
  registrarUsuario: jest.fn(),
  iniciarSesion: jest.fn(),
}));

const app = express();
app.use(express.json());
const autenticacionRutas = (await import('../../src/rutas/autenticacionRutas.js')).default;
app.use('/api/autenticacion', autenticacionRutas);

const { registrarUsuario, iniciarSesion } = await import(
  '../../src/servicios/autenticacionServicio.js'
);

describe('Rutas /api/autenticacion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /registro -> 201 con el usuario registrado', async () => {
    const usuario = { id_estudiante: 1 };
    registrarUsuario.mockResolvedValueOnce(usuario);
    const res = await request(app)
      .post('/api/autenticacion/registro')
      .send({
        nombre_completo: 'Juan',
        email: 'a@b.c',
        password: 'x',
        identificacion: '1',
        carrera: 'Sistemas',
        semestre_actual: 1,
        fecha_ingreso: '2024-01-01',
      });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      mensaje: 'Usuario registrado correctamente',
      usuario,
    });
  });

  test('POST /registro -> 409 cuando el correo esta duplicado', async () => {
    registrarUsuario.mockRejectedValueOnce({ statusCode: 409, message: 'dup' });
    const res = await request(app).post('/api/autenticacion/registro').send({});
    expect(res.status).toBe(409);
    expect(res.body).toEqual({ mensaje: 'dup' });
  });

  test('POST /login -> 200 con token y usuario', async () => {
    iniciarSesion.mockResolvedValueOnce({ token: 'jwt', usuario: { id_estudiante: 1 } });
    const res = await request(app)
      .post('/api/autenticacion/login')
      .send({ email: 'a@b.c', password: 'x' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      mensaje: 'Inicio de sesión exitoso',
      token: 'jwt',
      usuario: { id_estudiante: 1 },
    });
  });

  test('POST /login -> 401 cuando las credenciales son invalidas', async () => {
    iniciarSesion.mockRejectedValueOnce({ statusCode: 401, message: 'invalid' });
    const res = await request(app).post('/api/autenticacion/login').send({});
    expect(res.status).toBe(401);
  });
});
