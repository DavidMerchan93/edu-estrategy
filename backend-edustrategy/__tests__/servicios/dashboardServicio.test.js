import { jest, describe, test, expect, beforeEach } from '@jest/globals';

jest.unstable_mockModule('../../src/consultas/dashboardConsultas.js', () => ({
  getAsignaturasPorSemestre: jest.fn(),
  getSemestreActivo: jest.fn(),
}));

const { getAsignaturasPorSemestre, getSemestreActivo } = await import(
  '../../src/consultas/dashboardConsultas.js'
);
const { getDashboardData } = await import('../../src/servicios/dashboardServicio.js');

describe('dashboardServicio.getDashboardData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('retorna objeto en ceros cuando el estudiante no tiene semestre activo', async () => {
    getSemestreActivo.mockResolvedValue(null);

    const data = await getDashboardData(42);

    expect(data).toEqual({
      semestreActivo: 'Sin semestre activo',
      totalAsignaturas: 0,
      promedioGeneral: 0,
      tiempoTotal: 0,
      asignaturas: [],
    });
    expect(getAsignaturasPorSemestre).not.toHaveBeenCalled();
  });

  test('mapea asignaturas y calcula promedio a 1 decimal cuando hay datos', async () => {
    getSemestreActivo.mockResolvedValue({ id_semestre: 1, nombre: '2026-1' });
    getAsignaturasPorSemestre.mockResolvedValue([
      {
        id_asignatura: 1,
        nombre: 'Cálculo Diferencial',
        nombre_docente: 'Dr. Garcia',
        hitos: '3',
        nota: '4.0',
        tiempo: '25',
      },
      {
        id_asignatura: 2,
        nombre: 'Matemáticas',
        nombre_docente: 'Dra. Lopez',
        hitos: '2',
        nota: '3.0',
        tiempo: '15',
      },
    ]);

    const data = await getDashboardData(1);

    expect(data.semestreActivo).toBe('2026-1');
    expect(data.totalAsignaturas).toBe(2);
    expect(data.promedioGeneral).toBe(3.5);
    expect(data.tiempoTotal).toBe(40);
    expect(data.asignaturas).toEqual([
      {
        id: 1,
        nombre: 'Cálculo Diferencial',
        codigo: 'CAL',
        docente: 'Dr. Garcia',
        hitos: 3,
        nota: 4.0,
        tiempo: 25,
        semestre: '2026-1',
      },
      {
        id: 2,
        nombre: 'Matemáticas',
        codigo: 'MAT',
        docente: 'Dra. Lopez',
        hitos: 2,
        nota: 3.0,
        tiempo: 15,
        semestre: '2026-1',
      },
    ]);
  });

  test('derivarCodigo quita tildes y limita a 3 letras (probado vía asignaturas)', async () => {
    getSemestreActivo.mockResolvedValue({ id_semestre: 1, nombre: '2026-1' });
    getAsignaturasPorSemestre.mockResolvedValue([
      {
        id_asignatura: 1,
        nombre: 'Álgebra Lineal',
        nombre_docente: 'D',
        hitos: '0',
        nota: '0',
        tiempo: '0',
      },
    ]);

    const data = await getDashboardData(1);
    expect(data.asignaturas[0].codigo).toBe('ALG');
  });

  test('derivarCodigo devuelve N/A cuando el nombre queda vacio tras normalizar', async () => {
    getSemestreActivo.mockResolvedValue({ id_semestre: 1, nombre: '2026-1' });
    getAsignaturasPorSemestre.mockResolvedValue([
      {
        id_asignatura: 1,
        nombre: '   !!!   ',
        nombre_docente: 'D',
        hitos: '0',
        nota: '0',
        tiempo: '0',
      },
    ]);

    const data = await getDashboardData(1);
    expect(data.asignaturas[0].codigo).toBe('N/A');
  });

  test('derivarCodigo devuelve N/A cuando el nombre es null/undefined', async () => {
    getSemestreActivo.mockResolvedValue({ id_semestre: 1, nombre: '2026-1' });
    getAsignaturasPorSemestre.mockResolvedValue([
      {
        id_asignatura: 1,
        nombre: null,
        nombre_docente: 'D',
        hitos: '0',
        nota: '0',
        tiempo: '0',
      },
    ]);

    const data = await getDashboardData(1);
    expect(data.asignaturas[0].codigo).toBe('N/A');
  });

  test('promedioGeneral queda en 0 cuando hay una asignatura sin notas (NaN -> 0 por branch)', async () => {
    getSemestreActivo.mockResolvedValue({ id_semestre: 1, nombre: '2026-1' });
    getAsignaturasPorSemestre.mockResolvedValue([
      {
        id_asignatura: 1,
        nombre: 'Fisica',
        nombre_docente: 'D',
        hitos: '0',
        nota: '0',
        tiempo: '0',
      },
    ]);

    const data = await getDashboardData(1);
    expect(data.promedioGeneral).toBe(0);
    expect(data.tiempoTotal).toBe(0);
    expect(data.totalAsignaturas).toBe(1);
  });
});
