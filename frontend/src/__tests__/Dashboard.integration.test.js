import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from '../componentes/Dashboard';
import {
  mockFetchWith,
  okJson,
  errorJson,
  findCall,
  usuarioDemo,
  dashboardDemo,
} from '../__test_utils__/helpers';

const renderDashboard = () => {
  const setPantalla = jest.fn();
  const setUsuario = jest.fn();
  const utils = render(
    <Dashboard
      setPantalla={setPantalla}
      usuario={usuarioDemo}
      setUsuario={setUsuario}
    />
  );
  return { setPantalla, setUsuario, ...utils };
};

describe('Integración - Dashboard', () => {
  beforeEach(() => {
    localStorage.setItem('edu_token', 'jwt-test');
  });

  test('carga los datos del dashboard al montar y los renderiza en la tabla y estadísticas', async () => {
    mockFetchWith({ '/dashboard': okJson(dashboardDemo) });

    renderDashboard();

    expect(await screen.findByText(/Cálculo Diferencial/i)).toBeInTheDocument();
    expect(screen.getByText(/Matemáticas Discretas/i)).toBeInTheDocument();
    expect(screen.getByText(/Semestre 2026-1 · Activo/i)).toBeInTheDocument();
    expect(screen.getByText(/35h/)).toBeInTheDocument();
    expect(screen.getAllByText(/2/).length).toBeGreaterThan(0); // totalAsignaturas
  });

  test('filtra la tabla de asignaturas segun el buscador', async () => {
    mockFetchWith({ '/dashboard': okJson(dashboardDemo) });
    renderDashboard();

    const input = await screen.findByPlaceholderText(/Buscar asignatura/i);
    userEvent.type(input, 'mat');

    await waitFor(() => {
      expect(screen.getByText(/Matemáticas Discretas/i)).toBeInTheDocument();
      expect(screen.queryByText(/Cálculo Diferencial/i)).not.toBeInTheDocument();
    });

    userEvent.clear(input);
    userEvent.type(input, 'xyz-no-existe');
    expect(screen.getByText(/No se encontraron asignaturas/i)).toBeInTheDocument();
  });

  test('abre el modal de crear asignatura, lo rellena y crea la asignatura via API', async () => {
    const { calls } = mockFetchWith({
      '/dashboard': okJson(dashboardDemo),
      '/asignaturas': okJson({
        id_asignatura: 99,
        id_semestre: 1,
        nombre: 'Física',
        nombre_docente: 'Dr. Newton',
      }),
    });

    renderDashboard();
    await screen.findByText(/Cálculo Diferencial/i);

    userEvent.click(screen.getByRole('button', { name: /\+ Crear asignatura/i }));

    await screen.findByText(/Nueva asignatura/i);
    const nombreInput = screen.getByPlaceholderText(/Cálculo Diferencial/i);
    const docenteInput = screen.getByPlaceholderText(/Prof\. García/i);
    userEvent.type(nombreInput, 'Física');
    userEvent.type(docenteInput, 'Dr. Newton');
    userEvent.click(screen.getByRole('button', { name: /Guardar asignatura/i }));

    await waitFor(() => {
      const createCall = findCall(calls, '/asignaturas', 'POST');
      expect(createCall).toBeDefined();
      expect(JSON.parse(createCall.options.body)).toEqual({
        nombre: 'Física',
        docente: 'Dr. Newton',
      });
    });
  });

  test('elimina una asignatura tras confirmar y la quita de la tabla', async () => {
    const { calls } = mockFetchWith({
      '/dashboard': okJson(dashboardDemo),
      '/asignaturas/1': okJson({ mensaje: 'ok' }),
    });
    window.confirm = jest.fn(() => true);

    renderDashboard();
    await screen.findByText(/Cálculo Diferencial/i);

    const rows = screen.getAllByRole('row');
    const targetRow = rows.find((r) => r.textContent.includes('Cálculo Diferencial'));
    const deleteBtn = within(targetRow).getByTitle(/Eliminar asignatura/i);
    userEvent.click(deleteBtn);

    await waitFor(() => {
      expect(screen.queryByText(/Cálculo Diferencial/i)).not.toBeInTheDocument();
    });
    expect(findCall(calls, '/asignaturas/1', 'DELETE')).toBeDefined();
  });

  test('no elimina la asignatura si el usuario cancela el confirm', async () => {
    const { calls } = mockFetchWith({ '/dashboard': okJson(dashboardDemo) });
    window.confirm = jest.fn(() => false);

    renderDashboard();
    await screen.findByText(/Cálculo Diferencial/i);

    const rows = screen.getAllByRole('row');
    const targetRow = rows.find((r) => r.textContent.includes('Cálculo Diferencial'));
    userEvent.click(within(targetRow).getByTitle(/Eliminar asignatura/i));

    expect(screen.getByText(/Cálculo Diferencial/i)).toBeInTheDocument();
    expect(calls.find((c) => c.url.includes('/asignaturas/1') && c.options.method === 'DELETE')).toBeUndefined();
  });

  test('si la API devuelve 401 redirige a la pantalla de login', async () => {
    mockFetchWith({ '/dashboard': errorJson({ mensaje: 'Token inválido' }, 401) });

    const { setPantalla } = renderDashboard();

    await waitFor(() => {
      expect(setPantalla).toHaveBeenCalledWith('login');
    });
  });

  test('cerrar sesion elimina el token y vuelve a la pantalla de login', async () => {
    mockFetchWith({ '/dashboard': okJson(dashboardDemo) });

    const { setPantalla } = renderDashboard();
    await screen.findByText(/Cálculo Diferencial/i);

    userEvent.click(screen.getByRole('button', { name: /Salir/i }));

    expect(localStorage.getItem('edu_token')).toBeNull();
    expect(setPantalla).toHaveBeenCalledWith('login');
  });

  test('al hacer click en el nombre de usuario navega a la vista de Perfil', async () => {
    mockFetchWith({ '/dashboard': okJson(dashboardDemo) });
    renderDashboard();
    await screen.findByText(/Cálculo Diferencial/i);

    userEvent.click(screen.getByText(/David Demo/i));
    expect(await screen.findByText(/Mi Perfil/i)).toBeInTheDocument();
  });
});
