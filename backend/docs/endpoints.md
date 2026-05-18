# Endpoints de la API

Un **endpoint** es una dirección URL a la que el frontend puede enviar peticiones para obtener o enviar información.

Todos los endpoints empiezan con `/api`. El servidor corre por defecto en `http://localhost:4000`.

---

## Resumen rápido

| Método | Ruta | ¿Requiere sesión? | ¿Qué hace? |
|---|---|---|---|
| POST | `/api/auth/login` | No | Inicia sesión, devuelve token |
| GET | `/api/dashboard` | Sí (JWT) | Datos del dashboard del estudiante |

---

## POST `/api/auth/login`

Verifica las credenciales del usuario. Si son correctas, devuelve un token de sesión y los datos básicos del usuario.

### ¿Cómo se llama?

```
Método:  POST
URL:     http://localhost:4000/api/auth/login
Headers: Content-Type: application/json
```

### Cuerpo de la petición (body)

```json
{
  "email": "david@correo.edu.co",
  "password": "Admin2026"
}
```

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `email` | string | Sí | Correo registrado del estudiante |
| `password` | string | Sí | Contraseña en texto plano |

### Respuestas posibles

**Éxito — 200 OK**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "nombre": "David Stiven Merchan Bustos",
    "iniciales": "DS",
    "correo": "david@correo.edu.co",
    "carrera": "Ingeniería de Software",
    "semestre": 7,
    "semestreActivo": "2026-1"
  }
}
```

| Campo | Descripción |
|---|---|
| `token` | JWT que el frontend debe guardar y enviar en peticiones siguientes |
| `usuario.id` | ID del estudiante en la base de datos |
| `usuario.nombre` | Nombre completo |
| `usuario.iniciales` | Primeras letras del nombre y apellido (para el avatar) |
| `usuario.semestreActivo` | Nombre del semestre con `activo = true` |

**Error — 400 Bad Request** (datos inválidos, ej: email mal escrito)

```json
{
  "error": "Datos inválidos.",
  "detalles": [{ "msg": "Invalid value", "path": "email" }]
}
```

**Error — 401 Unauthorized** (correo no existe o contraseña incorrecta)

```json
{
  "error": "Correo o contraseña incorrectos."
}
```

> El servidor devuelve el mismo mensaje tanto si el correo no existe como si la contraseña es incorrecta. Esto es intencional: no queremos dar pistas sobre qué parte falló.

**Error — 403 Forbidden** (cuenta bloqueada por 5 intentos fallidos)

```json
{
  "error": "Cuenta bloqueada. Contacte al administrador."
}
```

### Ejemplo con curl

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"david@correo.edu.co","password":"Admin2026"}'
```

### ¿Qué hace internamente?

```
1. Valida que email y password llegaron correctamente
2. Busca el email en la tabla credencial (JOIN con estudiante y semestre)
3. Verifica la contraseña con bcrypt.compare()
4. Si falla: suma 1 a intentos_login (si llega a 5, bloquea la cuenta)
5. Si éxito: resetea intentos, crea JWT, devuelve token + datos del usuario
```

**Consulta SQL que se ejecuta:**

```sql
SELECT
  c.id_credencial, c.email, c.password_hash, c.rol,
  c.intentos_login, c.bloqueado,
  e.id_estudiante, e.nombre_completo, e.carrera, e.semestre_actual,
  s.id_semestre, s.nombre AS semestre_nombre
FROM credencial c
LEFT JOIN estudiante e ON e.id_credencial = c.id_credencial
LEFT JOIN semestre s ON s.id_estudiante = e.id_estudiante AND s.activo = TRUE
WHERE c.email = $1
```

---

## GET `/api/dashboard`

Devuelve todos los datos necesarios para mostrar el dashboard del estudiante que tiene sesión activa.

### ¿Cómo se llama?

```
Método:  GET
URL:     http://localhost:4000/api/dashboard
Headers: Authorization: Bearer <token>
```

El `<token>` es el que se recibió al hacer login. El frontend lo guarda en `localStorage` con la clave `edu_token`.

### Cuerpo de la petición

No lleva body. Toda la información del usuario se saca del token.

### Respuestas posibles

**Éxito — 200 OK**

```json
{
  "semestreActivo": "2026-1",
  "totalAsignaturas": 3,
  "promedioGeneral": 4.2,
  "tiempoTotal": 92,
  "asignaturas": [
    {
      "id": 2,
      "nombre": "Bases de Datos",
      "codigo": "BAS",
      "docente": "Carlos Mejía",
      "hitos": 3,
      "nota": 4.37,
      "tiempo": 24,
      "semestre": "2026-1"
    },
    {
      "id": 3,
      "nombre": "Inglés VII",
      "codigo": "ING",
      "docente": "Ana Gómez",
      "hitos": 2,
      "nota": 4.3,
      "tiempo": 4,
      "semestre": "2026-1"
    },
    {
      "id": 1,
      "nombre": "Proyecto de Software",
      "codigo": "PRO",
      "docente": "Tatiana Cabrera",
      "hitos": 3,
      "nota": 4.0,
      "tiempo": 64,
      "semestre": "2026-1"
    }
  ]
}
```

