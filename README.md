# EDU-ESTRATEGY

**EDU-ESTRATEGY** es una aplicación web de autogestión académica que centraliza y visualiza el rendimiento estudiantil. Permite a los estudiantes universitarios registrar semestres, materias e hitos académicos (parciales, talleres, quizzes, proyectos), llevando el control de notas y horas invertidas, todo presentado en un tablero interactivo con estadísticas consolidadas.

---

## Informacion academica

| | |
|---|---|
| **Universidad** | Corporacion Universitaria Iberoamericana de Colombia |
| **Materia** | Proyecto de Software |
| **Docente** | Tatiana Cabrera |

---

## Colaboradores

| Nombre | Identificacion |
|--------|----------------|
| Alexander Patino Londono | 1054992551 |
| David Stiven Merchan Bustos | 1023925771 |
| Laura Valentina Rodriguez Olmos | 1027521432 |
| Roxxana Hoyos Anacona | 1084262003 |
| Breynner Alexander Perez Alvarez | 1062014199 |

---

## Descripcion del proyecto

La aplicacion resuelve un problema comun entre estudiantes universitarios: la informacion academica dispersa en multiples plataformas. EDU-ESTRATEGY la centraliza en un solo lugar, ofreciendo:

- Registro y seguimiento de semestres y materias.
- Control de hitos academicos con notas parciales.
- Dashboard con promedio general, total de horas y graficas por materia.
- Historial de semestres cursados con indicadores de rendimiento.
- Gestion de perfil con foto de usuario.

---

## Arquitectura general

El sistema sigue un modelo **cliente-servidor** con las siguientes capas:

```
┌─────────────────────────────────┐
│         Frontend (React SPA)    │  Puerto 3000
│  Login · Dashboard · Materias   │
└──────────────┬──────────────────┘
               │ HTTP / JSON (REST API)
┌──────────────▼──────────────────┐
│      Backend (Express REST API) │  Puerto 5000
│  Rutas → Controladores →        │
│  Servicios → Consultas SQL      │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│        PostgreSQL 14+           │
│  usuarios · semestres ·         │
│  materias · hitos               │
└─────────────────────────────────┘
```

**Seguridad:** contrasenas cifradas con bcrypt, autenticacion con JWT (expira en 1 hora), bloqueo de cuenta tras 3 intentos fallidos.

---

## Tecnologias utilizadas

### Frontend
| Tecnologia | Version | Proposito |
|---|---|---|
| React | 19 | Libreria principal para la interfaz de usuario |
| CSS | — | Estilos con tema oscuro, sin frameworks adicionales |
| Fetch API | — | Comunicacion HTTP con el backend |

### Backend
| Tecnologia | Version | Proposito |
|---|---|---|
| Node.js | 20+ | Entorno de ejecucion del servidor |
| Express | 5 | Framework para la API REST |
| PostgreSQL | 14+ | Base de datos relacional |
| pg (node-postgres) | 8 | Cliente de conexion a PostgreSQL |
| bcrypt | 6 | Cifrado de contrasenas |
| jsonwebtoken | 9 | Generacion y verificacion de tokens JWT |
| multer | 2 | Manejo de subida de archivos |

### Infraestructura
| Tecnologia | Proposito |
|---|---|
| Docker | Contenerizacion de backend + frontend + BD local |
| Railway | Hosting del backend |
| GitHub Actions | Integracion continua (lint + build) |
| Concurrently | Ejecucion simultanea de frontend y backend |

---

## Requisitos previos

- Node.js >= 20
- Docker >= 24 y Docker Compose >= 2.24 (alternativa a Node.js y PostgreSQL)
- PostgreSQL >= 14
- npm >= 10

---

