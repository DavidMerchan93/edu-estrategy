# Backend — EDU-STRATEGY

Este documento explica qué hace el backend, cómo está organizado y cómo levantarlo para desarrollar.

---

## ¿Qué es el backend?

El backend es el "servidor" de la aplicación. Su trabajo es recibir peticiones del frontend (la página web), consultar la base de datos y devolver la información como respuesta.

En términos simples:

```
[Navegador / Frontend]  →  petición HTTP  →  [Backend]  →  consulta SQL  →  [Base de datos]
[Navegador / Frontend]  ←  respuesta JSON ←  [Backend]  ←  resultado     ←  [Base de datos]
```

El backend **no muestra nada en pantalla**. Solo habla en formato JSON — un formato de texto estructurado que el frontend luego convierte en lo que el usuario ve.

---

## Tecnologías usadas

| Tecnología | ¿Para qué sirve? |
|---|---|
| **Node.js** | Permite ejecutar JavaScript fuera del navegador, en el servidor |
| **Express** | Librería que facilita crear rutas y manejar peticiones HTTP en Node.js |
| **PostgreSQL** | Base de datos relacional donde vive toda la información |
| **Supabase** | Plataforma que aloja nuestra base de datos PostgreSQL en la nube |
| **bcrypt** | Librería para verificar contraseñas de forma segura |
| **jsonwebtoken** | Librería para crear y verificar tokens de sesión (JWT) |
| **dotenv** | Carga las variables de entorno desde el archivo `.env` |
| **cors** | Permite que el frontend (en otro puerto/dominio) se comunique con el backend |

---

## Cómo levantar el backend

### 1. Instalar dependencias (solo la primera vez)

```bash
cd backend
npm install
```

### 2. Crear el archivo `.env`

El archivo `.env` contiene información sensible (contraseñas, claves) que **no se sube al repositorio**. Cópialo desde el ejemplo:

```bash
cp .env.example .env
```

El `.env` ya está configurado con los datos de conexión a Supabase. Si alguien del equipo necesita los valores, pedirlos al encargado del proyecto.

### 3. Arrancar el servidor

```bash
# Modo desarrollo (se reinicia automáticamente al guardar cambios)
npm run dev

# Modo producción
npm start
```

Cuando el servidor arranca correctamente verás:
```
Base de datos conectada
Servidor corriendo en puerto 4000
```

### 4. Verificar que funciona

Abre el navegador o usa curl:

```
http://localhost:4000/api/dashboard  →  debe responder {"error":"Token requerido."}
```

Si responde algo (así sea un error), el servidor está vivo.

---

## Estructura de carpetas

```
backend/
├── src/
│   ├── index.js          ← Punto de entrada: arranca el servidor
│   ├── app.js            ← Configura Express: middlewares, rutas, errores
│   │
│   ├── db/
│   │   └── pool.js       ← Conexión a la base de datos (solo se crea una vez)
│   │
│   ├── middleware/
│   │   ├── auth.js       ← Verifica si el usuario tiene sesión válida
│   │   └── errorHandler.js ← Captura errores y los devuelve como JSON
│   │
│   ├── routes/
│   │   ├── index.js      ← Une todas las rutas bajo /api
│   │   ├── auth.routes.js      ← Rutas de autenticación
│   │   └── dashboard.routes.js ← Rutas del dashboard
│   │
│   ├── controllers/
│   │   ├── auth.controller.js      ← Recibe la petición, llama al servicio
│   │   └── dashboard.controller.js
│   │
│   ├── services/
│   │   ├── auth.service.js      ← Lógica: bcrypt, JWT, iniciales del nombre
│   │   └── dashboard.service.js ← Lógica: derivar código, calcular estadísticas
│   │
│   └── queries/
│       ├── auth.queries.js      ← Consultas SQL de autenticación
│       └── dashboard.queries.js ← Consultas SQL del dashboard
│
├── docs/               ← Esta carpeta: documentación del proyecto
├── .env                ← Variables secretas (NO subir al repo)
├── .env.example        ← Plantilla del .env (SÍ se sube al repo)
├── .gitignore
└── package.json
```

### ¿Por qué tantas carpetas?

El código está dividido en **capas**, cada una con una responsabilidad específica:

- **routes** → reciben la petición y la dirigen al lugar correcto
- **controllers** → validan los datos de entrada y llaman al servicio
- **services** → contienen la lógica de negocio (lo que hace la app)
- **queries** → solo hablan con la base de datos

Esta separación permite que si mañana cambia la base de datos, solo se toque la carpeta `queries`. Si cambia la lógica del negocio, solo `services`. Y así sucesivamente.

---

## Variables de entorno (.env)

| Variable | Descripción |
|---|---|
| `PORT` | Puerto donde corre el servidor (por defecto 4000) |
| `DATABASE_URL` | URL completa de conexión a PostgreSQL en Supabase |
| `JWT_SECRET` | Clave secreta para firmar los tokens de sesión |
| `JWT_EXPIRES_IN` | Cuánto dura la sesión (por ejemplo `8h` = 8 horas) |
| `FRONTEND_URL` | URL del frontend para permitir peticiones CORS |

> **Importante:** Nunca subas el `.env` al repositorio. Contiene contraseñas reales. El `.gitignore` ya lo excluye automáticamente.

---

## Documentos adicionales

- [autenticacion.md](./autenticacion.md) — Cómo funciona el sistema de login y sesiones
- [endpoints.md](./endpoints.md) — Todos los endpoints disponibles con ejemplos
