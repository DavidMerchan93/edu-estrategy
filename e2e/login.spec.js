/**
 * E2E: Login end-to-end.
 * 1. Stub POST /api/autenticacion/login -> devuelve token + usuario
 * 2. Stub GET /api/usuario/perfil -> devuelve perfil del usuario
 * 3. Stub GET /api/dashboard -> devuelve datos basicos del dashboard
 * Verifica que el usuario pasa de la pantalla de login al dashboard
 * con su nombre visible en la barra de navegacion.
 */
import { test, expect } from '@playwright/test';

const API = '**/api/**';

const USUARIO = {
  id_estudiante: 1,
  id_credencial: 1,
  identificacion: '1234567890',
  nombre_completo: 'David Demo',
  carrera: 'Ingenieria de Sistemas',
  semestre_actual: 5,
  fecha_ingreso: '2024-01-15',
  email: 'david@correo.edu.co',
  rol: 'estudiante',
  verificado: true,
};

test.describe('E2E - Login', () => {
  test('el usuario puede iniciar sesion y ver el dashboard con su nombre', async ({ page }) => {
    await page.route(`${API}/autenticacion/login`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          mensaje: 'Inicio de sesion exitoso',
          token: 'jwt-fake-e2e',
          usuario: USUARIO,
        }),
      });
    });

    await page.route(`${API}/usuario/perfil`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          mensaje: 'Perfil obtenido',
          usuario: USUARIO,
        }),
      });
    });

    await page.route(`${API}/dashboard`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          semestreActivo: '2026-1',
          totalAsignaturas: 0,
          promedioGeneral: 0,
          tiempoTotal: 0,
          asignaturas: [],
        }),
      });
    });

    await page.goto('/');

    await expect(page.getByText(/ESTRATEGIA EDUCATIVA/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Acceder/i })).toBeVisible();

    await page.getByPlaceholder(/usuario@correo.com/i).fill('david@correo.edu.co');
    await page.getByPlaceholder(/\*/).fill('Admin2026');
    await page.getByRole('button', { name: /Acceder/i }).click();

    await expect(page.getByText(/David Demo/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/EDU.STRATEGY/i)).toBeVisible();
    await expect(page.getByText(/Semestre 2026-1 . Activo/i)).toBeVisible();

    const token = await page.evaluate(() => window.localStorage.getItem('edu_token'));
    expect(token).toBe('jwt-fake-e2e');
  });

  test('muestra un mensaje de error si la API rechaza las credenciales', async ({ page }) => {
    await page.route(`${API}/autenticacion/login`, async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Credenciales invalidas' }),
      });
    });

    await page.goto('/');

    await page.getByPlaceholder(/usuario@correo.com/i).fill('a@b.c');
    await page.getByPlaceholder(/\*/).fill('wrong');
    await page.getByRole('button', { name: /Acceder/i }).click();

    await expect(page.getByText(/Credenciales invalidas/i)).toBeVisible();
    const token = await page.evaluate(() => window.localStorage.getItem('edu_token'));
    expect(token).toBeNull();
  });
});
