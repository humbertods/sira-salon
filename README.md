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
- `auth/session.js`: usuarios publicos, login, sesion local, logout, autologin y menu de sesion.

## Modulos objetivo

- `auth/`: login, sesion y permisos visuales. Parcialmente extraido.
- `inventario/`: fotos, sincronizacion y render principal extraidos.
- `movimientos/`: carga de movimientos extraida; pendientes render, entradas, salidas, combos y kits.
- `reportes/`: gastos, resumen mensual, cierres.
- `ui/`: helpers, feedback, modales y navegacion extraidos.

La migracion debe hacerse por partes pequeñas y probadas para no romper los handlers inline existentes.
