import { jest, describe, test, expect, beforeEach } from '@jest/globals';

jest.unstable_mockModule('../../src/consultas/semestreConsultas.js', () => ({
  desactivarSemestresActivosDB: jest.fn(),
  crearSemestreDB: jest.fn(),
}));

const { desactivarSemestresActivosDB, crearSemestreDB } = await import(
  '../../src/consultas/semestreConsultas.js'
);
const { crearSemestre } = await import(
  '../../src/controladores/semestreControlador.js'
);

describe('semestreControlador.crearSemestre', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('responde 400 si faltan campos obligatorios', async () => {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });

    await crearSemestre({ usuario: { id_estudiante: 1 }, body: {} }, { status, json });

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({
      mensaje: 'Nombre, fecha de inicio y fecha de fin son obligatorios',
    });
    expect(crearSemestreDB).not.toHaveBeenCalled();
  });

  test('desactiva semestres anteriores y crea uno nuevo cuando activo=true', async () => {
    desactivarSemestresActivosDB.mockResolvedValueOnce();
    crearSemestreDB.mockResolvedValueOnce({ id_semestre: 1, nombre: '2026-1', activo: true });

    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });

    await crearSemestre(
      {
        usuario: { id_estudiante: 1 },
        body: { nombre: '2026-1', fecha_inicio: '2026-01-01', fecha_fin: '2026-06-30', activo: true },
      },
      { status, json }
    );

    expect(desactivarSemestresActivosDB).toHaveBeenCalledWith(1);
    expect(crearSemestreDB).toHaveBeenCalledWith(1, '2026-1', '2026-01-01', '2026-06-30', true);
    expect(status).toHaveBeenCalledWith(201);
    expect(json).toHaveBeenCalledWith({
      mensaje: 'Semestre creado correctamente',
      semestre: expect.objectContaining({ id_semestre: 1 }),
    });
  });

  test('no desactiva semestres cuando activo no es true', async () => {
    crearSemestreDB.mockResolvedValueOnce({ id_semestre: 2, nombre: '2026-2', activo: false });

    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });

    await crearSemestre(
      {
        usuario: { id_estudiante: 1 },
        body: { nombre: '2026-2', fecha_inicio: '2026-07-01', fecha_fin: '2026-12-31' },
      },
      { status, json }
    );

    expect(desactivarSemestresActivosDB).not.toHaveBeenCalled();
    expect(crearSemestreDB).toHaveBeenCalledWith(1, '2026-2', '2026-07-01', '2026-12-31', false);
  });

  test('responde 500 cuando el servicio lanza un error', async () => {
    crearSemestreDB.mockRejectedValueOnce(new Error('boom'));

    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });

    await crearSemestre(
      {
        usuario: { id_estudiante: 1 },
        body: { nombre: '2026-1', fecha_inicio: '2026-01-01', fecha_fin: '2026-06-30' },
      },
      { status, json }
    );

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ mensaje: 'boom' });
  });
});
