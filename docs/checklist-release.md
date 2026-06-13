# Checklist Release SIRA

Usar despues de cada cambio en frontend o backend. Una version solo queda aprobada si todas las pruebas criticas pasan.

## Datos Del Release

- Fecha:
- Responsable:
- Cambio publicado:
- URL GitHub Pages: `https://humbertods.github.io/sira-salon/`
- URL Apps Script `/exec`:
- Resultado final: `Aprobado` / `No aprobado`

## 1. Antes De Publicar

- Confirmar que `apps/web/index.html` carga `src/config.js`, `src/api/sheet-api.js` y `src/auth/session.js`.
- Confirmar que `apps/web/manifest.json` apunta a archivos existentes.
- Confirmar que existen `apps/web/ICON.png` y `apps/web/LOGO_SIRAA.png`.
- Confirmar que `backend/apps-script/main.gs` y `backend/apps-script/COPIAR_EN_APPS_SCRIPT.gs` estan sincronizados.
- Verificar que no haya PINs en `apps/web/index.html`.
- Verificar que `SHEET_URL` apunta a la implementacion correcta de Apps Script.
- Verificar que `API_TOKEN` coincide en frontend y backend.
- Confirmar que no se publican `.DS_Store`, ZIPs, PDFs ni archivos viejos.

## 2. Publicacion Frontend

- Subir/reemplazar `index.html`.
- Subir/reemplazar `manifest.json` si cambio.
- Subir/reemplazar `src/config.js` si cambio.
- Subir/reemplazar `src/api/sheet-api.js` si cambio.
- Subir/reemplazar `src/auth/session.js` si cambio.
- Confirmar que GitHub Pages termino de publicar.
- Abrir la URL publicada.
- Recargar fuerte con `Cmd + Shift + R`.

## 3. Publicacion Backend

- Reemplazar completo `Codigo.gs` con `backend/apps-script/COPIAR_EN_APPS_SCRIPT.gs` si hubo cambios backend.
- Guardar Apps Script.
- Crear `Nueva version` en la implementacion web.
- Confirmar que se usa URL `/exec`.
- Si cambio la URL, actualizar `SHEET_URL` y volver a publicar frontend.

## 4. Pruebas Login

- PIN incorrecto muestra error y no entra.
- Login owner entra correctamente.
- Login CEO entra correctamente.
- Login staff entra correctamente.
- Cerrar sesion funciona.
- Recargar la pagina mantiene o recupera la sesion correctamente.

## 5. Pruebas Inventario

- Al entrar como owner, el dashboard muestra total de productos mayor a 0.
- Al entrar a `Stock`, aparecen productos reales del Sheet.
- La busqueda de productos filtra resultados.
- El boton `Actualizar` recarga sin dejar la app en blanco.
- Registrar una entrada actualiza el stock en pantalla.
- Registrar una salida actualiza el stock en pantalla.
- Revisar en Google Sheets que el stock quedo actualizado.
- Recargar fuerte y confirmar que el stock persiste.

## 6. Pruebas Movimientos

- Registrar movimiento individual.
- Verificar que aparece en historial/movimientos.
- Verificar que aparece en la hoja de movimientos.
- Registrar combo o bebida si aplica.
- Registrar kit si aplica.
- Confirmar que movimientos agrupados comparten `grupo`.
- Confirmar que no permite salida con stock insuficiente.

## 7. Pruebas Gastos Y Reportes

- Registrar gasto varios como owner o CEO.
- Confirmar que se crea o actualiza la hoja `💸 Gastos Varios`.
- Confirmar que reportes cargan sin errores.
- Confirmar que valor de stock se calcula en owner.
- Confirmar que cierres mensuales funcionan si aplica.

## 8. Pruebas Marca

- Abrir seccion de marca como owner.
- Abrir seccion de marca como CEO.
- Confirmar que carga productos de marca si existen en Sheet.
- Registrar producto de marca si aplica.
- Actualizar stock de marca si aplica.

## 9. Pruebas Permisos

- Staff puede registrar movimientos permitidos.
- Staff no debe ver pantallas owner.
- Staff no debe poder ejecutar acciones administrativas.
- CEO puede ver las pantallas permitidas.
- Owner puede acceder a todas las funciones.
- Si se fuerza una accion no permitida desde API, backend responde permiso insuficiente.

## 10. Consola Navegador

- No debe haber errores `Login error` usando PIN correcto.
- No debe haber errores CORS.
- No debe haber errores `No autorizado` usando app normal.
- No debe haber errores `Productos sync error`.
- No debe haber errores `postSheet is not defined`.
- No debe haber errores `loginConCodigo is not defined`.
- No debe haber 404 de `src/config.js`, `src/api/sheet-api.js` o `src/auth/session.js`.
- Un warning de extension del navegador no bloquea release si la app funciona.

## 11. Criterios De Aprobacion

- La app abre desde GitHub Pages.
- Login funciona para owner, CEO y staff.
- Productos cargan desde Google Sheets.
- Entrada y salida actualizan pantalla y Sheet.
- No hay errores rojos propios de SIRA en consola.
- Apps Script publicado corresponde a la version actual.
- Documentacion actualizada.

## 12. Si No Aprueba

- Anotar el error exacto.
- Tomar captura de consola.
- No hacer cambios al azar.
- Revisar `docs/manual-operativo.md`, seccion `Como Recuperar Si Algo Falla`.
- Corregir el archivo especifico.
- Publicar otra vez.
- Repetir este checklist desde el punto afectado.
