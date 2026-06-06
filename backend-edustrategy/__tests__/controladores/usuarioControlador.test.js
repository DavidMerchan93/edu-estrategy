import { jest, describe, test, expect, beforeEach } from '@jest/globals';

const queryMock = jest.fn();
const connectMock = jest.fn();

jest.unstable_mockModule('../../src/configuracion/baseDatos.js', () => ({
  pool: { query: queryMock, connect: connectMock },
}));

jest.unstable_mockModule('../../src/consultas/usuarioConsultas.js', () => ({
  getHistorialSemestresDB: jest.fn(),
}));

jest.unstable_mockModule('multer', () => {
  const uploadMiddleware = () => (req, res, next) => {
    if (req._multerFile === undefined) {
      return next();
    }
    if (req._multerFile === null) {
      return next();
    }
    if (req._multerError) {
      return next(req._multerError);
    }
    req.file = req._multerFile;
    next();
  };
  const multerFn = (opts) => ({
    single: uploadMiddleware,
    _storage: opts?.storage,
  });
  multerFn.diskStorage = (cfg) => ({ _diskStorage: cfg });
  return { default: multerFn };
});

const { getHistorialSemestresDB } = await import(
  '../../src/consultas/usuarioConsultas.js'
);
const {
  obtenerPerfil,
  actualizarPerfil,
  eliminarCuenta,
  obtenerHistorialSemestres,
  subirFoto,
} = await import('../../src/controladores/usuarioControlador.js');

