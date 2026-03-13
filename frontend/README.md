# Frontend - Posts Comments Manager

Aplicación web SPA para la gestión de publicaciones y comentarios, desarrollada con **Angular 18** y **Tailwind CSS**.

## Descripción

Este frontend proporciona una interfaz de usuario moderna y responsiva para interactuar con la API de Posts Comments Manager. Permite a los usuarios autenticarse, crear publicaciones, comentar y gestionar su contenido.

## Características principales

- **Autenticación**: Registro e inicio de sesión de usuarios
- **Gestión de Posts**: Crear, ver, editar y eliminar publicaciones
- **Comentarios**: Sistema de comentarios en cada publicación
- **Cuenta de Usuario**: Gestión del perfil
- **Diseño Responsivo**: Adaptable a todos los dispositivos
- **UI Moderna**: Interfaz limpia con Tailwind CSS

## Estructura del proyecto

```
frontend/
├── src/
│   ├── app/
│   │   ├── core/               # Servicios globales
│   │   │   └── services/       # Auth, Error, Toast
│   │   ├── features/           # Módulos por funcionalidad
│   │   │   └── posts/          # Feature de posts
│   │   │       ├── pages/      # Páginas del módulo
│   │   │       └── services/   # Servicios específicos
│   │   ├── pages/              # Páginas principales
│   │   │   ├── auth-page/      # Login y registro
│   │   │   ├── account-page/   # Perfil de usuario
│   │   │   └── ...
│   │   ├── shared/             # Componentes compartidos
│   │   │   ├── components/     # Toast, modales, etc.
│   │   │   └── icons/          # Iconos SVG como componentes
│   │   ├── app.component.ts    # Componente raíz
│   │   └── app.routes.ts       # Configuración de rutas
│   ├── assets/                 # Recursos estáticos
│   └── styles.scss             # Estilos globales
├── tailwind.config.js          # Configuración de Tailwind
└── angular.json                # Configuración de Angular
```

## Requisitos previos

- **Node.js** 18+ (recomendado 20 LTS)
- **npm** o **yarn**
- **Angular CLI** 18 (opcional, se puede usar npx)

## Instalación

### 1. Instalar dependencias

```bash
cd frontend
npm install
```

### 2. Configurar el entorno (opcional)

Si necesitas cambiar la URL del backend, edita el archivo `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000'
};
```

## Ejecutar la aplicación

### Desarrollo

```bash
npm start
# o
ng serve
```

La aplicación estará disponible en **`http://localhost:4200`**

Los cambios en el código se recargan automáticamente.

### Compilar para producción

```bash
npm run build
# o
ng build --configuration=production
```

Los archivos se generan en la carpeta `dist/frontend/`.

### Modo watch (desarrollo continuo)

```bash
npm run watch
```

Compila automáticamente al detectar cambios.

## Rutas de la aplicación

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/` | - | Redirige a `/posts` |
| `/auth` | AuthPageComponent | Login y registro |
| `/posts` | PostsPageComponent | Lista de publicaciones |
| `/posts/:id` | PostDetailPageComponent | Detalle de una publicación |
| `/posts/:id/edit` | PostEditPageComponent | Editar publicación |
| `/account` | AccountPageComponent | Perfil del usuario |
| `**` | - | Redirige a `/posts` (404) |

## Servicios principales

### AuthService
Gestiona la autenticación de usuarios:
- Login y registro
- Manejo de tokens JWT
- Estado de sesión

### PostsService
Operaciones CRUD de publicaciones:
- Obtener lista de posts
- Crear, editar, eliminar posts
- Gestión de comentarios

### ToastService
Sistema de notificaciones:
- Mensajes de éxito
- Alertas de error
- Notificaciones informativas

### ErrorService
Manejo centralizado de errores:
- Intercepta errores HTTP
- Muestra mensajes al usuario
- Logging de errores

## Tests

El proyecto incluye tests unitarios para los servicios y componentes principales.

```bash
# Ejecutar tests
npm test
```

Los tests se ejecutan con Karma y Jasmine.

## Scripts disponibles

| Script | Descripción |
|--------|-------------|
| `npm start` | Iniciar servidor de desarrollo |
| `npm run build` | Compilar para producción |
| `npm run watch` | Compilar en modo watch |
| `npm test` | Ejecutar tests unitarios |
| `ng generate` | Generar componentes, servicios, etc. |

## Tecnologías

| Tecnología | Versión | Uso |
|------------|---------|-----|
| Angular | 18.2.x | Framework frontend |
| TypeScript | 5.4.x | Lenguaje |
| Tailwind CSS | 3.4.x | Framework de estilos |
| RxJS | 7.8.x | Programación reactiva |
| Karma | 6.4.x | Test runner |
| Jasmine | 5.1.x | Framework de testing |

## Conexión con el Backend

El frontend se comunica con la API REST del backend. Asegúrate de que:

1. El backend esté ejecutándose en `http://localhost:3000`
2. CORS esté configurado correctamente en el backend
3. Las variables de entorno apunten a la URL correcta

### Flujo de autenticación

1. Usuario ingresa credenciales en `/auth`
2. Frontend envía petición POST a `/auth/login`
3. Backend devuelve token JWT
4. Frontend almacena token y lo envía en headers de siguientes peticiones
5. Backend valida token en endpoints protegidos

## Licencia

Wilmer García (Privado)
