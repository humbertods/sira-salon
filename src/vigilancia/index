let vigilanciaData = { resumen:{pendientes:0,alertasAbiertas:0,criticas:0,correcciones:0}, pendientes:[], alertas:[], correcciones:[] };

async function cargarVigilanciaDesdeSheet(){
  if(!SHEET_URL || !currentUser || (currentUser.rol!=='owner' && currentUser.rol!=='ceo')) return;
  try{
    const resp = await fetch(sheetUrl({action:'getVigilancia',t:Date.now()}), {method:'GET'});
    const data = JSON.parse(await resp.text());
    if(data.ok){
      vigilanciaData = data;
      renderVigilancia(currentUser.rol==='owner'?'ow':'ceo');
    }
  }catch(e){ console.log('Vigilancia sync error:', e); }
}

function renderVigilancia(prefix){
  const root = document.getElementById(prefix+'-vigilancia-root');
  if(!root) return;
  const r = vigilanciaData.resumen || {};
  const pendientes = vigilanciaData.pendientes || [];
  const alertas = vigilanciaData.alertas || [];
  const correcciones = vigilanciaData.correcciones || [];
  root.innerHTML = `
    <div class="stats-grid" style="margin-bottom:16px">
      <div class="stat-card sc-danger"><div class="stat-val">${r.criticas||0}</div><div class="stat-lbl">Críticas</div></div>
      <div class="stat-card sc-burg"><div class="stat-val">${r.alertasAbiertas||0}</div><div class="stat-lbl">Alertas</div></div>
      <div class="stat-card sc-gold"><div class="stat-val">${r.pendientes||0}</div><div class="stat-lbl">Pendientes</div></div>
      <div class="stat-card sc-ok"><div class="stat-val">${r.correcciones||0}</div><div class="stat-lbl">Correcciones</div></div>
    </div>
    <button class="btn-p" onclick="auditarAhoraSira('${prefix}')" style="margin-bottom:10px">Auditar ahora</button>
    <p class="sec-title">Alertas abiertas</p>
    <div>${renderAlertasSira(alertas)}</div>
    <p class="sec-title">Movimientos pendientes</p>
    <div>${renderPendientesSira(pendientes)}</div>
    <p class="sec-title">Historial de correcciones</p>
    <div>${renderCorreccionesSira(correcciones)}</div>`;
}

function renderAlertasSira(alertas){
  if(!alertas.length) return '<div class="empty" style="padding:16px"><div class="empty-text">Sin alertas abiertas</div></div>';
  return alertas.map(a=>{
    const sev = String(a.severidad||'MEDIA');
    const color = sev==='CRITICA'?'var(--danger)':sev==='ALTA'?'var(--warn)':'var(--primary)';
    return `<div class="info-card" style="margin-bottom:8px;border-left:4px solid ${color}">
      <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start">
        <div style="min-width:0">
          <div style="font-size:12px;font-weight:800;color:${color};letter-spacing:.5px">${escapeHtml(sev)} · ${escapeHtml(a.tipo_alerta)}</div>
          <div style="font-size:14px;font-weight:700;color:var(--text);margin-top:4px">${escapeHtml(a.producto_nombre || 'Sin producto')}</div>
          <div style="font-size:12px;color:var(--text2);margin-top:4px">${escapeHtml(a.descripcion)}</div>
          <div style="font-size:11px;color:var(--text3);margin-top:6px">${escapeHtml(a.accion_recomendada || '')}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;flex-shrink:0">
          <button class="btn-mini ok" onclick="resolverAlertaSiraUI('${escapeHtml(a.id_alerta)}')">✓</button>
          ${a.producto_id ? `<button class="btn-mini del" onclick="corregirStockSiraUI('${escapeHtml(a.producto_id)}','${escapeHtml(a.producto_nombre)}','${escapeHtml(a.id_alerta)}')">↺</button>` : ''}
        </div>
      </div>
    </div>`;
  }).join('');
}

