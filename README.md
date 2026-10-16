# CourseHub API - Aplicaciones para el Servidor Web

API RESTful desarrollada con **NestJS**, **TypeORM** y **PostgreSQL** para la gestión de cursos, estudiantes y matrículas académicas.

---

## Semana 6: Filtros, Paginación y Búsqueda con QueryBuilder

Esta entrega implementa consultas avanzadas, seguras y predecibles sobre los recursos persistentes del sistema:
- **Paginación y ordenamiento controlado** en `/courses`.
- **Búsqueda textual insensible a mayúsculas (`ILIKE`) y filtros combinados con `QueryBuilder`** en `/enrollments`.
- **Validación estricta y segura** con `ValidationPipe`, DTOs de consulta tipados, listas blancas y transformación automática de tipos.
- **Metadatos de paginación** (`total`, `page`, `limit`, `totalPages`) para permitir navegación predecible a clientes frontend/móviles.

---

## 1. DTOs de Consulta

### A. `CoursesQueryDto` (`src/courses/dto/courses-query.dto.ts`)
Controla la consulta paginada, filtrada y ordenada del listado de cursos.

| Parámetro | Tipo | Requerido | Valor por defecto | Validaciones / Reglas |
|---|---|---|---|---|
| `level` | `string` | No | `undefined` | Filtro por igualdad de nivel (`beginner`, `intermediate`, `advanced`). |
| `page` | `number` | No | `1` | Entero positivo, `@Min(1)`. |
| `limit` | `number` | No | `10` | Entero positivo entre 1 y 50 (`@Min(1)`, `@Max(50)`). |
| `sortBy` | `string` | No | `'id'` | Lista permitida cerrada: `'id'`, `'title'`, `'level'`. Previene inyección SQL por nombre de columna. |
| `order` | `string` | No | `'ASC'` | Transforma a mayúsculas; solo admite `'ASC'` o `'DESC'`. |

### B. `EnrollmentsQueryDto` (`src/enrollments/dto/enrollments-query.dto.ts`)
Controla la búsqueda y filtrado compuesto sobre matrículas y sus recursos relacionados (`student` y `course`).

| Parámetro | Tipo | Requerido | Valor por defecto | Validaciones / Reglas |
|---|---|---|---|---|
| `search` | `string` | No | `undefined` | Texto de búsqueda que coincide con `student.name` o `course.title` sin distinguir mayúsculas/minúsculas. |
| `studentId` | `number` | No | `undefined` | Identificador del estudiante (`@Min(1)`). |
| `courseId` | `number` | No | `undefined` | Identificador del curso (`@Min(1)`). |
| `activeOnly` | `string` | No | `undefined` | `@IsBooleanString()`. Si es `'true'`, filtra estudiantes activos (`isActive: true`). |
| `page` | `number` | No | `1` | Entero positivo, `@Min(1)`. |
| `limit` | `number` | No | `10` | Entero positivo entre 1 y 50 (`@Min(1)`, `@Max(50)`). |

---

## 2. Ejemplos de URLs y Respuestas

### Ejemplo 1: Paginación y ordenamiento de cursos
```http
GET /courses?page=1&limit=4&sortBy=title&order=ASC
```
**Respuesta (200 OK):**
```json
{
  "items": [
    { "id": 5, "title": "Advanced NestJS Architecture", "level": "advanced" },
    { "id": 9, "title": "DevOps & CI/CD", "level": "intermediate" },
    { "id": 3, "title": "Docker Containers", "level": "beginner" },
    { "id": 7, "title": "GraphQL APIs", "level": "intermediate" }
  ],
  "meta": {
    "total": 9,
    "page": 1,
    "limit": 4,
    "totalPages": 3
  }
}
```

### Ejemplo 2: Filtrado de cursos por nivel
```http
GET /courses?level=beginner&page=1&limit=5&sortBy=title&order=ASC
```
**Respuesta (200 OK):**
```json
{
  "items": [
    { "id": 3, "title": "Docker Containers", "level": "beginner" },
    { "id": 1, "title": "NestJS Fundamentals", "level": "beginner" },
    { "id": 6, "title": "React Essentials", "level": "beginner" }
  ],
  "meta": {
    "total": 3,
    "page": 1,
    "limit": 5,
    "totalPages": 1
  }
}
```

