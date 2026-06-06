/**
 * E2E: Crear una asignatura end-to-end.
 * Parte de un usuario ya autenticado (token en localStorage), abre el modal
 * de crear asignatura, lo rellena, hace submit y verifica que la nueva
 * asignatura aparece en la tabla sin recargar la pagina.
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

const DASHBOARD_INICIAL = {
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

test.describe('E2E - Crear asignatura', () => {
  test('crea una asignatura desde el modal y la ve en la tabla', async ({ page }) => {
    await setupSesion(page);

    await page.route(`${API}/usuario/perfil`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ mensaje: 'Perfil obtenido', usuario: USUARIO }),
      });
    });

    let dashboardCalls = 0;
    await page.route(`${API}/dashboard`, async (route) => {
      dashboardCalls += 1;
      if (dashboardCalls === 1) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(DASHBOARD_INICIAL),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            ...DASHBOARD_INICIAL,
            totalAsignaturas: 1,
            asignaturas: [
              {
                id: 99,
                nombre: 'Fisica Cuantica',
                codigo: 'FIS',
                docente: 'Dr. Newton',
                hitos: 0,
                nota: 0,
                tiempo: 0,
                semestre: '2026-1',
              },
            ],
          }),
        });
      }
    });

    await page.route(`${API}/asignaturas`, async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            mensaje: 'Asignatura creada correctamente',
            asignatura: {
              id_asignatura: 99,
              id_semestre: 1,
              nombre: 'Fisica Cuantica',
              nombre_docente: 'Dr. Newton',
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/');

    await expect(page.getByText(/EDU.STRATEGY/i)).toBeVisible({ timeout: 10_000 });

    await page.getByRole('button', { name: /Crear asignatura/i }).click();
    await expect(page.getByText(/Nueva asignatura/i)).toBeVisible();

    await page.locator('input[name="nombre"]').fill('Fisica Cuantica');
    await page.locator('input[name="docente"]').fill('Dr. Newton');
    await page.getByRole('button', { name: /Guardar asignatura/i }).click();

    await expect(page.getByRole('cell', { name: /Fisica Cuantica/i }).first()).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText('1').first()).toBeVisible();
  });
});
