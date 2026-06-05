# EDU-ESTRATEGY — Descripcion del Proyecto

## Informacion academica

| | |
|---|---|
| **Universidad** | Corporacion Universitaria Iberoamericana de Colombia |
| **Materia** | Proyecto de Software |
| **Docente** | Tatiana Cabrera |

## Colaboradores

| Nombre | Identificacion |
|--------|----------------|
| Alexander Patino Londono | 1054992551 |
| David Stiven Merchan Bustos | 1023925771 |
| Laura Valentina Rodriguez Olmos | 1027521432 |
| Roxxana Hoyos Anacona | 1084262003 |
| Breynner Alexander Perez Alvarez | 1062014199 |

---

## 1. Introduccion

EDU-ESTRATEGY es una aplicacion web disenada para ayudar a los estudiantes universitarios a gestionar y visualizar su rendimiento academico de forma centralizada. Actualmente, los estudiantes suelen tener su informacion academica dispersa en multiples plataformas institucionales, hojas de calculo o apuntes, lo que dificulta tener una vision clara de su progreso.

La aplicacion permite registrar semestres, materias e hitos academicos (parciales, talleres, quizzes, proyectos, etc.), llevando el control de notas y horas invertidas. Todo esto se presenta en un tablero principal con estadisticas consolidadas como el promedio general, el total de horas dedicadas, graficos comparativos por materia y el historial de semestres cursados.

Este proyecto fue desarrollado como parte de la asignatura de Proyecto de Software, del programa de Ingenieria de Sistemas, en la Corporacion Universitaria Iberoamericana de Colombia.

---

## 2. Estructura del Proyecto

El proyecto esta organizado como un **monorepositorio** que contiene dos aplicaciones independientes dentro de una misma carpeta raiz:

- **`frontend/`** — Aplicacion de interfaz de usuario construida con React. Contiene los componentes visuales (pantalla de inicio de sesion, registro, tablero principal, perfil, y ventanas modales para crear y editar semestres, materias e hitos academicos), los archivos de estilos CSS, y el modulo de comunicacion con el backend a traves de peticiones HTTP.

- **`backend-edustrategy/`** — Servidor backend construido con Node.js y Express. Sigue una arquitectura en capas: las rutas definen los puntos de entrada de la API, los controladores manejan las peticiones HTTP, los servicios contienen la logica de negocio, y las consultas encapsulan las sentencias SQL hacia la base de datos.

- **`docs/`** — Documentacion del proyecto incluyendo el modelo de la base de datos, los endpoints de la API, el esquema de integracion continua, y un script SQL con datos de ejemplo.

- **Raiz del proyecto** — Contiene archivos de configuracion global como `Dockerfile` para contenerizar el backend, `railway.toml` para despliegue en la nube, y un `package.json` que permite ejecutar ambas aplicaciones simultaneamente con un solo comando.

---

## 3. Arquitectura General del Sistema

La aplicacion sigue un modelo **cliente-servidor** clasico con dos componentes principales:

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

### Frontend (Cliente)

Es una **Single Page Application (SPA)** construida con React. Cuando el usuario accede a la aplicacion, el frontend verifica si existe una sesion activa mediante un token guardado localmente. Dependiendo del estado de autenticacion, se muestra la pantalla de inicio de sesion o el tablero principal. Todas las interacciones del usuario (crear semestres, registrar materias, anadir notas, etc.) se envian al backend mediante peticiones HTTP en formato JSON.

### Backend (Servidor)

Es un servidor REST construido con Express que expone una API dividida en modulos: autenticacion (registro e inicio de sesion), gestion de usuarios (perfil, foto, eliminacion de cuenta), semestres, materias, hitos academicos y un tablero de estadisticas. Cada peticion pasa por un flujo definido: la ruta dirige la solicitud al controlador adecuado, este delega la logica de negocio al servicio correspondiente, y el servicio ejecuta las consultas SQL a traves de un pool de conexiones a PostgreSQL.

