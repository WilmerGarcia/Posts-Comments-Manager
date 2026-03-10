# Posts-Comments-Manager

Proyecto fullstack para gestionar publicaciones y comentarios.

## Estructura

- **`backend/`** — API REST con NestJS, MongoDB (Mongoose), autenticación, posts y comentarios.
- **`frontend/`** — Aplicación Angular con Tailwind CSS.

## Requisitos

- Node.js 18.19+ (recomendado 20 LTS o 22)
- MongoDB (local o remoto)

## Inicio rápido

### Backend

```bash
cd backend
cp .env.example .env   # Configura las variables de entorno
npm install
npm run start:dev
```

API en `http://localhost:3000` (por defecto). Documentación Swagger en `/api` (si está configurado).

### Frontend

```bash
cd frontend
npm install
npm start
```

Aplicación en `http://localhost:4200`.

## Licencia

UNLICENSED (privado).