function renderPendientesSira(pendientes){
  if(!pendientes.length) return '<div class="empty" style="padding:16px"><div class="empty-text">Sin movimientos pendientes</div></div>';
  return pendientes.map(m=>`<div class="mov-card">
    <div class="mov-badge entrada">⏳</div>
    <div class="mov-info"><div class="mov-prod">${escapeHtml(m.producto_nombre)}</div><div class="mov-det">${escapeHtml(m.empleado_nombre)} · ${escapeHtml(m.destino || 'Sin destino')} · ${escapeHtml(m.fecha_hora)}</div></div>
    <div style="display:flex;align-items:center;gap:8px"><div class="mov-qty entrada">${escapeHtml(m.cantidad)}</div><button class="btn-mini ok" onclick="confirmarMovimientoSiraUI('${escapeHtml(m.id_movimiento)}',${Number(m.cantidad)||0})">✓</button></div>
  </div>`).join('');
}

function renderCorreccionesSira(correcciones){
  if(!correcciones.length) return '<div class="empty" style="padding:16px"><div class="empty-text">Sin correcciones registradas</div></div>';
  return correcciones.map(m=>`<div class="mov-card">
    <div class="mov-badge salida">↺</div>
    <div class="mov-info"><div class="mov-prod">${escapeHtml(m.producto_nombre)}</div><div class="mov-det">${escapeHtml(m.usuario_confirmacion || m.registrado_por)} · ${escapeHtml(m.fecha_hora)}</div></div>
    <div class="mov-qty salida">${escapeHtml(m.stock_antes)}→${escapeHtml(m.stock_despues)}</div>
  </div>`).join('');
}

async function auditarAhoraSira(prefix){
  try{
    showSyncBadge('Auditando...');
    const data = await postSheet({action:'auditarMovimientosSira'});
    showToast('Auditoría completada: '+(data.alertasGeneradas||0)+' alertas');
    await cargarVigilanciaDesdeSheet();
    renderVigilancia(prefix);
    setTimeout(()=>hideSyncBadge(), 1200);
  }catch(e){ console.log('Auditoría error:', e); showToast('No se pudo auditar'); hideSyncBadge(); }
}

async function resolverAlertaSiraUI(idAlerta){
  try{
    await postSheet({action:'resolverAlertaSira',idAlerta,estado:'RESUELTA'});
    showToast('Alerta resuelta');
    await cargarVigilanciaDesdeSheet();
  }catch(e){ console.log('Resolver alerta error:', e); showToast('No se pudo resolver'); }
}

async function confirmarMovimientoSiraUI(idMovimiento, cantidad){
  const raw = prompt('Cantidad recibida', String(cantidad || ''));
  if(raw === null) return;
  const cantidadRecibida = parseInt(raw, 10);
  if(!cantidadRecibida || cantidadRecibida <= 0){ showToast('Cantidad inválida'); return; }
  try{
    await postSheet({action:'confirmarMovimiento',idMovimiento,cantidadRecibida});
    showToast('Movimiento confirmado');
    await cargarVigilanciaDesdeSheet();
  }catch(e){ console.log('Confirmar movimiento error:', e); showToast('No se pudo confirmar'); }
}

async function corregirStockSiraUI(idProducto, productoNombre, idAlerta){
  const raw = prompt('Nuevo stock para '+productoNombre, '');
  if(raw === null) return;
  const nuevoStock = parseInt(raw, 10);
  if(Number.isNaN(nuevoStock) || nuevoStock < 0){ showToast('Stock inválido'); return; }
  const motivo = prompt('Motivo obligatorio de corrección', 'Corrección desde Vigilancia');
  if(!motivo) { showToast('Motivo requerido'); return; }
  try{
    await postSheet({action:'corregirStock',idProducto,nuevoStock,motivo,idAlerta});
    showToast('Stock corregido');
    await Promise.all([cargarProductosDesdeSheet(), cargarVigilanciaDesdeSheet()]);
  }catch(e){ console.log('Corregir stock error:', e); showToast('No se pudo corregir'); }
}
