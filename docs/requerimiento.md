# Analisis de requerimientos

## Sistema web de gestion de inventario y pedidos para farmacia

## 1. Introduccion

Este documento define los requerimientos iniciales de FarmaGest Vital, una solucion web orientada a la gestion de productos, inventario basico, catalogo en linea, carrito y pedidos para una farmacia.

El alcance se ajusta a una primera version realista del proyecto. Por esta razon no se incluyen modulos de proveedores, compras a proveedores, detalle de compras, abastecimiento ni gestion contable avanzada. Esos procesos pueden considerarse una mejora futura si el sistema crece.

## 2. Problema identificado

Muchas farmacias pequenas y medianas controlan productos y existencias de forma manual o con herramientas poco especializadas. Esto puede generar errores de inventario, dificultad para consultar productos, falta de alertas por bajo stock y perdida de medicamentos por vencimiento.

Ademas, la ausencia de un catalogo digital limita que los clientes consulten productos, precios y disponibilidad desde internet. FarmaGest Vital busca resolver ese flujo principal mediante una plataforma sencilla, ordenada y funcional.

## 3. Objetivo de la fase

Identificar y organizar las necesidades funcionales y no funcionales del sistema, definiendo usuarios, modulos, procesos, datos principales y criterios de aceptacion que guiaran el desarrollo.

## 4. Usuarios del sistema

| Usuario | Descripcion |
| --- | --- |
| Administrador | Usuario interno encargado de gestionar productos, categorias, inventario, pedidos, usuarios y reportes basicos. |
| Personal de farmacia | Usuario operativo que consulta inventario, revisa disponibilidad y atiende pedidos generados por clientes. |
| Cliente | Usuario externo que consulta el catalogo, revisa productos, agrega articulos al carrito y genera pedidos. |

## 5. Alcance funcional

| Area | Alcance incluido |
| --- | --- |
| Area publica | Catalogo de productos, detalle de producto, filtros por categoria, carrito y generacion de pedidos. |
| Area administrativa | Gestion de productos, categorias, inventario basico, pedidos, clientes, usuarios y reportes basicos. |
| Base de datos | Almacenamiento de productos, categorias, clientes, carritos, pedidos, inventario, usuarios y ventas/pedidos atendidos. |

## 6. Requerimientos funcionales

| Codigo | Requerimiento | Descripcion | Prioridad |
| --- | --- | --- | --- |
| RF01 | Gestion de productos | El sistema debe permitir registrar, consultar, editar y desactivar productos de la farmacia. | Alta |
| RF02 | Gestion de categorias | El sistema debe permitir organizar los productos por categorias. | Alta |
| RF03 | Consulta de catalogo | El sistema debe mostrar un catalogo en linea con productos disponibles para clientes. | Alta |
| RF04 | Filtrado por categorias | El sistema debe permitir filtrar productos por categoria. | Alta |
| RF05 | Detalle de producto | El sistema debe permitir consultar informacion detallada de cada producto. | Alta |
| RF06 | Carrito de compras | El sistema debe permitir agregar productos al carrito, modificar cantidades, eliminar productos y visualizar total. | Alta |
| RF07 | Generacion de pedidos | El sistema debe permitir crear un pedido a partir del carrito. | Alta |
| RF08 | Gestion de pedidos | El administrador debe poder revisar pedidos y actualizar su estado. | Alta |
| RF09 | Control de inventario | El sistema debe controlar stock actual, entradas, salidas y ajustes basicos. | Alta |
| RF10 | Alertas de bajo inventario | El sistema debe identificar productos con stock menor o igual al minimo definido. | Media |
| RF11 | Alertas por vencimiento | El sistema debe identificar productos proximos a vencer. | Media |
| RF12 | Gestion de clientes | El sistema debe registrar los datos basicos del cliente al generar un pedido. | Media |
| RF13 | Gestion de usuarios | El sistema debe permitir usuarios internos con roles administrativos basicos. | Media |
| RF14 | Reportes basicos | El sistema debe mostrar resumenes de productos, pedidos, bajo stock y productos proximos a vencer. | Baja |

## 7. Requerimientos no funcionales

| Codigo | Requerimiento | Descripcion | Prioridad |
| --- | --- | --- | --- |
| RNF01 | Usabilidad | La interfaz debe ser clara, ordenada y facil de usar para clientes y personal de farmacia. | Alta |
| RNF02 | Diseno responsive | El sistema debe adaptarse a computador, tablet y telefono movil. | Alta |
| RNF03 | Rendimiento | Las pantallas principales deben cargar de forma rapida y permitir interaccion fluida. | Media |
| RNF04 | Consistencia visual | El sistema debe mantener identidad visual coherente en botones, formularios, tablas y tarjetas. | Alta |
| RNF05 | Seguridad basica | El sistema debe proteger el panel administrativo y evitar modificaciones no autorizadas. | Media |
| RNF06 | Integridad de datos | El sistema debe evitar registros incompletos o inconsistentes en productos, stock, clientes y pedidos. | Alta |
| RNF07 | Mantenibilidad | El codigo debe organizarse por modulos para facilitar mejoras e integracion con base de datos. | Media |

