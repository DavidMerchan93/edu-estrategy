import { jest, describe, test, expect, beforeEach } from '@jest/globals';

jest.unstable_mockModule('bcrypt', () => ({
  default: { hash: jest.fn(), compare: jest.fn() },
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: { sign: jest.fn(), verify: jest.fn() },
  sign: jest.fn(),
  verify: jest.fn(),
}));

jest.unstable_mockModule('../../src/configuracion/baseDatos.js', () => ({
  pool: { query: jest.fn() },
}));

const { default: bcrypt } = await import('bcrypt');
const { default: jwt } = await import('jsonwebtoken');
const { pool } = await import('../../src/configuracion/baseDatos.js');
const { registrarUsuario, iniciarSesion } = await import(
  '../../src/servicios/autenticacionServicio.js'
);

const datosValidos = {
  nombre_completo: 'Juan Perez',
  email: 'juan@correo.edu.co',
  password: 'Secreta123',
  identificacion: '1234567890',
  carrera: 'Ingenieria de Sistemas',
  semestre_actual: 5,
  fecha_ingreso: '2024-01-15',
};

describe('autenticacionServicio.registrarUsuario', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('lanza 400 si falta algun campo obligatorio', async () => {
    await expect(registrarUsuario({ ...datosValidos, email: '' })).rejects.toMatchObject({
      statusCode: 400,
    });
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('lanza 400 si el semestre_actual es 0 (falsy)', async () => {
    await expect(
      registrarUsuario({ ...datosValidos, semestre_actual: 0 })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  test('lanza 400 si la fecha_ingreso esta vacia', async () => {
    await expect(
      registrarUsuario({ ...datosValidos, fecha_ingreso: '' })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  test('lanza 409 si el correo ya esta registrado', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id_credencial: 99 }] });

    await expect(registrarUsuario(datosValidos)).rejects.toMatchObject({
      statusCode: 409,
      message: 'El correo ya está registrado',
    });
    expect(bcrypt.hash).not.toHaveBeenCalled();
  });

  test('crea credencial y estudiante, retorna fila del estudiante', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id_credencial: 7 }] })
      .mockResolvedValueOnce({
        rows: [
          {
            id_estudiante: 1,
            id_credencial: 7,
            identificacion: datosValidos.identificacion,
            nombre_completo: datosValidos.nombre_completo,
            carrera: datosValidos.carrera,
            semestre_actual: datosValidos.semestre_actual,
            fecha_ingreso: datosValidos.fecha_ingreso,
          },
        ],
      });
    bcrypt.hash.mockResolvedValue('hash-bcrypt');

    const resultado = await registrarUsuario(datosValidos);

    expect(bcrypt.hash).toHaveBeenCalledWith(datosValidos.password, 10);
    expect(pool.query).toHaveBeenCalledTimes(3);
    expect(resultado).toEqual(
      expect.objectContaining({
        id_estudiante: 1,
        nombre_completo: datosValidos.nombre_completo,
      })
    );
  });
});

describe('autenticacionServicio.iniciarSesion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('lanza 400 si falta email o password', async () => {
    await expect(iniciarSesion({ email: '', password: 'x' })).rejects.toMatchObject({
      statusCode: 400,
    });
    await expect(iniciarSesion({ email: 'a@b.c', password: '' })).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  test('lanza 401 si no encuentra al usuario', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    await expect(iniciarSesion({ email: 'a@b.c', password: 'x' })).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  test('lanza 403 si la cuenta esta bloqueada', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        {
          id_estudiante: 1,
          id_credencial: 1,
          bloqueado: true,
          password_hash: 'h',
          email: 'a@b.c',
          rol: 'estudiante',
        },
      ],
    });
    await expect(iniciarSesion({ email: 'a@b.c', password: 'x' })).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  test('lanza 401 e incrementa intentos cuando la contraseña no coincide', async () => {
    pool.query
      .mockResolvedValueOnce({
        rows: [
          {
            id_estudiante: 1,
            id_credencial: 1,
            bloqueado: false,
            password_hash: 'h',
            email: 'a@b.c',
            rol: 'estudiante',
          },
        ],
      })
      .mockResolvedValueOnce({ rows: [] });
    bcrypt.compare.mockResolvedValue(false);

    await expect(
      iniciarSesion({ email: 'a@b.c', password: 'wrong' })
    ).rejects.toMatchObject({ statusCode: 401 });

    expect(pool.query).toHaveBeenCalledTimes(2);
    expect(pool.query.mock.calls[1][0]).toMatch(/UPDATE credencial/);
  });

  test('resetea intentos, firma token y devuelve usuario en caso de exito', async () => {
    const user = {
      id_estudiante: 1,
      id_credencial: 1,
      bloqueado: false,
      password_hash: 'h',
      email: 'a@b.c',
      rol: 'estudiante',
      nombre_completo: 'Juan',
      carrera: 'Sistemas',
      semestre_actual: 5,
      fecha_ingreso: '2024-01-15',
    };
    pool.query
      .mockResolvedValueOnce({ rows: [user] })
      .mockResolvedValueOnce({ rows: [] });
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('token-firmado');

    const data = await iniciarSesion({ email: 'a@b.c', password: 'ok' });

    expect(jwt.sign).toHaveBeenCalledWith(
      { id_estudiante: 1, email: 'a@b.c', rol: 'estudiante' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    expect(data.token).toBe('token-firmado');
    expect(data.usuario).toEqual(
      expect.objectContaining({
        id_estudiante: 1,
        email: 'a@b.c',
        rol: 'estudiante',
      })
    );
  });
});
