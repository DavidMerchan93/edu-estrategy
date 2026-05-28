const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'EDU-STRATEGY API',
    version: '1.0.0',
    description:
      'API REST del sistema EDU-STRATEGY para la gestión académica de estudiantes universitarios. Permite llevar control de semestres, asignaturas, hitos académicos y seguimiento de rendimiento.',
  },
  servers: [
    {
      url: '/',
      description: 'Servidor actual (relativo)',
    },
  ],
  tags: [
    { name: 'Salud', description: 'Endpoints de verificación del servidor y base de datos' },
    { name: 'Autenticación', description: 'Registro e inicio de sesión de usuarios' },
    { name: 'Usuario', description: 'Gestión del perfil del usuario autenticado' },
    { name: 'Asignaturas', description: 'CRUD de asignaturas del semestre activo' },
    { name: 'Semestres', description: 'Gestión de semestres académicos' },
    { name: 'Hitos', description: 'CRUD de hitos académicos por asignatura' },
    { name: 'Dashboard', description: 'Resumen del semestre activo con métricas' },
  ],
  paths: {
    '/api/salud': {
      get: {
        tags: ['Salud'],
        summary: 'Verificar estado del servidor',
        operationId: 'healthCheck',
        responses: {
          200: {
            description: 'Servidor funcionando correctamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    estado: { type: 'string', example: 'OK' },
                    mensaje: {
                      type: 'string',
                      example: 'Servidor EDU-STRATEGY funcionando correctamente',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/salud/base-datos': {
      get: {
        tags: ['Salud'],
        summary: 'Verificar conexión a la base de datos',
        operationId: 'healthCheckDb',
        responses: {
          200: {
            description: 'Conexión exitosa a PostgreSQL',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    estado: { type: 'string', example: 'OK' },
                    mensaje: { type: 'string', example: 'Conexión exitosa a PostgreSQL' },
                    fechaServidor: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
          500: {
            description: 'Error de conexión a la base de datos',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
                example: {
                  estado: 'ERROR',
                  mensaje: 'Error al conectar con PostgreSQL',
                  detalle: 'ECONNREFUSED',
                },
              },
            },
          },
        },
      },
    },
    '/api/autenticacion/registro': {
      post: {
        tags: ['Autenticación'],
        summary: 'Registrar un nuevo usuario',
        operationId: 'registro',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegistroBody' },
            },
          },
        },
        responses: {
          201: {
            description: 'Usuario registrado correctamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    mensaje: { type: 'string', example: 'Usuario registrado correctamente' },
                    usuario: { $ref: '#/components/schemas/Usuario' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Campos obligatorios faltantes',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          409: {
            description: 'El correo ya está registrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          500: { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },
    '/api/autenticacion/login': {
      post: {
        tags: ['Autenticación'],
        summary: 'Iniciar sesión',
        operationId: 'login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginBody' },
            },
          },
        },
        responses: {
          200: {
            description: 'Inicio de sesión exitoso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    mensaje: { type: 'string', example: 'Inicio de sesión exitoso' },
                    token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
                    usuario: { $ref: '#/components/schemas/UsuarioLogueado' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Credenciales no proporcionadas',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          401: {
            description: 'Credenciales inválidas',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'Usuario bloqueado por intentos fallidos',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          500: { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },
    '/api/usuario/prueba': {
      get: {
        tags: ['Usuario'],
        summary: 'Endpoint de prueba para verificar rutas de usuario',
        operationId: 'usuarioPrueba',
        responses: {
          200: {
            description: 'Ruta de usuario funcionando',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    mensaje: { type: 'string', example: 'Ruta de usuario funcionando' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/usuario/perfil': {
      get: {
        tags: ['Usuario'],
        summary: 'Obtener perfil del usuario autenticado',
        operationId: 'obtenerPerfil',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Perfil obtenido exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    mensaje: { type: 'string', example: 'Perfil obtenido' },
                    usuario: {
                      type: 'object',
                      properties: {
                        nombre_completo: { type: 'string' },
                        carrera: { type: 'string' },
                        semestre_actual: { type: 'integer' },
                        email: { type: 'string', format: 'email' },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: {
            description: 'Usuario no encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          500: { $ref: '#/components/responses/InternalServerError' },
        },
      },
      put: {
        tags: ['Usuario'],
        summary: 'Actualizar perfil del usuario autenticado',
        operationId: 'actualizarPerfil',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PerfilBody' },
            },
          },
        },
        responses: {
          200: {
            description: 'Perfil actualizado correctamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    mensaje: { type: 'string', example: 'Perfil actualizado correctamente' },
                    usuario: { $ref: '#/components/schemas/Usuario' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Campos obligatorios faltantes',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: {
            description: 'Usuario no encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          500: { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },
    '/api/asignaturas': {
      post: {
        tags: ['Asignaturas'],
        summary: 'Crear una nueva asignatura en el semestre activo',
        operationId: 'crearAsignatura',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AsignaturaBody' },
            },
          },
        },
        responses: {
          201: {
            description: 'Asignatura creada correctamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    mensaje: { type: 'string', example: 'Asignatura creada correctamente' },
                    asignatura: { $ref: '#/components/schemas/Asignatura' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Nombre y docente son obligatorios',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: {
            description: 'No tienes un semestre activo',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          500: { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },
    '/api/asignaturas/{id}': {
      put: {
        tags: ['Asignaturas'],
        summary: 'Actualizar una asignatura existente',
        operationId: 'actualizarAsignatura',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID de la asignatura',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AsignaturaBody' },
            },
          },
        },
        responses: {
          200: {
            description: 'Asignatura actualizada correctamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    mensaje: { type: 'string', example: 'Asignatura actualizada correctamente' },
                    asignatura: { $ref: '#/components/schemas/Asignatura' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Nombre y docente son obligatorios',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: {
            description: 'Asignatura no encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          500: { $ref: '#/components/responses/InternalServerError' },
        },
      },
      delete: {
        tags: ['Asignaturas'],
        summary: 'Eliminar una asignatura',
        operationId: 'eliminarAsignatura',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID de la asignatura',
          },
        ],
        responses: {
          200: {
            description: 'Asignatura eliminada correctamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    mensaje: { type: 'string', example: 'Asignatura eliminada correctamente' },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: {
            description: 'Asignatura no encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          500: { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },
    '/api/semestres': {
      post: {
        tags: ['Semestres'],
        summary: 'Crear un nuevo semestre académico',
        operationId: 'crearSemestre',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SemestreBody' },
            },
          },
        },
        responses: {
          201: {
            description: 'Semestre creado correctamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    mensaje: { type: 'string', example: 'Semestre creado correctamente' },
                    semestre: { $ref: '#/components/schemas/Semestre' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Campos obligatorios faltantes',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          500: { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },
    '/api/hitos/tipos': {
      get: {
        tags: ['Hitos'],
        summary: 'Obtener los tipos de actividad académica',
        operationId: 'getTiposActividad',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Lista de tipos de actividad',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/TipoActividad' },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          500: { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },
    '/api/hitos/{idAsignatura}': {
      get: {
        tags: ['Hitos'],
        summary: 'Listar hitos de una asignatura',
        operationId: 'listarHitos',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'idAsignatura',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID de la asignatura',
          },
        ],
        responses: {
          200: {
            description: 'Lista de hitos de la asignatura',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Hito' },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          500: { $ref: '#/components/responses/InternalServerError' },
        },
      },
      post: {
        tags: ['Hitos'],
        summary: 'Crear un nuevo hito en una asignatura',
        operationId: 'crearHito',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'idAsignatura',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID de la asignatura',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/HitoBody' },
            },
          },
        },
        responses: {
          201: {
            description: 'Hito creado correctamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    mensaje: { type: 'string', example: 'Hito creado correctamente' },
                    hito: { $ref: '#/components/schemas/Hito' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Datos inválidos (validación de campos)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: {
            description: 'Asignatura no encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          500: { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },
    '/api/hitos/{idHito}': {
      put: {
        tags: ['Hitos'],
        summary: 'Actualizar un hito existente',
        operationId: 'actualizarHito',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'idHito',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID del hito',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/HitoBody' },
            },
          },
        },
        responses: {
          200: {
            description: 'Hito actualizado correctamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    mensaje: { type: 'string', example: 'Hito actualizado correctamente' },
                    hito: { $ref: '#/components/schemas/Hito' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Datos inválidos (validación de campos)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: {
            description: 'Hito no encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          500: { $ref: '#/components/responses/InternalServerError' },
        },
      },
      delete: {
        tags: ['Hitos'],
        summary: 'Eliminar un hito',
        operationId: 'eliminarHito',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'idHito',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID del hito',
          },
        ],
        responses: {
          200: {
            description: 'Hito eliminado correctamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    mensaje: { type: 'string', example: 'Hito eliminado correctamente' },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: {
            description: 'Hito no encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          500: { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },
    '/api/dashboard': {
      get: {
        tags: ['Dashboard'],
        summary: 'Obtener resumen del dashboard del semestre activo',
        operationId: 'getDashboard',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Datos del dashboard',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Dashboard' },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          500: { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token JWT obtenido al iniciar sesión. Usar formato: Bearer <token>',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          mensaje: { type: 'string' },
          detalle: { type: 'string' },
        },
      },
      Usuario: {
        type: 'object',
        properties: {
          id_estudiante: { type: 'integer' },
          id_credencial: { type: 'integer' },
          identificacion: { type: 'string' },
          nombre_completo: { type: 'string' },
          carrera: { type: 'string' },
          semestre_actual: { type: 'integer' },
          fecha_ingreso: { type: 'string', format: 'date' },
        },
      },
      UsuarioLogueado: {
        type: 'object',
        properties: {
          id_estudiante: { type: 'integer' },
          nombre_completo: { type: 'string' },
          email: { type: 'string', format: 'email' },
          carrera: { type: 'string' },
          semestre_actual: { type: 'integer' },
          rol: { type: 'string' },
        },
      },
      Asignatura: {
        type: 'object',
        properties: {
          id_asignatura: { type: 'integer' },
          id_semestre: { type: 'integer' },
          nombre: { type: 'string' },
          nombre_docente: { type: 'string' },
        },
      },
      Semestre: {
        type: 'object',
        properties: {
          id_semestre: { type: 'integer' },
          id_estudiante: { type: 'integer' },
          nombre: { type: 'string' },
          fecha_inicio: { type: 'string', format: 'date' },
          fecha_fin: { type: 'string', format: 'date' },
          activo: { type: 'boolean' },
        },
      },
      TipoActividad: {
        type: 'object',
        properties: {
          id_tipo: { type: 'integer' },
          nombre: { type: 'string' },
        },
      },
      Hito: {
        type: 'object',
        properties: {
          id_hito: { type: 'integer' },
          id_asignatura: { type: 'integer' },
          id_tipo_actividad: { type: 'integer' },
          fecha_inicio: { type: 'string', format: 'date' },
          fecha_cierre: { type: 'string', format: 'date' },
          horas_dedicadas: { type: 'number' },
          nota: { type: 'number', format: 'float', nullable: true },
          tipo_nombre: { type: 'string' },
        },
      },
      RegistroBody: {
        type: 'object',
        required: ['nombre_completo', 'email', 'password', 'identificacion', 'carrera', 'semestre_actual', 'fecha_ingreso'],
        properties: {
          nombre_completo: { type: 'string', example: 'Juan Pérez' },
          email: { type: 'string', format: 'email', example: 'juan@ejemplo.com' },
          password: { type: 'string', format: 'password', example: 'MiPassword123' },
          identificacion: { type: 'string', example: '1234567890' },
          carrera: { type: 'string', example: 'Ingeniería de Sistemas' },
          semestre_actual: { type: 'integer', example: 5 },
          fecha_ingreso: { type: 'string', format: 'date', example: '2024-01-15' },
        },
      },
      LoginBody: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'juan@ejemplo.com' },
          password: { type: 'string', format: 'password', example: 'MiPassword123' },
        },
      },
      PerfilBody: {
        type: 'object',
        required: ['nombre_completo', 'carrera', 'semestre_actual'],
        properties: {
          nombre_completo: { type: 'string', example: 'Juan Pérez' },
          carrera: { type: 'string', example: 'Ingeniería de Sistemas' },
          semestre_actual: { type: 'integer', example: 5 },
        },
      },
      AsignaturaBody: {
        type: 'object',
        required: ['nombre', 'docente'],
        properties: {
          nombre: { type: 'string', example: 'Estructuras de Datos' },
          docente: { type: 'string', example: 'Dr. García' },
        },
      },
      SemestreBody: {
        type: 'object',
        required: ['nombre', 'fecha_inicio', 'fecha_fin'],
        properties: {
          nombre: { type: 'string', example: '2024-1' },
          fecha_inicio: { type: 'string', format: 'date', example: '2024-02-01' },
          fecha_fin: { type: 'string', format: 'date', example: '2024-06-30' },
          activo: { type: 'boolean', example: true },
        },
      },
      HitoBody: {
        type: 'object',
        required: ['id_tipo_actividad', 'fecha_inicio', 'fecha_cierre', 'horas_dedicadas'],
        properties: {
          id_tipo_actividad: { type: 'integer', example: 1 },
          fecha_inicio: { type: 'string', format: 'date', example: '2024-03-01' },
          fecha_cierre: { type: 'string', format: 'date', example: '2024-03-15' },
          horas_dedicadas: { type: 'number', example: 4.5, minimum: 0.5 },
          nota: { type: 'number', format: 'float', nullable: true, example: 4.5 },
        },
      },
      AsignaturaDashboard: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          nombre: { type: 'string' },
          codigo: { type: 'string' },
          docente: { type: 'string' },
          hitos: { type: 'integer' },
          nota: { type: 'number', format: 'float' },
          tiempo: { type: 'integer' },
          semestre: { type: 'string' },
        },
      },
      Dashboard: {
        type: 'object',
        properties: {
          semestreActivo: { type: 'string' },
          totalAsignaturas: { type: 'integer' },
          promedioGeneral: { type: 'number', format: 'float' },
          tiempoTotal: { type: 'integer' },
          asignaturas: {
            type: 'array',
            items: { $ref: '#/components/schemas/AsignaturaDashboard' },
          },
        },
        example: {
          semestreActivo: '2024-1',
          totalAsignaturas: 5,
          promedioGeneral: 3.8,
          tiempoTotal: 120,
          asignaturas: [
            {
              id: 1,
              nombre: 'Estructuras de Datos',
              codigo: 'EST',
              docente: 'Dr. García',
              hitos: 3,
              nota: 4.2,
              tiempo: 30,
              semestre: '2024-1',
            },
          ],
        },
      },
    },
    responses: {
      Unauthorized: {
        description: 'Token de autenticación no proporcionado o inválido',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: { mensaje: 'Token no proporcionado' },
          },
        },
      },
      InternalServerError: {
        description: 'Error interno del servidor',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: { mensaje: 'Error interno del servidor' },
          },
        },
      },
    },
  },
};

export default swaggerSpec;
