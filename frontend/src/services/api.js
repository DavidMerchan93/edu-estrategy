const BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

export async function apiLogin(email, password) {
  const res = await fetch(`${BASE}/auth/login`, {
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
