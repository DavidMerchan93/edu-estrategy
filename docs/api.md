# Referencia de la API — EDU-STRATEGY

## Base URL

```
http://localhost:5000/api
```

## Autenticación

Los endpoints protegidos requieren un JWT en el header `Authorization`:

```
Authorization: Bearer <token>
```

El token se obtiene en el endpoint de login y tiene una vigencia de **1 hora**.

---

## Resumen de endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | /salud | No | Estado del servidor |
| GET | /salud/base-datos | No | Estado de la conexión a BD |
| POST | /autenticacion/registro | No | Registrar nuevo estudiante |
| POST | /autenticacion/login | No | Iniciar sesión |
| GET | /usuario/perfil | Sí | Obtener perfil del usuario |
| PUT | /usuario/perfil | Sí | Actualizar perfil del usuario |
| GET | /dashboard | Sí | Datos del semestre activo |

---

## Salud

### GET /salud

Verifica que el servidor está activo.

**Respuesta 200:**
```json
{
  "estado": "OK",
  "mensaje": "Servidor EDU-STRATEGY funcionando correctamente"
}
```

---

### GET /salud/base-datos

Verifica la conexión a PostgreSQL.

**Respuesta 200:**
```json
{
  "estado": "OK",
  "mensaje": "Conexión exitosa a PostgreSQL",
  "fechaServidor": "2026-05-20T15:30:00.000Z"
}
```

**Respuesta 500:**
```json
{
  "estado": "ERROR",
  "mensaje": "Error al conectar con la base de datos"
}
```

---

## Autenticación

### POST /autenticacion/registro

Crea una nueva cuenta de estudiante.

**Body:**
```json
{
  "nombre_completo": "Juan Pérez",
  "email": "juan@correo.edu.co",
  "password": "MiContraseña123",
  "identificacion": "1234567890",
  "carrera": "Ingeniería de Sistemas",
  "semestre_actual": 5,
  "fecha_ingreso": "2024-01-15"
}
```

**Respuesta 201:**
```json
{
  "mensaje": "Usuario registrado correctamente",
  "usuario": {
    "id_estudiante": 1,
    "id_credencial": 1,
    "identificacion": "1234567890",
    "nombre_completo": "Juan Pérez",
    "carrera": "Ingeniería de Sistemas",
    "semestre_actual": 5,
    "fecha_ingreso": "2024-01-15"
  }
}
```

**Errores:**

| Código | Motivo |
|--------|--------|
| 400 | Faltan campos obligatorios |
| 409 | El correo ya está registrado |

---

### POST /autenticacion/login

Inicia sesión y devuelve un token JWT.

**Body:**
```json
{
  "email": "juan@correo.edu.co",
  "password": "MiContraseña123"
}
```

**Respuesta 200:**
```json
{
  "mensaje": "Inicio de sesión exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id_estudiante": 1,
    "identificacion": "1234567890",
    "nombre_completo": "Juan Pérez",
    "carrera": "Ingeniería de Sistemas",
    "semestre_actual": 5,
    "fecha_ingreso": "2024-01-15",
    "email": "juan@correo.edu.co",
    "rol": "estudiante"
  }
}
```

**Errores:**

| Código | Motivo |
|--------|--------|
| 400 | Faltan email o contraseña |
| 401 | Credenciales inválidas |
| 403 | Cuenta bloqueada (3 intentos fallidos) |

> La cuenta se bloquea automáticamente después de 3 intentos fallidos consecutivos. El contador se reinicia al iniciar sesión correctamente.

---

## Usuario

### GET /usuario/perfil

Retorna el perfil del usuario autenticado.

**Headers:** `Authorization: Bearer <token>`

**Respuesta 200:**
```json
{
  "mensaje": "Perfil obtenido",
  "usuario": {
    "nombre_completo": "Juan Pérez",
    "carrera": "Ingeniería de Sistemas",
    "semestre_actual": 5,
    "email": "juan@correo.edu.co"
  }
}
```

**Errores:**

| Código | Motivo |
|--------|--------|
| 401 | Token ausente o inválido |
| 404 | Usuario no encontrado |

---

### PUT /usuario/perfil

Actualiza los datos del perfil del usuario autenticado.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "nombre_completo": "Juan Alberto Pérez",
  "carrera": "Ingeniería de Software",
  "semestre_actual": 6
}
```

**Respuesta 200:**
```json
{
  "mensaje": "Perfil actualizado correctamente",
  "usuario": {
    "id_estudiante": 1,
    "identificacion": "1234567890",
    "nombre_completo": "Juan Alberto Pérez",
    "carrera": "Ingeniería de Software",
    "semestre_actual": 6,
    "fecha_ingreso": "2024-01-15"
  }
}
```

**Errores:**

| Código | Motivo |
|--------|--------|
| 400 | Faltan campos obligatorios |
| 401 | Token ausente o inválido |
| 404 | Usuario no encontrado |

---

## Dashboard

### GET /dashboard

Retorna los datos consolidados del semestre activo del estudiante autenticado.

**Headers:** `Authorization: Bearer <token>`

**Respuesta 200:**
```json
{
  "semestreActivo": "2026-1",
  "totalAsignaturas": 5,
  "promedioGeneral": 3.8,
  "tiempoTotal": 120,
  "asignaturas": [
    {
      "id": 1,
      "nombre": "Cálculo Diferencial",
      "codigo": "CAL",
      "docente": "Dr. García",
      "hitos": 3,
      "nota": 4.0,
      "tiempo": 25,
      "semestre": "2026-1"
    }
  ]
}
```

| Campo | Descripción |
|-------|-------------|
| `semestreActivo` | Nombre del semestre con `activo = true`. `"Sin semestre activo"` si no existe. |
| `totalAsignaturas` | Número de asignaturas en el semestre |
| `promedioGeneral` | Promedio de todas las notas, 1 decimal |
| `tiempoTotal` | Suma de horas dedicadas en todos los hitos |
| `codigo` | Primeras 3 letras del nombre de la asignatura (sin tildes) |
| `hitos` | Número de hitos registrados en la asignatura |
| `nota` | Promedio de notas de todos los hitos de la asignatura |
| `tiempo` | Suma de horas de todos los hitos de la asignatura |

**Respuesta cuando no hay semestre activo:**
```json
{
  "semestreActivo": "Sin semestre activo",
  "totalAsignaturas": 0,
  "promedioGeneral": 0,
  "tiempoTotal": 0,
  "asignaturas": []
}
```

**Errores:**

| Código | Motivo |
|--------|--------|
| 401 | Token ausente o inválido |
| 500 | Error interno del servidor |
