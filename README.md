# EDU-STRATEGY Backend

Backend del sistema EDU-STRATEGY desarrollado con Node.js, Express y PostgreSQL.

## Descripción

Este proyecto corresponde al backend de la plataforma EDU-STRATEGY, una aplicación web orientada a la autogestión académica estudiantil. El sistema permite autenticación de usuarios, gestión académica y comunicación mediante API REST.

## Tecnologías utilizadas

- Node.js
- Express
- PostgreSQL
- Supabase
- JWT
- bcrypt
- dotenv
- nodemon

## Instalación

Clonar repositorio:

```bash
git clone <url-del-repo>
```

Ingresar a la carpeta del backend:

```bash
cd backend-edustrategy
```

Instalar dependencias:

```bash
npm install
```

## Variables de entorno

Crear un archivo `.env` basado en `.env.example`:

```env
PORT=5000
DATABASE_URL=
JWT_SECRET=
```

## Ejecución del proyecto

Modo desarrollo:

```bash
npm run dev
```

El servidor se ejecutará en:

```txt
http://localhost:5000
```

## Endpoints principales

### Autenticación

- POST `/api/autenticacion/login`
- POST `/api/autenticacion/registro`

### Usuario

- GET `/api/usuario/perfil`

## Arquitectura

El backend se encuentra organizado de forma modular mediante:

- configuracion
- rutas
- controladores
- servicios
- middlewares

## Seguridad

El sistema implementa autenticación mediante JWT y cifrado de contraseñas utilizando bcrypt para proteger la información de los usuarios.