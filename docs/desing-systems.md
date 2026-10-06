# Diseno del sistema

## Sistema web de gestion de inventario y pedidos para farmacia

## 1. Introduccion

Este documento describe el diseno general de FarmaGest Vital, tomando como base los requerimientos definidos para la primera version del proyecto. El sistema se enfoca en catalogo, carrito, pedidos, productos, categorias, inventario basico, usuarios administrativos y reportes simples.

No se incluyen modulos de proveedores, compras a proveedores, detalle de compras, abastecimiento ni gestion contable, porque aumentan el alcance y no son necesarios para demostrar el flujo principal del sistema.

## 2. Objetivo de la fase

Definir la estructura funcional, visual y tecnica del sistema, estableciendo modulos, pantallas, navegacion, entidades de datos y componentes principales para desarrollar una solucion clara, realista y mantenible.

## 3. Descripcion general de la solucion

FarmaGest Vital se divide en dos areas:

| Area | Descripcion |
| --- | --- |
| Area publica | Permite al cliente consultar productos, filtrar por categoria, revisar detalles, agregar productos al carrito y generar pedidos. |
| Area administrativa | Permite al personal gestionar productos, categorias, inventario, pedidos, clientes, usuarios y reportes basicos. |

La solucion se plantea como una aplicacion web con frontend, backend y base de datos PostgreSQL. El frontend maneja la experiencia visual, el backend centraliza la logica y la base de datos almacena la informacion principal del negocio.

## 4. Arquitectura propuesta

| Capa | Responsabilidad |
| --- | --- |
| Frontend | Mostrar pantallas, capturar acciones del usuario y consumir la API. |
| Backend | Validar datos, aplicar reglas de negocio y exponer rutas para los modulos. |
| Base de datos | Guardar productos, categorias, clientes, carritos, pedidos, inventario y usuarios. |
| Navegador | Permitir el acceso desde computador, tablet o celular. |

## 5. Tecnologias propuestas

| Componente | Tecnologia | Justificacion |
| --- | --- | --- |
| Estructura visual | HTML | Permite construir las pantallas principales. |
| Estilos | CSS | Define apariencia, distribucion y diseno responsive. |
| Interactividad | JavaScript | Maneja catalogo, filtros, carrito y acciones del usuario. |
| Backend | Node.js con Express | Permite crear una API modular para el sistema. |
| Base de datos | PostgreSQL | Base relacional adecuada para productos, pedidos e inventario. |
| Herramienta de base de datos | PgAdmin4 | Permite crear y administrar las tablas de forma visual. |
| Control de versiones | Git | Mantiene historial y control de cambios. |

## 6. Estructura modular

| Modulo | Usuario principal | Descripcion | Prioridad |
| --- | --- | --- | --- |
| Catalogo | Cliente | Muestra productos disponibles, categorias, precios e informacion basica. | Alta |
| Detalle de producto | Cliente | Presenta informacion ampliada de cada producto. | Alta |
| Carrito | Cliente | Permite administrar productos seleccionados y total del pedido. | Alta |
| Pedidos | Cliente y administrador | Permite generar pedidos y gestionarlos desde el panel. | Alta |
| Productos | Administrador | Permite registrar, editar, consultar y desactivar productos. | Alta |
| Categorias | Administrador | Permite organizar productos para catalogo y filtros. | Alta |
| Inventario | Administrador | Permite controlar stock, salidas, ajustes y niveles minimos. | Alta |
| Clientes | Administrador | Permite consultar datos asociados a pedidos. | Media |
| Usuarios | Administrador | Permite administrar accesos internos. | Media |
| Alertas | Administrador | Permite identificar bajo stock y productos proximos a vencer. | Media |
| Reportes | Administrador | Permite consultar resumenes basicos de productos, pedidos e inventario. | Baja |

## 7. Mapa de navegacion

### 7.1 Navegacion del cliente

```text
Inicio
  -> Catalogo de productos
      -> Filtro por categoria
      -> Detalle de producto
          -> Agregar al carrito
              -> Carrito
                  -> Modificar cantidades
                  -> Eliminar productos
                  -> Generar pedido
```

### 7.2 Navegacion administrativa

```text
Panel administrativo
  -> Productos
      -> Registrar producto
      -> Editar producto
      -> Consultar producto
      -> Desactivar producto
  -> Categorias
      -> Registrar categoria
      -> Editar categoria
  -> Inventario
      -> Consultar stock
      -> Registrar ajuste
      -> Bajo stock
      -> Productos proximos a vencer
  -> Pedidos
      -> Pedidos pendientes
      -> Detalle de pedido
      -> Actualizar estado
  -> Clientes
      -> Consultar cliente
      -> Ver pedidos asociados
  -> Usuarios
      -> Crear usuario
      -> Editar usuario
      -> Desactivar usuario
  -> Reportes
```

