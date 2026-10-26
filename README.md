# FarmaGest Vital

Sistema académico de catálogo, pedidos e inventario para farmacia. Frontend con HTML, CSS y JavaScript; API con Express y TypeScript; MySQL o PostgreSQL.

## Ejecutar

1. Usa Node.js 22 o superior y pnpm. Desde la raíz ejecuta `pnpm install`.
2. Copia `.env.example` a `.env` y configura tu base de datos y un `JWT_SECRET` aleatorio. No publiques ese archivo.
3. En local, inicia MySQL desde XAMPP e importa `backends/src/db/db.sql` en una base de desarrollo vacía. En Render, configura `DATABASE_URL` para PostgreSQL; las tablas se inicializan al arrancar. No importes datos de demostración sobre una base de producción.
4. Usa una cuenta administradora existente. En una base nueva, el primer administrador debe crearse en la tabla `users` con la contraseña protegida mediante bcrypt; el registro por API requiere una sesión administradora.
5. Inicia la API con `pnpm start:dev` desde `backends/` (puerto 3000). Sirve el frontend con Live Server o Apache de XAMPP.
6. Abre `index.html` desde ese servidor y accede al panel en `frontends/dashboards/auth/login.html`, bajo la misma URL base.

Los comandos `npm run` solo ejecutan los scripts; las dependencias y el lockfile se gestionan con pnpm. Si ya tienes `backends/.env`, se conserva como configuración de respaldo; las variables cargadas desde el archivo de la raíz tienen prioridad al arrancar el servidor.

## Organización

Los módulos de inventario y usuarios siguen el patrón existente: archivo de rutas y tipos, carpetas `controllers`, `services` y `repositories`. Las rutas asignan middleware y controladores; los controladores manejan HTTP; los servicios validan y coordinan transacciones; los repositorios ejecutan SQL.

Las pantallas administrativas nuevas reutilizan `dashboard-general.css`, `products-admin.css` y sus componentes de formularios, tablas y mensajes.

## Funciones

- Catálogo, filtros, detalle, carrito, checkout y seguimiento con número de pedido y correo de compra. El seguimiento se consulta mediante POST; el correo no viaja en la URL.
- Productos, categorías, clientes y pedidos. El precio y la disponibilidad se verifican en el servidor.
- Inventario: entradas, salidas y ajustes con motivo y responsable. En un ajuste, la cantidad es el stock final contado. El historial muestra los últimos 500 movimientos; no se eliminan los anteriores de la base.
- Las compras descuentan stock y registran salidas dentro de la misma transacción. Los movimientos de una compra pública llevan responsable nulo y el número de pedido como motivo.
- Una cancelación devuelve stock una sola vez y registra la entrada en la misma transacción. Flujo permitido: pendiente → preparando → en camino → entregado. Los estados anteriores a entrega pueden pasar a cancelado. Entregado y cancelado son finales.
- Alertas de stock mínimo, productos vencidos y vencimientos dentro de 30 días. Un producto que vence hoy puede comprarse; el catálogo excluye vencidos, inactivos y productos sin existencias.
- Usuarios internos: creación, edición, roles, activación y cambio de contraseña. Solo administradores gestionan usuarios; el personal puede operar inventario y pedidos. No se permite desactivar o degradar la propia cuenta ni dejar el sistema sin administrador activo.
- Resumen de productos, pedidos, alertas y valor de pedidos entregados en Reportes.

Al arrancar, la migración de inventario permite un responsable nulo para compras públicas, conservando la clave foránea para las operaciones del personal. Los movimientos anteriores se conservan. Las modificaciones históricas que nunca se registraron no se reconstruyen.

## Verificación

Las capturas de los formularios de acceso y pedido, y de las tablas de MySQL en phpMyAdmin, están en [docs/evidencias/README.md](docs/evidencias/README.md). Incluyen el formulario vacío y diligenciado con datos ficticios, sin enviar compras, y las dos imágenes de la base de datos proporcionadas por el usuario.

### Formulario de acceso

![Formulario de acceso](docs/evidencias/formulario-acceso.jpg)

### Formulario de pedido vacío

![Formulario de pedido vacío](docs/evidencias/formulario-pedido-vacio.jpg)

### Formulario de pedido diligenciado

Datos ficticios de prueba; el pedido no fue enviado.

![Formulario de pedido diligenciado](docs/evidencias/formulario-pedido-diligenciado.jpg)

### Tablas de MySQL

Captura de phpMyAdmin proporcionada por el usuario. Muestra las tablas y su número de filas, sin el contenido de los registros.

![Tablas de MySQL en phpMyAdmin](docs/evidencias/mysql-tablas.png)

### Estructura de la base de datos

![Base farma_vital y sus tablas](docs/evidencias/mysql-estructura.png)

Las capturas de la base de datos no demuestran que el formulario mostrado haya guardado esos registros. La evidencia de consola todavía está pendiente.

### Comprobaciones del proyecto

`npm run typecheck` comprueba TypeScript. `npm test` ejecuta pruebas de inventario, rollback, estados, cancelación repetida y concurrente, checkout, vencimientos, autorización y privacidad del seguimiento.

Las pruebas utilizan un doble transaccional de base de datos y un servidor HTTP temporal; no escriben en la base configurada. En Windows, el entorno debe permitir conexiones a localhost para las pruebas HTTP. Estas pruebas no sustituyen la validación final con MySQL/PostgreSQL.

Para comprobar la instalación con tu base de desarrollo: crea un producto con stock, registra una entrada y un ajuste, realiza una compra desde el catálogo, comprueba su seguimiento con correo correcto e incorrecto, cancela el pedido dos veces y verifica que el stock se reponga una sola vez. Comprueba también que un usuario de personal no pueda administrar usuarios y que una cuenta desactivada pierda acceso.

## Configuración de despliegue

La API local usa el puerto 3000. El puerto del frontend depende de Live Server o Apache de XAMPP. Para otros dominios, configura `CORS_ORIGINS` como una lista de orígenes separados por comas. La URL de API de producción está en `frontends/js/api.js`; puede sobrescribirse mediante `farmagestApiUrl` en el almacenamiento local del navegador.

Si una instalación anterior usa la cuenta de demostración, cambia su contraseña desde Usuarios; el arranque ya no la restablece. La limitación de intentos se mantiene en memoria por instancia. No se ha realizado despliegue ni migración de una base remota como parte de estos cambios.

Pagos en línea, proveedores, compras a proveedores y contabilidad quedan fuera del alcance de esta versión, según `docs/requerimiento.md`.
