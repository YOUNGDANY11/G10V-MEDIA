const swaggerSpec = {
    openapi: '3.0.3',
    info: {
        title: 'G10V Media API',
        version: '1.0.0',
        description: 'Documentacion de la API para autenticacion, usuarios, semanas, media, entrenamientos y asistencias.'
    },
    servers: [
        {
            url: 'http://localhost:3000/api-docs',
            description: 'Servidor local'
        }
    ],
    tags: [
        { name: 'Auth', description: 'Registro e inicio de sesion' },
        { name: 'Users', description: 'Administracion de usuarios' },
        { name: 'Weeks', description: 'Configuracion de ventanas de entrega' },
        { name: 'Media', description: 'Entrega de videos dentro del periodo habilitado' },
        { name: 'Trainings', description: 'Administracion de entrenamientos' },
        { name: 'Attendances', description: 'Registro y consulta de asistencias' }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        },
        schemas: {
            AuthRegister: {
                type: 'object',
                required: ['name', 'lastname', 'document', 'password', 'email'],
                properties: {
                    name: { type: 'string', example: 'Daniel' },
                    lastname: { type: 'string', example: 'Morales' },
                    document: { type: 'string', example: '1234567890' },
                    password: { type: 'string', example: '123456' },
                    email: { type: 'string', example: 'daniel@example.com' },
                    id_role: { type: 'integer', example: 2 }
                }
            },
            AuthLogin: {
                type: 'object',
                required: ['document', 'password'],
                properties: {
                    document: { type: 'string', example: '1234567890' },
                    password: { type: 'string', example: '123456' }
                }
            },
            UserCreate: {
                type: 'object',
                required: ['name', 'lastname', 'document', 'password', 'email'],
                properties: {
                    name: { type: 'string', example: 'Ana' },
                    lastname: { type: 'string', example: 'Lopez' },
                    document: { type: 'string', example: '1002003004' },
                    password: { type: 'string', example: 'Secret123' },
                    email: { type: 'string', example: 'ana@example.com' },
                    id_role: { type: 'integer', example: 2 }
                }
            },
            UserUpdate: {
                type: 'object',
                required: ['name', 'lastname', 'document', 'email', 'id_role'],
                properties: {
                    name: { type: 'string', example: 'Ana' },
                    lastname: { type: 'string', example: 'Lopez' },
                    document: { type: 'string', example: '1002003004' },
                    email: { type: 'string', example: 'ana@example.com' },
                    id_role: { type: 'integer', example: 2 }
                }
            },
            WeekCreate: {
                type: 'object',
                required: ['name', 'delivery_date', 'start_time', 'end_time'],
                properties: {
                    name: { type: 'string', example: 'Semana 1 - Dia 1' },
                    delivery_date: { type: 'string', example: '2026-05-25', description: 'Formato YYYY-MM-DD' },
                    start_time: { type: 'string', example: '04:00', description: 'Formato HH:MM' },
                    end_time: { type: 'string', example: '12:00', description: 'Formato HH:MM' }
                }
            },
            MediaSubmit: {
                type: 'object',
                required: ['id_week', 'video'],
                properties: {
                    id_week: { type: 'integer', example: 1 },
                    video: {
                        type: 'string',
                        format: 'binary',
                        description: 'Archivo de video. Solo se guarda si la fecha y hora estan dentro de la ventana habilitada.'
                    }
                }
            },
            TrainingCreate: {
                type: 'object',
                required: ['name', 'description', 'date', 'time', 'location'],
                properties: {
                    name: { type: 'string', example: 'Entrenamiento Fuerza' },
                    description: { type: 'string', example: 'Sesion de tren superior' },
                    date: { type: 'string', example: '2026-05-25' },
                    time: { type: 'string', example: '08:00' },
                    location: { type: 'string', example: 'Cancha principal' }
                }
            },
            AttendanceCreate: {
                type: 'object',
                required: ['id_training', 'status'],
                properties: {
                    id_training: { type: 'integer', example: 1 },
                    status: { type: 'string', example: 'Presente' }
                }
            }
        }
    },
    security: [
        { bearerAuth: [] }
    ],
    paths: {
        '/auth/register': {
            post: {
                tags: ['Auth'],
                summary: 'Registrar usuario',
                description: 'Crea un usuario nuevo. Si no se envía `id_role`, queda como deportista por defecto.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': { schema: { $ref: '#/components/schemas/AuthRegister' } }
                    }
                },
                responses: {
                    200: { description: 'Usuario creado exitosamente' },
                    400: { description: 'Faltan datos o el documento ya existe' },
                    500: { description: 'Error interno' }
                }
            }
        },
        '/auth/login': {
            post: {
                tags: ['Auth'],
                summary: 'Iniciar sesion',
                description: 'Valida documento y contraseña y retorna un token JWT.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': { schema: { $ref: '#/components/schemas/AuthLogin' } }
                    }
                },
                responses: {
                    200: { description: 'Inicio de sesion exitoso' },
                    400: { description: 'Datos incompletos o contraseña incorrecta' },
                    404: { description: 'Usuario no existe' }
                }
            }
        },
        '/users/me': {
            get: {
                tags: ['Users'],
                summary: 'Obtener usuario autenticado',
                description: 'Retorna los datos del usuario que esta autenticado en el sistema.',
                responses: {
                    200: { description: 'Consulta exitosa' },
                    403: { description: 'Token requerido o invalido' }
                }
            }
        },
        '/users': {
            get: {
                tags: ['Users'],
                summary: 'Listar usuarios',
                description: 'Solo admin. Retorna todos los usuarios registrados.',
                responses: {
                    200: { description: 'Consulta exitosa' },
                    403: { description: 'Acceso denegado' }
                }
            },
            post: {
                tags: ['Users'],
                summary: 'Crear usuario',
                description: 'Solo admin. Crea un usuario nuevo con rol definido o deportista por defecto.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': { schema: { $ref: '#/components/schemas/UserCreate' } }
                    }
                },
                responses: {
                    200: { description: 'Usuario creado exitosamente' },
                    400: { description: 'Datos incompletos o documento duplicado' },
                    403: { description: 'Acceso denegado' }
                }
            }
        },
        '/users/{id}': {
            get: {
                tags: ['Users'],
                summary: 'Obtener usuario por id',
                description: 'Solo admin. Busca un usuario por su identificador.',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' },
                        description: 'ID del usuario'
                    }
                ],
                responses: {
                    200: { description: 'Consulta exitosa' },
                    404: { description: 'Usuario no existe' }
                }
            },
            put: {
                tags: ['Users'],
                summary: 'Actualizar usuario',
                description: 'Solo admin. Actualiza la informacion del usuario indicado.',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' },
                        description: 'ID del usuario'
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': { schema: { $ref: '#/components/schemas/UserUpdate' } }
                    }
                },
                responses: {
                    200: { description: 'Usuario actualizado exitosamente' },
                    400: { description: 'Datos invalidos' },
                    404: { description: 'Usuario no existe' }
                }
            },
            delete: {
                tags: ['Users'],
                summary: 'Eliminar usuario',
                description: 'Solo admin. Elimina un usuario por su id.',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' },
                        description: 'ID del usuario'
                    }
                ],
                responses: {
                    200: { description: 'Usuario eliminado con exito' },
                    404: { description: 'Usuario no existe' }
                }
            }
        },
        '/users/lastname': {
            post: {
                tags: ['Users'],
                summary: 'Buscar usuarios por apellido',
                description: 'Solo admin. Busca usuarios cuyo apellido coincida parcial o completamente.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['lastname'],
                                properties: {
                                    lastname: { type: 'string', example: 'Lopez' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Consulta exitosa' },
                    404: { description: 'No hay coincidencias' }
                }
            }
        },
        '/weeks': {
            get: {
                tags: ['Weeks'],
                summary: 'Listar semanas',
                description: 'Solo admin. Retorna todas las semanas configuradas con su fecha y horario de entrega.',
                responses: {
                    200: { description: 'Consulta exitosa' },
                    404: { description: 'No hay semanas registradas' }
                }
            },
            post: {
                tags: ['Weeks'],
                summary: 'Crear semana',
                description: 'Solo admin. Define una semana con fecha de entrega y ventana horaria.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': { schema: { $ref: '#/components/schemas/WeekCreate' } }
                    }
                },
                responses: {
                    200: { description: 'Semana creada con exito' },
                    400: { description: 'Datos invalidos o rango incorrecto' }
                }
            }
        },
        '/weeks/{id}': {
            delete: {
                tags: ['Weeks'],
                summary: 'Eliminar semana',
                description: 'Solo admin. Elimina una semana por su id.',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' },
                        description: 'ID de la semana'
                    }
                ],
                responses: {
                    200: { description: 'Semana eliminada con exito' },
                    404: { description: 'Semana no existe' }
                }
            }
        },
        '/trainings': {
            get: {
                tags: ['Trainings'],
                summary: 'Listar entrenamientos',
                description: 'Retorna todos los entrenamientos. Requiere autenticacion.',
                responses: {
                    200: { description: 'Consulta exitosa' }
                }
            },
            post: {
                tags: ['Trainings'],
                summary: 'Crear entrenamiento',
                description: 'Solo admin. Crea un entrenamiento nuevo.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': { schema: { $ref: '#/components/schemas/TrainingCreate' } }
                    }
                },
                responses: {
                    200: { description: 'Entrenamiento creado con exito' },
                    400: { description: 'Datos incompletos' }
                }
            }
        },
        '/trainings/location': {
            get: {
                tags: ['Trainings'],
                summary: 'Buscar entrenamientos por ubicacion',
                description: 'Busca entrenamientos por ubicacion usando query `location`.',
                parameters: [
                    {
                        name: 'location',
                        in: 'query',
                        required: true,
                        schema: { type: 'string' },
                        example: 'Cancha principal'
                    }
                ],
                responses: {
                    200: { description: 'Consulta exitosa' },
                    400: { description: 'Falta la ubicacion' }
                }
            }
        },
        '/trainings/{id}': {
            get: {
                tags: ['Trainings'],
                summary: 'Obtener entrenamiento por id',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' },
                        description: 'ID del entrenamiento'
                    }
                ],
                responses: {
                    200: { description: 'Consulta exitosa' },
                    404: { description: 'Entrenamiento no existe' }
                }
            },
            put: {
                tags: ['Trainings'],
                summary: 'Actualizar entrenamiento',
                description: 'Solo admin. Actualiza un entrenamiento existente.',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' }
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': { schema: { $ref: '#/components/schemas/TrainingCreate' } }
                    }
                },
                responses: {
                    200: { description: 'Entrenamiento actualizado con exito' },
                    404: { description: 'Entrenamiento no existe' }
                }
            },
            delete: {
                tags: ['Trainings'],
                summary: 'Eliminar entrenamiento',
                description: 'Solo admin. Elimina un entrenamiento por id.',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' }
                    }
                ],
                responses: {
                    200: { description: 'Entrenamiento eliminado con exito' },
                    404: { description: 'Entrenamiento no existe' }
                }
            }
        },
        '/attendances': {
            get: {
                tags: ['Attendances'],
                summary: 'Listar asistencias',
                description: 'Solo admin. Retorna todas las asistencias registradas.',
                responses: {
                    200: { description: 'Consulta exitosa' }
                }
            },
            post: {
                tags: ['Attendances'],
                summary: 'Crear asistencia',
                description: 'Solo deportista. Registra asistencia para un entrenamiento.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': { schema: { $ref: '#/components/schemas/AttendanceCreate' } }
                    }
                },
                responses: {
                    200: { description: 'Asistencia creada con exito' },
                    400: { description: 'Datos invalidos' }
                }
            }
        },
        '/attendances/{id}': {
            get: {
                tags: ['Attendances'],
                summary: 'Obtener asistencia por id',
                description: 'Solo admin. Retorna una asistencia puntual.',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' }
                    }
                ],
                responses: {
                    200: { description: 'Consulta exitosa' },
                    404: { description: 'Asistencia no existe' }
                }
            }
        },
        '/attendances/training/{id}': {
            get: {
                tags: ['Attendances'],
                summary: 'Listar asistencias por entrenamiento',
                description: 'Solo admin. Retorna las asistencias de un entrenamiento especifico.',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' }
                    }
                ],
                responses: {
                    200: { description: 'Consulta exitosa' },
                    404: { description: 'No hay asistencias registradas para este entrenamiento' }
                }
            }
        },
        '/media': {
            get: {
                tags: ['Media'],
                summary: 'Listar media',
                description: 'Solo admin. Retorna todas las entregas de video registradas.',
                responses: {
                    200: { description: 'Consulta exitosa' }
                }
            }
        },
        '/media/mine': {
            get: {
                tags: ['Media'],
                summary: 'Obtener mis entregas',
                description: 'Solo deportista. Retorna los videos enviados por el usuario autenticado.',
                responses: {
                    200: { description: 'Consulta exitosa' },
                    404: { description: 'No tienes entregas registradas' }
                }
            }
        },
        '/media/{id}': {
            get: {
                tags: ['Media'],
                summary: 'Obtener media por id',
                description: 'Solo admin. Retorna una entrega de video específica.',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' }
                    }
                ],
                responses: {
                    200: { description: 'Consulta exitosa' },
                    404: { description: 'Esta entrega no existe' }
                }
            }
        },
        '/media/week/{id}': {
            get: {
                tags: ['Media'],
                summary: 'Obtener media por semana',
                description: 'Solo admin. Retorna las entregas asociadas a una semana.',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' }
                    }
                ],
                responses: {
                    200: { description: 'Consulta exitosa' },
                    404: { description: 'No hay entregas para esta semana' }
                }
            }
        },
        '/media/submit': {
            post: {
                tags: ['Media'],
                summary: 'Subir video',
                description: 'Solo deportista. Sube un video dentro del rango activo de la semana seleccionada. Si la ventana ya cerro o aun no inicia, el archivo no se guarda en disco.',
                requestBody: {
                    required: true,
                    content: {
                        'multipart/form-data': {
                            schema: { $ref: '#/components/schemas/MediaSubmit' }
                        }
                    }
                },
                responses: {
                    200: { description: 'Video enviado con exito' },
                    400: { description: 'Semana invalida, ventana cerrada o archivo invalido' },
                    404: { description: 'Usuario o semana no existe' }
                }
            }
        }
    }
}

module.exports = swaggerSpec