## Guia de instalacion

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd edu-estrategy
```

### 2. Configurar variables de entorno

Crea el archivo `backend-edustrategy/.env` a partir del ejemplo:

```bash
cp backend-edustrategy/.env.example backend-edustrategy/.env
```

Edita `.env` con tus valores:

```env
PORT=5000
DATABASE_URL=postgresql://usuario:password@localhost:5432/edustrategy
JWT_SECRET=clave_secreta_larga_y_aleatoria
```

Para el frontend (opcional, solo si el backend no corre en `localhost:5000`), crea `frontend/.env.development`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Instalar dependencias

```bash
# Dependencias del backend
cd backend-edustrategy && npm install && cd ..

# Dependencias del frontend
cd frontend && npm install && cd ..

# Dependencias raiz (concurrently)
npm install
```

### 4. Inicializar la base de datos

Ejecuta el script SQL de ejemplo disponible en `docs/`:

```bash
psql -U tu_usuario -d edustrategy -f docs/seed.sql
```

---

## Ejecutar el proyecto localmente

Desde la raiz del repositorio, un solo comando levanta frontend y backend de forma simultanea:

```bash
npm start
```

Esto inicia:
- **Backend** en `http://localhost:5000`
- **Frontend** en `http://localhost:3000`

O por separado:

```bash
# Solo el backend
cd backend-edustrategy && npm start

# Solo el frontend
cd frontend && npm start
```

---

## Ejecutar con Docker

Como alternativa a la instalacion manual, puedes ejecutar toda la aplicacion con Docker:

### Requisito

- [Docker](https://docs.docker.com/get-docker/) >= 24
- [Docker Compose](https://docs.docker.com/compose/install/) >= 2.24

### Con base de datos en la nube (Supabase)

```bash
docker compose up --build
```

Esto levanta:
- **Frontend** en `http://localhost:3000`
- **Backend** en `http://localhost:5000`

### Con PostgreSQL local (desarrollo)

```bash
docker compose -f docker-compose.yml -f docker-compose.local.yml up --build
```

Esto levanta ademas un contenedor de PostgreSQL 16 con datos persistentes.

Para mas detalles, consulta [docs/docker.md](docs/docker.md).

---

## Estructura del repositorio

```
edu-estrategy/
├── package.json                   # Script raiz con concurrently
├── docker-compose.yml             # Orquestacion Docker (backend + frontend)
├── docker-compose.local.yml       # Override con PostgreSQL local
├── Dockerfile                     # Contenerizacion del backend (Railway)
├── railway.toml                   # Configuracion de despliegue
├── .github/workflows/ci.yml       # Pipeline CI/CD
├── backend-edustrategy/           # API REST (Express 5)
│   ├── servidor.js                # Punto de entrada
│   └── src/
│       ├── configuracion/         # Conexion PostgreSQL
│       ├── consultas/             # Queries SQL
│       ├── controladores/         # Logica HTTP
│       ├── middlewares/           # Validacion JWT
│       ├── rutas/                 # Definicion de rutas
│       └── servicios/             # Logica de negocio
├── frontend/                      # SPA React
│   ├── Dockerfile                 # Build multi-etapa (Node + Nginx)
│   ├── nginx.conf                 # Proxy inverso para API
│   └── src/
│       ├── componentes/           # Login, Registro, Dashboard
│       └── services/              # Cliente HTTP
└── docs/                          # Documentacion del proyecto
```

---

## Documentacion adicional

| Archivo | Contenido |
|---------|-----------|
| [docs/descripcion-proyecto.md](docs/descripcion-proyecto.md) | Descripcion detallada del proyecto |
| [docs/api.md](docs/api.md) | Referencia de endpoints de la API |
| [docs/base-de-datos.md](docs/base-de-datos.md) | Esquema de la base de datos |
| [docs/ci-cd.md](docs/ci-cd.md) | Pipeline de integracion y despliegue continuo |
| [docs/docker.md](docs/docker.md) | Documentacion de Docker y docker-compose |

---

## Licencia

Este proyecto es de uso academico. Consulta el archivo [LICENSE](LICENSE) para mas informacion.
