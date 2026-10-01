# Analisis De Requerimientos

## FarmaGest Vital

## 1. Introduccion

FarmaGest Vital es un sistema web para la gestion operativa de una farmacia. La primera version se enfoca en catalogo publico, administracion de productos y categorias, clientes, ventas, stock y alertas basicas.

El proyecto excluye proveedores, compras a proveedores, detalle de compras, abastecimiento, costos avanzados y contabilidad. Esos procesos no son necesarios para demostrar el flujo principal del sistema.

## 2. Problema Identificado

Muchas farmacias pequenas controlan sus productos, vencimientos y existencias con procesos manuales. Esto puede generar errores de stock, perdida de productos vencidos, dificultad para consultar disponibilidad y poca visibilidad para los clientes.

FarmaGest Vital busca centralizar el catalogo, el panel administrativo y el flujo de venta en una plataforma clara y mantenible.

## 3. Usuarios Del Sistema

| Usuario | Descripcion |
| --- | --- |
| Cliente | Usuario externo que consulta productos y finaliza una compra sin crear cuenta. |
| Administrador | Usuario interno con acceso al panel para administrar productos, categorias, clientes, ventas y reportes. |
| Personal de farmacia | Usuario interno que puede atender ventas, consultar clientes e inventario. |

## 4. Alcance Actual

| Area | Incluido actualmente | Pendiente |
| --- | --- | --- |
| Autenticacion | Register, login, JWT y roles `admin`/`staff`. | Administracion completa de usuarios internos. |
| Productos | CRUD, busqueda, stock, vencimiento y disponibilidad. | Carga de imagenes y filtros avanzados. |
| Categorias | CRUD y estado activo/inactivo. | Mejoras de ordenamiento. |
| Clientes | Gestion administrativa y creacion automatica en checkout. | Historial visual en frontend. |
| Ventas | Checkout publico, venta interna, detalle, descuento de stock, historial y total vendido. | Vista completa en frontend admin. |
| Carrito | Carrito visual en frontend. | Persistencia backend del carrito. |
| Inventario | Stock en productos y descuento por venta. | Movimientos de inventario y ajustes manuales. |
| Reportes | Total vendido desde ventas. | Reportes de productos mas vendidos, vencidos y bajo stock. |

## 5. Requerimientos Funcionales

| Codigo | Requerimiento | Descripcion | Estado |
| --- | --- | --- | --- |
| RF01 | Autenticacion administrativa | El sistema debe permitir login y control por roles para el panel. | Implementado |
| RF02 | Gestion de categorias | El sistema debe permitir crear, listar, buscar, actualizar y desactivar categorias. | Implementado |
| RF03 | Gestion de productos | El sistema debe permitir crear, listar, buscar, actualizar y desactivar productos. | Implementado |
| RF04 | Validacion de vencimiento | El sistema debe impedir registrar productos con fecha vencida y alertar productos vencidos o por vencer. | Implementado |
| RF05 | Gestion de clientes | El sistema debe permitir consultar, crear y actualizar clientes desde el panel. | Implementado |
| RF06 | Checkout publico | El cliente debe poder finalizar compra sin registrarse, ingresando datos basicos. | Implementado en backend |
| RF07 | Creacion de venta | El sistema debe crear venta, detalle, total y descontar stock. | Implementado |
| RF08 | Historial de ventas | El personal debe poder consultar ventas registradas. | Implementado |
| RF09 | Busqueda de ventas | El sistema debe permitir buscar ventas por ID y fecha. | Implementado |
| RF10 | Total vendido | El sistema debe calcular total vendido general o por rango de fechas. | Implementado |
| RF11 | Carrito persistente | El sistema debe guardar carrito y sus items antes del checkout. | Pendiente |
| RF12 | Movimientos de inventario | El sistema debe registrar entradas, salidas y ajustes. | Pendiente |
| RF13 | Reportes operativos | El sistema debe mostrar reportes de stock bajo, vencimientos y ventas. | Pendiente |
| RF14 | Dashboard administrativo | El panel debe mostrar metricas generales. | Parcial |

