const {
  getAsignaturasPorSemestre,
  getSemestreActivo,
} = require('../queries/dashboard.queries');

function derivarCodigo(nombre) {
  return (nombre || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z\s]/g, '')
    .trim()
    .substring(0, 3)
    .toUpperCase() || 'N/A';
}

async function getDashboardData(idEstudiante, idSemestreFromToken) {
  let idSemestre = idSemestreFromToken;
  let semestreNombre = null;

  if (!idSemestre) {
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
    idSemestre = sem.id_semestre;
    semestreNombre = sem.nombre;
  } else {
    const sem = await getSemestreActivo(idEstudiante);
    semestreNombre = sem ? sem.nombre : null;
  }

  const filas = await getAsignaturasPorSemestre(idSemestre);

  const asignaturas = filas.map((a) => ({
    id: a.id_asignatura,
    nombre: a.nombre,
    codigo: derivarCodigo(a.nombre),
    docente: a.nombre_docente,
    hitos: parseInt(a.hitos, 10),
    nota: parseFloat(a.nota),
    tiempo: parseInt(a.tiempo, 10),
    semestre: semestreNombre,
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
    semestreActivo: semestreNombre,
    totalAsignaturas,
    promedioGeneral,
    tiempoTotal,
    asignaturas,
  };
}

module.exports = { getDashboardData };
