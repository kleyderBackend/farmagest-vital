# FarmaGest Vital

FarmaGest Vital es un sistema web academico para la gestion de una farmacia, con catalogo ecommerce, panel administrativo, control de productos, categorias, clientes y ventas.

El proyecto esta construido con una arquitectura separada entre frontend, backend y base de datos PostgreSQL. El alcance actual evita modulos de proveedores, compras a proveedores y contabilidad avanzada para mantener el desarrollo enfocado en el flujo principal del negocio.

## Estado Actual

| Area | Estado | Descripcion |
| --- | --- | --- |
| Frontend publico | En desarrollo | Inicio, catalogo, detalle de producto y carrito visual. |
| Frontend admin | En desarrollo | Login, dashboard, productos y categorias conectados parcialmente al backend. |
| Backend | En desarrollo | API modular con autenticacion, categorias, productos, clientes y ventas. |
| Base de datos | Definida | Script SQL para PostgreSQL en `backends/src/db/db.sql`. |
| Documentacion | Actualizada | Requerimientos, diagramas y diseno del sistema en `docs/`. |

## Modulos Implementados

| Modulo | Ruta base | Estado |
| --- | --- | --- |
| Auth | `/api/auth` | Login, register y JWT. |
| Categories | `/api/categories` | Crear, listar, buscar, actualizar y desactivar categorias. |
| Products | `/api/products` | Crear, listar, buscar, actualizar, desactivar, validar vencimiento y stock. |
| Customers | `/api/customers` | Gestion administrativa de clientes. |
| Sales | `/api/sales` | Checkout publico, ventas internas, historial, busqueda y total vendido. |

## Modulos Pendientes

| Modulo | Proposito |
| --- | --- |
| Cart | Persistir carrito antes del checkout. |
| Inventory | Registrar entradas, salidas, ajustes y trazabilidad de stock. |
| Reports | Reportes operativos de ventas, productos, stock bajo y vencimientos. |
| Dashboard API | Endpoints especificos para metricas del panel administrativo. |

## Stack Tecnologico

| Capa | Tecnologia |
| --- | --- |
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express, TypeScript |
| Base de datos | PostgreSQL |
| Autenticacion | JWT |
| Password hashing | bcrypt |
| Package manager | pnpm |

## Estructura Principal

```text
farmagest-vital/
  backends/
    app.ts
    server.ts
    src/
      config/
      db/
      middlewares/
      modules/
        auth/
        categories/
        products/
        customers/
        sales/
  frontends/
    index.html
    ecommerce/
    dashboards/
    js/
    css/
  docs/
```

## Configuracion Del Backend

Crear un archivo `.env` dentro de `backends/`:

```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=farmSalud
DB_USER=postgres
DB_PASSWORD=
JWT_SECRET=una-clave-secreta-larga
```

Si PostgreSQL local no tiene password, `DB_PASSWORD` puede quedar vacio.

## Instalacion Y Ejecucion

Desde la carpeta del backend:

```bash
cd backends
pnpm install
pnpm start:dev
```

Servidor esperado:

```text
http://localhost:3000
```

## Base De Datos

El script SQL principal esta en:

```text
backends/src/db/db.sql
```

Tablas actuales:

- `users`
- `categories`
- `products`
- `customers`
- `carts`
- `cart_items`
- `orders`
- `order_items`
- `inventory_movements`

Aunque el modulo del backend se llama `sales`, la base de datos conserva las tablas `orders` y `order_items` para registrar ventas y su detalle.

## Rutas Principales

### Auth

```text
POST /api/auth/register
POST /api/auth/login
```

### Categories

```text
GET    /api/categories
GET    /api/categories/active
GET    /api/categories/:id
GET    /api/categories/name/:name
POST   /api/categories/creted-categorie
PUT    /api/categories/:id
DELETE /api/categories/:id
```

### Products

```text
GET    /api/products
GET    /api/products/active
GET    /api/products/available
GET    /api/products/category/:id
GET    /api/products/name/:name
GET    /api/products/:id
POST   /api/products/created-products
PUT    /api/products/:id
DELETE /api/products/:id
```

### Customers

```text
GET  /api/customers
GET  /api/customers/:id
GET  /api/customers/email/:email
POST /api/customers/created-customer
PUT  /api/customers/:id
```

### Sales

```text
POST /api/sales/checkout
POST /api/sales/created-sale
GET  /api/sales
GET  /api/sales/range?startDate=2026-09-01&endDate=2026-09-30
GET  /api/sales/total-sold
GET  /api/sales/total-sold?startDate=2026-09-01&endDate=2026-09-30
GET  /api/sales/date/2026-09-30
GET  /api/sales/:id
```

## Checkout Publico

El cliente no se registra con cuenta. Sus datos se capturan al finalizar la compra.

```json
{
  "customer": {
    "fullName": "Juan Perez",
    "phone": "3001234567",
    "email": "juan@gmail.com",
    "address": "Calle 10 # 20-30"
  },
  "notes": "Entregar en la tarde",
  "items": [
    {
      "productId": 1,
      "quantity": 2
    }
  ]
}
```

El backend:

- busca o crea el cliente por email;
- valida productos activos, disponibles y no vencidos;
- valida stock;
- crea la venta;
- registra el detalle;
- descuenta stock en una transaccion.

## Seguridad

- Las rutas administrativas usan JWT.
- Los roles internos son `admin` y `staff`.
- El checkout publico no requiere token.
- Productos vencidos no pueden venderse.
- No se permite crear o actualizar productos con fecha de vencimiento pasada.

## Documentacion

| Archivo | Contenido |
| --- | --- |
| `docs/requerimiento.md` | Requerimientos funcionales y no funcionales. |
| `docs/desing-systems.md` | Diseno funcional, tecnico y visual. |
| `docs/Diagrama-entidad-relacion-db.md` | Modelo de base de datos. |
| `docs/Diagrama-architecture-systems.md` | Arquitectura del sistema. |
| `docs/diagrama-casos-uso.md` | Casos de uso por actor. |
| `docs/diagrama-flujo-cliente.md` | Flujo del cliente. |
| `docs/Diagrama-flujo-admin.md` | Flujo administrativo. |

## Alcance Excluido

No se incluyen por ahora:

- proveedores;
- compras a proveedores;
- detalle de compras;
- flujo de abastecimiento;
- reportes de compras;
- contabilidad;
- costos avanzados;
- pagos en linea.

## Estado Recomendado Del Desarrollo

Siguiente orden sugerido:

1. Completar modulo `cart`.
2. Crear modulo `inventory`.
3. Crear modulo `reports`.
4. Conectar checkout frontend con `/api/sales/checkout`.
5. Completar vistas administrativas de clientes y ventas.
