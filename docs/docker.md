# Docker

## Introduccion

EDU-STRATEGY utiliza Docker para contenerizar la aplicacion, facilitando su ejecucion en cualquier entorno sin necesidad de instalar dependencias adicionales (excepto Docker mismo).

## Requisitos

- [Docker](https://docs.docker.com/get-docker/) >= 24
- [Docker Compose](https://docs.docker.com/compose/install/) >= 2.24 (incluido con Docker Desktop)

Verifica la instalacion:

```bash
docker --version
docker compose version
```

## Arquitectura de contenedores

```
                    ┌──────────────────────────────────┐
                    │  Nginx (puerto 80)                │
                    │  Sirve el build de React +        │
                    │  proxy reverso /api → backend     │
                    └──────────┬───────────────────────┘
                               │ proxy_pass
                    ┌──────────▼───────────────────────┐
                    │  Express API (puerto 5000)        │
                    │  Rutas → Controladores → Servicios│
                    └──────────┬───────────────────────┘
                               │
                    ┌──────────▼───────────────────────┐
                    │  PostgreSQL 16                     │
                    │  Solo si usas docker-compose.local │
                    └──────────────────────────────────┘
```

## Estructura de archivos Docker

```
edu-estrategy/
├── docker-compose.yml              # Orquestacion principal (backend + frontend)
├── docker-compose.local.yml        # Override para desarrollo con PostgreSQL local
├── Dockerfile                       # [Opcional] Backend para Railway
├── backend-edustrategy/
│   ├── Dockerfile                   # Backend (Node.js 20)
│   └── .dockerignore
├── frontend/
│   ├── Dockerfile                   # Frontend (multi-etapa: Node build + Nginx)
│   ├── nginx.conf                   # Configuracion de Nginx
│   └── .dockerignore
└── docs/
    └── docker.md                    # Esta documentacion
```

## Modos de ejecucion

### 1. Produccion (con Supabase)

Usa tu base de datos en la nube (Supabase). Solo construye backend y frontend.

```bash
docker compose up --build
```

Esto levanta:
- **Frontend** en `http://localhost:3000`
- **Backend** en `http://localhost:5000`

El backend se conecta a Supabase usando las variables de `backend-edustrategy/.env`.

### 2. Desarrollo local (con PostgreSQL en contenedor)

Levanta una base de datos PostgreSQL local ademas de backend y frontend.

```bash
docker compose -f docker-compose.yml -f docker-compose.local.yml up --build
```

Esto levanta:
- **Frontend** en `http://localhost:3000`
- **Backend** en `http://localhost:5000`
- **PostgreSQL** en `localhost:5432`

**Credenciales de la base de datos local:**

| Variable | Valor |
|---|---|
| Host | `localhost` |
| Puerto | `5432` |
| Base de datos | `edustrategy` |
| Usuario | `edustrategy` |
| Contrasena | `edustrategy123` |

La base de datos se inicializa automaticamente con el esquema definido en la imagen de PostgreSQL.

### 3. Ejecutar en segundo plano

Agrega `-d` para ejecutar en background:

```bash
docker compose up --build -d
docker compose -f docker-compose.yml -f docker-compose.local.yml up --build -d
```

## Variables de entorno

### Backend (`.env`)

| Variable | Descripcion | Ejemplo |
|---|---|---|
| `PORT` | Puerto del servidor Express | `5000` |
| `DATABASE_URL` | Cadena de conexion a PostgreSQL | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Clave secreta para tokens JWT | `clave_secreta_larga` |

Estas variables se cargan automaticamente desde `backend-edustrategy/.env`.

### Frontend (arg de build)

| Arg | Descripcion | Default |
|---|---|---|
| `REACT_APP_API_URL` | URL base de la API | `/api` (proxy Nginx) |

No es necesario crear `.env.development` para el frontend en Docker porque Nginx hace de proxy.

## Comandos utiles

```bash
# Construir y levantar
docker compose up --build

# Ver logs en tiempo real
docker compose logs -f

# Ver logs de un servicio especifico
docker compose logs -f backend
docker compose logs -f frontend

# Detener contenedores
docker compose down

# Detener y eliminar volumenes (borra datos de BD local)
docker compose -f docker-compose.yml -f docker-compose.local.yml down -v

# Reconstruir un solo servicio
docker compose build backend
docker compose build frontend

# Ejecutar comando dentro de un contenedor en ejecucion
docker compose exec backend sh
docker compose exec frontend sh

# Ver recursos de los contenedores
docker stats
```

## Solucion de problemas

### Error: `port is already allocated`

Otro servicio esta usando el puerto 3000 o 5000. Detenlo o cambia el mapeo de puertos en `docker-compose.yml`:

```yaml
ports:
  - "3001:80"   # frontend en localhost:3001
  - "5001:5000" # backend en localhost:5001
```

### Error: `connect ECONNREFUSED db:5432`

El contenedor de PostgreSQL no esta listo. Espera unos segundos o revisa los logs:

```bash
docker compose -f docker-compose.yml -f docker-compose.local.yml logs -f db
```

### Error: `relation "usuarios" does not exist`

La base de datos no tiene las tablas necesarias. Asegurate de usar `docker-compose.local.yml` que incluye la inicializacion automatica, o ejecuta el script SQL manualmente.

## Notas

- El frontend usa Nginx como proxy inverso: las peticiones a `/api/*` se redirigen al backend. Esto evita problemas de CORS.
- El `docker-compose.local.yml` es un *override*: extiende y sobreescribe servicios del archivo principal. Debe usarse siempre junto con `docker-compose.yml`.
- Para desarrollo sin Docker, sigue usando `npm start` desde la raiz del proyecto.
