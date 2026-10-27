# CourseHub API - Aplicaciones para el Servidor Web

API RESTful desarrollada con **NestJS**, **TypeORM** y **PostgreSQL** para la gestión académica de cursos, estudiantes y matrículas. Proyecto Integrador · Etapa 2 (Semanas 5 a 7).

---

## 📋 Requisitos del Sistema

- **Node.js**: Versión 20.x o 22.x LTS.
- **npm**: Versión 10.x o superior.
- **PostgreSQL**: Versión 14 o superior en ejecución local o remota.

---

## 🚀 Instalación y Puesta en Marcha

### 1. Clonar el repositorio e instalar dependencias
```bash
git clone <URL_DEL_REPOSITORIO>
cd Aplicacion-Servidores-Web
npm install
```

### 2. Configurar las variables de entorno
Copia la plantilla `.env.example` a un archivo local `.env`:

En Windows (PowerShell):
```powershell
Copy-Item .env.example .env
```

En Linux / macOS:
```bash
cp .env.example .env
```

Edita el archivo `.env` recién creado con tus credenciales locales de PostgreSQL.

> [!WARNING]
> **ADVERTENCIA DE SEGURIDAD CRÍTICA:**  
> El archivo `.env` contiene credenciales sensibles y **NUNCA debe compartirse, enviarse a terceros ni incluirse en el repositorio de Git**. Se encuentra protegido e ignorado explícitamente en el archivo `.gitignore`. Solo se versiona la plantilla `.env.example` con valores ficticios.

### 3. Variables de Entorno Requeridas

La aplicación valida de forma estricta las variables de entorno al iniciar mediante un esquema **Joi** en `ConfigModule.forRoot`:

| Variable | Tipo | Requerido | Valor por defecto | Descripción |
|---|---|---|---|---|
| `NODE_ENV` | `string` | No | `'development'` | Ambiente de ejecución (`'development'`, `'test'`, `'production'`). |
| `PORT` | `number` | No | `3000` | Puerto en el que la API escucha peticiones. |
| `DB_HOST` | `string` | **Sí** | - | Dirección del servidor PostgreSQL (ej. `localhost`). |
| `DB_PORT` | `number` | No | `5432` | Puerto de conexión a PostgreSQL. |
| `DB_NAME` | `string` | **Sí** | - | Nombre de la base de datos (ej. `coursehub`). |
| `DB_USER` | `string` | **Sí** | - | Usuario de la base de datos (ej. `postgres`). |
| `DB_PASSWORD` | `string` | Condicional | - | Contraseña. Opcional/vacía en desarrollo local, pero **obligatoria y no vacía** si `NODE_ENV=production`. |
| `JWT_SECRET` | `string` | **Sí** | - | Clave secreta para la firma y verificación de tokens JWT (mínimo 32 caracteres). Nunca compartir ni versionar en Git. |
| `JWT_EXPIRES_IN` | `string` | No | `'15m'` | Tiempo de vida de los access tokens emitidos (ej. `'15m'`, `'1h'`). |

### 4. Política de Sincronización TypeORM por Ambiente

- **En desarrollo (`NODE_ENV=development`)**: `synchronize: true` está habilitado para generar y sincronizar automáticamente las tablas (`students`, `courses`, `enrollments`) a partir de las entidades.
- **En producción o pruebas (`NODE_ENV=production` / `test`)**: `synchronize: false` se desactiva estrictamente para evitar pérdidas accidentales de datos o modificaciones destructivas en esquemas productivos.

### 5. Iniciar la Aplicación

```bash
# Modo desarrollo con recarga automática
npm run start:dev

# Modo producción
npm run build
npm run start:prod
```

### 6. Ejecutar Pruebas Unitarias

```bash
npm run test
```

---

## 📌 Endpoints Principales

