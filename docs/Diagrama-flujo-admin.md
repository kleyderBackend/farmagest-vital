# Diagrama De Flujo Del Administrador

## FarmaGest Vital

## 1. Objetivo

Representar el flujo administrativo actual: autenticacion, gestion de categorias, productos, clientes y ventas. Inventario avanzado y reportes quedan como siguientes modulos.

## 2. Diagrama

```mermaid
flowchart TD
    A([Inicio]) --> B[Ingresar al login admin]
    B --> C{Credenciales validas?}
    C -->|No| D[Mostrar error]
    D --> B
    C -->|Si| E[Guardar token y abrir dashboard]
    E --> F{Seleccionar modulo}

    F -->|Categorias| G[Gestionar categorias]
    G --> G1[Crear, editar, listar o desactivar]
    G1 --> E

    F -->|Productos| H[Gestionar productos]
    H --> H1[Crear o actualizar producto]
    H1 --> H2{Fecha vencida?}
    H2 -->|Si| H3[Rechazar operacion]
    H2 -->|No| H4[Guardar producto]
    H3 --> H
    H4 --> E

    F -->|Clientes| I[Consultar clientes]
    I --> I1[Crear o actualizar cliente]
    I1 --> E

    F -->|Ventas| J[Consultar ventas]
    J --> J1{Accion?}
    J1 -->|Buscar por ID| J2[Ver detalle de venta]
    J1 -->|Buscar por fecha| J3[Listar ventas del dia]
    J1 -->|Total vendido| J4[Consultar total vendido]
    J1 -->|Venta interna| J5[Crear venta con customerId]
    J2 --> E
    J3 --> E
    J4 --> E
    J5 --> J6[Validar stock y descontar]
    J6 --> E

    F -->|Inventario pendiente| K[Movimientos y ajustes]
    K --> E

    F -->|Reportes pendiente| L[Reportes operativos]
    L --> E

    E --> M{Cerrar sesion?}
    M -->|No| F
    M -->|Si| N([Fin])
```

## 3. Flujo Administrativo

| Paso | Accion | Resultado |
| --- | --- | --- |
| 1 | Admin o staff inicia sesion. | Recibe token JWT. |
| 2 | Entra al dashboard. | Consulta resumen y navegacion. |
| 3 | Gestiona categorias. | Organiza catalogo. |
| 4 | Gestiona productos. | Crea, edita, desactiva y valida vencimientos. |
| 5 | Gestiona clientes. | Consulta o actualiza clientes. |
| 6 | Gestiona ventas. | Consulta historial, detalle, fecha y total vendido. |
| 7 | Crea venta interna. | Usa cliente existente o datos de cliente y descuenta stock. |

## 4. Validaciones

| Validacion | Descripcion |
| --- | --- |
| Token requerido | Las rutas administrativas requieren JWT. |
| Roles validos | Solo `admin` y `staff` acceden a clientes y ventas. |
| Producto valido | Producto debe tener categoria, precio, stock y fecha valida. |
| Producto no vencido | No se vende producto vencido. |
| Stock suficiente | La venta interna no puede dejar stock negativo. |
| Cliente valido | La venta interna debe asociarse a un cliente. |

## 5. Modulos Administrativos

| Modulo | Estado |
| --- | --- |
| Auth | Implementado |
| Categorias | Implementado |
| Productos | Implementado |
| Clientes | Implementado |
| Ventas | Implementado |
| Inventario | Pendiente |
| Reportes | Pendiente |

## 6. Resultado Esperado

El personal interno puede administrar el flujo principal de la farmacia: productos, categorias, clientes y ventas. Los modulos de inventario y reportes se agregaran despues sobre la misma base.
