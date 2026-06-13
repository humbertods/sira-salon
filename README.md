# SIRA

Sistema Inteligente de Registro y Administracion para inventario operativo del salon.

## Estado Final

SIRA queda organizado como una aplicacion web/PWA publicada con GitHub Pages y conectada a Google Sheets mediante Google Apps Script.

Estado actual:

- Frontend modularizado parcialmente y listo para publicacion.
- Login seguro validado en backend, sin PINs en el HTML.
- Operaciones principales conectadas a Apps Script.
- Backend con router por `action`.
- Documentacion operativa y checklist de release disponibles.

## Archivos Oficiales

- Frontend PWA: `apps/web/index.html`
- Manifest PWA: `apps/web/manifest.json`
- Configuracion frontend: `apps/web/src/config.js`
- Cliente API frontend: `apps/web/src/api/sheet-api.js`
- Sesion/login frontend: `apps/web/src/auth/session.js`
- Backend Google Apps Script: `backend/apps-script/main.gs`
- Archivo completo para copiar en Apps Script: `backend/apps-script/COPIAR_EN_APPS_SCRIPT.gs`

## Estructura

- `apps/web/`: aplicacion web/PWA actual.
- `apps/web/src/`: archivos frontend separados por responsabilidad.
- `backend/apps-script/`: backend actual basado en Google Apps Script.
- `backend/api-contract/`: contrato API observado e inicio de especificacion futura.
- `docs/`: documentacion tecnica, operativa y decisiones de arquitectura.
- `data/samples/`: ejemplos de datos para pruebas/migracion.
- `archive/old-versions/`: versiones anteriores conservadas como referencia.
- `archive/artifacts/`: binarios, ZIPs u otros artefactos no operativos.
- `private/`: documentos privados, PDFs y archivos Excel.

## Publicacion

Frontend:

- Se publica en GitHub Pages desde la carpeta/raiz configurada del repositorio publico.
- Los archivos que deben existir publicados son `index.html`, `manifest.json`, `ICON.png`, `LOGO_SIRAA.png` y la carpeta `src/`.

Backend:

- Se publica desde Google Apps Script asociado al Google Sheet de SIRA.
- Para actualizarlo, reemplazar completo `Codigo.gs` con `backend/apps-script/COPIAR_EN_APPS_SCRIPT.gs` y crear una nueva version de la implementacion.

## Configuracion Critica

- `SHEET_URL` vive en `apps/web/src/config.js`.
- `API_TOKEN` del frontend vive en `apps/web/src/config.js`.
- `API_TOKEN` del backend vive en `backend/apps-script/main.gs` y `backend/apps-script/COPIAR_EN_APPS_SCRIPT.gs`.
- Si se cambia el token, debe actualizarse en los tres lugares.

## Operacion Normal

Antes de considerar una version como lista:

- Ejecutar el checklist de `docs/checklist-release.md`.
- Confirmar que la consola del navegador no tenga errores rojos propios de SIRA.
- Confirmar que el inventario carga productos desde Google Sheets.
- Probar login y operaciones con owner, CEO y staff.

## Documentos Tecnicos

- Manual operativo: `docs/manual-operativo.md`
- Checklist release: `docs/checklist-release.md`
- Seguridad: `docs/seguridad.md`
- Hojas usadas por backend: `docs/hojas-backend.md`
- Brechas frontend/backend: `docs/brechas-backend-frontend.md`
- Transicion CORS: `docs/cors-transicion.md`
- Contrato API observado: `backend/api-contract/sira-api-v0.md`
- OpenAPI inicial: `backend/api-contract/openapi.yaml`
- Integracion Nexserv: `docs/integracion-nexserv.md`

## Regla De Mantenimiento

No editar versiones antiguas dentro de `archive/`. Todo cambio operativo debe hacerse sobre los archivos oficiales listados arriba.
