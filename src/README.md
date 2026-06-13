# Frontend Modules

Esta carpeta contiene la extraccion gradual del antiguo `index.html` monolitico.

## Estado actual

- `config.js`: configuracion central de URL/API token.
- `api/sheet-api.js`: cliente de Google Apps Script (`sheetUrl`, `postSheet`).
- `ui/helpers.js`: constantes compartidas, fecha Ecuador, normalizacion, estado, avatar y variables globales de fotos.
- `auth/session.js`: usuarios publicos, login, sesion local, logout, autologin y menu de sesion.

## Modulos objetivo

- `auth/`: login, sesion y permisos visuales. Parcialmente extraido.
- `inventario/`: productos, stock, alertas.
- `movimientos/`: entradas, salidas, combos, kits.
- `reportes/`: gastos, resumen mensual, cierres.
- `ui/`: helpers compartidos parcialmente extraidos; pendientes modales, toast y navegacion.

La migracion debe hacerse por partes pequeñas y probadas para no romper los handlers inline existentes.
