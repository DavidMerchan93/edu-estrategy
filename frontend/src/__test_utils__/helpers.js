/**
 * Helpers compartidos entre los tests de integración del frontend.
 * Mockean globalmente la API fetch y exponen utilidades para crear
 * respuestas tipadas, inspeccionar llamadas y armar datos de prueba.
 */
import { jest } from '@jest/globals';

const BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const okJson = (body, init = {}) =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve(body),
    ...init,
  });

export const errorJson = (body, status = 400) =>
  Promise.resolve({
    ok: false,
    status,
    json: () => Promise.resolve(body),
  });

/**
 * Mockea `global.fetch` con una función que responde según una tabla
 * `{ [urlSufijo]: respuesta }` y guarda cada llamada para inspección.
 */
export const mockFetchWith = (handlers) => {
  const calls = [];
  const spy = jest.fn((url, options = {}) => {
    calls.push({ url, options });
    for (const [suffix, response] of Object.entries(handlers)) {
      if (url.includes(suffix)) {
        return typeof response === 'function' ? response(url, options) : response;
      }
    }
    return errorJson({ mensaje: 'No mock para ' + url }, 404);
  });
  global.fetch = spy;
  return { spy, calls };
};

export const findCall = (calls, urlIncludes, method) =>
  calls.find(
    (c) => c.url.includes(urlIncludes) && (!method || (c.options.method || 'GET') === method)
  );

export const usuarioDemo = {
  id_estudiante: 1,
  nombre_completo: 'David Demo',
  carrera: 'Ingeniería de Sistemas',
  semestre_actual: 5,
  fecha_ingreso: '2024-01-15',
  email: 'david@correo.edu.co',
  verificado: true,
  foto_url: null,
};

export const dashboardDemo = {
  semestreActivo: '2026-1',
  totalAsignaturas: 2,
  promedioGeneral: 4.2,
  tiempoTotal: 35,
  asignaturas: [
    {
      id: 1,
      nombre: 'Cálculo Diferencial',
      codigo: 'CAL',
      docente: 'Dr. García',
      hitos: 3,
      nota: 4.5,
      tiempo: 25,
      semestre: '2026-1',
    },
    {
      id: 2,
      nombre: 'Matemáticas Discretas',
      codigo: 'MAT',
      docente: 'Dra. López',
      hitos: 1,
      nota: 3.8,
      tiempo: 10,
      semestre: '2026-1',
    },
  ],
};

export { BASE };
