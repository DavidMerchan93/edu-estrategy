import { jest, describe, test, expect, beforeEach } from '@jest/globals';

jest.unstable_mockModule('../../src/configuracion/baseDatos.js', () => ({
  pool: { query: jest.fn() },
}));

const { pool } = await import('../../src/configuracion/baseDatos.js');
const {
  desactivarSemestresActivosDB,
  crearSemestreDB,
} = await import('../../src/consultas/semestreConsultas.js');

describe('semestreConsultas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('desactivarSemestresActivosDB', () => {
    test('ejecuta UPDATE poniendo activo=FALSE para el estudiante', async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 1 });

      await desactivarSemestresActivosDB(7);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE semestre SET activo = FALSE'),
        [7]
      );
    });
  });

  describe('crearSemestreDB', () => {
    test('inserta y retorna la fila del nuevo semestre', async () => {
      const fila = { id_semestre: 1, nombre: '2026-1', activo: true };
      pool.query.mockResolvedValueOnce({ rows: [fila] });

      const r = await crearSemestreDB(7, '2026-1', '2026-01-01', '2026-06-30', true);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO semestre'),
        [7, '2026-1', '2026-01-01', '2026-06-30', true]
      );
      expect(r).toEqual(fila);
    });
  });
});