### Ejemplo 3: Búsqueda textual de matrículas con QueryBuilder
```http
GET /enrollments?search=nest&page=1&limit=10
```
**Respuesta (200 OK):**
```json
{
  "items": [
    {
      "id": 1,
      "student": { "id": 1, "name": "Ana Gomez", "email": "ana@example.com", "career": "Software", "semester": 4, "age": 20, "isActive": true },
      "course": { "id": 1, "title": "NestJS Fundamentals", "level": "beginner" }
    },
    {
      "id": 5,
      "student": { "id": 4, "name": "Nestor Castillo", "email": "nestor@example.com", "career": "Software", "semester": 3, "age": 19, "isActive": true },
      "course": { "id": 3, "title": "Docker Containers", "level": "beginner" }
    }
  ],
  "meta": {
    "total": 4,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

### Ejemplo 4: Búsqueda combinada (Texto + Estudiante Activo + Paginación)
```http
GET /enrollments?search=ana&activeOnly=true&page=1&limit=2
```
**Respuesta (200 OK):**
```json
{
  "items": [
    {
      "id": 1,
      "student": { "id": 1, "name": "Ana Gomez", "isActive": true, ... },
      "course": { "id": 1, "title": "NestJS Fundamentals", ... }
    },
    {
      "id": 2,
      "student": { "id": 1, "name": "Ana Gomez", "isActive": true, ... },
      "course": { "id": 2, "title": "TypeScript Pro", ... }
    }
  ],
  "meta": {
    "total": 4,
    "page": 1,
    "limit": 2,
    "totalPages": 2
  }
}
```

### Ejemplo 5: Petición inválida rechazada por ValidationPipe
```http
GET /courses?page=0&limit=200&sortBy=invalido&order=lateral
```
**Respuesta (400 Bad Request):**
```json
{
  "message": [
    "page must not be less than 1",
    "limit must not be greater than 50",
    "sortBy must be one of the following values: id, title, level",
    "order must be one of the following values: ASC, DESC"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

### Ejemplo 6: Búsqueda sin coincidencias (Colección vacía correcta)
```http
GET /enrollments?search=inexistente12345
```
**Respuesta (200 OK):**
```json
{
  "items": [],
  "meta": {
    "total": 0,
    "page": 1,
    "limit": 10,
    "totalPages": 0
  }
}
```

---

## 3. Justificaciones de Diseño y Respuestas Teóricas

1. **¿Por qué el ordenamiento debe existir incluso cuando el usuario no lo especifica?**
   Sin un ordenamiento explícito y determinista (`ORDER BY`), PostgreSQL no garantiza el orden de las filas retornadas entre consultas consecutivas. Al paginar con `skip` y `take`, una fila puede repetirse en la página 2 o ser omitida completamente si el motor de base de datos altera el plan de ejecución o el orden interno de las páginas del disco. Un orden por defecto (`id ASC`) asegura estabilidad y consistencia.

2. **¿Qué diferencia hay entre `total` e `items.length`?**
   - `items.length`: Representa la cantidad de elementos devueltos exclusivamente en la ventana o página actual (como máximo igual a `limit`).
   - `total`: Representa el número global de registros que existen en la base de datos y que cumplen con las condiciones del filtro, sin importar en qué página se encuentre el cliente.

3. **¿Por qué el filtro debe estar en el DTO y en la consulta a la base de datos, y no aplicarse en memoria con `.filter()`?**
   Filtrar en memoria requiere descargar todos los registros desde PostgreSQL hacia la aplicación Node.js, saturando la red, aumentando el tiempo de respuesta (latencia) y consumiendo memoria RAM innecesaria en el servidor. Al filtrar en la consulta (`WHERE` / `qb.andWhere`), el motor de la base de datos aprovecha índices, procesa solo los bloques necesarios y transfiere únicamente los datos requeridos.

4. **¿Por qué `GET /enrollments?search=inexistente` devuelve 200 y no 404?**
   Porque el endpoint apunta al recurso colección `/enrollments`, el cual sí existe en el sistema. Una búsqueda sin resultados simplemente significa que el conjunto de elementos que satisfacen el criterio está vacío (`items: []`). El código `404 Not Found` se reserva para cuando la ruta o un recurso individual específico por ID (`/enrollments/999`) no existe.

5. **Regla de seguridad contra inyección SQL en ordenamiento y búsqueda:**
   - Para `sortBy`: Los nombres de columna no pueden parametrizarse en SQL estándar. Por lo tanto, se aplica una **lista blanca cerrada** mediante `@IsIn(['id', 'title', 'level'])`. Cualquier valor no permitido se rechaza con `400 Bad Request`.
   - Para `search`: Se utilizan parámetros nombrados seguros de TypeORM (`:search`) con comodines `%`:
     ```ts
     qb.andWhere('(student.name ILIKE :search OR course.title ILIKE :search)', {
       search: `%${search.trim()}%`,
     });
     ```
     Esto evita concatenar cadenas y neutraliza cualquier intento de inyección SQL (como `' OR 1=1 --`).

---

## 4. Colección Postman y Pruebas HTTP

El repositorio incluye dos herramientas listas para ejecutar la demostración requerida:
- **Colección Postman:** [CourseHub_Semana06.postman_collection.json](./postman/CourseHub_Semana06.postman_collection.json)
- **Archivo REST Client:** [coursehub-semana06.http](./coursehub-semana06.http)

### Sembrado automático de datos de prueba
Para poblar la base de datos con los cursos, estudiantes y matrículas requeridos:
```bash
# 1. Iniciar la aplicación
npm run start:dev

# 2. En otra terminal, ejecutar el sembrador:
node scripts/seed.js
```

---

## 5. Endpoints Disponibles en CourseHub API

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/courses` | Listado paginado de cursos (`level`, `page`, `limit`, `sortBy`, `order`). |
| `GET` | `/courses/:id` | Obtener curso por ID. |
| `POST` | `/courses` | Crear un nuevo curso. |
| `PATCH` | `/courses/:id` | Actualizar datos de un curso. |
| `DELETE` | `/courses/:id` | Eliminar curso. |
| `GET` | `/students` | Listado de estudiantes con filtros. |
| `GET` | `/students/:id` | Obtener estudiante por ID. |
| `POST` | `/students` | Registrar nuevo estudiante. |
| `PATCH` | `/students/:id` | Actualizar estudiante. |
| `PATCH` | `/students/:id/status` | Cambiar estado `isActive` del estudiante. |
| `DELETE` | `/students/:id` | Eliminar estudiante activo. |
| `GET` | `/enrollments` | Listado paginado y búsqueda textual de matrículas (`search`, `studentId`, `courseId`, `activeOnly`, `page`, `limit`). |
| `POST` | `/enrollments` | Registrar matrícula validando reglas de negocio (estudiante activo, curso existente, no duplicada). |
| `GET` | `/students/:studentId/enrollments` | Matrículas de un estudiante específico. |
| `GET` | `/courses/:courseId/enrollments` | Matrículas de un curso específico. |
| `DELETE` | `/enrollments/:id` | Cancelar matrícula. |