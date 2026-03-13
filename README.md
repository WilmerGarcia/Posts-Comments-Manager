# Posts Comments Manager

Aplicación fullstack para la gestión de publicaciones y comentarios con autenticación de usuarios.

## Descripción

Sistema completo que permite a los usuarios registrarse, crear publicaciones, comentar en posts de otros usuarios y gestionar su propio contenido. Construido con tecnologías modernas y buenas prácticas de desarrollo.

## Arquitectura

```
Posts-Comments-Manager/
├── backend/          # API REST (NestJS + MongoDB)
├── frontend/         # Aplicación web (Angular + Tailwind)
└── README.md
```

| Componente | Tecnología | Puerto |
|------------|------------|--------|
| Frontend | Angular 18 + Tailwind CSS | 4200 |
| Backend | NestJS 11 + TypeScript | 3000 |
| Base de datos | MongoDB 7 | 27017 |
| Admin DB | Mongo Express | 8081 |

## Características

- **Autenticación JWT**: Sistema seguro de registro e inicio de sesión
- **CRUD de Posts**: Crear, leer, actualizar y eliminar publicaciones
- **Sistema de Comentarios**: Comentarios asociados a cada publicación
- **Subida de Archivos**: Soporte para imágenes en publicaciones
- **Documentación API**: Swagger integrado
- **Docker Ready**: Despliegue con contenedores


## Requisitos

- **Node.js** 18.19+ (recomendado 20 LTS o 22)
- **MongoDB** 6+ (local o Docker)
- **npm** o **yarn**
- **Docker** y **Docker Compose** (opcional)

## Documentación adicional

- [Backend README](./backend/README.md) - Documentación detallada de la API
- [Frontend README](./frontend/README.md) - Documentación de la aplicación web

## Licencia

Wilmer García (Privado)
