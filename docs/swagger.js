const swaggerSpec = {
    openapi: '3.0.3',
    info: {
        title: 'G10V Media API',
        version: '1.0.0',
        description: `API G10V`
    },
    servers: [
        {
            url: 'https://g10v-media-production-3645.up.railway.app/',
            description: 'Produccion'
        }
    ],
    tags: [
        { name: 'Auth',          description: 'Registro e inicio de sesion' },
        { name: 'Users',         description: 'Administracion de usuarios' },
        { name: 'Weeks',         description: 'Configuracion de ventanas de entrega' },
        { name: 'Media',         description: 'Entrega de videos dentro del periodo habilitado' },
        { name: 'Trainings',     description: 'Administracion de entrenamientos' },
        { name: 'Attendances',   description: 'Registro y consulta de asistencias' },
        { name: 'PasswordReset', description: 'Recuperacion de contraseña por correo electronico' }
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
                    name:      { type: 'string',  example: 'Daniel' },
                    lastname:  { type: 'string',  example: 'Morales' },
                    document:  { type: 'string',  example: '1234567890' },
                    password:  { type: 'string',  example: 'Secret123' },
                    email:     { type: 'string',  example: 'daniel@example.com' },
                    id_role:   { type: 'integer', example: 2, description: '1=Admin, 2=Deportista (default si no se envia)' }
                }
            },
            AuthLogin: {
                type: 'object',
                required: ['document', 'password'],
                properties: {
                    document: { type: 'string', example: '1234567890' },
                    password: { type: 'string', example: 'Secret123' }
                }
            },
            UserCreate: {
                type: 'object',
                required: ['name', 'lastname', 'document', 'password', 'email'],
                properties: {
                    name:     { type: 'string',  example: 'Ana' },
                    lastname: { type: 'string',  example: 'Lopez' },
                    document: { type: 'string',  example: '1002003004' },
                    password: { type: 'string',  example: 'Secret123' },
                    email:    { type: 'string',  example: 'ana@example.com' },
                    id_role:  { type: 'integer', example: 2, description: '1=Admin, 2=Deportista (default si no se envia)' }
                }
            },
            UserUpdate: {
                type: 'object',
                required: ['name', 'lastname', 'document', 'email', 'id_role'],
                properties: {
                    name:     { type: 'string',  example: 'Ana' },
                    lastname: { type: 'string',  example: 'Lopez' },
                    document: { type: 'string',  example: '1002003004' },
                    email:    { type: 'string',  example: 'ana@example.com' },
                    id_role:  { type: 'integer', example: 2 }
                }
            },
            WeekCreate: {
                type: 'object',
                required: ['name', 'delivery_date', 'start_time', 'end_time'],
                properties: {
                    name:          { type: 'string', example: 'Semana 1 - Dia 1' },
                    delivery_date: { type: 'string', example: '2026-05-25', description: 'Formato YYYY-MM-DD' },
                    start_time:    { type: 'string', example: '04:00', description: 'Formato HH:MM' },
                    end_time:      { type: 'string', example: '12:00', description: 'Formato HH:MM. Debe ser mayor que start_time' }
                }
            },
            MediaPresign: {
                type: 'object',
                required: ['id_week', 'filename', 'contentType'],
                properties: {
                    id_week:     { type: 'integer', example: 1, description: 'ID de la semana activa' },
                    filename:    { type: 'string',  example: 'mi_video.mp4', description: 'Nombre original del archivo' },
                    contentType: { type: 'string',  example: 'video/mp4', description: 'Tipo MIME del video (debe comenzar con video/)' }
                }
            },
            MediaConfirm: {
                type: 'object',
                required: ['id_week', 'key', 'publicUrl'],
                properties: {
                    id_week:   { type: 'integer', example: 1 },
                    key:       { type: 'string',  example: 'videos/1717200000000-u5-mi_video.mp4', description: 'Clave del objeto en el bucket (retornada por /presign)' },
                    publicUrl: { type: 'string',  example: 'https://bucket.example.com/videos/1717200000000-u5-mi_video.mp4', description: 'URL publica retornada por /presign' }
                }
            },
            TrainingCreate: {
                type: 'object',
                required: ['name', 'description', 'date', 'time', 'location'],
                properties: {
                    name:        { type: 'string', example: 'Entrenamiento Fuerza' },
                    description: { type: 'string', example: 'Sesion de tren superior' },
                    date:        { type: 'string', example: '2026-05-25', description: 'Formato YYYY-MM-DD' },
                    time:        { type: 'string', example: '08:00', description: 'Formato HH:MM' },
                    location:    { type: 'string', example: 'Cancha principal' }
                }
            },
            AttendanceCreate: {
                type: 'object',
                required: ['id_training', 'status'],
                properties: {
                    id_training: { type: 'integer', example: 1 },
                    status:      { type: 'string',  example: 'Presente' }
                }
            },
            PasswordResetForgot: {
                type: 'object',
                required: ['document'],
                properties: {
                    document: { type: 'string', example: '1234567890', description: 'Documento del usuario. Se enviara un codigo de 6 digitos al correo asociado.' }
                }
            },
            PasswordResetConfirm: {
                type: 'object',
                required: ['email', 'code', 'newPassword'],
                properties: {
                    email:       { type: 'string', example: 'daniel@example.com' },
                    code:        { type: 'string', example: '837291', description: 'Codigo de 6 digitos recibido por correo' },
                    newPassword: { type: 'string', example: 'NuevaSecret123', description: 'Nueva contraseña. Minimo 8 caracteres.' }
                }
            }
        }
    },
    security: [
        { bearerAuth: [] }
    ],
    paths: {

        // ── Auth ─────────────────────────────────────────────────────────────────

        '/api/auth/register': {
            post: {
                tags: ['Auth'],
                summary: 'Registrar usuario',
                description: 'Crea un usuario nuevo. Si no se envía `id_role`, queda como deportista (2) por defecto.',
                security: [],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthRegister' } } }
                },
                responses: {
                    200: { description: 'Usuario creado exitosamente' },
                    400: { description: 'Datos incompletos o documento ya registrado' },
                    500: { description: 'Error interno' }
                }
            }
        },

        '/api/auth/login': {
            post: {
                tags: ['Auth'],
                summary: 'Iniciar sesion',
                description: 'Valida documento y contraseña, retorna un token JWT valido por 1 año.',
                security: [],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthLogin' } } }
                },
                responses: {
                    200: { description: 'Inicio de sesion exitoso. Retorna token JWT.' },
                    400: { description: 'Datos incompletos o contraseña incorrecta' },
                    404: { description: 'Usuario no encontrado' },
                    500: { description: 'Error interno' }
                }
            }
        },

        // ── Users ─────────────────────────────────────────────────────────────────

        '/api/users/me': {
            get: {
                tags: ['Users'],
                summary: 'Obtener usuario autenticado',
                description: 'Retorna los datos del usuario autenticado (omite document, password, created_at, updated_at).',
                responses: {
                    200: { description: 'Consulta exitosa' },
                    401: { description: 'Token no proporcionado o invalido' },
                    404: { description: 'Usuario no encontrado' },
                    500: { description: 'Error interno' }
                }
            }
        },

        '/api/users/lastname': {
            post: {
                tags: ['Users'],
                summary: 'Buscar usuarios por apellido',
                description: 'Solo admin (role 1). Busqueda parcial por apellido (ILIKE).',
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
                    400: { description: 'Apellido requerido' },
                    401: { description: 'Token no proporcionado o invalido' },
                    403: { description: 'Acceso denegado' },
                    404: { description: 'No se encontraron usuarios con ese apellido' },
                    500: { description: 'Error interno' }
                }
            }
        },

        '/api/users': {
            get: {
                tags: ['Users'],
                summary: 'Listar todos los usuarios',
                description: 'Solo admin (role 1). Retorna todos los usuarios registrados.',
                responses: {
                    200: { description: 'Consulta exitosa' },
                    401: { description: 'Token no proporcionado o invalido' },
                    403: { description: 'Acceso denegado' },
                    404: { description: 'No hay usuarios registrados' },
                    500: { description: 'Error interno' }
                }
            },
            post: {
                tags: ['Users'],
                summary: 'Crear usuario',
                description: 'Solo admin (role 1). Crea un usuario con rol definido o deportista (2) por defecto.',
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/UserCreate' } } }
                },
                responses: {
                    200: { description: 'Usuario creado exitosamente' },
                    400: { description: 'Datos incompletos o documento ya registrado' },
                    401: { description: 'Token no proporcionado o invalido' },
                    403: { description: 'Acceso denegado' },
                    500: { description: 'Error interno' }
                }
            }
        },

        '/api/users/{id}': {
            get: {
                tags: ['Users'],
                summary: 'Obtener usuario por ID',
                description: 'Solo admin (role 1). Busca un usuario por su ID.',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'ID del usuario' }
                ],
                responses: {
                    200: { description: 'Consulta exitosa' },
                    401: { description: 'Token no proporcionado o invalido' },
                    403: { description: 'Acceso denegado' },
                    404: { description: 'Usuario no encontrado' },
                    500: { description: 'Error interno' }
                }
            },
            put: {
                tags: ['Users'],
                summary: 'Actualizar usuario',
                description: 'Solo admin (role 1). Actualiza los datos del usuario. El documento puede ser el mismo o uno nuevo no usado por otro usuario.',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'ID del usuario' }
                ],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/UserUpdate' } } }
                },
                responses: {
                    200: { description: 'Usuario actualizado exitosamente' },
                    400: { description: 'Datos invalidos o documento ya asociado a otro usuario' },
                    401: { description: 'Token no proporcionado o invalido' },
                    403: { description: 'Acceso denegado' },
                    404: { description: 'Usuario no encontrado' },
                    500: { description: 'Error interno' }
                }
            },
            delete: {
                tags: ['Users'],
                summary: 'Eliminar usuario',
                description: 'Solo admin (role 1). Elimina un usuario por ID.',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'ID del usuario' }
                ],
                responses: {
                    200: { description: 'Usuario eliminado con exito' },
                    400: { description: 'Usuario no encontrado' },
                    401: { description: 'Token no proporcionado o invalido' },
                    403: { description: 'Acceso denegado' },
                    500: { description: 'Error interno' }
                }
            }
        },

        // ── Weeks ─────────────────────────────────────────────────────────────────

        '/api/weeks/active': {
            get: {
                tags: ['Weeks'],
                summary: 'Listar semanas activas',
                description: 'Retorna las semanas cuya ventana de entrega esta abierta en este momento (hora Colombia). Puede ser un array vacio.',
                responses: {
                    200: { description: 'Consulta exitosa' },
                    401: { description: 'Token no proporcionado o invalido' },
                    500: { description: 'Error interno' }
                }
            }
        },

        '/api/weeks': {
            get: {
                tags: ['Weeks'],
                summary: 'Listar todas las semanas',
                description: 'Solo admin (role 1). Retorna todas las semanas configuradas.',
                responses: {
                    200: { description: 'Consulta exitosa' },
                    401: { description: 'Token no proporcionado o invalido' },
                    403: { description: 'Acceso denegado' },
                    404: { description: 'No hay semanas registradas' },
                    500: { description: 'Error interno' }
                }
            },
            post: {
                tags: ['Weeks'],
                summary: 'Crear semana',
                description: 'Solo admin (role 1). Define una semana con fecha y ventana horaria de entrega. `end_time` debe ser mayor que `start_time`.',
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/WeekCreate' } } }
                },
                responses: {
                    200: { description: 'Semana creada con exito' },
                    400: { description: 'Datos invalidos, formato incorrecto o rango de tiempo invalido' },
                    401: { description: 'Token no proporcionado o invalido' },
                    403: { description: 'Acceso denegado' },
                    500: { description: 'Error interno' }
                }
            }
        },

        '/api/weeks/{id}': {
            delete: {
                tags: ['Weeks'],
                summary: 'Eliminar semana',
                description: 'Solo admin (role 1). Elimina una semana por ID.',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'ID de la semana' }
                ],
                responses: {
                    200: { description: 'Semana eliminada con exito' },
                    401: { description: 'Token no proporcionado o invalido' },
                    403: { description: 'Acceso denegado' },
                    404: { description: 'Semana no encontrada' },
                    500: { description: 'Error interno' }
                }
            }
        },

        // ── Trainings ─────────────────────────────────────────────────────────────

        '/api/trainings/location': {
            get: {
                tags: ['Trainings'],
                summary: 'Buscar entrenamientos por ubicacion',
                description: 'Accesible para cualquier usuario autenticado. Busca entrenamientos por ubicacion usando el query param `location`.',
                parameters: [
                    { name: 'location', in: 'query', required: true, schema: { type: 'string' }, example: 'Cancha principal' }
                ],
                responses: {
                    200: { description: 'Consulta exitosa' },
                    400: { description: 'Parametro location requerido' },
                    401: { description: 'Token no proporcionado o invalido' },
                    404: { description: 'No hay entrenamientos en esa ubicacion' },
                    500: { description: 'Error interno' }
                }
            }
        },

        '/api/trainings': {
            get: {
                tags: ['Trainings'],
                summary: 'Listar entrenamientos',
                description: 'Accesible para cualquier usuario autenticado. Retorna todos los entrenamientos.',
                responses: {
                    200: { description: 'Consulta exitosa' },
                    401: { description: 'Token no proporcionado o invalido' },
                    404: { description: 'No hay entrenamientos registrados' },
                    500: { description: 'Error interno' }
                }
            },
            post: {
                tags: ['Trainings'],
                summary: 'Crear entrenamiento',
                description: 'Solo admin (role 1). Crea un entrenamiento nuevo. **Dispara un correo automatico** a todos los deportistas registrados con los detalles del entrenamiento. El correo se envia en segundo plano y no afecta la respuesta.',
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/TrainingCreate' } } }
                },
                responses: {
                    200: { description: 'Entrenamiento creado con exito' },
                    400: { description: 'Datos incompletos' },
                    401: { description: 'Token no proporcionado o invalido' },
                    403: { description: 'Acceso denegado' },
                    500: { description: 'Error interno' }
                }
            }
        },

        '/api/trainings/{id}': {
            get: {
                tags: ['Trainings'],
                summary: 'Obtener entrenamiento por ID',
                description: 'Accesible para cualquier usuario autenticado.',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'ID del entrenamiento' }
                ],
                responses: {
                    200: { description: 'Consulta exitosa' },
                    401: { description: 'Token no proporcionado o invalido' },
                    404: { description: 'Entrenamiento no encontrado' },
                    500: { description: 'Error interno' }
                }
            },
            put: {
                tags: ['Trainings'],
                summary: 'Actualizar entrenamiento',
                description: 'Solo admin (role 1). Actualiza un entrenamiento. Valida conflictos de fecha/hora con otros entrenamientos. **Dispara un correo automatico** a todos los deportistas registrados notificando el cambio. El correo se envia en segundo plano y no afecta la respuesta.',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'ID del entrenamiento' }
                ],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/TrainingCreate' } } }
                },
                responses: {
                    200: { description: 'Entrenamiento actualizado con exito' },
                    400: { description: 'Datos incompletos o conflicto de horario con otro entrenamiento' },
                    401: { description: 'Token no proporcionado o invalido' },
                    403: { description: 'Acceso denegado' },
                    404: { description: 'Entrenamiento no encontrado' },
                    500: { description: 'Error interno' }
                }
            },
            delete: {
                tags: ['Trainings'],
                summary: 'Eliminar entrenamiento',
                description: 'Solo admin (role 1). Elimina un entrenamiento por ID.',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'ID del entrenamiento' }
                ],
                responses: {
                    200: { description: 'Entrenamiento eliminado con exito' },
                    401: { description: 'Token no proporcionado o invalido' },
                    403: { description: 'Acceso denegado' },
                    404: { description: 'Entrenamiento no encontrado' },
                    500: { description: 'Error interno' }
                }
            }
        },

        // ── Attendances ───────────────────────────────────────────────────────────

        '/api/attendances/training/{id}': {
            get: {
                tags: ['Attendances'],
                summary: 'Asistencias por entrenamiento',
                description: 'Solo admin (role 1). Retorna todas las asistencias de un entrenamiento especifico.',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'ID del entrenamiento' }
                ],
                responses: {
                    200: { description: 'Consulta exitosa' },
                    401: { description: 'Token no proporcionado o invalido' },
                    403: { description: 'Acceso denegado' },
                    404: { description: 'No hay asistencias para este entrenamiento' },
                    500: { description: 'Error interno' }
                }
            }
        },

        '/api/attendances/mine': {
            get: {
                tags: ['Attendances'],
                summary: 'Mis asistencias',
                description: 'Solo deportista (role 2). Retorna las asistencias del usuario autenticado.',
                responses: {
                    200: { description: 'Consulta exitosa' },
                    401: { description: 'Token no proporcionado o invalido' },
                    403: { description: 'Acceso denegado' },
                    404: { description: 'No tienes asistencias registradas' },
                    500: { description: 'Error interno' }
                }
            }
        },

        '/api/attendances/{id}': {
            get: {
                tags: ['Attendances'],
                summary: 'Obtener asistencia por ID',
                description: 'Solo admin (role 1). Retorna una asistencia puntual.',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'ID de la asistencia' }
                ],
                responses: {
                    200: { description: 'Consulta exitosa' },
                    401: { description: 'Token no proporcionado o invalido' },
                    403: { description: 'Acceso denegado' },
                    404: { description: 'Asistencia no encontrada' },
                    500: { description: 'Error interno' }
                }
            }
        },

        '/api/attendances': {
            get: {
                tags: ['Attendances'],
                summary: 'Listar todas las asistencias',
                description: 'Solo admin (role 1). Retorna todas las asistencias registradas.',
                responses: {
                    200: { description: 'Consulta exitosa' },
                    401: { description: 'Token no proporcionado o invalido' },
                    403: { description: 'Acceso denegado' },
                    404: { description: 'No hay asistencias registradas' },
                    500: { description: 'Error interno' }
                }
            },
            post: {
                tags: ['Attendances'],
                summary: 'Registrar asistencia',
                description: 'Solo deportista (role 2). Registra asistencia para un entrenamiento. Solo es posible dentro de los primeros 40 minutos desde el inicio del entrenamiento. No se puede registrar dos veces para el mismo entrenamiento.',
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/AttendanceCreate' } } }
                },
                responses: {
                    200: { description: 'Asistencia creada con exito' },
                    400: { description: 'Datos invalidos, fuera de la ventana de tiempo o asistencia ya registrada' },
                    401: { description: 'Token no proporcionado o invalido' },
                    403: { description: 'Acceso denegado o intento de registrar asistencia para otro usuario' },
                    404: { description: 'Usuario o entrenamiento no encontrado' },
                    500: { description: 'Error interno' }
                }
            }
        },

        // ── Media ─────────────────────────────────────────────────────────────────

        '/api/media/mine': {
            get: {
                tags: ['Media'],
                summary: 'Mis entregas de video',
                description: 'Accesible para admin y deportista (role 1 y 2). Retorna los videos enviados por el usuario autenticado con URL de acceso temporal (24h).',
                responses: {
                    200: { description: 'Consulta exitosa' },
                    401: { description: 'Token no proporcionado o invalido' },
                    404: { description: 'No tienes entregas registradas' },
                    500: { description: 'Error interno' }
                }
            }
        },

        '/api/media/week/{id}': {
            get: {
                tags: ['Media'],
                summary: 'Entregas por semana',
                description: 'Solo admin (role 1). Retorna todas las entregas de una semana con URL de acceso temporal (24h).',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'ID de la semana' }
                ],
                responses: {
                    200: { description: 'Consulta exitosa' },
                    401: { description: 'Token no proporcionado o invalido' },
                    403: { description: 'Acceso denegado' },
                    404: { description: 'No hay entregas para esta semana' },
                    500: { description: 'Error interno' }
                }
            }
        },

        '/api/media/presign': {
            post: {
                tags: ['Media'],
                summary: 'Paso 1 – Obtener URL de subida',
                description: 'Solo deportista (role 2). Valida que la ventana de entrega este abierta y retorna una presigned PUT URL para subir el video directamente al bucket (el video **nunca pasa por el servidor**). Ejecutar antes de `/confirm`.',
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/MediaPresign' } } }
                },
                responses: {
                    200: { description: 'URL generada. Retorna `uploadUrl`, `key` y `publicUrl`.' },
                    400: { description: 'Datos invalidos, contentType no es video, o ventana de entrega cerrada/no iniciada' },
                    401: { description: 'Token no proporcionado o invalido' },
                    403: { description: 'Acceso denegado' },
                    404: { description: 'Usuario o semana no encontrada' },
                    500: { description: 'Error interno' }
                }
            }
        },

        '/api/media/confirm': {
            post: {
                tags: ['Media'],
                summary: 'Paso 2 – Confirmar subida y guardar en BD',
                description: 'Solo deportista (role 2). Confirma que el video fue subido al bucket y lo registra en la base de datos. Usar el `key` y `publicUrl` retornados por `/presign`.',
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/MediaConfirm' } } }
                },
                responses: {
                    200: { description: 'Video registrado con exito. Retorna el objeto media con `documentUrl`.' },
                    400: { description: 'Datos incompletos' },
                    401: { description: 'Token no proporcionado o invalido' },
                    403: { description: 'Acceso denegado o key no pertenece al usuario autenticado' },
                    404: { description: 'Usuario o semana no encontrada' },
                    500: { description: 'Error interno' }
                }
            }
        },

        '/api/media': {
            get: {
                tags: ['Media'],
                summary: 'Listar todas las entregas',
                description: 'Solo admin (role 1). Retorna todas las entregas de video con URL de acceso temporal (24h).',
                responses: {
                    200: { description: 'Consulta exitosa' },
                    401: { description: 'Token no proporcionado o invalido' },
                    403: { description: 'Acceso denegado' },
                    404: { description: 'No hay entregas registradas' },
                    500: { description: 'Error interno' }
                }
            }
        },

        '/api/media/{id}': {
            get: {
                tags: ['Media'],
                summary: 'Obtener entrega por ID',
                description: 'Solo admin (role 1). Retorna una entrega de video con URL de acceso temporal (24h).',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'ID de la entrega' }
                ],
                responses: {
                    200: { description: 'Consulta exitosa' },
                    401: { description: 'Token no proporcionado o invalido' },
                    403: { description: 'Acceso denegado' },
                    404: { description: 'Entrega no encontrada' },
                    500: { description: 'Error interno' }
                }
            }
        },

        // ── Password Reset ────────────────────────────────────────────────────────

        '/api/password-reset/forgot': {
            post: {
                tags: ['PasswordReset'],
                summary: 'Solicitar codigo de recuperacion',
                description: 'No requiere autenticacion. Envia un codigo de 6 digitos al correo asociado al documento. El codigo expira en 3 minutos. Por seguridad, la respuesta es identica independientemente de si el documento existe o no.',
                security: [],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/PasswordResetForgot' } } }
                },
                responses: {
                    200: { description: 'Solicitud procesada' },
                    400: { description: 'Documento requerido' },
                    500: { description: 'Error al procesar la solicitud' }
                }
            }
        },

        '/api/password-reset/reset': {
            post: {
                tags: ['PasswordReset'],
                summary: 'Restablecer contraseña',
                description: 'No requiere autenticacion. Valida el codigo recibido por correo y establece la nueva contraseña. El codigo debe ser valido, no expirado y no usado. Invalida todos los codigos pendientes del usuario tras el cambio exitoso.',
                security: [],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/PasswordResetConfirm' } } }
                },
                responses: {
                    200: { description: 'Contraseña restablecida exitosamente' },
                    400: { description: 'Datos incompletos, contraseña menor a 8 caracteres, correo invalido o codigo invalido/expirado' },
                    500: { description: 'Error al procesar la solicitud' }
                }
            }
        }
    }
}

module.exports = swaggerSpec
