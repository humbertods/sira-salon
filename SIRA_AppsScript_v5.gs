// ============================================================
//  SIRA — Google Apps Script v5.2
//  Fecha y hora como strings limpios
// ============================================================

const HOJA_STOCK    = "📦 Stock Actual";
const HOJA_MOVS     = "📋 Movimientos";
const HOJA_ALERTAS  = "🚨 Alertas";
const HOJA_MARCA    = "💄 Marca";
const FILA_INICIO   = 8;
const COL_NOMBRE    = 2;
const COL_AREA      = 3;
const COL_CATEGORIA = 4;
const COL_UNIDAD    = 5;
const COL_STOCK     = 6;
const COL_MIN       = 7;
const COL_ESTADO    = 8;
const COL_COSTO     = 9;
const COL_VALOR     = 10;
const COL_FECHA     = 11;
const COL_NOTAS     = 12;
const EMAIL_ALERTAS = "tumarcadigital7@gmail.com";
const TZ            = "America/Guayaquil";

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function formatFecha(val) {
  if (!val) return '';
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val).substring(0,10);
    return Utilities.formatDate(d, TZ, 'yyyy-MM-dd');
  } catch(e) { return String(val).substring(0,10); }
}

function formatHora(val) {
  if (!val) return '';
  try {
    // Si Sheets devuelve un objeto Date nativo, formatearlo directo con TZ
    if (val instanceof Date && !isNaN(val.getTime())) {
      return Utilities.formatDate(val, TZ, 'HH:mm');
    }
    // Si es string, extraer HH:MM con regex
    const s = String(val);
    const match = s.match(/(\d{1,2}):(\d{2})/);
    if (match) return match[1].padStart(2,'0') + ':' + match[2];
    return '';
  } catch(e) { return ''; }
}

