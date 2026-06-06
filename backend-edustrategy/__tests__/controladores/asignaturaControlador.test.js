import { jest, describe, test, expect, beforeEach } from '@jest/globals';

jest.unstable_mockModule('../../src/consultas/asignaturaConsultas.js', () => ({
  getSemestreActivoPorEstudiante: jest.fn(),
  crearAsignaturaDB: jest.fn(),
  actualizarAsignaturaDB: jest.fn(),
  eliminarAsignaturaDB: jest.fn(),
}));

const {
  getSemestreActivoPorEstudiante,
  crearAsignaturaDB,
  actualizarAsignaturaDB,
  eliminarAsignaturaDB,
} = await import('../../src/consultas/asignaturaConsultas.js');
const {
  crearAsignatura,
  actualizarAsignatura,
  eliminarAsignatura,
} = await import('../../src/controladores/asignaturaControlador.js');

describe('asignaturaControlador', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('crearAsignatura', () => {
    test('responde 400 si falta nombre o docente', async () => {
      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });

      await crearAsignatura(
        { usuario: { id_estudiante: 1 }, body: { nombre: 'x' } },
        { status, json }
      );

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({ mensaje: 'Nombre y docente son obligatorios' });
      expect(getSemestreActivoPorEstudiante).not.toHaveBeenCalled();
    });

    test('responde 404 si el estudiante no tiene semestre activo', async () => {
      getSemestreActivoPorEstudiante.mockResolvedValueOnce(null);

      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });

      await crearAsignatura(
        {
          usuario: { id_estudiante: 1 },
          body: { nombre: 'Mate', docente: 'Dr. X' },
        },
        { status, json }
      );

      expect(status).toHaveBeenCalledWith(404);
      expect(json).toHaveBeenCalledWith({ mensaje: 'No tienes un semestre activo' });
      expect(crearAsignaturaDB).not.toHaveBeenCalled();
    });

    test('responde 201 cuando crea la asignatura', async () => {
      getSemestreActivoPorEstudiante.mockResolvedValueOnce({ id_semestre: 1 });
      crearAsignaturaDB.mockResolvedValueOnce({
        id_asignatura: 1,
        nombre: 'Mate',
        nombre_docente: 'Dr. X',
      });

      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });

      await crearAsignatura(
        {
          usuario: { id_estudiante: 1 },
          body: { nombre: ' Mate ', docente: ' Dr. X ' },
        },
        { status, json }
      );

      expect(crearAsignaturaDB).toHaveBeenCalledWith(1, 'Mate', 'Dr. X');
      expect(status).toHaveBeenCalledWith(201);
      expect(json).toHaveBeenCalledWith({
        mensaje: 'Asignatura creada correctamente',
        asignatura: expect.objectContaining({ id_asignatura: 1 }),
      });
    });

    test('responde 500 si crearAsignaturaDB lanza', async () => {
      getSemestreActivoPorEstudiante.mockResolvedValueOnce({ id_semestre: 1 });
      crearAsignaturaDB.mockRejectedValueOnce(new Error('boom'));

      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });

      await crearAsignatura(
        {
          usuario: { id_estudiante: 1 },
          body: { nombre: 'Mate', docente: 'Dr. X' },
        },
        { status, json }
      );

      expect(status).toHaveBeenCalledWith(500);
      expect(json).toHaveBeenCalledWith({ mensaje: 'boom' });
    });
  });

  describe('actualizarAsignatura', () => {
    test('responde 400 si falta nombre o docente', async () => {
      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });

      await actualizarAsignatura(
        { usuario: { id_estudiante: 1 }, params: { id: 1 }, body: { nombre: 'x' } },
        { status, json }
      );

      expect(status).toHaveBeenCalledWith(400);
    });

    test('responde 404 si la asignatura no existe o no pertenece al estudiante', async () => {
      actualizarAsignaturaDB.mockResolvedValueOnce(null);

      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });

      await actualizarAsignatura(
        {
          usuario: { id_estudiante: 1 },
          params: { id: 1 },
          body: { nombre: 'Mate', docente: 'Dr. X' },
        },
        { status, json }
      );

      expect(actualizarAsignaturaDB).toHaveBeenCalledWith(1, 1, 'Mate', 'Dr. X');
      expect(status).toHaveBeenCalledWith(404);
      expect(json).toHaveBeenCalledWith({ mensaje: 'Asignatura no encontrada' });
    });

    test('responde 200 cuando actualiza correctamente', async () => {
      actualizarAsignaturaDB.mockResolvedValueOnce({ id_asignatura: 1, nombre: 'N' });

      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });

      await actualizarAsignatura(
        {
          usuario: { id_estudiante: 1 },
          params: { id: 1 },
          body: { nombre: 'N', docente: 'D' },
        },
        { status, json }
      );

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({
        mensaje: 'Asignatura actualizada correctamente',
        asignatura: expect.objectContaining({ id_asignatura: 1 }),
      });
    });

    test('responde 500 si actualizarAsignaturaDB lanza', async () => {
      actualizarAsignaturaDB.mockRejectedValueOnce(new Error('boom'));

      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });

      await actualizarAsignatura(
        {
          usuario: { id_estudiante: 1 },
          params: { id: 1 },
          body: { nombre: 'N', docente: 'D' },
        },
        { status, json }
      );

      expect(status).toHaveBeenCalledWith(500);
      expect(json).toHaveBeenCalledWith({ mensaje: 'boom' });
    });
  });

  describe('eliminarAsignatura', () => {
    test('responde 404 si no existe', async () => {
      eliminarAsignaturaDB.mockResolvedValueOnce(null);

      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });

      await eliminarAsignatura(
        { usuario: { id_estudiante: 1 }, params: { id: 1 } },
        { status, json }
      );

      expect(status).toHaveBeenCalledWith(404);
      expect(json).toHaveBeenCalledWith({ mensaje: 'Asignatura no encontrada' });
    });

    test('responde 200 cuando elimina correctamente', async () => {
      eliminarAsignaturaDB.mockResolvedValueOnce({ id_asignatura: 1 });

      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });

      await eliminarAsignatura(
        { usuario: { id_estudiante: 1 }, params: { id: 1 } },
        { status, json }
      );

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({ mensaje: 'Asignatura eliminada correctamente' });
    });

    test('responde 500 si eliminarAsignaturaDB lanza', async () => {
      eliminarAsignaturaDB.mockRejectedValueOnce(new Error('boom'));

      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });

      await eliminarAsignatura(
        { usuario: { id_estudiante: 1 }, params: { id: 1 } },
        { status, json }
      );

      expect(status).toHaveBeenCalledWith(500);
      expect(json).toHaveBeenCalledWith({ mensaje: 'boom' });
    });
  });
});
