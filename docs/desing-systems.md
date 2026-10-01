# Diseno Del Sistema

## FarmaGest Vital

## 1. Introduccion

Este documento describe el diseno funcional, tecnico y visual de FarmaGest Vital. La version actual se enfoca en el flujo principal de farmacia: catalogo, productos, categorias, clientes y ventas.

Quedan fuera de esta etapa proveedores, compras, abastecimiento, contabilidad y costos avanzados.

## 2. Vision General

| Area | Descripcion |
| --- | --- |
| Area publica | Cliente consulta productos, usa carrito visual y finaliza compra sin cuenta. |
| Area administrativa | Admin o staff gestiona productos, categorias, clientes y ventas. |
| Backend | API modular con Express y TypeScript. |
| Base de datos | PostgreSQL con tablas relacionales para usuarios, productos, clientes y ventas. |

## 3. Tecnologias

| Componente | Tecnologia |
| --- | --- |
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express, TypeScript |
| Base de datos | PostgreSQL |
| Seguridad | JWT, bcrypt |
| Administracion DB | PgAdmin4 |
| Versionado | Git |

## 4. Estructura Modular

| Modulo | Estado | Responsabilidad |
| --- | --- | --- |
| `auth` | Implementado | Login, register, JWT y roles. |
| `categories` | Implementado | Gestion de categorias. |
| `products` | Implementado | Gestion de productos, stock y vencimientos. |
| `customers` | Implementado | Gestion administrativa de clientes. |
| `sales` | Implementado | Checkout, venta interna, historial, detalle y total vendido. |
| `cart` | Pendiente | Persistir carrito en backend. |
| `inventory` | Pendiente | Movimientos y ajustes de stock. |
| `reports` | Pendiente | Reportes administrativos. |

## 5. Navegacion Publica

```text
Inicio
  -> Catalogo
      -> Filtro por categoria
      -> Detalle de producto
          -> Agregar al carrito
              -> Carrito
                  -> Checkout
                      -> Confirmacion de venta
```

## 6. Navegacion Administrativa

```text
Login admin
  -> Dashboard
      -> Productos
          -> Crear producto
          -> Editar producto
      -> Categorias
          -> Crear categoria
          -> Editar categoria
      -> Clientes
          -> Listar clientes
          -> Actualizar cliente
      -> Ventas
          -> Historial
          -> Buscar por ID
          -> Buscar por fecha
          -> Total vendido
```

## 7. Pantallas Principales

### Publicas

| Pantalla | Proposito |
| --- | --- |
| Inicio | Presentar marca y acceso al catalogo. |
| Catalogo | Mostrar productos disponibles. |
| Detalle | Ver informacion completa del producto. |
| Carrito | Revisar productos seleccionados. |
| Checkout | Capturar datos del cliente y finalizar compra. |

### Administrativas

| Pantalla | Proposito |
| --- | --- |
| Login | Acceso interno. |
| Dashboard | Resumen operativo. |
| Productos | Administrar catalogo. |
| Categorias | Organizar productos. |
| Clientes | Consultar datos de clientes. |
| Ventas | Consultar historial y totales. |

## 8. Modelo De Datos

| Tabla | Proposito |
| --- | --- |
| `users` | Usuarios internos. |
| `categories` | Categorias del catalogo. |
| `products` | Productos, precios, stock y vencimientos. |
| `customers` | Clientes que compran. |
| `orders` | Cabecera de venta. |
| `order_items` | Detalle de venta. |
| `carts` | Carritos pendientes de implementar. |
| `cart_items` | Items de carrito pendientes de implementar. |
| `inventory_movements` | Movimientos de inventario pendientes de implementar. |

## 9. API Actual

| Metodo | Ruta | Uso |
| --- | --- | --- |
| POST | `/api/auth/register` | Registrar usuario interno. |
| POST | `/api/auth/login` | Iniciar sesion. |
| GET | `/api/categories` | Listar categorias. |
| POST | `/api/categories/creted-categorie` | Crear categoria. |
| PUT | `/api/categories/:id` | Actualizar categoria. |
| DELETE | `/api/categories/:id` | Desactivar categoria. |
| GET | `/api/products` | Listar productos. |
| POST | `/api/products/created-products` | Crear producto. |
| PUT | `/api/products/:id` | Actualizar producto. |
| DELETE | `/api/products/:id` | Desactivar producto. |
| GET | `/api/customers` | Listar clientes. |
| POST | `/api/customers/created-customer` | Crear cliente desde admin. |
| PUT | `/api/customers/:id` | Actualizar cliente. |
| POST | `/api/sales/checkout` | Checkout publico sin token. |
| POST | `/api/sales/created-sale` | Venta interna con token. |
| GET | `/api/sales` | Historial de ventas. |
| GET | `/api/sales/:id` | Venta por ID. |
| GET | `/api/sales/date/:date` | Ventas por fecha. |
| GET | `/api/sales/total-sold` | Total vendido. |

## 10. Criterios Visuales

| Criterio | Aplicacion |
| --- | --- |
| Claridad | Pantallas sin informacion innecesaria. |
| Consistencia | Formularios, tablas y botones con lenguaje visual uniforme. |
| Enfoque operativo | El admin prioriza lectura rapida y accion. |
| Responsive | El layout debe funcionar en escritorio y movil. |
| Accesibilidad | Buen contraste, textos claros y estados visibles. |

## 11. Estados Y Alertas

| Estado | Uso |
| --- | --- |
| Disponible | Producto activo, visible y vendible. |
| No disponible | Producto oculto para venta. |
| Stock bajo | `current_stock <= minimum_stock`. |
| Por vencer | Producto con vencimiento cercano. |
| Vencido | Producto con fecha anterior a hoy; no se vende. |

## 12. Prioridades De Diseno

1. Terminar checkout visual conectado con `/api/sales/checkout`.
2. Crear vistas admin para clientes y ventas.
3. Implementar carrito backend.
4. Implementar inventario.
5. Implementar reportes.

## 13. Conclusion

El sistema tiene una base modular coherente y preparada para crecer. La documentacion actual distingue entre lo implementado y lo pendiente, lo que permite continuar el desarrollo sin perder el alcance real del proyecto.