## 8. Pantallas principales

### 8.1 Area publica

| Pantalla | Proposito | Elementos principales |
| --- | --- | --- |
| Inicio | Presentar marca y acceso al catalogo. | Logo, menu, hero, categorias y productos destacados. |
| Catalogo | Mostrar productos disponibles. | Tarjetas, filtros, precio, descripcion y acciones. |
| Detalle de producto | Ampliar informacion de un producto. | Imagen, nombre, categoria, precio, disponibilidad y boton de carrito. |
| Carrito | Mostrar productos seleccionados. | Lista, cantidades, total, eliminar producto y generar pedido. |
| Confirmacion de pedido | Informar que el pedido fue creado. | Numero de pedido, resumen, datos del cliente y estado inicial. |

### 8.2 Area administrativa

| Pantalla | Proposito | Elementos principales |
| --- | --- | --- |
| Panel administrativo | Resumir el estado general. | Indicadores, alertas, accesos rapidos y pedidos recientes. |
| Productos | Administrar catalogo. | Tabla, formulario, crear, editar y desactivar. |
| Categorias | Organizar productos. | Tabla, formulario y estado de categoria. |
| Inventario | Controlar existencias. | Stock actual, stock minimo, alertas y ajustes. |
| Pedidos | Revisar pedidos de clientes. | Tabla, estado, detalle y acciones de atencion. |
| Clientes | Consultar clientes asociados a pedidos. | Datos basicos e historial simple. |
| Usuarios | Gestionar acceso interno. | Tabla, roles, estado y formulario. |
| Reportes | Consultar informacion resumida. | Filtros, tablas y resumenes de productos, pedidos e inventario. |

## 9. Flujo principal del cliente

| Paso | Accion del usuario | Respuesta del sistema |
| --- | --- | --- |
| 1 | El cliente ingresa al sitio web. | El sistema muestra inicio y acceso al catalogo. |
| 2 | El cliente revisa productos o selecciona una categoria. | El sistema filtra y muestra productos correspondientes. |
| 3 | El cliente abre el detalle de un producto. | El sistema muestra informacion ampliada. |
| 4 | El cliente agrega el producto al carrito. | El sistema actualiza carrito y cantidades. |
| 5 | El cliente revisa el carrito. | El sistema muestra productos, cantidades y total. |
| 6 | El cliente confirma el pedido. | El sistema registra el pedido para atencion administrativa. |

## 10. Flujo principal del administrador

| Paso | Accion del administrador | Respuesta del sistema |
| --- | --- | --- |
| 1 | Ingresa al panel administrativo. | El sistema valida acceso y muestra resumen. |
| 2 | Registra o edita productos. | El catalogo queda actualizado. |
| 3 | Gestiona categorias. | Los productos quedan organizados. |
| 4 | Revisa inventario y alertas. | El sistema muestra stock, bajo inventario y vencimientos. |
| 5 | Atiende pedidos. | El sistema permite cambiar estados y descontar stock al completar. |
| 6 | Consulta clientes o usuarios. | El sistema muestra informacion administrativa basica. |
| 7 | Consulta reportes. | El sistema muestra resumenes de productos, pedidos e inventario. |

## 11. Modelo de datos propuesto

Los campos terminados en `_id` se proponen como `uuid` generados por PostgreSQL mediante `gen_random_uuid()`.

| Entity | Description | Main fields |
| --- | --- | --- |
| `users` | Usuarios internos del sistema. | `user_id`, `full_name`, `email`, `password_hash`, `role`, `is_active` |
| `categories` | Clasificacion de productos. | `category_id`, `name`, `description`, `is_active` |
| `products` | Productos de la farmacia. | `product_id`, `category_id`, `name`, `presentation`, `sale_price`, `current_stock`, `minimum_stock`, `expiration_date` |
| `customers` | Clientes que generan pedidos. | `customer_id`, `full_name`, `phone`, `email`, `address` |
| `carts` | Carritos de clientes. | `cart_id`, `customer_id`, `status` |
| `cart_items` | Productos dentro de un carrito. | `cart_item_id`, `cart_id`, `product_id`, `quantity`, `unit_price`, `subtotal` |
| `orders` | Pedidos realizados por clientes. | `order_id`, `customer_id`, `order_date`, `total`, `status`, `notes` |
| `order_items` | Productos incluidos en cada pedido. | `order_item_id`, `order_id`, `product_id`, `quantity`, `unit_price`, `subtotal` |
| `inventory_movements` | Movimientos y ajustes de inventario. | `movement_id`, `product_id`, `user_id`, `movement_type`, `quantity`, `reason` |

