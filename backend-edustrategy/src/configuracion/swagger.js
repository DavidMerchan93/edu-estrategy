import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EDU-STRATEGY API',
      version: '1.0.0',
      description:
        'API del sistema EDU-STRATEGY para gestión de semestres, asignaturas e hitos académicos.',
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Desarrollo local',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            mensaje: { type: 'string', description: 'Mensaje de error' },
            detalle: { type: 'string', description: 'Detalle del error (opcional)' },
          },
        },
        Usuario: {
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
        Asignatura: {
          type: 'object',
          properties: {
            id_asignatura: { type: 'integer' },
            id_semestre: { type: 'integer' },
            nombre: { type: 'string' },
            nombre_docente: { type: 'string' },
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
            nota: { type: 'number', nullable: true },
          },
        },
        TipoActividad: {
          type: 'object',
          properties: {
            id_tipo: { type: 'integer' },
            nombre: { type: 'string' },
          },
        },
        LoginRequest: {
          type: 'object',
          properties: {
            email: { type: 'string', format: 'email', example: 'estudiante@correo.com' },
            password: { type: 'string', format: 'password', example: 'miPassword123' },
          },
          required: ['email', 'password'],
        },
        RegistroRequest: {
          type: 'object',
          properties: {
            identificacion: { type: 'string', example: '1234567890' },
            nombre_completo: { type: 'string', example: 'Juan Pérez' },
            email: { type: 'string', format: 'email', example: 'juan.perez@correo.com' },
            password: { type: 'string', format: 'password', example: 'miPassword123' },
            carrera: { type: 'string', example: 'Ingeniería de Sistemas' },
            semestre_actual: { type: 'integer', example: 5 },
            fecha_ingreso: { type: 'string', format: 'date', example: '2024-01-15' },
          },
          required: ['identificacion', 'nombre_completo', 'email', 'password', 'carrera', 'semestre_actual', 'fecha_ingreso'],
        },
        ActualizarPerfilRequest: {
          type: 'object',
          properties: {
            nombre_completo: { type: 'string', example: 'Juan Pérez' },
            carrera: { type: 'string', example: 'Ingeniería de Sistemas' },
            semestre_actual: { type: 'integer', example: 5 },
          },
          required: ['nombre_completo', 'carrera', 'semestre_actual'],
        },
        CrearAsignaturaRequest: {
          type: 'object',
          properties: {
            nombre: { type: 'string', example: 'Estructuras de Datos' },
            docente: { type: 'string', example: 'Carlos López' },
          },
          required: ['nombre', 'docente'],
        },
        CrearSemestreRequest: {
          type: 'object',
          properties: {
            nombre: { type: 'string', example: '2026-1' },
            fecha_inicio: { type: 'string', format: 'date', example: '2026-01-20' },
            fecha_fin: { type: 'string', format: 'date', example: '2026-06-15' },
            activo: { type: 'boolean', example: true },
          },
          required: ['nombre', 'fecha_inicio', 'fecha_fin'],
        },
        CrearHitoRequest: {
          type: 'object',
          properties: {
            id_tipo_actividad: { type: 'integer', example: 1 },
            fecha_inicio: { type: 'string', format: 'date', example: '2026-03-01' },
            fecha_cierre: { type: 'string', format: 'date', example: '2026-03-15' },
            horas_dedicadas: { type: 'number', example: 20 },
            nota: { type: 'number', example: 4.5, nullable: true },
          },
          required: ['id_tipo_actividad', 'fecha_inicio', 'fecha_cierre', 'horas_dedicadas'],
        },
      },
    },
  },
  apis: ['./src/controladores/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