function doGet(e) {
  try {
    const action   = (e.parameter && e.parameter.action) || 'getProductos';
    const callback = (e.parameter && e.parameter.callback) || null;
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let data;

    if (action === 'getProductos') {
      const ws = ss.getSheetByName(HOJA_STOCK);
      const lastRow = ws.getLastRow();
      if (lastRow < FILA_INICIO) {
        data = { ok: true, productos: [] };
      } else {
        const datos = ws.getRange(FILA_INICIO, 1, lastRow - FILA_INICIO + 1, 12).getValues();
        const productos = datos
          .filter(row => row[COL_NOMBRE-1] && row[COL_NOMBRE-1] !== '')
          .map((row, i) => ({
            id:     FILA_INICIO + i,
            nombre: String(row[COL_NOMBRE-1]),
            area:   String(row[COL_AREA-1] || ''),
            unidad: String(row[COL_UNIDAD-1] || 'Unidad'),
            stock:  Number(row[COL_STOCK-1]) || 0,
            min:    Number(row[COL_MIN-1]) || 0,
            costo:  Number(row[COL_COSTO-1]) || 0,
            notas:  String(row[COL_NOTAS-1] || ''),
          }));
        data = { ok: true, productos };
      }

    } else if (action === 'getMarca') {
      const ws = ss.getSheetByName(HOJA_MARCA);
      if (!ws) { data = { ok: true, productos: [] }; }
      else {
        const lastRow = ws.getLastRow();
        if (lastRow < 2) { data = { ok: true, productos: [] }; }
        else {
          const datos = ws.getRange(2, 1, lastRow-1, 6).getValues();
          const productos = datos
            .filter(row => row[1] && row[1] !== '')
            .map(row => ({
              id:     Number(row[0]) || Date.now(),
              nombre: String(row[1]),
              stock:  Number(row[2]) || 0,
              min:    Number(row[3]) || 0,
              precio: Number(row[4]) || 0,
              unidad: String(row[5] || 'Unidad'),
            }));
          data = { ok: true, productos };
        }
      }

    } else if (action === 'getMovimientos') {
      const ws = ss.getSheetByName(HOJA_MOVS);
      if (!ws) { data = { ok: true, movimientos: [] }; }
      else {
        const lastRow = ws.getLastRow();
        if (lastRow < 8) { data = { ok: true, movimientos: [] }; }
        else {
          const datos = ws.getRange(8, 1, lastRow-7, 9).getValues();
          const movimientos = datos
            .filter(row => row[0] && row[1])
            .map(row => ({
              fecha:       formatFecha(row[0]),
              producto:    String(row[1]),
              tipo:        String(row[2]),
              cantidad:    Number(row[3]) || 1,
              area:        String(row[4] || ''),
              responsable: String(row[5] || ''),
              tipoUnidad:  String(row[6] || 'Unidad'),
              grupo:       String(row[7] || ''),
              hora:        formatHora(row[8]),
            }));
          data = { ok: true, movimientos };
        }
      }

    } else if (action === 'getGastosVarios') {
      const ws = ss.getSheetByName('💸 Gastos Varios');
      if (!ws) { data = { ok: true, gastos: [] }; }
      else {
        const lastRow = ws.getLastRow();
        if (lastRow < 2) { data = { ok: true, gastos: [] }; }
        else {
          const datos = ws.getRange(2, 1, lastRow-1, 7).getValues();
          const gastos = datos
            .filter(row => row[0] && row[3])
            .map(row => ({
              fecha:       formatFecha(row[0]),
              hora:        formatHora(row[1]),
              categoria:   String(row[2] || 'Otro'),
              descripcion: String(row[3] || ''),
              monto:       Number(row[4]) || 0,
              responsable: String(row[5] || ''),
              notas:       String(row[6] || ''),
            }));
          data = { ok: true, gastos };
        }
      }

    } else {
      data = { ok: false, error: 'Acción no reconocida' };
    }

    if (callback) {
      return ContentService
        .createTextOutput(callback + '(' + JSON.stringify(data) + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return jsonResponse(data);

  } catch(err) {
    return jsonResponse({ ok: false, error: err.message });
  }
}

function doPost(e) {
  try {
    const datos = JSON.parse(e.postData.contents);
    const action = datos.action || 'movimiento';
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'nuevoProducto') {
      const ws = ss.getSheetByName(HOJA_STOCK);
      const nextRow = Math.max(ws.getLastRow()+1, FILA_INICIO);
      const num = nextRow - FILA_INICIO + 1;
      ws.getRange(nextRow,1).setValue(num);
      ws.getRange(nextRow,COL_NOMBRE).setValue(datos.nombre);
      ws.getRange(nextRow,COL_AREA).setValue(datos.area);
      ws.getRange(nextRow,COL_CATEGORIA).setValue(datos.area);
      ws.getRange(nextRow,COL_UNIDAD).setValue(datos.unidad||'Unidad');
      ws.getRange(nextRow,COL_STOCK).setValue(Number(datos.stock)||0);
      ws.getRange(nextRow,COL_MIN).setValue(Number(datos.min)||0);
      ws.getRange(nextRow,COL_ESTADO).setValue('=IF(F'+nextRow+'=0,"✖ Agotado",IF(F'+nextRow+'<G'+nextRow+',"⚠ Stock Bajo","✔ OK"))');
      ws.getRange(nextRow,COL_COSTO).setValue(Number(datos.costo)||0);
      ws.getRange(nextRow,COL_VALOR).setValue('=F'+nextRow+'*I'+nextRow);
      ws.getRange(nextRow,COL_FECHA).setValue(datos.fecha||Utilities.formatDate(new Date(),TZ,'yyyy-MM-dd'));
      ws.getRange(nextRow,COL_NOTAS).setValue(datos.notas||'');
      ws.getRange(nextRow,1,1,12).setBackground(num%2===0?'#FFF8F9':'#FFFFFF');
      actualizarAlertas();
      return jsonResponse({ ok: true, mensaje: 'Producto guardado' });
    }

    if (action === 'nuevoProductoMarca') {
      const ws = ss.getSheetByName(HOJA_MARCA);
      const nextRow = Math.max(ws.getLastRow()+1, 2);
      ws.getRange(nextRow,1).setValue(datos.id||Date.now());
      ws.getRange(nextRow,2).setValue(datos.nombre);
      ws.getRange(nextRow,3).setValue(Number(datos.stock)||0);
      ws.getRange(nextRow,4).setValue(Number(datos.min)||0);
      ws.getRange(nextRow,5).setValue(Number(datos.precio)||0);
      ws.getRange(nextRow,6).setValue(datos.unidad||'Unidad');
      return jsonResponse({ ok: true, mensaje: 'Producto marca guardado' });
    }

    if (action === 'actualizarStockMarca') {
      const ws = ss.getSheetByName(HOJA_MARCA);
      const lastRow = ws.getLastRow();
      if (lastRow < 2) return jsonResponse({ ok: false, error: 'Sin datos' });
      const nombres = ws.getRange(2,2,lastRow-1,1).getValues();
      let fila = -1;
      nombres.forEach((row,i) => {
        if (row[0] && row[0].toString().toLowerCase()===datos.nombre.toLowerCase()) fila=2+i;
      });
      if (fila===-1) return jsonResponse({ ok: false, error: 'No encontrado' });
      ws.getRange(fila,3).setValue(Number(datos.stock));
      return jsonResponse({ ok: true, mensaje: 'Stock marca actualizado' });
    }

    if (action === 'actualizarStock') {
      const ws = ss.getSheetByName(HOJA_STOCK);
      const lastRow = ws.getLastRow();
      if (lastRow < FILA_INICIO) return jsonResponse({ ok: false, error: 'Sin datos' });
      const nombres = ws.getRange(FILA_INICIO,COL_NOMBRE,lastRow-FILA_INICIO+1,1).getValues();
      let fila = -1;
      nombres.forEach((row,i) => {
        if (row[0] && row[0].toString().toLowerCase()===datos.producto.toLowerCase()) fila=FILA_INICIO+i;
      });
      if (fila===-1) return jsonResponse({ ok: false, error: 'No encontrado' });
      ws.getRange(fila,COL_STOCK).setValue(Number(datos.nuevoStock));
      ws.getRange(fila,COL_FECHA).setValue(datos.fecha||Utilities.formatDate(new Date(),TZ,'yyyy-MM-dd'));
      actualizarAlertas();
      return jsonResponse({ ok: true, mensaje: 'Stock actualizado' });
    }

    if (action === 'movimientoBatch') {
      // Registrar múltiples movimientos en una sola petición (combos/kits)
      const movs = datos.movimientos || [];
      if (movs.length === 0) return jsonResponse({ ok: false, error: 'Sin movimientos' });

      const wsM = ss.getSheetByName(HOJA_MOVS);
      const fechaHoy = Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd');

      movs.forEach(m => {
        const nr = Math.max(wsM.getLastRow()+1, 8);
        const tipo = m.tipo || 'salida';
        const hora = m.hora || Utilities.formatDate(new Date(), TZ, 'HH:mm');
        wsM.getRange(nr,1).setValue(m.fecha || fechaHoy);
        wsM.getRange(nr,2).setValue(m.producto);
        wsM.getRange(nr,3).setValue(tipo==='entrada'?'Entrada':'Salida');
        wsM.getRange(nr,4).setValue(parseInt(m.cantidad) || 1);
        wsM.getRange(nr,5).setValue(m.area || '');
        wsM.getRange(nr,6).setValue(m.responsable || '');
        wsM.getRange(nr,7).setValue(m.tipoUnidad || 'Unidad');
        wsM.getRange(nr,8).setValue(m.grupo || '');
        wsM.getRange(nr,9).setNumberFormat('@').setValue(hora);
        wsM.getRange(nr,1,1,9).setBackground(tipo==='entrada'?'#E8F5E9':'#FFEBEE');
        wsM.getRange(nr,3).setFontColor(tipo==='entrada'?'#1B5E20':'#B71C1C').setFontWeight('bold');
      });

      actualizarAlertas();
      return jsonResponse({ ok: true, mensaje: movs.length + ' movimientos registrados' });
    }

    if (action === 'actualizarStockBatch') {
      // Actualizar stock de múltiples productos en una sola petición
      const items = datos.items || [];
      if (items.length === 0) return jsonResponse({ ok: false, error: 'Sin items' });

      const ws = ss.getSheetByName(HOJA_STOCK);
      const lastRow = ws.getLastRow();
      if (lastRow < FILA_INICIO) return jsonResponse({ ok: false, error: 'Sin datos' });

      const nombres = ws.getRange(FILA_INICIO,COL_NOMBRE,lastRow-FILA_INICIO+1,1).getValues();
      const fechaHoy = Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd');

      items.forEach(item => {
        nombres.forEach((row,i) => {
          if (row[0] && row[0].toString().toLowerCase() === item.nombre.toLowerCase()) {
            const fila = FILA_INICIO + i;
            ws.getRange(fila, COL_STOCK).setValue(Number(item.stock));
            ws.getRange(fila, COL_FECHA).setValue(fechaHoy);
          }
        });
      });

      actualizarAlertas();
      return jsonResponse({ ok: true, mensaje: items.length + ' stocks actualizados' });
    }

    if (action === 'movimiento') {
      const tipo        = datos.tipo;
      const producto    = datos.producto;
      const cantidad    = parseInt(datos.cantidad);
      const responsable = datos.responsable;
      const area        = datos.area || '';
      const tipoUnidad  = datos.tipoUnidad || 'Unidad';
      const grupo       = datos.grupo || '';
      const fechaHoy    = Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd');
      // Usar la hora que envía la app (del dispositivo del usuario) como prioridad
      const horaApp     = datos.hora || '';
      const horaReal    = horaApp || Utilities.formatDate(new Date(), TZ, 'HH:mm');

      if (!tipo||!producto||!cantidad||!responsable) {
        return jsonResponse({ ok: false, error: 'Faltan campos' });
      }

      const ws = ss.getSheetByName(HOJA_STOCK);
      const lastRow = ws.getLastRow();
      if (lastRow >= FILA_INICIO) {
        const nombres = ws.getRange(FILA_INICIO,COL_NOMBRE,lastRow-FILA_INICIO+1,1).getValues();
        nombres.forEach((row,i) => {
          if (row[0] && row[0].toString().toLowerCase()===producto.toLowerCase()) {
            const fila = FILA_INICIO+i;
            const stockActual = Number(ws.getRange(fila,COL_STOCK).getValue())||0;
            const nuevoStock = tipo==='entrada'?stockActual+cantidad:Math.max(0,stockActual-cantidad);
            ws.getRange(fila,COL_STOCK).setValue(nuevoStock);
            if (tipo==='entrada') ws.getRange(fila,COL_FECHA).setValue(fechaHoy);
          }
        });
      }

      const wsM = ss.getSheetByName(HOJA_MOVS);
      const nr = Math.max(wsM.getLastRow()+1, 8);
      wsM.getRange(nr,1).setValue(fechaHoy);
      wsM.getRange(nr,2).setValue(producto);
      wsM.getRange(nr,3).setValue(tipo==='entrada'?'Entrada':'Salida');
      wsM.getRange(nr,4).setValue(cantidad);
      wsM.getRange(nr,5).setValue(area);
      wsM.getRange(nr,6).setValue(responsable);
      wsM.getRange(nr,7).setValue(tipoUnidad);
      wsM.getRange(nr,8).setValue(grupo);
      // Grabar hora como texto puro — setNumberFormat('@') evita que Sheets la interprete como Time
      wsM.getRange(nr,9).setNumberFormat('@').setValue(horaReal);
      wsM.getRange(nr,1,1,9).setBackground(tipo==='entrada'?'#E8F5E9':'#FFEBEE');
      wsM.getRange(nr,3).setFontColor(tipo==='entrada'?'#1B5E20':'#B71C1C').setFontWeight('bold');
      actualizarAlertas();
      return jsonResponse({ ok: true, mensaje: 'Movimiento registrado', hora: horaReal });
    }

    if (action === 'gastoVarios') {
      let ws = ss.getSheetByName('💸 Gastos Varios');
      if (!ws) {
        ws = ss.insertSheet('💸 Gastos Varios');
        ws.getRange(1,1,1,7).setValues([['Fecha','Hora','Categoría','Descripción','Monto','Responsable','Notas']]);
        ws.getRange(1,1,1,7).setFontWeight('bold').setBackground('#5b0a25').setFontColor('white');
        ws.setColumnWidth(1,100);ws.setColumnWidth(2,60);ws.setColumnWidth(3,120);
        ws.setColumnWidth(4,200);ws.setColumnWidth(5,80);ws.setColumnWidth(6,100);ws.setColumnWidth(7,150);
      }
      const nr = Math.max(ws.getLastRow()+1, 2);
      const fechaHoy = datos.fecha || Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd');
      const horaGV = datos.hora || Utilities.formatDate(new Date(), TZ, 'HH:mm');
      ws.getRange(nr,1).setValue(fechaHoy);
      ws.getRange(nr,2).setNumberFormat('@').setValue(horaGV);
      ws.getRange(nr,3).setValue(datos.categoria || 'Otro');
      ws.getRange(nr,4).setValue(datos.descripcion || '');
      ws.getRange(nr,5).setValue(Number(datos.monto) || 0);
      ws.getRange(nr,6).setValue(datos.responsable || '');
      ws.getRange(nr,7).setValue(datos.notas || '');
      ws.getRange(nr,1,1,7).setBackground('#F3E5F5');
      return jsonResponse({ ok: true, mensaje: 'Gasto varios registrado' });
    }

    return jsonResponse({ ok: false, error: 'Acción no reconocida' });
  } catch(err) {
    return jsonResponse({ ok: false, error: err.message });
  }
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("✦ Salón Inventario")
    .addItem("➕ Registrar Entrada", "registrarEntrada")
    .addItem("➖ Registrar Salida",  "registrarSalida")
    .addSeparator()
    .addItem("🚨 Actualizar Alertas",       "actualizarAlertas")
    .addItem("📧 Enviar Alertas por Email", "enviarAlertasEmail")
    .addSeparator()
    .addItem("⏰ Activar Alerta Diaria", "crearTriggerDiario")
    .addToUi();
}

function obtenerProductos(ws) {
  const lastRow = ws.getLastRow();
  if (lastRow < FILA_INICIO) return [];
  return ws.getRange(FILA_INICIO,1,lastRow-FILA_INICIO+1,12).getValues()
    .filter(row => row[COL_NOMBRE-1] && row[COL_NOMBRE-1]!=='')
    .map((row,i) => ({
      fila:        FILA_INICIO+i,
      nombre:      row[COL_NOMBRE-1],
      area:        row[COL_AREA-1],
      stockActual: Number(row[COL_STOCK-1])||0,
      stockMin:    Number(row[COL_MIN-1])||0,
    }));
}

function actualizarAlertas() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const wsStock  = ss.getSheetByName(HOJA_STOCK);
  const wsAlerta = ss.getSheetByName(HOJA_ALERTAS);
  if (!wsAlerta) return;
  const alertas = obtenerProductos(wsStock).filter(p=>p.stockActual<=p.stockMin);
  const ultima = wsAlerta.getLastRow();
  if (ultima>=8) wsAlerta.getRange(8,1,ultima-7,7).clearContent().setBackground(null);
  alertas.forEach((p,i) => {
    const r=8+i; const ag=p.stockActual===0;
    wsAlerta.getRange(r,1).setValue(i+1);
    wsAlerta.getRange(r,2).setValue(p.nombre);
    wsAlerta.getRange(r,3).setValue(p.area);
    wsAlerta.getRange(r,4).setValue(p.stockActual);
    wsAlerta.getRange(r,5).setValue(p.stockMin);
    wsAlerta.getRange(r,6).setValue(ag?'✖ Agotado':'⚠ Stock Bajo').setFontWeight('bold').setFontColor(ag?'#B71C1C':'#E65100');
    wsAlerta.getRange(r,7).setValue(ag?'Comprar URGENTE':'Reabastecer pronto').setFontWeight('bold').setFontColor(ag?'#B71C1C':'#E65100');
    wsAlerta.getRange(r,1,1,7).setBackground(ag?'#FFEBEE':'#FFF3E0');
  });
}

