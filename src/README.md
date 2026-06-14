# Frontend Modules

Esta carpeta contiene la extraccion gradual del antiguo `index.html` monolitico.

## Estado actual

- `config.js`: configuracion central de URL/API token.
- `api/sheet-api.js`: cliente de Google Apps Script (`sheetUrl`, `postSheet`).
- `ui/helpers.js`: constantes compartidas, fecha Ecuador, normalizacion, estado, avatar y variables globales de fotos.
- `ui/feedback.js`: toast, badge de sincronizacion, sonidos y confirmaciones visuales.
- `ui/modals.js`: apertura/cierre de modales y cierre tocando el fondo.
- `ui/navigation.js`: navegacion de pantallas owner y CEO.
- `inventario/photos.js`: carga, procesamiento y guardado de fotos de productos.
- `inventario/sync.js`: carga de productos y escritura de movimientos/stock/productos en Apps Script.
- `inventario/render.js`: dashboard de inventario, stock, alertas y filtro por area.
- `movimientos/sync.js`: carga y normalizacion de movimientos desde Apps Script.
- `movimientos/render.js`: historial owner/CEO y movimientos del dia para staff.
- `equipo/render.js`: listado visual de equipo y activacion local de usuarios.
- `reportes/helpers.js`: nombres de meses y rangos de semana/mes compartidos.
- `reportes/index.js`: dashboard de reportes, productos mas usados, staff mensual, resumen general y flujo financiero.
- `marca/index.js`: modulo Mi Marca, productos, stock, pedidos y sync basico.
- `gastos/index.js`: dashboard de gastos de inventario, filtros por periodo y carga/envio de gastos varios.
- `cierres/index.js`: carga de meses cerrados, filtro de datos cerrados y cierre mensual.
- `auth/session.js`: usuarios publicos, login, sesion local, logout, autologin y menu de sesion.

## Modulos objetivo

- `auth/`: login, sesion y permisos visuales. Parcialmente extraido.
- `inventario/`: fotos, sincronizacion y render principal extraidos.
- `movimientos/`: carga y render de movimientos extraidos; pendientes entradas, salidas, combos y kits.
- `reportes/`: helpers, resumen mensual y flujo financiero extraidos.
- `ui/`: helpers, feedback, modales y navegacion extraidos.

La migracion debe hacerse por partes pequeñas y probadas para no romper los handlers inline existentes.