| Método | Endpoint | Descripción | Parámetros Query / Body |
|---|---|---|---|
| `GET` | `/` | Comprobación de estado / Bienvenida | Ninguno |
| `GET` | `/courses` | Listado paginado de cursos | `page`, `limit`, `sortBy`, `order`, `level` |
| `GET` | `/courses/:id` | Detalle de un curso | Param `id` |
| `POST` | `/courses` | Crear curso | `{ "title": string, "level": string }` |
| `PATCH` | `/courses/:id` | Actualizar curso | Campos a actualizar |
| `DELETE` | `/courses/:id` | Eliminar curso | Param `id` |
| `GET` | `/students` | Listado de estudiantes | `career`, `semester`, `isActive` |
| `GET` | `/students/:id` | Detalle de estudiante | Param `id` |
| `POST` | `/students` | Registrar estudiante | `{ "name", "email", "career", "semester", "age", "isActive" }` |
| `PATCH` | `/students/:id/status` | Activar/desactivar estudiante | Query `isActive=true/false` |
| `GET` | `/enrollments` | Búsqueda y filtrado de matrículas | `search`, `studentId`, `courseId`, `activeOnly`, `page`, `limit` |
| `POST` | `/enrollments` | Registrar matrícula | `{ "studentId": number, "courseId": number }` |
| `DELETE` | `/enrollments/:id` | Cancelar matrícula | Param `id` |
| `POST` | `/auth/register` | Registro de usuario | `{ "email": string, "password": string }` |
| `POST` | `/auth/login` | Inicio de sesión y emisión de token JWT | `{ "email": string, "password": string }` |

---

### 🔐 Contrato de Autenticación (`POST /auth/login`) · Sesión 17

Valida las credenciales del usuario con **bcrypt** y, tras una comprobación exitosa, emite un **JSON Web Token (JWT)** de acceso temporal con una carga útil mínima.

- **Entrada (`POST /auth/login`)**:
  ```json
  {
    "email": "ana@example.com",
    "password": "PasswordSegura123!"
  }
  ```
- **Salida Exitosa (`200 OK`)**:
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "ana@example.com",
      "createdAt": "2026-10-27T18:00:00.000Z"
    }
  }
  ```
- **Estructura del Payload JWT emitido (`JwtPayload`)**:
  - `sub`: Identificador numérico del usuario (`user.id`).
  - `email`: Correo institucional/personal normalizado.
  - `iat`: Timestamp de emisión (añadido automáticamente por la librería).
  - `exp`: Timestamp de expiración (calculado según `JWT_EXPIRES_IN`, aprox. 15 minutos).
- **Caducidad aproximada**: 15 minutos (`15m`).
- **Respuesta ante Credenciales Inválidas (`401 Unauthorized`)**:
  ```json
  {
    "statusCode": 401,
    "message": "Credenciales inválidas",
    "error": "Unauthorized"
  }
  ```
  *(Devuelve 401 tanto para contraseña errónea como para usuario inexistente, sin emitir ningún token)*.
- **Advertencia de Seguridad**:
  - Un token JWT está **firmado, no cifrado**. Su carga útil (payload) puede ser decodificada y leída por cualquiera que tenga acceso al token (Base64Url).
  - **NUNCA** incluir datos sensibles en el payload (como `password`, `passwordHash`, números bancarios o secretos de entorno).
  - Los tokens son credenciales vivas: **NUNCA** compartas ni publiques tokens en repositorios, capturas públicas o chats. Trátalos con la misma confidencialidad que una sesión activa.

---

## 🛡️ Reglas de Negocio e Integridad

1. **Matrícula única por pareja estudiante–curso**: Se impide que un mismo estudiante se matricule más de una vez en el mismo curso (Restricción `@Unique(['student', 'course'])` y validación en servicio que responde `409 Conflict`).
2. **Estudiante inexistente o curso inexistente**: Se rechaza con `404 Not Found`.
3. **Estudiante inactivo**: No se permite matricular a estudiantes cuyo estado `isActive` sea `false` (responde `400 Bad Request`).
4. **Correo único**: El correo institucional de los estudiantes no puede repetirse (`409 Conflict`).
5. **Protección contra inyección SQL**:
   - `sortBy`: Protegido mediante lista blanca `@IsIn(['id', 'title', 'level'])`.
   - `search`: Parametrizado mediante comodines `:search` en el `QueryBuilder` de TypeORM (`ILIKE :search`).

---

## 📦 Colecciones de Demostración y Pruebas

Para reproducir la evaluación completa de la Etapa 2 se incluyen:
- **Colección Postman exportable**: [`postman/CourseHub_Etapa02.postman_collection.json`](./postman/CourseHub_Etapa02.postman_collection.json)
- **Archivo REST Client (VS Code)**: [`coursehub-etapa02.http`](./coursehub-etapa02.http)
- **Script sembrador de datos**: `node scripts/seed.js` (requiere que el servidor esté encendido).