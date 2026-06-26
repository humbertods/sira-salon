# Seguridad

## Estado actual

SIRA tiene una barrera de API token entre el frontend y Google Apps Script, login por PIN en backend y sesion firmada para autorizar escrituras.

## Token actual

- Backend: `backend/apps-script/main.gs`, constantes `API_TOKEN_PUBLIC` y `API_TOKEN_BRIDGE`.
- Frontend: `apps/web/src/config.js`, valor `API_TOKEN` dentro de `window.SIRA_CONFIG`.

Todas las llamadas GET agregan `token` como query param mediante `sheetUrl()`.

Todas las llamadas POST agregan `token` al payload mediante `postSheet()`.

Las escrituras de la PWA tambien agregan `sessionToken`, emitido por el backend al iniciar sesion.

## Limitacion importante

El token publico no es seguridad fuerte porque vive en el frontend publicado. Sirve como identificador de app y barrera contra llamadas casuales, pero la autorizacion de escrituras depende del `sessionToken` firmado.

Los PINs ahora viven en `backend/apps-script/main.gs`, dentro de `USUARIOS`. Esto evita exponerlos al usuario final en la app publicada, pero todavia deben moverse a `PropertiesService` o una hoja protegida antes de una integracion productiva con Nexserv.

## Login actual

- Frontend llama `postSheet({ action: 'login', codigo })`.
- Backend valida el codigo contra `USUARIOS`.
- Backend devuelve usuario publico y `sessionToken` firmado.
- Frontend guarda `sessionToken` en `localStorage` junto con la sesion.
- En cada escritura, backend valida firma, expiracion, usuario activo y rol real.
- El HTML ya no contiene PINs.

## Permisos por rol

El backend valida permisos por accion usando el usuario recuperado desde `sessionToken`, no desde `userId`/`userRol` del navegador.

- `owner`: puede ejecutar todas las acciones.
- `ceo`: puede registrar movimientos, productos, marca, gastos y stock.
- `staff`: puede registrar movimientos simples y batches operativos.

Acciones sensibles:

- `guardarFoto`: solo `owner`.
- `cierreMes`: solo `owner`.
- `gastoVarios`: `owner`, `ceo`.
- `nuevoProducto`: `owner`, `ceo`.
- `actualizarStock`: `owner`, `ceo`.

## Compatibilidad puente

El token `API_TOKEN_BRIDGE` conserva compatibilidad server-to-server para NexServ. La PWA publicada debe usar `API_TOKEN_PUBLIC` y sesion firmada.

## Limitaciones actuales

- Los PINs siguen en `USUARIOS` dentro del codigo backend.
- `SESSION_SECRET_FALLBACK` existe como respaldo; para produccion comercial debe definirse `SIRA_SESSION_SECRET` en `PropertiesService`.
- Las lecturas GET siguen protegidas solo por token publico; para modo comercial multiempresa deben requerir sesion o aislamiento por cliente.

## Siguiente fase recomendada

- Mover usuarios y PINs desde codigo backend hacia `PropertiesService` o una hoja protegida.
- Definir `SIRA_SESSION_SECRET` en Script Properties y rotar secretos antes de produccion.
- Rotar `API_TOKEN` cuando se publique una version final.
