const BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const getToken = () => localStorage.getItem('edu_token');

export async function apiObtenerPerfil(token) {
  const res = await fetch(`${BASE}/usuario/perfil`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || 'Error al obtener perfil.');
  return data.usuario;
}

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

export async function apiFetchDashboard(token) {
  const res = await fetch(`${BASE}/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al cargar datos.');
  return data; // { semestreActivo, totalAsignaturas, promedioGeneral, tiempoTotal, asignaturas }
}

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

export async function apiListarTiposActividad() {
  const res = await fetch(`${BASE}/hitos/tipos`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || 'Error al cargar tipos de actividad.');
  return data;
}

export async function apiListarHitos(idAsignatura) {
  const res = await fetch(`${BASE}/hitos/${idAsignatura}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || 'Error al cargar hitos.');
  return data;
}

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

export async function apiEliminarHito(idHito) {
  const res = await fetch(`${BASE}/hitos/${idHito}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || 'Error al eliminar hito.');
}

export async function apiEliminarAsignatura(id) {
  const res = await fetch(`${BASE}/asignaturas/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || 'Error al eliminar asignatura.');
}
