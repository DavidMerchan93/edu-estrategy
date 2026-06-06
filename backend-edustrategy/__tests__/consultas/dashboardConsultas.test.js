import { jest, describe, test, expect, beforeEach } from '@jest/globals';

jest.unstable_mockModule('../../src/configuracion/baseDatos.js', () => ({
  pool: { query: jest.fn() },
}));

const { pool } = await import('../../src/configuracion/baseDatos.js');
const {
  getAsignaturasPorSemestre,
  getSemestreActivo,
} = await import('../../src/consultas/dashboardConsultas.js');

describe('dashboardConsultas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAsignaturasPorSemestre', () => {
    test('ejecuta el query con idSemestre y retorna filas', async () => {
      const filas = [{ id_asignatura: 1, hitos: '3', nota: '4.0', tiempo: '25' }];
      pool.query.mockResolvedValueOnce({ rows: filas });

      const r = await getAsignaturasPorSemestre(1);

      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('GROUP BY'), [1]);
      expect(pool.query.mock.calls[0][0]).toContain('COUNT(h.id_hito)');
      expect(r).toEqual(filas);
    });

    test('retorna array vacio si el semestre no tiene asignaturas', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });
      const r = await getAsignaturasPorSemestre(99);
      expect(r).toEqual([]);
    });
  });

  describe('getSemestreActivo', () => {
    test('retorna la fila del semestre activo', async () => {
      const fila = { id_semestre: 1, nombre: '2026-1' };
      pool.query.mockResolvedValueOnce({ rows: [fila] });

      const r = await getSemestreActivo(7);

      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('activo = TRUE'), [7]);
      expect(r).toEqual(fila);
    });

    test('retorna null cuando no hay semestre activo', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });
      const r = await getSemestreActivo(7);
      expect(r).toBeNull();
    });
  });
});
