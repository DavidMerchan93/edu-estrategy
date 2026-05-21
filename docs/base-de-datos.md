# Base de Datos — EDU-STRATEGY

## Tecnología

- **DBMS:** PostgreSQL >= 14
- **Driver:** pg (node-postgres) v8.13.1
- **Conexión:** Pool con SSL habilitado (`rejectUnauthorized: false`)

---

## Diagrama Entidad-Relación

```
┌─────────────┐       ┌──────────────┐       ┌───────────┐
│  CREDENCIAL │ 1   1 │  ESTUDIANTE  │ 1   N │ SEMESTRE  │
│─────────────│───────│──────────────│───────│───────────│
│ id_credencial│      │ id_estudiante│       │id_semestre│
│ email        │      │ id_credencial│       │id_estudiante│
│ password_hash│      │ identificacion│      │ nombre    │
│ rol          │      │ nombre_completo│     │ activo    │
│ intentos_login│     │ carrera      │       └─────┬─────┘
│ bloqueado    │      │ semestre_actual│            │ 1
└─────────────┘       │ fecha_ingreso │            │
                      └──────────────┘            │ N
                                           ┌──────┴──────┐
                                           │  ASIGNATURA │
                                           │─────────────│
                                           │id_asignatura│
                                           │ id_semestre │
                                           │ nombre      │
                                           │nombre_docente│
                                           └──────┬──────┘
                                                  │ 1
                                                  │ N
                                           ┌──────┴──────┐
                                           │    HITO     │
                                           │─────────────│
                                           │  id_hito    │
                                           │id_asignatura│
                                           │ nota        │
                                           │horas_dedicadas│
                                           └─────────────┘
```

---

## Tablas

### credencial

Almacena las credenciales de acceso de cada usuario.

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| `id_credencial` | SERIAL | PK | Identificador único |
| `email` | VARCHAR | NOT NULL, UNIQUE | Correo electrónico |
| `password_hash` | VARCHAR | NOT NULL | Contraseña cifrada con bcrypt |
| `rol` | VARCHAR | NOT NULL, DEFAULT 'estudiante' | Rol del usuario |
| `intentos_login` | INTEGER | DEFAULT 0 | Intentos fallidos consecutivos |
| `bloqueado` | BOOLEAN | DEFAULT false | Cuenta bloqueada si `intentos_login >= 3` |

---

### estudiante

Almacena el perfil académico del estudiante.

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| `id_estudiante` | SERIAL | PK | Identificador único |
| `id_credencial` | INTEGER | FK → credencial, NOT NULL | Referencia a credencial |
| `identificacion` | VARCHAR | NOT NULL | Número de documento |
| `nombre_completo` | VARCHAR | NOT NULL | Nombre completo |
| `carrera` | VARCHAR | NOT NULL | Programa académico |
| `semestre_actual` | INTEGER | NOT NULL | Semestre en curso |
| `fecha_ingreso` | DATE | NOT NULL | Fecha de matrícula |

---

### semestre

Representa un período académico de un estudiante. Solo puede haber un semestre con `activo = true` por estudiante.

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| `id_semestre` | SERIAL | PK | Identificador único |
| `id_estudiante` | INTEGER | FK → estudiante, NOT NULL | Dueño del semestre |
| `nombre` | VARCHAR | NOT NULL | Etiqueta del semestre (ej. "2026-1") |
| `activo` | BOOLEAN | NOT NULL | `true` = semestre en curso |

---

### asignatura

Representa una materia dentro de un semestre.

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| `id_asignatura` | SERIAL | PK | Identificador único |
| `id_semestre` | INTEGER | FK → semestre, NOT NULL | Semestre al que pertenece |
| `nombre` | VARCHAR | NOT NULL | Nombre de la asignatura |
| `nombre_docente` | VARCHAR | NOT NULL | Nombre del docente |

---

### hito

Representa un entregable o evaluación dentro de una asignatura (parcial, trabajo, quiz, etc.).

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| `id_hito` | SERIAL | PK | Identificador único |
| `id_asignatura` | INTEGER | FK → asignatura, NOT NULL | Asignatura a la que pertenece |
| `nota` | NUMERIC(4,2) | NOT NULL | Nota obtenida (escala 0.00 – 5.00) |
| `horas_dedicadas` | INTEGER | NOT NULL | Horas invertidas en este hito |

---

## Flujos de datos

### Registro de usuario

```
POST /autenticacion/registro
  → INSERT INTO credencial (email, password_hash, rol, intentos_login, bloqueado)
  → INSERT INTO estudiante (id_credencial, identificacion, nombre_completo, carrera, semestre_actual, fecha_ingreso)
```

### Inicio de sesión

```
POST /autenticacion/login
  → SELECT estudiante.*, credencial.*
      FROM estudiante JOIN credencial ON id_credencial
      WHERE credencial.email = $1
  → Si contraseña inválida:
      UPDATE credencial SET intentos_login = intentos_login + 1,
                            bloqueado = CASE WHEN intentos_login + 1 >= 3 THEN true END
  → Si contraseña válida:
      UPDATE credencial SET intentos_login = 0
      → Genera JWT { id_estudiante, email, rol }
```

### Carga del dashboard

```
GET /api/dashboard (token requerido)
  → SELECT id_semestre, nombre FROM semestre
      WHERE id_estudiante = $1 AND activo = TRUE LIMIT 1
  → SELECT asignatura.*, COUNT(hito), AVG(nota), SUM(horas_dedicadas)
      FROM asignatura LEFT JOIN hito ON id_asignatura
      WHERE id_semestre = $1
      GROUP BY asignatura
      ORDER BY nombre
```

---

## Conexión

La aplicación utiliza un pool de conexiones configurado con la variable de entorno `DATABASE_URL`:

```
postgresql://usuario:contraseña@host:puerto/nombre_bd
```

Configurado en `backend-edustrategy/src/configuracion/baseDatos.js`.
