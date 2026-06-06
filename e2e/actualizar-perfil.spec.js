/**
 * E2E: Actualizar perfil end-to-end.
 * 1. Usuario autenticado entra al dashboard
 * 2. Hace click en su nombre para ir a la vista de Perfil
 * 3. Modifica el nombre completo y la carrera
 * 4. Pulsa Guardar cambios
 * 5. Verifica el mensaje de exito y que la API recibio los datos correctos
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

const DASHBOARD = {
  semestreActivo: '2026-1',
  totalAsignaturas: 0,
  promedioGeneral: 0,
  tiempoTotal: 0,
  asignaturas: [],
};

const setupSesion = async (page) => {
  await page.addInitScript(
    ({ token, usuario }) => {
      window.localStorage.setItem('edu_token', token);
      window.localStorage.setItem('edu_usuario', JSON.stringify(usuario));
    },
    { token: 'jwt-fake-e2e', usuario: USUARIO }
  );
};

test.describe('E2E - Actualizar perfil', () => {
  test('actualiza el nombre y la carrera y ve el mensaje de exito', async ({ page }) => {
    await setupSesion(page);

    await page.route(`${API}/dashboard`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(DASHBOARD),
      });
    });

    await page.route(`${API}/usuario/semestres`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ semestres: [] }),
      });
    });

    let putPayload = null;
    await page.route(`${API}/usuario/perfil`, async (route) => {
      if (route.request().method() === 'PUT') {
        putPayload = JSON.parse(route.request().postData() || '{}');
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            mensaje: 'Perfil actualizado correctamente',
            usuario: {
              ...USUARIO,
              nombre_completo: putPayload.nombre_completo,
              carrera: putPayload.carrera,
              semestre_actual: Number(putPayload.semestre_actual),
            },
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ mensaje: 'Perfil obtenido', usuario: USUARIO }),
        });
      }
    });

    await page.goto('/');

    await expect(page.getByText(/EDU.STRATEGY/i)).toBeVisible({ timeout: 10_000 });

    await page.getByText(/David Demo/i).first().click();
    await expect(page.getByText(/Mi Perfil/i)).toBeVisible();

    const nombreInput = page.locator('input[name="nombre_completo"]');
    const carreraInput = page.locator('input[name="carrera"]');

    await nombreInput.fill('David Actualizado');
    await carreraInput.fill('Ing. de Software');

    await page.getByRole('button', { name: /Guardar cambios/i }).click();

    await expect(page.getByText(/Perfil actualizado correctamente/i)).toBeVisible({
      timeout: 10_000,
    });

    expect(putPayload).toEqual({
      nombre_completo: 'David Actualizado',
      carrera: 'Ing. de Software',
      semestre_actual: 5,
    });

    await expect(page.getByRole('button', { name: /Volver al Dashboard/i })).toBeVisible();
  });
});
