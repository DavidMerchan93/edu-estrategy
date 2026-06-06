import { jest, describe, test, expect, beforeEach } from '@jest/globals';

jest.unstable_mockModule('../../src/configuracion/baseDatos.js', () => ({
  pool: { query: jest.fn() },
}));

const { pool } = await import('../../src/configuracion/baseDatos.js');
const { verificarServidor, verificarBaseDatos } = await import(
  '../../src/controladores/saludControlador.js'
);

describe('saludControlador', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('verificarServidor', () => {
    test('responde 200 con estado OK y mensaje', () => {
      const json = jest.fn();
      const res = { json };

      verificarServidor({}, res);

      expect(json).toHaveBeenCalledWith({
        estado: 'OK',
        mensaje: 'Servidor EDU-STRATEGY funcionando correctamente',
      });
    });
  });

  describe('verificarBaseDatos', () => {
    test('responde 200 con la fecha del servidor PostgreSQL', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ now: '2026-01-01T00:00:00Z' }] });
      const json = jest.fn();
      const res = { status: jest.fn().mockReturnValue({ json }), json };

      await verificarBaseDatos({}, res);

      expect(pool.query).toHaveBeenCalledWith('SELECT NOW()');
      expect(res.json).toHaveBeenCalledWith({
        estado: 'OK',
        mensaje: 'Conexión exitosa a PostgreSQL',
        fechaServidor: '2026-01-01T00:00:00Z',
      });
    });

    test('responde 500 con detalle del error cuando falla la conexion', async () => {
      pool.query.mockRejectedValueOnce(new Error('connection refused'));
      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });
      const res = { status, json };

      await verificarBaseDatos({}, res);

      expect(status).toHaveBeenCalledWith(500);
      expect(json).toHaveBeenCalledWith({
        estado: 'ERROR',
        mensaje: 'Error al conectar con PostgreSQL',
        detalle: 'connection refused',
      });
    });
  });
});
