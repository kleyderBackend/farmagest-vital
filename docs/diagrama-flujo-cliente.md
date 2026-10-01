# Diagrama De Flujo Del Cliente

## FarmaGest Vital

## 1. Objetivo

Representar el recorrido del cliente desde el catalogo hasta el checkout publico. El cliente no crea cuenta ni inicia sesion; sus datos se capturan al finalizar la compra.

## 2. Diagrama

```mermaid
flowchart TD
    A([Inicio]) --> B[Ingresar al sitio]
    B --> C[Ver pagina principal]
    C --> D[Entrar al catalogo]
    D --> E{Filtrar por categoria?}
    E -->|Si| F[Seleccionar categoria]
    F --> G[Mostrar productos filtrados]
    E -->|No| H[Mostrar productos disponibles]
    G --> I[Seleccionar producto]
    H --> I
    I --> J[Ver detalle]
    J --> K{Producto disponible y con stock?}
    K -->|No| L[Mostrar no disponible]
    L --> D
    K -->|Si| M[Seleccionar cantidad]
    M --> N{Cantidad valida?}
    N -->|No| M
    N -->|Si| O[Agregar al carrito]
    O --> P{Agregar mas productos?}
    P -->|Si| D
    P -->|No| Q[Ir al carrito]
    Q --> R[Revisar productos y total]
    R --> S{Modificar carrito?}
    S -->|Si| T[Actualizar cantidades o eliminar item]
    T --> R
    S -->|No| U[Ingresar datos de cliente]
    U --> V{Datos completos?}
    V -->|No| U
    V -->|Si| W[Confirmar checkout]
    W --> X[Enviar a POST /api/sales/checkout]
    X --> Y{Venta valida?}
    Y -->|No| Z[Mostrar error]
    Z --> R
    Y -->|Si| AA[Registrar venta y descontar stock]
    AA --> AB[Mostrar resumen]
    AB --> AC([Fin])
```

## 3. Descripcion

| Paso | Accion | Resultado |
| --- | --- | --- |
| 1 | Cliente entra al sitio. | Se muestra inicio y catalogo. |
| 2 | Consulta productos. | Ve productos disponibles. |
| 3 | Revisa detalle. | Confirma precio, presentacion y disponibilidad. |
| 4 | Agrega productos al carrito. | El carrito visual se actualiza. |
| 5 | Revisa carrito. | Puede ajustar cantidades o eliminar productos. |
| 6 | Ingresa datos. | Nombre, telefono, correo y direccion opcional. |
| 7 | Confirma compra. | El frontend envia checkout al backend. |
| 8 | Backend valida venta. | Crea o reutiliza cliente, valida stock y vencimiento. |
| 9 | Backend registra venta. | Crea `orders`, `order_items` y descuenta stock. |

## 4. Validaciones

| Validacion | Descripcion |
| --- | --- |
| Datos de cliente | Nombre, telefono y correo son obligatorios. |
| Producto activo | El producto debe estar activo y disponible. |
| Producto no vencido | No se vende un producto con fecha vencida. |
| Stock suficiente | La cantidad solicitada no puede superar el stock. |
| Venta atomica | Si falla un item, se revierte toda la operacion. |

## 5. Resultado Esperado

El cliente completa una compra sin registrarse. El sistema guarda o reutiliza sus datos por email, registra la venta y actualiza stock.
