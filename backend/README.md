<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

  <p align="center">API del proyecto Posts-Comments-Manager. Backend con <a href="http://nodejs.org" target="_blank">Node.js</a> y <a href="https://nestjs.com" target="_blank">NestJS</a>.</p>

## Descripción

API REST construida con [Nest](https://github.com/nestjs/nest): módulos de usuarios, autenticación, publicaciones (posts) y comentarios, con MongoDB (Mongoose).

## Instalación

```bash
npm install
```

Copia `.env.example` a `.env` y configura las variables (MongoDB, JWT, etc.).

## Ejecutar la aplicación

```bash
# desarrollo
npm run start

# modo watch (recarga al cambiar código)
npm run start:dev

# producción
npm run start:prod
```

## Tests

```bash
# tests unitarios
npm run test

# tests e2e
npm run test:e2e

# cobertura
npm run test:cov
```

## Soporte

Nest es un proyecto open source bajo licencia MIT. Más información en [docs.nestjs.com](https://docs.nestjs.com).

## Licencia

Nest está bajo [licencia MIT](LICENSE).