describe('usuarioControlador', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    connectMock.mockReset();
  });

  describe('obtenerPerfil', () => {
    test('responde 200 con el perfil del usuario', async () => {
      const fila = { nombre_completo: 'Juan', carrera: 'Sistemas', email: 'a@b.c' };
      queryMock.mockResolvedValueOnce({ rows: [fila] });

      const json = jest.fn();
      await obtenerPerfil({ usuario: { id_estudiante: 1 } }, { json });

      expect(queryMock).toHaveBeenCalledWith(expect.stringContaining('FROM estudiante e'), [1]);
      expect(json).toHaveBeenCalledWith({ mensaje: 'Perfil obtenido', usuario: fila });
    });

    test('responde 404 si no encuentra al usuario', async () => {
      queryMock.mockResolvedValueOnce({ rows: [] });
      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });
      await obtenerPerfil({ usuario: { id_estudiante: 1 } }, { status, json });
      expect(status).toHaveBeenCalledWith(404);
      expect(json).toHaveBeenCalledWith({ mensaje: 'Usuario no encontrado' });
    });

    test('responde 500 si la consulta falla', async () => {
      queryMock.mockRejectedValueOnce(new Error('boom'));
      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });
      await obtenerPerfil({ usuario: { id_estudiante: 1 } }, { status, json });
      expect(status).toHaveBeenCalledWith(500);
    });
  });

  describe('actualizarPerfil', () => {
    test('responde 400 si falta un campo obligatorio', async () => {
      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });
      await actualizarPerfil(
        { usuario: { id_estudiante: 1 }, body: { nombre_completo: 'X' } },
        { status, json }
      );
      expect(status).toHaveBeenCalledWith(400);
      expect(queryMock).not.toHaveBeenCalled();
    });

    test('responde 404 si el UPDATE no afecta ninguna fila', async () => {
      queryMock.mockResolvedValueOnce({ rows: [] });
      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });
      await actualizarPerfil(
        {
          usuario: { id_estudiante: 1 },
          body: { nombre_completo: 'X', carrera: 'C', semestre_actual: 5 },
        },
        { status, json }
      );
      expect(status).toHaveBeenCalledWith(404);
    });

    test('responde 200 cuando actualiza el perfil', async () => {
      const fila = { id_estudiante: 1, nombre_completo: 'X' };
      queryMock.mockResolvedValueOnce({ rows: [fila] });
      const json = jest.fn();
      await actualizarPerfil(
        {
          usuario: { id_estudiante: 1 },
          body: { nombre_completo: 'X', carrera: 'C', semestre_actual: 5 },
        },
        { json }
      );
      expect(json).toHaveBeenCalledWith({
        mensaje: 'Perfil actualizado correctamente',
        usuario: fila,
      });
    });

    test('responde 500 si la consulta falla', async () => {
      queryMock.mockRejectedValueOnce(new Error('boom'));
      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });
      await actualizarPerfil(
        {
          usuario: { id_estudiante: 1 },
          body: { nombre_completo: 'X', carrera: 'C', semestre_actual: 5 },
        },
        { status, json }
      );
      expect(status).toHaveBeenCalledWith(500);
    });
  });

  describe('eliminarCuenta', () => {
    const buildClient = () => {
      const release = jest.fn();
      const client = {
        query: jest.fn(),
        release,
      };
      return client;
    };

    test('realiza el commit y responde 200 cuando todo sale bien', async () => {
      const client = buildClient();
      connectMock.mockResolvedValueOnce(client);
      client.query
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockResolvedValueOnce(undefined) // DELETE hito
        .mockResolvedValueOnce(undefined) // DELETE asignatura
        .mockResolvedValueOnce(undefined) // DELETE semestre
        .mockResolvedValueOnce({ rows: [{ id_credencial: 9 }] }) // DELETE estudiante
        .mockResolvedValueOnce(undefined) // DELETE credencial
        .mockResolvedValueOnce(undefined); // COMMIT

      const json = jest.fn();
      await eliminarCuenta({ usuario: { id_estudiante: 1 } }, { json });

      expect(client.query.mock.calls[0][0]).toBe('BEGIN');
      expect(client.query.mock.calls[6][0]).toBe('COMMIT');
      expect(client.release).toHaveBeenCalled();
      expect(json).toHaveBeenCalledWith({ mensaje: 'Cuenta eliminada correctamente' });
    });

    test('hace rollback y 404 si el estudiante no existe', async () => {
      const client = buildClient();
      connectMock.mockResolvedValueOnce(client);
      client.query
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockResolvedValueOnce(undefined) // DELETE hito
        .mockResolvedValueOnce(undefined) // DELETE asignatura
        .mockResolvedValueOnce(undefined) // DELETE semestre
        .mockResolvedValueOnce({ rows: [] }); // DELETE estudiante - 0 rows

      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });
      await eliminarCuenta({ usuario: { id_estudiante: 1 } }, { status, json });

      expect(client.query.mock.calls.some((c) => c[0] === 'ROLLBACK')).toBe(true);
      expect(status).toHaveBeenCalledWith(404);
      expect(json).toHaveBeenCalledWith({ mensaje: 'Usuario no encontrado' });
    });

    test('hace rollback si ocurre un error y devuelve 500', async () => {
      const client = buildClient();
      connectMock.mockResolvedValueOnce(client);
      client.query
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockRejectedValueOnce(new Error('boom')); // DELETE hito

      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });
      await eliminarCuenta({ usuario: { id_estudiante: 1 } }, { status, json });

      expect(client.query.mock.calls.some((c) => c[0] === 'ROLLBACK')).toBe(true);
      expect(status).toHaveBeenCalledWith(500);
      expect(client.release).toHaveBeenCalled();
    });

    test('responde 500 cuando falla el connect del pool', async () => {
      connectMock.mockRejectedValueOnce(new Error('connect fail'));
      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });
      await eliminarCuenta({ usuario: { id_estudiante: 1 } }, { status, json });
      expect(status).toHaveBeenCalledWith(500);
    });
  });

  describe('obtenerHistorialSemestres', () => {
    test('responde 200 con el historial', async () => {
      getHistorialSemestresDB.mockResolvedValueOnce([{ id_semestre: 1 }]);
      const json = jest.fn();
      await obtenerHistorialSemestres({ usuario: { id_estudiante: 1 } }, { json });
      expect(json).toHaveBeenCalledWith({ semestres: [{ id_semestre: 1 }] });
    });

    test('responde 500 si la consulta falla', async () => {
      getHistorialSemestresDB.mockRejectedValueOnce(new Error('boom'));
      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });
      await obtenerHistorialSemestres({ usuario: { id_estudiante: 1 } }, { status, json });
      expect(status).toHaveBeenCalledWith(500);
    });
  });

  describe('subirFoto', () => {
    const runHandler = async (reqOverrides) => {
      const req = {
        usuario: { id_estudiante: 1 },
        ...reqOverrides,
      };
      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });
      const res = { status, json };
      const [uploadMw, handler] = subirFoto;
      await new Promise((resolve) => {
        uploadMw(req, res, () => resolve());
      });
      await handler(req, res);
      return { json, status };
    };

    test('responde 400 cuando no se envia ningun archivo', async () => {
      const { json, status } = await runHandler({ _multerFile: null });
      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({ mensaje: 'No se envió ninguna imagen.' });
    });

    test('responde 200 con la URL cuando el archivo se sube correctamente', async () => {
      queryMock.mockResolvedValueOnce({ rows: [{ foto_url: '/uploads/foto_1_x.png' }] });
      const { json } = await runHandler({
        _multerFile: { filename: 'foto_1_x.png' },
      });
      expect(queryMock).toHaveBeenCalledWith(expect.stringContaining('UPDATE estudiante'), [
        '/uploads/foto_1_x.png',
        1,
      ]);
      expect(json).toHaveBeenCalledWith({
        mensaje: 'Foto actualizada correctamente',
        foto_url: '/uploads/foto_1_x.png',
      });
    });

    test('responde 500 cuando el UPDATE falla', async () => {
      queryMock.mockRejectedValueOnce(new Error('boom'));
      const { status } = await runHandler({
        _multerFile: { filename: 'foto.png' },
      });
      expect(status).toHaveBeenCalledWith(500);
    });
  });
});