## 12. Diseno de API propuesto

| Metodo | Ruta | Proposito |
| --- | --- | --- |
| POST | `/api/auth/login` | Iniciar sesion administrativa. |
| GET | `/api/products` | Listar productos disponibles. |
| GET | `/api/products/:id` | Consultar detalle de producto. |
| POST | `/api/products` | Registrar producto. |
| PUT | `/api/products/:id` | Actualizar producto. |
| DELETE | `/api/products/:id` | Desactivar producto. |
| GET | `/api/categories` | Listar categorias. |
| POST | `/api/categories` | Registrar categoria. |
| POST | `/api/cart/items` | Agregar producto al carrito. |
| PUT | `/api/cart/items/:id` | Actualizar cantidad. |
| DELETE | `/api/cart/items/:id` | Eliminar producto del carrito. |
| POST | `/api/orders` | Registrar pedido generado desde el carrito. |
| GET | `/api/orders` | Listar pedidos para administracion. |
| PUT | `/api/orders/:id/status` | Actualizar estado de pedido. |
| GET | `/api/inventory/alerts` | Consultar bajo stock y proximos vencimientos. |
| POST | `/api/inventory/movements` | Registrar ajuste de inventario. |
| GET | `/api/reports/summary` | Consultar resumen basico del sistema. |

## 13. Estados principales

### 13.1 Estado de producto

| Estado | Descripcion |
| --- | --- |
| Disponible | Producto visible y con stock para pedido. |
| Agotado | Producto sin stock disponible. |
| Inactivo | Producto oculto del catalogo. |
| Proximo a vencer | Producto que requiere revision por fecha de vencimiento. |

### 13.2 Estado de pedido

| Estado | Descripcion |
| --- | --- |
| Pendiente | Pedido recibido, aun sin atencion. |
| En proceso | Pedido revisado por la farmacia. |
| Completado | Pedido atendido correctamente. |
| Cancelado | Pedido anulado por cliente o farmacia. |

## 14. Criterios de diseno visual

| Criterio | Aplicacion |
| --- | --- |
| Claridad | Las pantallas muestran informacion relevante sin saturar. |
| Consistencia | Botones, tablas, formularios y tarjetas mantienen apariencia uniforme. |
| Jerarquia | Titulos, subtitulos y acciones principales se diferencian visualmente. |
| Accesibilidad | El sistema mantiene buen contraste y lectura clara. |
| Responsividad | Las pantallas se adaptan a movil y escritorio. |
| Enfoque operativo | El panel administrativo prioriza rapidez y orden. |

## 15. Correspondencia con requerimientos

| Requerimiento | Modulo o pantalla relacionada |
| --- | --- |
| RF01 Gestion de productos | Productos |
| RF02 Gestion de categorias | Categorias |
| RF03 Consulta de catalogo | Catalogo |
| RF04 Filtrado por categorias | Catalogo |
| RF05 Detalle de producto | Detalle |
| RF06 Carrito de compras | Carrito |
| RF07 Generacion de pedidos | Carrito y pedidos |
| RF08 Gestion de pedidos | Pedidos |
| RF09 Control de inventario | Inventario |
| RF10 Alertas de bajo inventario | Inventario y panel administrativo |
| RF11 Alertas por vencimiento | Inventario y alertas |
| RF12 Gestion de clientes | Clientes |
| RF13 Gestion de usuarios | Usuarios |
| RF14 Reportes basicos | Reportes |

## 16. Alcance de la version inicial

La primera version funcional debe concentrarse en:

- Catalogo de productos.
- Filtro por categorias.
- Detalle de producto.
- Carrito.
- Generacion de pedidos.
- Gestion de productos y categorias.
- Control basico de stock.
- Alertas de bajo inventario y vencimiento.
- Gestion basica de pedidos.
- Reportes simples.

Quedan fuera de esta version: proveedores, compras a proveedores, detalle de compras, abastecimiento, reportes de compras, gestion contable, costos avanzados e integracion de pagos.

## 17. Conclusion

El diseno del sistema establece una version clara, profesional y alcanzable de FarmaGest Vital. La solucion se concentra en el flujo principal del proyecto y mantiene una arquitectura preparada para crecer sin obligar a desarrollar modulos innecesarios en esta etapa.
