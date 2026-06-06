import { jest, describe, test, expect, beforeEach } from '@jest/globals';

jest.unstable_mockModule('../../src/servicios/autenticacionServicio.js', () => ({
  registrarUsuario: jest.fn(),
  iniciarSesion: jest.fn(),
}));

const { registrarUsuario, iniciarSesion } = await import(
  '../../src/servicios/autenticacionServicio.js'
);
const { registro, login } = await import(
  '../../src/controladores/autenticacionControlador.js'
);

const buildRes = () => {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  return { status, json };
};

describe('autenticacionControlador', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registro', () => {
    test('responde 201 con el usuario creado', async () => {
      const usuario = { id_estudiante: 1, nombre_completo: 'Juan' };
      registrarUsuario.mockResolvedValueOnce(usuario);

      const req = { body: { nombre_completo: 'Juan', email: 'a@b.c' } };
      const res = buildRes();

      await registro(req, res);

      expect(registrarUsuario).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        mensaje: 'Usuario registrado correctamente',
        usuario,
      });
    });

    test('responde con statusCode de error cuando registrarUsuario lanza', async () => {
      registrarUsuario.mockRejectedValueOnce({ statusCode: 409, message: 'El correo ya está registrado' });

      const req = { body: {} };
      const res = buildRes();

      await registro(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ mensaje: 'El correo ya está registrado' });
    });

    test('cae a 500 cuando el error no tiene statusCode', async () => {
      registrarUsuario.mockRejectedValueOnce(new Error('boom'));

      const req = { body: {} };
      const res = buildRes();

      await registro(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ mensaje: 'boom' });
    });
  });

  describe('login', () => {
    test('responde 200 con token y datos del usuario', async () => {
      const data = { token: 'jwt', usuario: { id_estudiante: 1 } };
      iniciarSesion.mockResolvedValueOnce(data);

      const req = { body: { email: 'a@b.c', password: 'x' } };
      const res = buildRes();

      await login(req, res);

      expect(iniciarSesion).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        mensaje: 'Inicio de sesión exitoso',
        token: 'jwt',
        usuario: data.usuario,
      });
    });

    test('responde 401 cuando las credenciales son invalidas', async () => {
      iniciarSesion.mockRejectedValueOnce({ statusCode: 401, message: 'Credenciales inválidas' });

      const req = { body: {} };
      const res = buildRes();

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ mensaje: 'Credenciales inválidas' });
    });

    test('cae a 500 cuando el error no tiene statusCode', async () => {
      iniciarSesion.mockRejectedValueOnce(new Error('boom'));

      const req = { body: {} };
      const res = buildRes();

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ mensaje: 'boom' });
    });
  });
});
