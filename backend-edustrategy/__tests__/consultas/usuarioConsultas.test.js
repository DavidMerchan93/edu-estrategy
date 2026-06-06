import { jest, describe, test, expect, beforeEach } from '@jest/globals';

jest.unstable_mockModule('../../src/configuracion/baseDatos.js', () => ({
  pool: { query: jest.fn() },
}));

const { pool } = await import('../../src/configuracion/baseDatos.js');
const { getHistorialSemestresDB } = await import(
  '../../src/consultas/usuarioConsultas.js'
);

describe('usuarioConsultas.getHistorialSemestresDB', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('ejecuta query y retorna el historial con metricas agregadas', async () => {
    const filas = [
      {
        id_semestre: 1,
        nombre: '2026-1',
        activo: true,
        total_asignaturas: 5,
        promedio: '4.0',
        tiempo_total: 120,
      },
    ];
    pool.query.mockResolvedValueOnce({ rows: filas });

    const r = await getHistorialSemestresDB(7);

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('FROM semestre s'),
      [7]
    );
    expect(pool.query.mock.calls[0][0]).toContain('ORDER BY s.fecha_inicio DESC');
    expect(r).toEqual(filas);
  });

  test('retorna array vacio si el estudiante no tiene semestres', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const r = await getHistorialSemestresDB(99);
    expect(r).toEqual([]);
  });
});
