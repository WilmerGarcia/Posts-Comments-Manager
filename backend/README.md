## Backend - Posts Comments Manager

API REST del proyecto **Posts Comments Manager**, construida con [NestJS](https://nestjs.com), [Node.js](https://nodejs.org) y MongoDB (Mongoose).

Esta API expone endpoints para:

- **Autenticación y usuarios**: registro, login y gestión básica de usuarios mediante JWT.
- **Posts**: crear, listar, actualizar y eliminar publicaciones.
- **Comentarios**: crear, listar y eliminar comentarios asociados a un post.
- **Reglas de negocio principales**:
  - Solo el **creador de un post** puede **editarlo o eliminarlo**.
  - Un **comentario** puede ser eliminado por:
    - El **creador del post** al que pertenece.
    - El **autor del comentario**.

## Requisitos previos

- Node.js (versión recomendada 18+)
- MongoDB en ejecución (local o remoto)

## Instalación

```bash
npm install
```

- Copia `.env.example` a `.env`.
- Configura las variables necesarias: conexión a MongoDB, secretos JWT, puertos, etc.

## Ejecutar la aplicación

```bash
# desarrollo
npm run start

# modo watch (recarga al cambiar código)
npm run start:dev

# producción
npm run start:prod
```

La API por defecto suele exponerse en `http://localhost:3000` (ajusta según tu `.env`).

## Documentación con Swagger

Este backend incluye **documentación automática de la API con Swagger**.

- Una vez levantado el servidor, abre en el navegador:
  - `http://localhost:3000/api` (o la ruta que tengas configurada) para ver la **documentación interactiva** generada por Swagger.
- Desde esta interfaz puedes:
  - Explorar todos los endpoints disponibles.
  - Ver los modelos de datos (DTOs) y respuestas.
  - Probar peticiones directamente desde el navegador (incluyendo autenticación con JWT si está configurada en Swagger).

## Tests

```bash
# tests unitarios
npm run test

# tests e2e
npm run test:e2e

# cobertura
npm run test:cov
```

## Tecnologías principales

- **NestJS** como framework principal.
- **TypeScript**.
- **MongoDB** con **Mongoose** para la capa de persistencia.
- **JWT** para autenticación.
- **Swagger** para documentación de la API.

## Licencia

Nest está bajo [licencia MIT](LICENSE).
