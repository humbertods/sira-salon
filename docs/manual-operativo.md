# Manual Operativo SIRA

Este documento explica como publicar, validar y recuperar SIRA sin depender de memoria o cambios parciales.

## Archivos Oficiales

- Frontend publicado: `apps/web/index.html`
- Manifest PWA: `apps/web/manifest.json`
- Icono PWA/favicon: `apps/web/ICON.png`
- Logo login: `apps/web/LOGO_SIRAA.png`
- Configuracion frontend: `apps/web/src/config.js`
- Cliente API frontend: `apps/web/src/api/sheet-api.js`
- Sesion/login frontend: `apps/web/src/auth/session.js`
- Backend Apps Script oficial: `backend/apps-script/main.gs`
- Archivo para copiar en Google Apps Script: `backend/apps-script/COPIAR_EN_APPS_SCRIPT.gs`

## Publicar Frontend En GitHub Pages

Usar este flujo cuando cambie `index.html`, `manifest.json`, `ICON.png`, `LOGO_SIRAA.png` o cualquier archivo dentro de `src/`.

1. Abrir el repositorio publico de GitHub donde vive GitHub Pages de SIRA.
2. Confirmar que la raiz publicada contiene estos archivos: `index.html`, `manifest.json`, `ICON.png`, `LOGO_SIRAA.png` y carpeta `src/`.
3. Reemplazar `index.html` con el contenido de `apps/web/index.html`.
4. Reemplazar `manifest.json` con el contenido de `apps/web/manifest.json` si cambio.
5. Entrar a `src/config.js` y reemplazarlo con `apps/web/src/config.js` si cambio.
6. Entrar a `src/api/sheet-api.js` y reemplazarlo con `apps/web/src/api/sheet-api.js` si cambio.
7. Entrar a `src/auth/session.js` y reemplazarlo con `apps/web/src/auth/session.js` si cambio.
8. Subir `ICON.png` y `LOGO_SIRAA.png` solo si cambiaron.
9. No subir `.DS_Store`, ZIPs, PDFs ni archivos viejos.
10. Guardar/commit en GitHub.
11. Esperar 1 o 2 minutos a que GitHub Pages publique.
12. Abrir `https://humbertods.github.io/sira-salon/`.
13. Recargar fuerte con `Cmd + Shift + R`.
14. Abrir consola del navegador con `Option + Cmd + J`.
15. Confirmar que no haya errores rojos propios de SIRA.

## Publicar Backend En Google Apps Script

Usar este flujo cuando cambie cualquier funcion backend, permisos, token, login, acciones o nombres de hojas.

1. Abrir `backend/apps-script/COPIAR_EN_APPS_SCRIPT.gs`.
2. Copiar todo el contenido del archivo.
3. Abrir el Google Sheet operativo de SIRA.
4. Ir a `Extensiones > Apps Script`.
5. Abrir el archivo `Codigo.gs` o el archivo principal actual.
6. Seleccionar todo el contenido existente.
7. Reemplazarlo completo con el contenido de `COPIAR_EN_APPS_SCRIPT.gs`.
8. Guardar con `Cmd + S`.
9. Ir a `Implementar > Gestionar implementaciones`.
10. Editar la implementacion web actual con el icono de lapiz.
11. En `Version`, seleccionar `Nueva version`.
12. Confirmar que la app web se ejecute como propietario.
13. Confirmar que el acceso permita llamadas desde GitHub Pages segun la configuracion actual.
14. Hacer clic en `Implementar`.
15. Copiar la URL `/exec` solo si cambio la implementacion.
16. Si la URL cambio, actualizar `SHEET_URL` en `apps/web/src/config.js` y publicar frontend otra vez.

## Validar Despues De Publicar

1. Abrir la app publicada.
2. Hacer login como owner.
3. Confirmar que el dashboard muestra productos y valor de stock.
4. Entrar a `Stock` y confirmar que aparecen productos.
5. Hacer clic en `Actualizar` y confirmar que sigue cargando.
6. Probar una entrada pequena de producto real o producto de prueba.
7. Probar una salida pequena de producto real o producto de prueba.
8. Revisar el Google Sheet y confirmar que movimientos y stock se actualizaron.
9. Cerrar sesion.
10. Repetir login con CEO.
11. Repetir login con staff.
12. Revisar consola del navegador.

## Como Recuperar Si Algo Falla

### La pagina no carga o se ve rota

1. Confirmar que `index.html` existe en la raiz publicada de GitHub Pages.
2. Confirmar que existen `src/config.js`, `src/api/sheet-api.js` y `src/auth/session.js`.
3. Confirmar que no quedaron archivos duplicados sueltos como `config.js`, `sheet-api.js` o `session.js` fuera de `src/`.
4. Recargar fuerte con `Cmd + Shift + R`.
5. Si sigue fallando, volver a subir el ultimo `apps/web/index.html` validado.

### Sale `0 productos`

1. Abrir consola del navegador.
2. Buscar errores como `Productos sync error`, `No autorizado`, `CORS` o `Failed to fetch`.
3. Confirmar que `apps/web/src/config.js` tiene la URL correcta de Apps Script en `SHEET_URL`.
4. Confirmar que `API_TOKEN` coincide en frontend y backend.
5. Abrir directamente la URL de Apps Script con `?token=TOKEN&t=1` para confirmar que devuelve `ok:true` y productos.
6. Si el backend devuelve productos pero la app no, volver a publicar `index.html` y `src/` completos.

### Login no entra

1. Confirmar que Apps Script publicado tiene `action === "login"` en `doPost`.
2. Confirmar que `USUARIOS` existe en backend y contiene el PIN esperado.
3. Confirmar que el token del frontend coincide con el backend.
4. Crear nueva version de Apps Script y desplegar.
5. Recargar fuerte GitHub Pages.

### Error `No autorizado`

1. Revisar `API_TOKEN` en `apps/web/src/config.js`.
2. Revisar `API_TOKEN` en `backend/apps-script/main.gs`.
3. Revisar `API_TOKEN` en `backend/apps-script/COPIAR_EN_APPS_SCRIPT.gs`.
4. Los tres valores deben ser iguales.
5. Si se corrigio backend, publicar nueva version de Apps Script.
6. Si se corrigio frontend, publicar GitHub Pages.

### Error CORS o `Failed to fetch`

1. Confirmar que la implementacion de Apps Script es una app web publicada.
2. Confirmar que se esta usando la URL `/exec`, no `/dev`.
3. Confirmar que el acceso de la app web permite llamadas desde la app publicada.
4. Crear nueva version de Apps Script.
5. Revisar si el navegador esta bloqueando por extension; probar en ventana incognito.

## Regla Importante

No pegar cambios por pedazos en Apps Script salvo emergencia. Para evitar inconsistencias, reemplazar siempre `Codigo.gs` completo con `COPIAR_EN_APPS_SCRIPT.gs`.

## Configuracion

La URL del backend y el token de API estan en:

`apps/web/src/config.js`

Si cambia la URL de Apps Script, actualizar `SHEET_URL` ahi.

Si cambia el token, actualizar:

- `apps/web/src/config.js`
- `backend/apps-script/main.gs`
- `backend/apps-script/COPIAR_EN_APPS_SCRIPT.gs`

Despues de cambiar token o URL, siempre publicar backend y frontend, y ejecutar `docs/checklist-release.md`.
