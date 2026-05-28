import {
  getAsignaturasPorSemestre,
  getSemestreActivo,
} from '../consultas/dashboardConsultas.js';

/**
 * Deriva un codigo de 3 letras en mayusculas a partir del nombre de la asignatura.
 * Elimina tildes y caracteres no alfabeticos antes de tomar los primeros 3 caracteres.
 * @param {string} nombre - Nombre de la asignatura
 * @returns {string} Codigo de 3 letras o 'N/A' si el nombre esta vacio
 */
function derivarCodigo(nombre) {
  return (nombre || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z\s]/g, '')
    .trim()
    .substring(0, 3)
    .toUpperCase() || 'N/A';
}

/**
 * Agrega y devuelve los datos del tablero para el semestre activo del estudiante.
 * Si no existe un semestre activo, retorna un objeto con valores en cero y lista vacia.
 * @param {number} idEstudiante - ID del estudiante autenticado
 * @returns {Promise<{
 *   semestreActivo: string,
 *   totalAsignaturas: number,
 *   promedioGeneral: number,
 *   tiempoTotal: number,
 *   asignaturas: Array<{
 *     id: number, nombre: string, codigo: string, docente: string,
 *     hitos: number, nota: number, tiempo: number, semestre: string
 *   }>
 * }>}
 */
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
