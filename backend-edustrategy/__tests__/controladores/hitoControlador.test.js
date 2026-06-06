import { jest, describe, test, expect, beforeEach } from '@jest/globals';

jest.unstable_mockModule('../../src/consultas/hitoConsultas.js', () => ({
  listarTiposActividad: jest.fn(),
  listarHitosPorAsignatura: jest.fn(),
  crearHitoDB: jest.fn(),
  actualizarHitoDB: jest.fn(),
  eliminarHitoDB: jest.fn(),
}));

const {
  listarTiposActividad,
  listarHitosPorAsignatura,
  crearHitoDB,
  actualizarHitoDB,
  eliminarHitoDB,
} = await import('../../src/consultas/hitoConsultas.js');
const {
  getTiposActividad,
  listarHitos,
  crearHito,
  actualizarHito,
  eliminarHito,
} = await import('../../src/controladores/hitoControlador.js');

describe('hitoControlador', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTiposActividad', () => {
    test('responde 200 con la lista de tipos', async () => {
      const tipos = [{ id_tipo: 1, nombre: 'Parcial' }];
      listarTiposActividad.mockResolvedValueOnce(tipos);

      const json = jest.fn();
      const res = { json };

      await getTiposActividad({}, res);

      expect(json).toHaveBeenCalledWith(tipos);
    });

    test('responde 500 si la consulta falla', async () => {
      listarTiposActividad.mockRejectedValueOnce(new Error('boom'));
      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });
      await getTiposActividad({}, { status, json });
      expect(status).toHaveBeenCalledWith(500);
    });
  });

  describe('listarHitos', () => {
    test('responde 200 con los hitos de la asignatura', async () => {
      const hitos = [{ id_hito: 1 }];
      listarHitosPorAsignatura.mockResolvedValueOnce(hitos);

      const json = jest.fn();
      await listarHitos(
        { usuario: { id_estudiante: 1 }, params: { idAsignatura: 2 } },
        { json }
      );

      expect(listarHitosPorAsignatura).toHaveBeenCalledWith(2, 1);
      expect(json).toHaveBeenCalledWith(hitos);
    });

    test('responde 500 si la consulta falla', async () => {
      listarHitosPorAsignatura.mockRejectedValueOnce(new Error('boom'));
      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });
      await listarHitos(
        { usuario: { id_estudiante: 1 }, params: { idAsignatura: 2 } },
        { status, json }
      );
      expect(status).toHaveBeenCalledWith(500);
    });
  });

  describe('crearHito', () => {
    const baseBody = {
      id_tipo_actividad: 1,
      fecha_inicio: '2024-01-01',
      fecha_cierre: '2024-01-10',
      horas_dedicadas: 5,
    };

    test('responde 400 si falta un campo obligatorio', async () => {
      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });

      await crearHito(
        {
          usuario: { id_estudiante: 1 },
          params: { idAsignatura: 2 },
          body: { ...baseBody, fecha_inicio: undefined },
        },
        { status, json }
      );

      expect(status).toHaveBeenCalledWith(400);
      expect(crearHitoDB).not.toHaveBeenCalled();
    });

    test('responde 400 si horas_dedicadas <= 0', async () => {
      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });

      await crearHito(
        {
          usuario: { id_estudiante: 1 },
          params: { idAsignatura: 2 },
          body: { ...baseBody, horas_dedicadas: 0 },
        },
        { status, json }
      );

      expect(status).toHaveBeenCalledWith(400);
    });

    test('responde 400 si fecha_cierre < fecha_inicio', async () => {
      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });

      await crearHito(
        {
          usuario: { id_estudiante: 1 },
          params: { idAsignatura: 2 },
          body: { ...baseBody, fecha_inicio: '2024-02-01', fecha_cierre: '2024-01-01' },
        },
        { status, json }
      );

      expect(status).toHaveBeenCalledWith(400);
    });

    test('responde 400 si la nota esta fuera del rango [0, 5]', async () => {
      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });

      await crearHito(
        {
          usuario: { id_estudiante: 1 },
          params: { idAsignatura: 2 },
          body: { ...baseBody, nota: 6 },
        },
        { status, json }
      );

      expect(status).toHaveBeenCalledWith(400);
    });

    test('responde 400 si la nota es negativa', async () => {
      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });

      await crearHito(
        {
          usuario: { id_estudiante: 1 },
          params: { idAsignatura: 2 },
          body: { ...baseBody, nota: -1 },
        },
        { status, json }
      );

      expect(status).toHaveBeenCalledWith(400);
    });

    test('parsea nota como float y envia null cuando viene vacia o undefined', async () => {
      crearHitoDB.mockResolvedValueOnce({ id_hito: 1 });
      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });

      await crearHito(
        {
          usuario: { id_estudiante: 1 },
          params: { idAsignatura: 2 },
          body: { ...baseBody, nota: '' },
        },
        { status, json }
      );

      expect(crearHitoDB.mock.calls[0]).toEqual([2, 1, 1, '2024-01-01', '2024-01-10', 5, null]);
      expect(status).toHaveBeenCalledWith(201);
    });

    test('parsea nota como float cuando viene valida', async () => {
      crearHitoDB.mockResolvedValueOnce({ id_hito: 1 });
      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });

      await crearHito(
        {
          usuario: { id_estudiante: 1 },
          params: { idAsignatura: 2 },
          body: { ...baseBody, nota: '4.5' },
        },
        { status, json }
      );

      expect(crearHitoDB.mock.calls[0][6]).toBe(4.5);
    });

    test('responde 404 si la asignatura no existe', async () => {
      crearHitoDB.mockResolvedValueOnce(null);
      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });

      await crearHito(
        {
          usuario: { id_estudiante: 1 },
          params: { idAsignatura: 2 },
          body: baseBody,
        },
        { status, json }
      );

      expect(status).toHaveBeenCalledWith(404);
      expect(json).toHaveBeenCalledWith({ mensaje: 'Asignatura no encontrada' });
    });

    test('responde 201 cuando crea el hito', async () => {
      crearHitoDB.mockResolvedValueOnce({ id_hito: 1 });
      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });

      await crearHito(
        {
          usuario: { id_estudiante: 1 },
          params: { idAsignatura: 2 },
          body: baseBody,
        },
        { status, json }
      );

      expect(status).toHaveBeenCalledWith(201);
      expect(json).toHaveBeenCalledWith({
        mensaje: 'Hito creado correctamente',
        hito: { id_hito: 1 },
      });
    });

    test('responde 500 si crearHitoDB lanza', async () => {
      crearHitoDB.mockRejectedValueOnce(new Error('boom'));
      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });

      await crearHito(
        {
          usuario: { id_estudiante: 1 },
          params: { idAsignatura: 2 },
          body: baseBody,
        },
        { status, json }
      );

      expect(status).toHaveBeenCalledWith(500);
    });
  });

  describe('actualizarHito', () => {
    const baseBody = {
      id_tipo_actividad: 1,
      fecha_inicio: '2024-01-01',
      fecha_cierre: '2024-01-10',
      horas_dedicadas: 5,
    };

    test('responde 400 si falta un campo obligatorio', async () => {
      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });
      await actualizarHito(
        { usuario: { id_estudiante: 1 }, params: { idHito: 1 }, body: { ...baseBody, horas_dedicadas: undefined } },
        { status, json }
      );
      expect(status).toHaveBeenCalledWith(400);
    });

    test('responde 400 si horas <= 0', async () => {
      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });
      await actualizarHito(
        { usuario: { id_estudiante: 1 }, params: { idHito: 1 }, body: { ...baseBody, horas_dedicadas: -2 } },
        { status, json }
      );
      expect(status).toHaveBeenCalledWith(400);
    });

    test('responde 400 si fecha_cierre < fecha_inicio', async () => {
      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });
      await actualizarHito(
        {
          usuario: { id_estudiante: 1 },
          params: { idHito: 1 },
          body: { ...baseBody, fecha_inicio: '2024-03-01', fecha_cierre: '2024-01-01' },
        },
        { status, json }
      );
      expect(status).toHaveBeenCalledWith(400);
    });

    test('responde 400 si la nota es mayor a 5', async () => {
      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });
      await actualizarHito(
        {
          usuario: { id_estudiante: 1 },
          params: { idHito: 1 },
          body: { ...baseBody, nota: 5.5 },
        },
        { status, json }
      );
      expect(status).toHaveBeenCalledWith(400);
    });

    test('acepta nota null cuando no se envia', async () => {
      actualizarHitoDB.mockResolvedValueOnce({ id_hito: 1 });
      const json = jest.fn();
      await actualizarHito(
        {
          usuario: { id_estudiante: 1 },
          params: { idHito: 1 },
          body: baseBody,
        },
        { json }
      );
      expect(actualizarHitoDB.mock.calls[0][6]).toBeNull();
    });

    test('responde 404 si el hito no existe', async () => {
      actualizarHitoDB.mockResolvedValueOnce(null);
      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });
      await actualizarHito(
        { usuario: { id_estudiante: 1 }, params: { idHito: 1 }, body: baseBody },
        { status, json }
      );
      expect(status).toHaveBeenCalledWith(404);
      expect(json).toHaveBeenCalledWith({ mensaje: 'Hito no encontrado' });
    });

    test('responde 200 cuando actualiza', async () => {
      actualizarHitoDB.mockResolvedValueOnce({ id_hito: 1 });
      const json = jest.fn();
      await actualizarHito(
        { usuario: { id_estudiante: 1 }, params: { idHito: 1 }, body: baseBody },
        { json }
      );
      expect(json).toHaveBeenCalledWith({
        mensaje: 'Hito actualizado correctamente',
        hito: { id_hito: 1 },
      });
    });

    test('responde 500 si actualizarHitoDB lanza', async () => {
      actualizarHitoDB.mockRejectedValueOnce(new Error('boom'));
      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });
      await actualizarHito(
        { usuario: { id_estudiante: 1 }, params: { idHito: 1 }, body: baseBody },
        { status, json }
      );
      expect(status).toHaveBeenCalledWith(500);
    });
  });

  describe('eliminarHito', () => {
    test('responde 404 si no existe', async () => {
      eliminarHitoDB.mockResolvedValueOnce(null);
      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });
      await eliminarHito(
        { usuario: { id_estudiante: 1 }, params: { idHito: 1 } },
        { status, json }
      );
      expect(status).toHaveBeenCalledWith(404);
    });

    test('responde 200 cuando elimina', async () => {
      eliminarHitoDB.mockResolvedValueOnce({ id_hito: 1 });
      const json = jest.fn();
      await eliminarHito(
        { usuario: { id_estudiante: 1 }, params: { idHito: 1 } },
        { json }
      );
      expect(json).toHaveBeenCalledWith({ mensaje: 'Hito eliminado correctamente' });
    });

    test('responde 500 si eliminarHitoDB lanza', async () => {
      eliminarHitoDB.mockRejectedValueOnce(new Error('boom'));
      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });
      await eliminarHito(
        { usuario: { id_estudiante: 1 }, params: { idHito: 1 } },
        { status, json }
      );
      expect(status).toHaveBeenCalledWith(500);
    });
  });
});