## 8. Modulos principales

| Modulo | Descripcion |
| --- | --- |
| Catalogo | Muestra productos disponibles al cliente. |
| Detalle de producto | Presenta informacion ampliada del producto. |
| Carrito | Permite administrar productos seleccionados antes de generar un pedido. |
| Pedidos | Registra y permite gestionar pedidos de clientes. |
| Productos | Permite administrar el catalogo desde el panel. |
| Categorias | Organiza los productos. |
| Inventario | Controla stock, ajustes y alertas. |
| Clientes | Guarda datos basicos asociados a pedidos. |
| Usuarios | Permite acceso administrativo. |
| Reportes | Presenta informacion basica para seguimiento del negocio. |

## 9. Datos principales

| Entidad | Datos principales |
| --- | --- |
| Producto | Identificador, categoria, nombre, presentacion, descripcion, precio, stock, stock minimo, fecha de vencimiento, disponibilidad. |
| Categoria | Identificador, nombre, descripcion y estado. |
| Cliente | Nombre, telefono, correo y direccion opcional. |
| Carrito | Cliente, estado, productos seleccionados, cantidades y total temporal. |
| Pedido | Cliente, productos solicitados, cantidades, total, fecha y estado. |
| Usuario | Nombre, correo, rol, clave protegida y estado. |
| Movimiento de inventario | Producto, tipo de movimiento, cantidad, motivo, fecha y usuario responsable. |

## 10. Reglas de negocio

| Regla | Descripcion |
| --- | --- |
| Stock disponible | Un producto no debe agregarse al carrito si no tiene stock disponible. |
| Cantidad valida | La cantidad agregada al carrito no debe superar el stock existente. |
| Pedido con productos | Todo pedido debe tener al menos un producto. |
| Total actualizado | El total del carrito debe actualizarse al modificar cantidades o eliminar productos. |
| Producto visible | Los productos inactivos o no disponibles no deben mostrarse como disponibles en el catalogo. |
| Bajo inventario | Un producto debe generar alerta cuando su stock sea menor o igual al minimo definido. |
| Vencimiento | Los productos proximos a vencer deben identificarse para revision del personal. |
| Trazabilidad | Los ajustes de inventario deben quedar registrados como movimientos. |

## 11. Fuera de alcance en esta version

| Elemento excluido | Motivo |
| --- | --- |
| Proveedores | Aumenta el alcance administrativo y no es necesario para demostrar el flujo principal. |
| Compras a proveedores | Requiere flujo de abastecimiento, costos y validaciones adicionales. |
| Detalle de compras | Depende del modulo de compras, por lo tanto se excluye. |
| Reportes de compras | No aplica sin modulo de compras. |
| Gestion contable | Supera el objetivo academico y funcional de esta primera version. |
| Costos avanzados | No son necesarios para catalogo, pedidos e inventario basico. |

## 12. Criterios de aceptacion

| Criterio | Resultado esperado |
| --- | --- |
| Catalogo | El cliente puede visualizar productos organizados por categoria. |
| Detalle | El cliente puede consultar informacion completa de un producto. |
| Carrito | El cliente puede agregar, modificar y eliminar productos del carrito. |
| Pedido | El cliente puede generar un pedido desde el carrito. |
| Productos | El administrador puede registrar y actualizar productos. |
| Inventario | El sistema permite consultar stock y alertas basicas. |
| Pedidos admin | El administrador puede revisar y cambiar estados de pedidos. |
| Responsive | La interfaz se visualiza correctamente en computador y dispositivos moviles. |

## 13. Prioridad de desarrollo

| Prioridad | Elementos |
| --- | --- |
| Alta | Catalogo, detalle de producto, carrito, pedidos, productos, categorias e inventario basico. |
| Media | Clientes, usuarios, alertas de bajo stock y vencimiento. |
| Baja | Reportes basicos y estadisticas simples. |
| Futuro | Proveedores, compras, abastecimiento, reportes de compras, pagos en linea y contabilidad. |

## 14. Conclusion

El analisis de requerimientos establece una version inicial clara y alcanzable de FarmaGest Vital. El proyecto se enfoca en resolver el flujo principal: mostrar productos, permitir pedidos de clientes y administrar productos e inventario desde un panel interno.

Este alcance es mas adecuado para completar el sistema con calidad, evitar modulos innecesarios y mantener coherencia entre documentacion, base de datos, backend y frontend.
