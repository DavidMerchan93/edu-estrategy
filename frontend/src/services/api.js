/** URL base de la API. Configurable via REACT_APP_API_URL en .env.development. */
const BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/** @returns {string | null} Token JWT almacenado en localStorage */
const getToken = () => localStorage.getItem('edu_token');

/**
 * Obtiene el perfil del usuario autenticado.
 * @param {string} token - JWT de sesion
 * @returns {Promise<Object>} Datos del perfil (nombre_completo, carrera, semestre_actual, email)
 */
export async function apiObtenerPerfil(token) {
  const res = await fetch(`${BASE}/usuario/perfil`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || 'Error al obtener perfil.');
  return data.usuario;
}

/**
 * Autentica al usuario y devuelve el token JWT junto con sus datos basicos.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ token: string, usuario: Object }>}
 */
export async function apiLogin(email, password) {
  const res = await fetch(`${BASE}/autenticacion/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al iniciar sesión.');
  return data; // { token, usuario }
}

/**
 * Carga los datos consolidados del tablero para el semestre activo.
 * @param {string} token - JWT de sesion
 * @returns {Promise<{ semestreActivo: string, totalAsignaturas: number, promedioGeneral: number, tiempoTotal: number, asignaturas: Array }>}
 */
export async function apiFetchDashboard(token) {
  const res = await fetch(`${BASE}/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al cargar datos.');
  return data; // { semestreActivo, totalAsignaturas, promedioGeneral, tiempoTotal, asignaturas }
}

/**
 * Crea una asignatura en el semestre activo del usuario autenticado.
 * @param {{ nombre: string, docente: string }} datos
 * @returns {Promise<Object>} Asignatura creada (id_asignatura, id_semestre, nombre, nombre_docente)
 */
export async function apiCrearAsignatura(datos) {
  const res = await fetch(`${BASE}/asignaturas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(datos),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || 'Error al crear asignatura.');
  return data.asignatura; // { id_asignatura, id_semestre, nombre, nombre_docente }
}

/**
 * Actualiza el nombre y el docente de una asignatura.
 * @param {number} id - ID de la asignatura
 * @param {{ nombre: string, docente: string }} datos
 * @returns {Promise<Object>} Asignatura actualizada
 */
export async function apiActualizarAsignatura(id, datos) {
  const res = await fetch(`${BASE}/asignaturas/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(datos),
  });
  const data = await res.json();
  if (!res.ok)
    throw new Error(data.mensaje || 'Error al actualizar asignatura.');
  return data.asignatura; // { id_asignatura, id_semestre, nombre, nombre_docente }
}

/**
 * Crea un nuevo semestre para el usuario autenticado.
 * @param {{ nombre: string, fecha_inicio: string, fecha_fin: string, activo: boolean }} datos
 * @returns {Promise<Object>} Semestre creado
 */
export async function apiCrearSemestre(datos) {
  const res = await fetch(`${BASE}/semestres`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(datos),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || 'Error al crear semestre.');
  return data.semestre;
}

/**
 * Obtiene todos los tipos de actividad disponibles para los hitos.
 * @returns {Promise<Array<{ id_tipo: number, nombre: string }>>}
 */
export async function apiListarTiposActividad() {
  const res = await fetch(`${BASE}/hitos/tipos`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const data = await res.json();
  if (!res.ok)
    throw new Error(data.mensaje || 'Error al cargar tipos de actividad.');
  return data;
}

/**
 * Lista todos los hitos de una asignatura del usuario autenticado.
 * @param {number} idAsignatura
 * @returns {Promise<Array<Object>>}
 */
export async function apiListarHitos(idAsignatura) {
  const res = await fetch(`${BASE}/hitos/${idAsignatura}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || 'Error al cargar hitos.');
  return data;
}

/**
 * Crea un hito para una asignatura del usuario autenticado.
 * @param {number} idAsignatura
 * @param {{ id_tipo_actividad: number, fecha_inicio: string, fecha_cierre: string, horas_dedicadas: number, nota: number | null }} datos
 * @returns {Promise<Object>} Hito creado
 */
export async function apiCrearHito(idAsignatura, datos) {
  const res = await fetch(`${BASE}/hitos/${idAsignatura}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(datos),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || 'Error al crear hito.');
  return data.hito;
}

/**
 * Actualiza un hito existente del usuario autenticado.
 * @param {number} idHito
 * @param {{ id_tipo_actividad: number, fecha_inicio: string, fecha_cierre: string, horas_dedicadas: number, nota: number | null }} datos
 * @returns {Promise<Object>} Hito actualizado
 */
export async function apiActualizarHito(idHito, datos) {
  const res = await fetch(`${BASE}/hitos/${idHito}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(datos),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || 'Error al actualizar hito.');
  return data.hito;
}

/**
 * Elimina un hito del usuario autenticado.
 * @param {number} idHito
 * @returns {Promise<void>}
 */
export async function apiEliminarHito(idHito) {
  const res = await fetch(`${BASE}/hitos/${idHito}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || 'Error al eliminar hito.');
}

/**
 * Elimina una asignatura del usuario autenticado.
 * @param {number} id - ID de la asignatura
 * @returns {Promise<void>}
 */
export async function apiEliminarAsignatura(id) {
  const res = await fetch(`${BASE}/asignaturas/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || 'Error al eliminar asignatura.');
}