### Seguridad

- Las contrasenas se almacenan cifradas con el algoritmo bcrypt.
- La autenticacion se maneja con tokens JWT que expiran despues de una hora.
- Tras tres intentos fallidos de inicio de sesion, la cuenta se bloquea automaticamente.
- Las rutas protegidas verifican el token antes de procesar cualquier solicitud.

### Flujo de datos (ejemplo: Tablero principal)

1. El usuario inicia sesion y es redirigido al tablero.
2. El frontend solicita los datos del dashboard al backend.
3. El backend identifica el semestre activo del estudiante, consulta las materias asociadas y calcula indicadores como el promedio de notas, el total de horas invertidas y la cantidad de hitos por materia.
4. El frontend recibe estos datos y los presenta en tarjetas de resumen, una grafica de barras comparativa y una tabla filtrable con colores que indican el rendimiento (verde, amarillo, rojo).

---

## 4. Tecnologias Utilizadas

### Frontend

| Tecnologia | Version | Proposito |
|---|---|---|
| **React** | 19 | Libreria principal para construir la interfaz de usuario |
| **CSS** | — | Estilos visuales con tema oscuro, sin frameworks adicionales |
| **Fetch API** | — | Comunicacion con el backend (sin librerias externas como Axios) |

### Backend

| Tecnologia | Version | Proposito |
|---|---|---|
| **Node.js** | 20+ | Entorno de ejecucion del servidor |
| **Express** | 5 | Framework para construir la API REST |
| **PostgreSQL** | 14+ | Base de datos relacional |
| **pg (node-postgres)** | 8 | Cliente para conectar Node.js con PostgreSQL |
| **bcrypt** | 6 | Cifrado de contrasenas |
| **jsonwebtoken** | 9 | Generacion y verificacion de tokens JWT |
| **multer** | 2 | Manejo de subida de archivos (foto de perfil) |

### Infraestructura y DevOps

| Tecnologia | Proposito |
|---|---|
| **Docker** | Contenerizacion del backend para despliegue consistente |
| **Railway** | Plataforma de hosting para el backend |
| **GitHub Actions** | Integracion continua: verifica que el codigo compile y pase las reglas de estilo |
| **Concurrently** | Ejecucion simultanea del frontend y backend con un solo comando |
| **Swagger** | Documentacion interactiva de la API |

### Herramientas de desarrollo

| Herramienta | Proposito |
|---|---|
| **ESLint** | Analisis estatico de codigo para mantener calidad |
| **Prettier** | Formateo automatico y consistente del codigo |
| **Nodemon** | Recarga automatica del servidor durante el desarrollo |

---

## 5. Guia de Instalacion

### Requisitos previos

- Node.js >= 20
- PostgreSQL >= 14
- npm >= 10

### Pasos

**1. Clonar el repositorio**

```bash
git clone <url-del-repositorio>
cd edu-estrategy
```

**2. Configurar variables de entorno**

```bash
cp backend-edustrategy/.env.example backend-edustrategy/.env
```

Edita `backend-edustrategy/.env`:

```env
PORT=5000
DATABASE_URL=postgresql://usuario:password@localhost:5432/edustrategy
JWT_SECRET=clave_secreta_larga_y_aleatoria
```

Para cambiar la URL del backend en el frontend, crea `frontend/.env.development`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

**3. Instalar dependencias**

```bash
cd backend-edustrategy && npm install && cd ..
cd frontend && npm install && cd ..
npm install
```

**4. Inicializar la base de datos**

```bash
psql -U tu_usuario -d edustrategy -f docs/seed.sql
```

---

## 6. Instrucciones para Ejecutar el Proyecto Localmente

Desde la raiz del repositorio, un solo comando levanta el frontend y el backend de forma simultanea:

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

### Credenciales de prueba

| Email | Contrasena |
|-------|-----------|
| david@correo.edu.co | Admin2026 |
| tatiana@correo.edu.co | Admin2026 |
