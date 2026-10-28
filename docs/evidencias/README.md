# Evidencias de formularios y base de datos

Formularios originales y MySQL: 25 de octubre de 2026. Flujo POO: 27 de octubre de 2026.

Las capturas de formularios se tomaron del frontend abierto en un navegador mediante un servidor local. No se modificó la interfaz para generar estas imágenes. Las dos capturas de MySQL fueron proporcionadas por el usuario.

## Formulario de acceso

Página: `frontends/dashboards/auth/login.html`.

Se comprobó la visualización de los campos de usuario y contraseña y del botón de ingreso. No se introdujeron credenciales ni se inició sesión; los textos visibles son los placeholders del formulario.

![Formulario de acceso](formulario-acceso.jpg)

## Formulario de pedido vacío

Página: `frontends/ecommerce/formularyOfShoip.html`.

Se comprobó la visualización de datos del cliente, dirección, método de pago y resumen del carrito vacío.

![Formulario de pedido vacío](formulario-pedido-vacio.jpg)

## Formulario de pedido diligenciado

Se rellenaron los campos con datos ficticios: Cliente de prueba, prueba@example.com, teléfono de prueba, dirección ficticia y nota explicativa. El carrito permaneció vacío y no se pulsó Finalizar compra.

![Formulario de pedido diligenciado](formulario-pedido-diligenciado.jpg)

## Base de datos MySQL: tablas

Captura proporcionada por el usuario desde phpMyAdmin. Muestra nueve tablas con motor InnoDB: `carts`, `cart_items`, `categories`, `customers`, `inventory_movements`, `orders`, `order_items`, `products` y `users`.

La vista informa una fila en cada una de las tablas `categories`, `customers`, `orders`, `order_items`, `products` y `users`. Las tablas `carts`, `cart_items` e `inventory_movements` aparecen sin filas. No se muestran los valores de los registros.

![Tablas y número de filas en MySQL](mysql-tablas.png)

## Base de datos MySQL: árbol de tablas

La segunda captura identifica la base `farma_vital` y sus nueve tablas en el panel lateral de phpMyAdmin.

![Estructura de farma_vital en phpMyAdmin](mysql-estructura.png)

## Compra simulada con POO

Prueba del 27 de octubre de 2026: se agregaron dos productos del catálogo JSON, se cotizó el envío a Bogotá con clima y divisas consultados, se validó una tarjeta ficticia y se generó un recibo. Después se recargó la página y se abrió el recibo desde el historial: conservó el identificador, los importes y la tasa de cambio. También se verificó el diseño a 390 píxeles de ancho sin desbordamiento horizontal.

La revisión de la vista final se repitió con una unidad de producto, destino Medellín y medios de pago simulados. Las capturas actualizadas muestran la vista final con el recibo reconstruido y el historial local. Tras confirmar, se ocultan el formulario y el resumen del carrito vacío; al recargar permanece el recibo con los mismos importes. La operación está rotulada **COMPRA SIMULADA - SIN COBRO**; no creó un pedido en MySQL ni efectuó un pago. El recibo JSON no contiene datos de contacto ni datos bancarios.

![Recibo e historial de la compra simulada](recibo-poo.jpg)

[Ver detalle del recibo y el historial](recibo-poo-detalle.jpg).

## Alcance de las evidencias

Las imágenes documentan los formularios, una compra simulada completa y la existencia de tablas y registros en la base mostrada. No permiten atribuir esos registros al formulario diligenciado: ese pedido no se envió. Para demostrar el flujo real de persistencia falta capturar una prueba enviada al backend, la consola y el contenido del registro correspondiente en MySQL.
