import { jest, describe, test, expect, beforeEach } from '@jest/globals';

jest.unstable_mockModule('../../src/configuracion/baseDatos.js', () => ({
  pool: { query: jest.fn() },
}));

const { pool } = await import('../../src/configuracion/baseDatos.js');
const {
  getSemestreActivoPorEstudiante,
  crearAsignaturaDB,
  actualizarAsignaturaDB,
  eliminarAsignaturaDB,
} = await import('../../src/consultas/asignaturaConsultas.js');

describe('asignaturaConsultas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSemestreActivoPorEstudiante', () => {
    test('retorna la fila cuando existe semestre activo', async () => {
      const fila = { id_semestre: 1 };
      pool.query.mockResolvedValueOnce({ rows: [fila] });

      const r = await getSemestreActivoPorEstudiante(7);

      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('activo = TRUE'), [7]);
      expect(r).toEqual(fila);
    });

    test('retorna null cuando no hay semestre activo', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });
      const r = await getSemestreActivoPorEstudiante(7);
      expect(r).toBeNull();
    });
  });

  describe('crearAsignaturaDB', () => {
    test('inserta y retorna la fila creada', async () => {
      const fila = { id_asignatura: 1, nombre: 'Mate', nombre_docente: 'D' };
      pool.query.mockResolvedValueOnce({ rows: [fila] });

      const r = await crearAsignaturaDB(1, 'Mate', 'D');

      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO asignatura'), [
        1,
        'Mate',
        'D',
      ]);
      expect(r).toEqual(fila);
    });
  });

  describe('actualizarAsignaturaDB', () => {
    test('retorna la fila actualizada cuando pertenece al estudiante', async () => {
      const fila = { id_asignatura: 1, nombre: 'N', nombre_docente: 'D' };
      pool.query.mockResolvedValueOnce({ rows: [fila] });

      const r = await actualizarAsignaturaDB(1, 7, 'N', 'D');

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE asignatura'),
        ['N', 'D', 1, 7]
      );
      expect(r).toEqual(fila);
    });

    test('retorna null cuando no existe o no pertenece al estudiante', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });
      const r = await actualizarAsignaturaDB(1, 7, 'N', 'D');
      expect(r).toBeNull();
    });
  });

  describe('eliminarAsignaturaDB', () => {
    test('retorna la fila eliminada cuando pertenece al estudiante', async () => {
      const fila = { id_asignatura: 1 };
      pool.query.mockResolvedValueOnce({ rows: [fila] });

      const r = await eliminarAsignaturaDB(1, 7);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM asignatura'),
        [1, 7]
      );
      expect(r).toEqual(fila);
    });

    test('retorna null cuando no existe', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });
      const r = await eliminarAsignaturaDB(1, 7);
      expect(r).toBeNull();
    });
  });
});