## 6. Requerimientos No Funcionales

| Codigo | Requerimiento | Descripcion |
| --- | --- | --- |
| RNF01 | Seguridad | Las rutas administrativas deben requerir JWT y roles. |
| RNF02 | Integridad | Las ventas deben ejecutarse en transaccion para evitar ventas parciales. |
| RNF03 | Usabilidad | La interfaz debe ser clara para cliente y personal administrativo. |
| RNF04 | Responsive | Las pantallas deben adaptarse a movil y escritorio. |
| RNF05 | Mantenibilidad | El backend debe organizarse por modulos, controllers, services y repositories. |
| RNF06 | Consistencia | La documentacion, base de datos y backend deben usar nombres coherentes. |

## 7. Reglas De Negocio

| Regla | Descripcion |
| --- | --- |
| Cliente sin cuenta | El cliente publico no crea usuario ni usa token; sus datos se capturan en checkout. |
| Cliente por email | En checkout, si el email ya existe, se reutiliza el cliente. |
| Producto vendible | Un producto debe estar activo, disponible, con stock y no vencido para venderse. |
| Stock suficiente | La cantidad vendida no puede superar el stock actual. |
| Venta transaccional | Si falla un producto, cliente, stock o detalle, se revierte toda la venta. |
| Precio historico | El detalle de venta guarda el precio unitario usado al momento de vender. |
| Bajo stock | Un producto esta en alerta si `current_stock <= minimum_stock`. |
| Fecha vencida | No se permite crear o actualizar productos con fecha de vencimiento anterior a hoy. |

## 8. Modulos Del Backend

| Modulo | Estado | Responsabilidad |
| --- | --- | --- |
| `auth` | Implementado | Login, registro, JWT y roles. |
| `categories` | Implementado | Gestion de categorias. |
| `products` | Implementado | Gestion de productos, stock y vencimientos. |
| `customers` | Implementado | Gestion administrativa de clientes. |
| `sales` | Implementado | Checkout, ventas, detalle, stock e historial. |
| `cart` | Pendiente | Persistir carrito antes del checkout. |
| `inventory` | Pendiente | Movimientos y ajustes de inventario. |
| `reports` | Pendiente | Reportes administrativos. |

## 9. Fuera De Alcance

| Elemento excluido | Motivo |
| --- | --- |
| Proveedores | No es necesario para el flujo principal. |
| Compras a proveedores | Aumenta el alcance y requiere abastecimiento. |
| Detalle de compras | Depende del modulo de compras. |
| Reportes de compras | No aplica sin compras. |
| Gestion contable | Supera la primera version academica. |
| Costos avanzados | No son necesarios para catalogo, ventas e inventario basico. |
| Pagos en linea | Puede agregarse en una version futura. |

## 10. Criterios De Aceptacion

| Criterio | Resultado esperado |
| --- | --- |
| Login | Un admin o staff puede iniciar sesion y recibir token. |
| Productos | El admin puede crear y editar productos validando categoria, precio, stock y vencimiento. |
| Categorias | El admin puede organizar productos por categorias. |
| Checkout | Un cliente puede finalizar compra con datos basicos sin token. |
| Venta | El sistema crea venta, detalle y descuenta stock correctamente. |
| Clientes | El sistema guarda o reutiliza clientes por email. |
| Historial | El personal puede consultar ventas por ID, fecha y rango. |
| Seguridad | Las rutas administrativas no responden sin token valido. |

## 11. Prioridad De Desarrollo

| Prioridad | Elementos |
| --- | --- |
| Alta | Conectar checkout frontend, completar carrito backend, vistas admin de ventas/clientes. |
| Media | Inventario con movimientos, dashboard API y reportes basicos. |
| Baja | Mejoras visuales, filtros avanzados, exportaciones. |
| Futuro | Pagos, proveedores, compras, contabilidad. |

## 12. Conclusion

La documentacion queda alineada con el desarrollo actual: el sistema ya tiene base funcional para autenticacion, productos, categorias, clientes y ventas. El siguiente paso logico es completar carrito, inventario, reportes y la conexion visual del checkout con el backend.