| Campo raíz | Descripción |
|---|---|
| `semestreActivo` | Nombre del semestre que tiene `activo = true` |
| `totalAsignaturas` | Cantidad de asignaturas en ese semestre |
| `promedioGeneral` | Promedio de las notas de todas las asignaturas |
| `tiempoTotal` | Suma de horas dedicadas en todos los hitos |
| `asignaturas` | Lista de asignaturas con sus estadísticas |

| Campo dentro de `asignaturas` | Descripción |
|---|---|
| `id` | ID de la asignatura en la base de datos |
| `nombre` | Nombre completo ("Bases de Datos") |
| `codigo` | Abreviatura generada automáticamente ("BAS") |
| `docente` | Nombre del docente |
| `hitos` | Cantidad de hitos registrados |
| `nota` | Promedio de notas de los hitos (ignora hitos sin nota) |
| `tiempo` | Total de horas dedicadas en esa asignatura |
| `semestre` | Nombre del semestre al que pertenece |

> **Sobre el campo `codigo`:** La base de datos no tiene este campo. El backend lo genera tomando las primeras 3 letras del nombre, quitando tildes y pasándolas a mayúsculas. Ejemplos: "Inglés VII" → "ING", "Proyecto de Software" → "PRO".

> **Sobre la nota promedio:** Si un hito no tiene nota todavía (campo `nota` en `NULL`), no se cuenta en el promedio. Solo se promedian los hitos calificados.

**Error — 401 Unauthorized** (sin token o token inválido)

```json
{
  "error": "Token requerido."
}
```

```json
{
  "error": "Token inválido o expirado."
}
```

**Sin semestre activo — 200 OK** (el estudiante existe pero no tiene semestre activo)

```json
{
  "semestreActivo": "Sin semestre activo",
  "totalAsignaturas": 0,
  "promedioGeneral": 0,
  "tiempoTotal": 0,
  "asignaturas": []
}
```

### Ejemplo con curl

```bash
# Primero obtener el token
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"david@correo.edu.co","password":"Admin2026"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")

# Luego llamar al dashboard
curl http://localhost:4000/api/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

### ¿Qué hace internamente?

```
1. El middleware verifica el JWT del header
2. Del token extrae idEstudiante e idSemestre
3. Consulta la base de datos: todas las asignaturas del semestre
   con el conteo de hitos, promedio de notas y suma de horas
4. Calcula promedioGeneral y tiempoTotal
5. Genera el campo "codigo" para cada asignatura
6. Devuelve todo como JSON
```

**Consulta SQL que se ejecuta:**

```sql
SELECT
  a.id_asignatura,
  a.nombre,
  a.nombre_docente,
  COUNT(h.id_hito)                        AS hitos,
  COALESCE(AVG(h.nota), 0)::numeric(4,2)  AS nota,
  COALESCE(SUM(h.horas_dedicadas), 0)      AS tiempo
FROM asignatura a
LEFT JOIN hito h ON h.id_asignatura = a.id_asignatura
WHERE a.id_semestre = $1
GROUP BY a.id_asignatura, a.nombre, a.nombre_docente
ORDER BY a.nombre
```

> `COALESCE(valor, 0)` significa: "usa este valor, pero si es NULL usa 0 en su lugar". Así no falla cuando una asignatura no tiene hitos.

---

## Cómo probar los endpoints sin el frontend

### Opción 1: curl (terminal)

Ver los ejemplos en cada endpoint arriba.

### Opción 2: Extensión REST Client en VS Code

Crea un archivo `pruebas.http` en cualquier carpeta con este contenido:

```http
### Login
POST http://localhost:4000/api/auth/login
Content-Type: application/json

{
  "email": "david@correo.edu.co",
  "password": "Admin2026"
}

### Dashboard (reemplaza <TOKEN> con el token del login)
GET http://localhost:4000/api/dashboard
Authorization: Bearer <TOKEN>
```

Instala la extensión **REST Client** de Huachao Mao en VS Code y aparecerá el botón "Send Request" encima de cada petición.

### Opción 3: Postman

1. Abre Postman
2. Crea una petición POST a `http://localhost:4000/api/auth/login`
3. En Body → raw → JSON, pega `{"email":"david@correo.edu.co","password":"Admin2026"}`
4. Envía y copia el token de la respuesta
5. Crea una petición GET a `http://localhost:4000/api/dashboard`
6. En Headers agrega `Authorization: Bearer <token copiado>`

---

## Credenciales de prueba

| Email | Contraseña | Estudiante |
|---|---|---|
| `david@correo.edu.co` | `Admin2026` | David Stiven Merchan Bustos |
| `tatiana@correo.edu.co` | `Admin2026` | Tatiana Paola Walteros |
| `admin@edu-strategy.com` | `Admin2026` | Administrador del Sistema |

> Las contraseñas del administrador no funcionarán en el endpoint de dashboard porque no tiene `id_estudiante` ni semestres asociados.

---

## Códigos de estado HTTP más comunes

| Código | Nombre | ¿Qué significa? |
|---|---|---|
| 200 | OK | Todo salió bien |
| 400 | Bad Request | Los datos enviados son inválidos |
| 401 | Unauthorized | No tienes sesión o las credenciales son incorrectas |
| 403 | Forbidden | Tienes sesión pero no tienes permiso |
| 500 | Internal Server Error | Algo falló dentro del servidor |
