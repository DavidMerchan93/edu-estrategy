import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Perfil from '../componentes/Perfil';
import { mockFetchWith, okJson, errorJson, findCall, usuarioDemo } from '../__test_utils__/helpers';

const renderPerfil = (props = {}) => {
  const onVolver = jest.fn();
  const onUsuarioActualizado = jest.fn();
  const utils = render(
    <Perfil
      usuario={usuarioDemo}
      onVolver={onVolver}
      onUsuarioActualizado={onUsuarioActualizado}
      {...props}
    />
  );
  return { onVolver, onUsuarioActualizado, ...utils };
};

describe('Integración - Perfil', () => {
  beforeEach(() => {
    localStorage.setItem('edu_token', 'jwt-test');
  });

  test('renderiza los datos del usuario y carga el historial de semestres', async () => {
    mockFetchWith({
      '/usuario/semestres': okJson({
        semestres: [
          {
            id_semestre: 1,
            nombre: '2026-1',
            activo: true,
            total_asignaturas: 5,
            promedio: '4.2',
            tiempo_total: 120,
          },
          {
            id_semestre: 2,
            nombre: '2025-2',
            activo: false,
            total_asignaturas: 6,
            promedio: '3.5',
            tiempo_total: 100,
          },
        ],
      }),
    });

    renderPerfil();

    expect(screen.getByDisplayValue(usuarioDemo.nombre_completo)).toBeInTheDocument();
    expect(screen.getByDisplayValue(usuarioDemo.carrera)).toBeInTheDocument();
    expect(screen.getByDisplayValue(String(usuarioDemo.semestre_actual))).toBeInTheDocument();
    expect(screen.getByDisplayValue(usuarioDemo.email)).toBeInTheDocument();
    expect(screen.getByText(/Verificado/i)).toBeInTheDocument();

    expect(await screen.findByText('2026-1')).toBeInTheDocument();
    expect(screen.getByText('2025-2')).toBeInTheDocument();
    expect(screen.getByText(/5 asig\. · 120h/)).toBeInTheDocument();
    expect(screen.getByText('4.2')).toBeInTheDocument();
  });

  test('al guardar cambios llama a la API PUT /usuario/perfil y notifica al padre', async () => {
    const { calls } = mockFetchWith({
      '/usuario/semestres': okJson({ semestres: [] }),
      '/usuario/perfil': okJson({
        usuario: {
          id_estudiante: 1,
          nombre_completo: 'David Actualizado',
          carrera: 'Ing. de Software',
          semestre_actual: 6,
        },
      }),
    });

    const { onUsuarioActualizado } = renderPerfil();
    await screen.findByText(/Sin semestres registrados/);

    const nombreInput = document.querySelector('input[name="nombre_completo"]');
    const carreraInput = document.querySelector('input[name="carrera"]');
    const semestreInput = document.querySelector('input[name="semestre_actual"]');

    userEvent.clear(nombreInput);
    userEvent.type(nombreInput, 'David Actualizado');
    userEvent.clear(carreraInput);
    userEvent.type(carreraInput, 'Ing. de Software');
    userEvent.clear(semestreInput);
    userEvent.type(semestreInput, '6');

    userEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));

    await waitFor(() => {
      expect(screen.getByText(/Perfil actualizado correctamente/i)).toBeInTheDocument();
    });
    const putCall = findCall(calls, '/usuario/perfil', 'PUT');
    expect(putCall).toBeDefined();
    expect(JSON.parse(putCall.options.body)).toEqual({
      nombre_completo: 'David Actualizado',
      carrera: 'Ing. de Software',
      semestre_actual: 6,
    });
    expect(onUsuarioActualizado).toHaveBeenCalledWith(
      expect.objectContaining({ nombre_completo: 'David Actualizado' })
    );
  });

  test('muestra el mensaje de error cuando la API rechaza la actualizacion', async () => {
    mockFetchWith({
      '/usuario/semestres': okJson({ semestres: [] }),
      '/usuario/perfil': errorJson({ mensaje: 'Datos inválidos' }, 400),
    });

    renderPerfil();
    await screen.findByText(/Sin semestres registrados/);

    userEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));

    await waitFor(() => {
      expect(screen.getByText(/Datos inválidos/i)).toBeInTheDocument();
    });
  });

  test('el boton Volver al Dashboard llama al callback onVolver', async () => {
    mockFetchWith({ '/usuario/semestres': okJson({ semestres: [] }) });
    const { onVolver } = renderPerfil();

    await screen.findByText(/Sin semestres registrados/);
    userEvent.click(screen.getByRole('button', { name: /Volver al Dashboard/i }));
    expect(onVolver).toHaveBeenCalled();
  });

  test('flujo de eliminar cuenta: pide confirmacion y al confirmar llama a DELETE y limpia el token', async () => {
    const { calls } = mockFetchWith({
      '/usuario/semestres': okJson({ semestres: [] }),
      '/usuario/cuenta': okJson({ mensaje: 'Cuenta eliminada' }),
    });
    window.confirm = jest.fn(() => true);
    const reloadSpy = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadSpy },
      writable: true,
    });

    renderPerfil();
    await screen.findByText(/Sin semestres registrados/);

    userEvent.click(screen.getByRole('button', { name: /Eliminar mi cuenta/i }));
    expect(
      screen.getByText(/¿Estás seguro\? Esta acción eliminará todos tus datos/i)
    ).toBeInTheDocument();

    userEvent.click(screen.getByRole('button', { name: /Sí, eliminar mi cuenta/i }));

    await waitFor(() => {
      expect(findCall(calls, '/usuario/cuenta', 'DELETE')).toBeDefined();
    });
    expect(localStorage.getItem('edu_token')).toBeNull();
  });

  test('cancelar la eliminacion no llama a la API', async () => {
    mockFetchWith({ '/usuario/semestres': okJson({ semestres: [] }) });

    renderPerfil();
    await screen.findByText(/Sin semestres registrados/);
    userEvent.click(screen.getByRole('button', { name: /Eliminar mi cuenta/i }));
    userEvent.click(screen.getByRole('button', { name: /Cancelar/i }));

    expect(
      screen.queryByText(/¿Estás seguro\? Esta acción eliminará todos tus datos/i)
    ).not.toBeInTheDocument();
  });
});
