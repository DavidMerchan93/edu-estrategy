import { jest, describe, test, expect, beforeEach } from '@jest/globals';

jest.unstable_mockModule('../../src/configuracion/baseDatos.js', () => ({
  pool: { query: jest.fn() },
}));

const { pool } = await import('../../src/configuracion/baseDatos.js');
const {
  listarTiposActividad,
  listarHitosPorAsignatura,
  crearHitoDB,
  actualizarHitoDB,
  eliminarHitoDB,
} = await import('../../src/consultas/hitoConsultas.js');

describe('hitoConsultas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listarTiposActividad', () => {
    test('retorna la lista ordenada por nombre', async () => {
      const filas = [{ id_tipo: 1, nombre: 'Parcial' }];
      pool.query.mockResolvedValueOnce({ rows: filas });

      const r = await listarTiposActividad();

      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('ORDER BY nombre'));
      expect(r).toEqual(filas);
    });
  });

  describe('listarHitosPorAsignatura', () => {
    test('lista hitos verificando que la asignatura pertenece al estudiante', async () => {
      const filas = [{ id_hito: 1 }];
      pool.query.mockResolvedValueOnce({ rows: filas });

      const r = await listarHitosPorAsignatura(2, 7);

      expect(pool.query.mock.calls[0][1]).toEqual([2, 7]);
      expect(r).toEqual(filas);
    });
  });

  describe('crearHitoDB', () => {
    test('retorna el hito creado cuando la asignatura pertenece al estudiante', async () => {
      const fila = { id_hito: 1 };
      pool.query.mockResolvedValueOnce({ rows: [fila] });

      const r = await crearHitoDB(2, 7, 3, '2024-01-01', '2024-01-10', 5, 4.0);

      expect(pool.query.mock.calls[0][0]).toContain('INSERT INTO hito');
      expect(pool.query.mock.calls[0][0]).toContain('EXISTS');
      expect(pool.query.mock.calls[0][1]).toEqual([2, 3, '2024-01-01', '2024-01-10', 5, 4.0, 2, 7]);
      expect(r).toEqual(fila);
    });

    test('acepta nota null', async () => {
      const fila = { id_hito: 1 };
      pool.query.mockResolvedValueOnce({ rows: [fila] });

      const r = await crearHitoDB(2, 7, 3, '2024-01-01', '2024-01-10', 5, null);

      expect(pool.query.mock.calls[0][1][5]).toBeNull();
      expect(r).toEqual(fila);
    });

    test('retorna null si la asignatura no existe o no pertenece al estudiante', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });
      const r = await crearHitoDB(2, 7, 3, '2024-01-01', '2024-01-10', 5, 4.0);
      expect(r).toBeNull();
    });
  });

  describe('actualizarHitoDB', () => {
    test('retorna el hito actualizado cuando pertenece al estudiante', async () => {
      const fila = { id_hito: 1 };
      pool.query.mockResolvedValueOnce({ rows: [fila] });

      const r = await actualizarHitoDB(1, 7, 3, '2024-01-01', '2024-01-10', 5, 4.0);

      expect(pool.query.mock.calls[0][0]).toContain('UPDATE hito');
      expect(pool.query.mock.calls[0][1]).toEqual([3, '2024-01-01', '2024-01-10', 5, 4.0, 1, 7]);
      expect(r).toEqual(fila);
    });

    test('retorna null si el hito no existe', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });
      const r = await actualizarHitoDB(1, 7, 3, '2024-01-01', '2024-01-10', 5, 4.0);
      expect(r).toBeNull();
    });
  });

  describe('eliminarHitoDB', () => {
    test('retorna la fila eliminada cuando pertenece al estudiante', async () => {
      const fila = { id_hito: 1 };
      pool.query.mockResolvedValueOnce({ rows: [fila] });

      const r = await eliminarHitoDB(1, 7);

      expect(pool.query.mock.calls[0][0]).toContain('DELETE FROM hito');
      expect(pool.query.mock.calls[0][1]).toEqual([1, 7]);
      expect(r).toEqual(fila);
    });

    test('retorna null si el hito no existe', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });
      const r = await eliminarHitoDB(1, 7);
      expect(r).toBeNull();
    });
  });
});