function enviarAlertasEmail() {
  const ws = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA_STOCK);
  const alertas = obtenerProductos(ws).filter(p=>p.stockActual<=p.stockMin);
  if (!alertas.length) { SpreadsheetApp.getUi().alert('✅ Todo en orden.'); return; }
  const fecha = Utilities.formatDate(new Date(),TZ,'dd/MM/yyyy');
  let html = '<h2 style="color:#5b0a25">🚨 Alertas · '+fecha+'</h2><table border="1" cellpadding="6" style="border-collapse:collapse;font-size:13px"><tr style="background:#5b0a25;color:white"><th>Producto</th><th>Área</th><th>Stock</th><th>Mínimo</th><th>Estado</th></tr>';
  alertas.forEach(p=>{const ag=p.stockActual===0;html+='<tr style="background:'+(ag?'#FFEBEE':'#FFF3E0')+'"><td>'+p.nombre+'</td><td>'+p.area+'</td><td>'+p.stockActual+'</td><td>'+p.stockMin+'</td><td style="color:'+(ag?'#B71C1C':'#E65100')+';font-weight:bold">'+(ag?'✖ Agotado':'⚠ Stock Bajo')+'</td></tr>';});
  html+='</table>';
  MailApp.sendEmail({to:EMAIL_ALERTAS,subject:'🚨 [Salón] '+alertas.length+' alerta(s) · '+fecha,htmlBody:html});
  SpreadsheetApp.getUi().alert('📧 Email enviado.');
}

function crearTriggerDiario() {
  ScriptApp.getProjectTriggers().forEach(t=>{if(t.getHandlerFunction()==='verificarStockDiario')ScriptApp.deleteTrigger(t);});
  ScriptApp.newTrigger('verificarStockDiario').timeBased().everyDays(1).atHour(8).create();
  SpreadsheetApp.getUi().alert('✅ Alerta diaria activada a las 8am.');
}
function verificarStockDiario() {
  const ws = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA_STOCK);
  if (obtenerProductos(ws).filter(p=>p.stockActual<=p.stockMin).length>0) enviarAlertasEmail();
  actualizarAlertas();
}
