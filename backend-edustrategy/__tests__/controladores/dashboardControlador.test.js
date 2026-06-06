import { jest, describe, test, expect, beforeEach } from '@jest/globals';

jest.unstable_mockModule('../../src/servicios/dashboardServicio.js', () => ({
  getDashboardData: jest.fn(),
}));

const { getDashboardData } = await import('../../src/servicios/dashboardServicio.js');
const { getDashboard } = await import(
  '../../src/controladores/dashboardControlador.js'
);

describe('dashboardControlador', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('responde 200 con los datos del dashboard', async () => {
    const data = { semestreActivo: '2026-1', totalAsignaturas: 2, asignaturas: [] };
    getDashboardData.mockResolvedValueOnce(data);

    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const req = { usuario: { id_estudiante: 1 } };

    await getDashboard(req, { status, json });

    expect(getDashboardData).toHaveBeenCalledWith(1);
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(data);
  });

  test('responde 500 con mensaje cuando el servicio lanza un error generico', async () => {
    getDashboardData.mockRejectedValueOnce(new Error('boom'));

    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });

    await getDashboard({ usuario: { id_estudiante: 1 } }, { status, json });

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ mensaje: 'boom' });
  });

  test('usa "Error interno del servidor" cuando el error no tiene message', async () => {
    getDashboardData.mockRejectedValueOnce({});

    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });

    await getDashboard({ usuario: { id_estudiante: 1 } }, { status, json });

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ mensaje: 'Error interno del servidor' });
  });
});
