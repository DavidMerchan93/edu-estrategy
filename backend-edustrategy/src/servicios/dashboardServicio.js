import {
  getAsignaturasPorSemestre,
  getSemestreActivo,
} from '../consultas/dashboardConsultas.js';

function derivarCodigo(nombre) {
  return (nombre || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z\s]/g, '')
    .trim()
    .substring(0, 3)
    .toUpperCase() || 'N/A';
}

export async function getDashboardData(idEstudiante) {
  const sem = await getSemestreActivo(idEstudiante);

  if (!sem) {
    return {
      semestreActivo: 'Sin semestre activo',
      totalAsignaturas: 0,
      promedioGeneral: 0,
      tiempoTotal: 0,
      asignaturas: [],
    };
  }

  const filas = await getAsignaturasPorSemestre(sem.id_semestre);

  const asignaturas = filas.map((a) => ({
    id: a.id_asignatura,
    nombre: a.nombre,
    codigo: derivarCodigo(a.nombre),
    docente: a.nombre_docente,
    hitos: parseInt(a.hitos, 10),
    nota: parseFloat(a.nota),
    tiempo: parseInt(a.tiempo, 10),
    semestre: sem.nombre,
  }));

  const totalAsignaturas = asignaturas.length;
  const promedioGeneral =
    totalAsignaturas > 0
      ? parseFloat(
          (asignaturas.reduce((s, a) => s + a.nota, 0) / totalAsignaturas).toFixed(1)
        )
      : 0;
  const tiempoTotal = asignaturas.reduce((s, a) => s + a.tiempo, 0);

  return {
    semestreActivo: sem.nombre,
    totalAsignaturas,
    promedioGeneral,
    tiempoTotal,
    asignaturas,
  };
}
