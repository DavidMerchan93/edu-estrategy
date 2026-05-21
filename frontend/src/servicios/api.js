const BASE_URL = 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');

export const obtenerAsignaturasApi = async () => {
  const res = await fetch(`${BASE_URL}/asignaturas`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje);
  return data.asignaturas;
};

export const crearAsignaturaApi = async (datos) => {
  const res = await fetch(`${BASE_URL}/asignaturas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(datos),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje);
  return data.asignatura;
};

export const actualizarAsignaturaApi = async (id, datos) => {
  const res = await fetch(`${BASE_URL}/asignaturas/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(datos),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje);
  return data.asignatura;
};

export const eliminarAsignaturaApi = async (id) => {
  const res = await fetch(`${BASE_URL}/asignaturas/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje);
};