# CI/CD — EDU-STRATEGY

## Visión general

El proyecto usa **GitHub Actions** para integración continua (CI) y plataformas de nube para despliegue continuo (CD).

```
Push / PR
    │
    ▼
GitHub Actions CI
├── lint-frontend  ──┐
└── lint-backend     ├─→ build-frontend
                     │
                     └─→ (si todo pasa) merge a main
                                │
                        ┌───────┴───────┐
                        ▼               ▼
                     Vercel          Railway / Render
                   (frontend)          (backend)
```

---

## Integración continua — GitHub Actions

**Archivo:** `.github/workflows/ci.yml`

### Triggers

| Evento | Ramas |
|--------|-------|
| `push` | `main`, `develop`, `feat/**` |
| `pull_request` | `main` |

### Jobs

#### lint-frontend

Valida el estilo del código del frontend.

```
1. Checkout del código
2. Setup Node.js 20 (cache npm)
3. npm ci --legacy-peer-deps
4. npm run lint       (ESLint)
5. npm run format:check (Prettier)
```

#### build-frontend

Verifica que el frontend compila sin errores. Depende de `lint-frontend`.

```
1. Checkout del código
2. Setup Node.js 20 (cache npm)
3. npm ci --legacy-peer-deps
4. npm run build
```

#### lint-backend

Valida el estilo del código del backend. Corre en paralelo con `lint-frontend`.

```
1. Checkout del código
2. Setup Node.js 20 (cache npm)
3. npm ci
4. npm run lint  (ESLint con globals de Node.js)
```

### Resultado esperado

- Todos los jobs deben pasar para que un PR sea mergeable a `main`.
- Un fallo en `lint-frontend` bloquea también `build-frontend`.
- `lint-backend` corre independientemente del frontend.

---

## Despliegue continuo (CD)

El CD es gestionado directamente por las plataformas de nube mediante integración nativa con GitHub. No requiere configuración adicional en GitHub Actions.

### Frontend → Vercel o Netlify

| Parámetro | Valor |
|-----------|-------|
| Root directory | `frontend` |
| Build command | `npm run build` |
| Output directory | `build` |
| Branch de producción | `main` |
| Node version | 20 |

**Flujo:** Al hacer merge a `main`, la plataforma detecta el cambio, ejecuta el build y despliega automáticamente.

---

### Backend → Railway o Render

| Parámetro | Valor |
|-----------|-------|
| Root directory | `backend-edustrategy` |
| Start command | `node servidor.js` |
| Branch de producción | `main` |
| Node version | 20 |

**Variables de entorno a configurar en la plataforma:**

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Cadena de conexión a PostgreSQL |
| `JWT_SECRET` | Clave secreta para firmar los tokens JWT |
| `PORT` | Puerto del servidor (la plataforma puede asignarlo automáticamente) |

**Flujo:** Al hacer merge a `main`, la plataforma reinicia el servicio con el nuevo código.

---

## Flujo de trabajo recomendado

```bash
# 1. Crear rama de feature
git checkout -b feat/nueva-funcionalidad

# 2. Desarrollar y hacer commits
git add .
git commit -m "feat: descripción del cambio"

# 3. Push y abrir Pull Request a main
git push origin feat/nueva-funcionalidad

# 4. GitHub Actions corre CI automáticamente
#    → lint-frontend, lint-backend, build-frontend

# 5. Si todos los checks pasan → merge a main

# 6. Vercel / Railway detectan el merge → despliegan automáticamente
```
