# Testing — EDU-STRATEGY

El proyecto cuenta con tres capas de pruebas automatizadas:

| Capa | Herramienta | Ubicacion | Cantidad |
|------|-------------|-----------|----------|
| Tests unitarios + de integracion del backend | Jest 29 + Supertest 7 | `backend-edustrategy/__tests__/` | 24 archivos / 149 tests |
| Tests de integracion del frontend | Jest 29 + React Testing Library | `frontend/src/__tests__/` | 3 archivos / 19 tests |
| Tests end-to-end (E2E) | Playwright | `e2e/` | 3 archivos / 4 tests |

---

## 1. Tests del backend

### Cobertura objetivo

El umbral de cobertura esta configurado en **85 %** para las cuatro metricas (lineas, ramas, funciones, statements) en `backend-edustrategy/jest.config.js`. La corrida actual supera ampliamente ese umbral:

```
Statements   : 96.81 %
Branches     : 95.71 %
Functions    : 95.45 %
Lines        : 97.10 %
```

Archivos excluidos del calculo de cobertura:

- `backend-edustrategy/servidor.js` (punto de entrada / wiring)
- `backend-edustrategy/src/configuracion/swagger.js` (esquema OpenAPI)
- `backend-edustrategy/src/seguridad/cifrarCredenciales.js` (script CLI)

### Como correrlos

```bash
cd backend-edustrategy

npm test              # ejecucion normal
npm run test:coverage # con reporte de cobertura
npm run test:watch    # modo watch
```

> Los tests usan ESM nativo (`"type": "module"`) y se ejecutan con
> `node --experimental-vm-modules`. El mock de modulos ESM se hace con
> `jest.unstable_mockModule(...)` seguido de `await import(...)` dinamico.

### Estructura

```
backend-edustrategy/__tests__/
├── setup.js                       # variables de entorno para tests
├── configuracion/
│   └── baseDatos.test.js          # conexion SSL / localhost
├── middlewares/
│   └── validarToken.test.js       # middleware JWT
├── servicios/
│   ├── autenticacionServicio.test.js
│   └── dashboardServicio.test.js
├── consultas/                     # queries SQL
│   ├── asignaturaConsultas.test.js
│   ├── dashboardConsultas.test.js
│   ├── hitoConsultas.test.js
│   ├── semestreConsultas.test.js
│   └── usuarioConsultas.test.js
├── controladores/                 # logica HTTP
│   ├── asignaturaControlador.test.js
│   ├── autenticacionControlador.test.js
│   ├── dashboardControlador.test.js
│   ├── hitoControlador.test.js
│   ├── saludControlador.test.js
│   ├── semestreControlador.test.js
│   └── usuarioControlador.test.js
└── rutas/                         # pruebas con supertest
    ├── asignaturaRutas.test.js
    ├── autenticacionRutas.test.js
    ├── dashboardRutas.test.js
    ├── hitoRutas.test.js
    ├── saludRutas.test.js
    ├── semestreRutas.test.js
    └── usuarioRutas.test.js
```

---

## 2. Tests del frontend

### Como correrlos

```bash
cd frontend

npm test                            # modo watch (interactivo)
CI=true npm test -- --watchAll=false # corrida unica (CI / scripts)
```

### Utilidades compartidas

- `frontend/src/setupTests.js` registra `@testing-library/jest-dom`.
- `frontend/src/__test_utils__/helpers.js` expone helpers para stub de
  `fetch` (`mockFetchWith`, `okJson`, `errorJson`) y datos de prueba
  (`usuarioDemo`, `dashboardDemo`).

### Suites de integracion

| Archivo | Vista probada | Tests |
|---------|---------------|-------|
| `Login.integration.test.js` | Login | 5 |
| `Dashboard.integration.test.js` | Dashboard (carga, estadisticas, tabla) | 8 |
| `Perfil.integration.test.js` | Perfil (carga, edicion, foto) | 6 |

Las pruebas renderizan los componentes reales y verifican interacciones
con el usuario (`userEvent.type`, `userEvent.click`), sustituyendo
`fetch` con stubs deterministas.

---

## 3. Tests end-to-end (E2E)

### Como correrlos

```bash
# Instalacion inicial (solo una vez)
npx playwright install chromium

# Desde la raiz del proyecto
npm run test:e2e          # ejecucion headless
npm run test:e2e:headed   # con navegador visible
npm run test:e2e:report   # abre el reporte HTML de la corrida anterior
```

La configuracion de Playwright (`playwright.config.js`) levanta
automaticamente el dev server del frontend con `npm start --prefix frontend`
sobre el puerto 3000 y reutiliza una instancia existente si ya esta en
marcha (`reuseExistingServer: !process.env.CI`).

### Escenarios cubiertos

| Spec | Flujo | Tests |
|------|-------|-------|
| `e2e/login.spec.js` | Login exitoso + dashboard · Login con credenciales invalidas | 2 |
| `e2e/crear-asignatura.spec.js` | Abrir modal · completar formulario · ver la asignatura en la tabla | 1 |
| `e2e/actualizar-perfil.spec.js` | Login previo · editar nombre y carrera · ver mensaje de exito | 1 |

### Aislamiento de la API

Los E2E no dependen del backend real. Cada spec intercepta las llamadas
a `/api/**` con `page.route(...)` y responde con datos controlados, lo
que permite ejecutar toda la suite sin PostgreSQL ni Express en
funcionamiento. Ver `e2e/login.spec.js` para el patron completo.

### Artefactos en caso de fallo

Tras un fallo, Playwright deja disponible:

- `test-results/<test>/test-failed-1.png` (screenshot)
- `test-results/<test>/video.webm` (video)
- `test-results/<test>/trace.zip` (trace interactivo, abrir con `npx playwright show-trace`)

En CI estos artefactos se suben automaticamente (ver `docs/ci-cd.md`).
