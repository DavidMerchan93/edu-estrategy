# Cómo funciona la autenticación

Este documento explica paso a paso cómo el sistema verifica que un usuario es quien dice ser, y cómo protege las rutas que requieren sesión activa.

---

## El problema que resuelve

Cuando un usuario ingresa su correo y contraseña, el servidor necesita:

1. Confirmar que ese correo existe en la base de datos
2. Confirmar que la contraseña es correcta **sin guardar la contraseña en texto plano**
3. Darle al usuario algo que pueda usar para las siguientes peticiones sin tener que escribir su contraseña cada vez

Para esto se usan dos herramientas: **bcrypt** y **JWT**.

---

## Parte 1: Contraseñas con bcrypt

### ¿Por qué no guardar la contraseña directamente?

Imagina que alguien accede ilegalmente a la base de datos. Si las contraseñas están en texto plano (`Admin2026`), el atacante tiene acceso a las cuentas de todos los usuarios de inmediato.

**bcrypt** soluciona esto convirtiendo la contraseña en un código irreversible llamado **hash**:

```
"Admin2026"  →  bcrypt  →  "$2b$10$XlEAc7ghHGmQ9.BkSWM..."
```

Lo importante: **no se puede revertir**. No existe forma de convertir `$2b$10$XlEAc7...` de vuelta a `Admin2026`. Por eso se llama hash y no cifrado.

### ¿Cómo se verifica entonces?

Cuando el usuario ingresa su contraseña, bcrypt la procesa con el mismo algoritmo y **compara los resultados**:

```
"Admin2026" (lo que escribió el usuario)
     +
"$2b$10$XlEAc7ghHGmQ9..." (lo que hay en la base de datos)
     ↓
bcrypt.compare()  →  true (coincide) o false (no coincide)
```

Esto pasa en [auth.service.js](../src/services/auth.service.js):

```js
const coincide = await bcrypt.compare(password, fila.password_hash);
```

---

## Parte 2: Sesiones con JWT

### ¿Qué es un JWT?

JWT significa *JSON Web Token*. Es básicamente una **credencial digital** que el servidor le entrega al usuario después de que inicia sesión correctamente.

Funciona como una pulsera de entrada en un evento:
- La primera vez presentas tu documento (correo + contraseña) en la puerta
- Te dan una pulsera (el token)
- Las siguientes veces solo muestras la pulsera; ya no necesitas el documento

### ¿Cómo se ve un JWT?

Es una cadena de texto dividida en tres partes separadas por puntos:

```
eyJhbGciOiJIUzI1NiJ9.eyJpZEVzdHVkaWFudGUiOjF9.xK9mP3qL7nR2
    ^-- Encabezado         ^-- Datos (payload)    ^-- Firma
```

La parte del medio (payload) contiene información que el servidor le quiere guardar al usuario:

```json
{
  "idCredencial": 2,
  "idEstudiante": 1,
  "idSemestre": 1,
  "rol": "estudiante"
}
```

> **Nota:** Esta información no está cifrada — cualquiera puede leerla si decodifica el JWT. Por eso **nunca se guarda información sensible** (como contraseñas) dentro del token.

### La firma: lo que hace al JWT seguro

La tercera parte del JWT es una firma generada con una clave secreta que solo el servidor conoce (`JWT_SECRET` en el `.env`).

Cuando llega una petición con un token, el servidor verifica la firma. Si alguien modificó el contenido del token (por ejemplo, cambió `"idEstudiante": 1` a `"idEstudiante": 99` para hacerse pasar por otro usuario), la firma no va a coincidir y el token es rechazado.

### ¿Cuánto dura la sesión?

El token tiene una fecha de expiración configurada en `.env`:

```
JWT_EXPIRES_IN=8h
```

Después de 8 horas, el token deja de ser válido y el usuario tiene que iniciar sesión de nuevo.

---

## Flujo completo de autenticación

```
1. Usuario escribe correo y contraseña en el frontend
          ↓
2. Frontend envía POST /api/auth/login con { email, password }
          ↓
3. Backend busca el email en la base de datos
   - Si no existe → responde 401 "Correo o contraseña incorrectos"
   - Si la cuenta está bloqueada → responde 403 "Cuenta bloqueada"
          ↓
4. Backend compara la contraseña con el hash guardado (bcrypt.compare)
   - Si no coincide → suma 1 a intentos_login
                    → si llega a 5 intentos, bloquea la cuenta
                    → responde 401 "Correo o contraseña incorrectos"
          ↓
5. Si la contraseña es correcta:
   - Resetea el contador de intentos a 0
   - Crea un JWT con los datos del estudiante
   - Responde 200 con { token, usuario }
          ↓
6. Frontend guarda el token en localStorage
          ↓
7. En cada petición siguiente, el frontend envía el token en el header:
   Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

---

## El middleware de autenticación

Un **middleware** es una función que se ejecuta antes de llegar al endpoint. Es como un guardia de seguridad en la puerta.

El archivo [auth.js](../src/middleware/auth.js) hace exactamente esto: antes de que cualquier petición llegue al dashboard, pasa por este guardia:

```js
function verificarToken(req, res, next) {
  // 1. Leer el token del header
  const token = req.headers.authorization.slice(7); // quita "Bearer "

  // 2. Verificar que el token es válido y no expiró
  req.user = jwt.verify(token, process.env.JWT_SECRET);

  // 3. Si todo está bien, dejar pasar
  next();
}
```

Si el token falta o es inválido, el middleware responde con error y **la petición nunca llega al endpoint**.

---

## Protección contra fuerza bruta

"Fuerza bruta" es cuando alguien intenta adivinar una contraseña probando miles de combinaciones automáticamente.

El sistema lo previene con el contador `intentos_login` en la tabla `credencial`:

| Intento | ¿Qué pasa? |
|---|---|
| 1 - 4 fallidos | `intentos_login` sube, cuenta activa |
| 5 fallido | `bloqueado = true`, cuenta bloqueada |
| Login exitoso | `intentos_login = 0`, `bloqueado = false` |

Una cuenta bloqueada solo puede ser desbloqueada por un administrador (cambiando `bloqueado = false` en la base de datos).

---

## Archivos relacionados

| Archivo | Rol en la autenticación |
|---|---|
| [queries/auth.queries.js](../src/queries/auth.queries.js) | Busca usuario en BD, actualiza intentos |
| [services/auth.service.js](../src/services/auth.service.js) | bcrypt, JWT, lógica de bloqueo |
| [controllers/auth.controller.js](../src/controllers/auth.controller.js) | Valida inputs, llama al servicio |
| [routes/auth.routes.js](../src/routes/auth.routes.js) | Define la ruta POST /auth/login |
| [middleware/auth.js](../src/middleware/auth.js) | Verifica el JWT en cada petición protegida |
