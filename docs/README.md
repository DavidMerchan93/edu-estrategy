# EDU-STRATEGY — Documentación del Proyecto

EDU-STRATEGY es una aplicación web de autogestión académica que centraliza y visualiza el rendimiento académico de los estudiantes. Permite registrar asignaturas, hitos (parciales, trabajos, etc.), notas y horas dedicadas, y presenta un dashboard con estadísticas consolidadas.

## Documentación disponible

| Archivo | Descripción |
|---------|-------------|
| [api.md](api.md) | Referencia completa de endpoints del backend |
| [base-de-datos.md](base-de-datos.md) | Esquema de la base de datos y relaciones |
| [ci-cd.md](ci-cd.md) | Pipeline de integración y despliegue continuo |

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19.2, Create React App |
| Backend | Node.js, Express 5, ES6 modules |
| Base de datos | PostgreSQL |
| Autenticación | JWT (jsonwebtoken), bcrypt |
| CI | GitHub Actions |
| CD (frontend) | Vercel / Netlify |
| CD (backend) | Railway / Render |

---

## Prerrequisitos

- Node.js >= 20
- PostgreSQL >= 14
- npm >= 10

---

## Variables de entorno

Crea un archivo `.env` en `backend-edustrategy/` basado en `.env.example`:

```env
PORT=5000
DATABASE_URL=postgresql://usuario:password@host:5432/nombre_bd
JWT_SECRET=clave_secreta_larga_y_aleatoria
```

El frontend no requiere variables de entorno para desarrollo local (usa `http://localhost:5000/api` por defecto). Para cambiar la URL del backend crea `frontend/.env.development`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## Instalación

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd edu-estrategy

# 2. Instalar dependencias del backend
cd backend-edustrategy && npm install && cd ..

# 3. Instalar dependencias del frontend
cd frontend && npm install && cd ..

# 4. Instalar dependencias raíz (concurrently)
npm install
```

---

## Iniciar el proyecto

```bash
# Desde la raíz — inicia backend (puerto 5000) y frontend (puerto 3000) simultáneamente
npm start
```

O por separado:

```bash
# Backend
cd backend-edustrategy && npm start

# Frontend
cd frontend && npm start
```

---

## Estructura del repositorio

```
edu-estrategy/
├── package.json                  # Script raíz (concurrently)
├── .github/
│   └── workflows/
│       └── ci.yml                # Pipeline CI/CD
├── backend-edustrategy/          # API REST (Express 5, ES6 modules)
│   ├── servidor.js               # Entry point
│   ├── eslint.config.js
│   └── src/
│       ├── configuracion/        # Conexión PostgreSQL
│       ├── consultas/            # Queries SQL (dashboard)
│       ├── controladores/        # Lógica de respuesta HTTP
│       ├── middlewares/          # Validación de JWT
│       ├── rutas/                # Definición de rutas
│       └── servicios/            # Lógica de negocio
├── frontend/                     # SPA React
│   └── src/
│       ├── componentes/          # Login, Registro, Dashboard
│       └── services/             # Cliente HTTP (api.js)
└── docs/                         # Esta documentación
```

---

## Credenciales de prueba

| Email | Contraseña |
|-------|-----------|
| david@correo.edu.co | Admin2026 |
| tatiana@correo.edu.co | Admin2026 |
