# Backend - Posts Comments Manager

API REST para la gestión de publicaciones y comentarios, construida con **NestJS**, **TypeScript** y **MongoDB**.

## Descripción

Este backend proporciona una API completa para gestionar publicaciones y comentarios con autenticación de usuarios. Incluye documentación automática con Swagger y soporte para despliegue con Docker.

## Características principales

- **Autenticación JWT**: Registro e inicio de sesión de usuarios con tokens seguros
- **Gestión de Posts**: CRUD completo de publicaciones
- **Sistema de Comentarios**: Comentarios asociados a cada publicación
- **Subida de Archivos**: Soporte para carga de imágenes y archivos
- **Documentación Swagger**: API documentada e interactiva
- **Docker Ready**: Configuración completa para contenedores

### Reglas de negocio

| Acción | Permisos |
|--------|----------|
| Editar/Eliminar Post | Solo el creador del post |
| Eliminar Comentario | Creador del post **o** autor del comentario |

## Estructura del proyecto

```
backend/
├── src/
│   ├── auth/           # Autenticación (login, registro, JWT)
│   ├── users/          # Gestión de usuarios
│   ├── posts/          # CRUD de publicaciones
│   ├── comments/       # Sistema de comentarios
│   ├── uploads/        # Subida de archivos
│   └── app.module.ts   # Módulo principal
├── test/               # Tests e2e
├── Dockerfile          # Imagen Docker
└── docker-compose.yml  # Orquestación de servicios
```

## Requisitos previos

- **Node.js** 18+ (recomendado 20 LTS)
- **MongoDB** 6+ (local, remoto o vía Docker)
- **npm** o **yarn**

## Instalación

### 1. Clonar e instalar dependencias

```bash
cd backend
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus valores:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NODE_ENV` | Entorno de ejecución | `development` o `production` |
| `PORT` | Puerto del servidor | `3000` |
| `MONGODB_URI` | URI de conexión a MongoDB | `mongodb://localhost:27017/posts-db` |
| `MONGO_DB_NAME` | Nombre de la base de datos | `posts-comments-db` |
| `JWT_SECRET` | Clave secreta para tokens JWT | `tu-secreto-seguro` |

## Ejecutar la aplicación

### Desarrollo (con hot-reload)

```bash
npm run start:dev
```

### Producción

```bash
npm run build
npm run start:prod
```

### Modo debug

```bash
npm run start:debug
```

La API estará disponible en `http://localhost:3000` (o el puerto configurado).

## Docker

### Ejecutar con Docker Compose

Esta opción levanta el backend, MongoDB y Mongo Express (panel de administración):

```bash
# Construir e iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f backend

# Detener servicios
docker-compose down
```

### Servicios disponibles

| Servicio | URL | Descripción |
|----------|-----|-------------|
| Backend API | `http://localhost:3000` | API REST |
| Swagger | `http://localhost:3000/api` | Documentación interactiva |
| Mongo Express | `http://localhost:8081` | Panel de administración MongoDB |

### Solo construir la imagen

```bash
docker build -t posts-backend .
```

## Documentación API (Swagger)

Una vez iniciado el servidor, accede a la documentación interactiva:

**`http://localhost:3000/api`**

Desde Swagger puedes:
- Explorar todos los endpoints disponibles
- Ver los modelos de datos (DTOs) y respuestas
- Probar peticiones directamente desde el navegador
- Autenticarte con JWT para probar endpoints protegidos

## Endpoints principales

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/auth/register` | Registrar nuevo usuario |
| `POST` | `/auth/login` | Iniciar sesión |

### Posts

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/posts` | Listar todas las publicaciones |
| `GET` | `/posts/:id` | Obtener publicación por ID |
| `POST` | `/posts` | Crear nueva publicación |
| `PATCH` | `/posts/:id` | Actualizar publicación |
| `DELETE` | `/posts/:id` | Eliminar publicación |

### Comentarios

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/comments/post/:postId` | Listar comentarios de un post |
| `POST` | `/comments` | Crear comentario |
| `DELETE` | `/comments/:id` | Eliminar comentario |

### Uploads

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/uploads` | Subir archivo |

## Tests

El proyecto incluye tests unitarios para los módulos principales (auth, posts, comments, users).

```bash
# Ejecutar tests
npm run test

# Tests en modo watch
npm run test:watch

# Tests e2e
npm run test:e2e
```

## Scripts disponibles

| Script | Descripción |
|--------|-------------|
| `npm run start` | Iniciar en modo normal |
| `npm run start:dev` | Iniciar con hot-reload |
| `npm run start:debug` | Iniciar en modo debug |
| `npm run start:prod` | Iniciar en producción |
| `npm run build` | Compilar el proyecto |
| `npm run lint` | Ejecutar ESLint |
| `npm run format` | Formatear código con Prettier |
| `npm run test` | Ejecutar tests |
| `npm run test:e2e` | Ejecutar tests end-to-end |

## Tecnologías

| Tecnología | Versión | Uso |
|------------|---------|-----|
| NestJS | 11.x | Framework backend |
| TypeScript | 5.x | Lenguaje |
| MongoDB | 7.x | Base de datos |
| Mongoose | 9.x | ODM para MongoDB |
| Passport | 0.7.x | Autenticación |
| JWT | - | Tokens de sesión |
| Swagger | 11.x | Documentación API |
| Jest | 30.x | Testing |
| Docker | - | Contenedores |

## Licencia

Wilmer García (Privado)
