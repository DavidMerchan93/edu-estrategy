import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../componentes/Login';
import { mockFetchWith, okJson, errorJson, findCall } from '../__test_utils__/helpers';

describe('Integración - Login', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renderiza el formulario con los campos de email y contraseña', () => {
    mockFetchWith({});
    render(<Login setPantalla={() => {}} setUsuario={() => {}} />);

    expect(screen.getByText(/ESTRATEGIA EDUCATIVA/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/usuario@correo.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/\*/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Acceder/i })).toBeInTheDocument();
  });

  test('al hacer submit con credenciales validas llama a la API, guarda el token y notifica al padre', async () => {
    const setPantalla = jest.fn();
    const setUsuario = jest.fn();
    const { calls } = mockFetchWith({
      '/autenticacion/login': okJson({
        token: 'jwt-test-123',
        usuario: {
          id_estudiante: 1,
          nombre_completo: 'David Demo',
          email: 'david@correo.edu.co',
        },
      }),
    });

    render(<Login setPantalla={setPantalla} setUsuario={setUsuario} />);

    userEvent.type(screen.getByPlaceholderText(/usuario@correo.com/i), 'david@correo.edu.co');
    userEvent.type(screen.getByPlaceholderText(/\*/), 'Admin2026');
    userEvent.click(screen.getByRole('button', { name: /Acceder/i }));

    await waitFor(() => {
      expect(setPantalla).toHaveBeenCalledWith('dashboard');
    });

    const loginCall = findCall(calls, '/autenticacion/login', 'POST');
    expect(loginCall).toBeDefined();
    expect(JSON.parse(loginCall.options.body)).toEqual({
      email: 'david@correo.edu.co',
      password: 'Admin2026',
    });
    expect(loginCall.options.headers['Content-Type']).toBe('application/json');

    expect(setUsuario).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'david@correo.edu.co' })
    );
    expect(localStorage.getItem('edu_token')).toBe('jwt-test-123');
  });

  test('muestra el mensaje de error devuelto por la API cuando las credenciales son invalidas', async () => {
    mockFetchWith({
      '/autenticacion/login': errorJson({ error: 'Credenciales inválidas' }, 401),
    });

    const setPantalla = jest.fn();
    const setUsuario = jest.fn();
    render(<Login setPantalla={setPantalla} setUsuario={setUsuario} />);

    userEvent.type(screen.getByPlaceholderText(/usuario@correo.com/i), 'a@b.c');
    userEvent.type(screen.getByPlaceholderText(/\*/), 'wrong');
    userEvent.click(screen.getByRole('button', { name: /Acceder/i }));

    await waitFor(() => {
      expect(screen.getByText(/Credenciales inválidas/i)).toBeInTheDocument();
    });
    expect(setPantalla).not.toHaveBeenCalled();
    expect(localStorage.getItem('edu_token')).toBeNull();
  });

  test('el boton Autocompletar rellena el formulario con las credenciales de prueba', () => {
    mockFetchWith({});
    render(<Login setPantalla={() => {}} setUsuario={() => {}} />);

    userEvent.click(screen.getByRole('button', { name: /Autocompletar primera cuenta/i }));

    expect(screen.getByPlaceholderText(/usuario@correo.com/i)).toHaveValue('david@correo.edu.co');
    expect(screen.getByPlaceholderText(/\*/)).toHaveValue('Admin2026');
  });

  test('al hacer click en Regístrate se cambia la pantalla a registro', () => {
    mockFetchWith({});
    const setPantalla = jest.fn();
    render(<Login setPantalla={setPantalla} setUsuario={() => {}} />);

    userEvent.click(screen.getByText(/¿No tienes cuenta\? Regístrate/i));
    expect(setPantalla).toHaveBeenCalledWith('registro');
  });
});
