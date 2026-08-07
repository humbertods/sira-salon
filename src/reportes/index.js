function renderReportes(){
  const alertas=productos.filter(p=>p.stock<=p.min&&p.stock>0);
  const agotados=productos.filter(p=>p.stock===0);
  const ok=productos.filter(p=>p.stock>p.min);
  const valor=productos.reduce((s,p)=>s+p.stock*p.costo,0);
  document.getElementById('r-total').textContent=productos.length;
  document.getElementById('r-ok').textContent=ok.length;
  document.getElementById('r-warn').textContent=alertas.length;
  document.getElementById('r-danger').textContent=agotados.length;
  document.getElementById('r-valor').textContent='$'+valor.toFixed(2);
  renderTopUsados();
  renderFlujoFinanciero();
  prepararControlesDetalleUso();
  renderDetalleUsoProductoEstadoInicial();
  prepararControlesDetalleStaff();
  renderDetalleStaffEstadoInicial();
  renderStaffMes();
  renderResumenGeneral();
}

let detalleUsoConsultando = false;
let detalleStaffConsultando = false;
let staffOpcionesCargadas = false;

function prepararControlesDetalleUso(){
  const prodSel = document.getElementById('du-prod');
  const mesSel = document.getElementById('du-mes');
  const anioSel = document.getElementById('du-anio');
  if(!prodSel || !mesSel || !anioSel) return;

  if(!prodSel.dataset.ready || parseInt(prodSel.dataset.count||'0') !== productos.length){
    const previo = prodSel.value;
    prodSel.innerHTML = '<option value="">Seleccioná un producto</option>' + productos
      .slice()
      .sort((a,b)=>String(a.nombre||'').localeCompare(String(b.nombre||'')))
      .map(p=>`<option value="${escapeHtml(productoOptionValue(p))}">${escapeHtml(p.nombre)}</option>`)
      .join('');
    if(previo) prodSel.value = previo;
    prodSel.dataset.ready = '1';
    prodSel.dataset.count = productos.length;
  }

  if(!mesSel.dataset.ready){
    const now = new Date();
    mesSel.innerHTML = MESES_NOMBRES.map((m,i)=>`<option value="${i+1}" ${i===now.getMonth()?'selected':''}>${m}</option>`).join('');
    mesSel.dataset.ready = '1';
  }

  if(!anioSel.dataset.ready || parseInt(anioSel.dataset.movs||'0') !== movimientos.length){
    const now = new Date();
    const previo = anioSel.value;
    const anios = [];
    for(let y = now.getFullYear() + 1; y >= 2020; y--) anios.push(y);
    anioSel.innerHTML = anios.map(y=>`<option value="${y}">${y}</option>`).join('');
    anioSel.value = previo || String(now.getFullYear());
    anioSel.dataset.ready = '1';
    anioSel.dataset.movs = movimientos.length;
  }
}

function getProductoDetalleUso(){
  const prodSel = document.getElementById('du-prod');
  if(!prodSel || !prodSel.value) return null;
  return buscarProductoPorOptionValue(prodSel.value);
}

function renderDetalleUsoProductoEstadoInicial(){
  prepararControlesDetalleUso();
  const resumen = document.getElementById('du-resumen');
  const detalle = document.getElementById('du-detalle');
  if(resumen) resumen.innerHTML = '<div class="no-data">Seleccioná un producto y presioná Buscar</div>';
  if(detalle) detalle.innerHTML = '';
}

async function buscarDetalleUsoProducto(){
  if(detalleUsoConsultando) return;
  const prod = getProductoDetalleUso();
  const mesSel = document.getElementById('du-mes');
  const anioSel = document.getElementById('du-anio');
  const resumen = document.getElementById('du-resumen');
  const detalle = document.getElementById('du-detalle');
  const btn = document.getElementById('du-buscar');
  if(!resumen || !detalle) return;
  if(!prod){
    resumen.innerHTML = '<div class="no-data">Seleccioná un producto y presioná Buscar</div>';
    detalle.innerHTML = '';
    return;
  }
  detalleUsoConsultando = true;
  if(btn){ btn.disabled = true; btn.textContent = 'Buscando...'; }
  resumen.innerHTML = '<div class="no-data">Buscando...</div>';
  detalle.innerHTML = '';
  try{
    const data = await fetch(sheetUrl({ action:'getReporteDetalleProducto', idProducto: prod.idEstable || '', producto: prod.nombre || '', mes: mesSel.value, anio: anioSel.value })).then(r=>r.json());
    if(!data.ok) throw new Error(data.error || 'Error de consulta');
    renderDetalleUsoProductoResultado(data);
  }catch(err){
    resumen.innerHTML = `<div class="no-data">Error de consulta: ${escapeHtml(err.message)}</div>`;
  }finally{
    detalleUsoConsultando = false;
    if(btn){ btn.disabled = false; btn.textContent = 'BUSCAR'; }
  }
}

function renderDetalleUsoProductoResultado(data){
  const resumen = document.getElementById('du-resumen');
  const detalle = document.getElementById('du-detalle');
  const salidas = data.resumenSalidas || {movimientos:0,unidades:0,valor:0};
  const ingresos = data.resumenIngresos || {movimientos:0,unidades:0,valor:0};
  const totalMovs = salidas.movimientos + ingresos.movimientos;
  if(totalMovs === 0){
    resumen.innerHTML = `<div class="no-data">No existen movimientos para este producto en ${escapeHtml((data.periodo || {}).etiqueta || '')}.</div>`;
    detalle.innerHTML = '';
    return;
  }
  resumen.innerHTML = `<div style="font-size:15px;font-weight:700;margin-bottom:4px">DETALLE DE USO — ${escapeHtml((data.producto || {}).nombre || '')}</div>
    <div style="font-size:12px;color:var(--text2);margin-bottom:12px">${escapeHtml((data.periodo || {}).etiqueta || '')}</div>
    <div class="rep-summary">
      <div class="rep-sum-box salida"><div class="rep-sum-val">${salidas.movimientos}</div><div class="rep-sum-lbl">Salidas · $${Number(salidas.valor||0).toFixed(2)}</div></div>
      <div class="rep-sum-box entrada"><div class="rep-sum-val">${ingresos.movimientos}</div><div class="rep-sum-lbl">Ingresos · $${Number(ingresos.valor||0).toFixed(2)}</div></div>
    </div>`;
  const staff = data.staff || [];
  detalle.innerHTML = `<div class="info-card-title">Staff relacionada</div>` + (staff.length ? staff.map(s=>`
    <div class="gasto-item">
      <div class="gasto-item-info"><div class="gasto-item-name">${escapeHtml(s.nombre)}</div><div class="gasto-item-meta">Salidas: ${s.salidas} · Ingresos: ${s.ingresos}</div></div>
    </div>`).join('') : '<div class="no-data">Sin staff relacionada</div>');
}

function prepararControlesDetalleStaff(){
  const staffSel = document.getElementById('ds-staff');
  const mesSel = document.getElementById('ds-mes');
  const anioSel = document.getElementById('ds-anio');
  if(!staffSel || !mesSel || !anioSel) return;
  if(!mesSel.dataset.ready){
    const now = new Date();
    mesSel.innerHTML = MESES_NOMBRES.map((m,i)=>`<option value="${i+1}" ${i===now.getMonth()?'selected':''}>${m}</option>`).join('');
    mesSel.dataset.ready = '1';
  }
  if(!anioSel.dataset.ready){
    const now = new Date();
    const anios = [];
    for(let y = now.getFullYear() + 1; y >= 2020; y--) anios.push(y);
    anioSel.innerHTML = anios.map(y=>`<option value="${y}">${y}</option>`).join('');
    anioSel.value = String(now.getFullYear());
    anioSel.dataset.ready = '1';
  }
  if(!staffOpcionesCargadas) cargarOpcionesDetalleStaff();
}

async function cargarOpcionesDetalleStaff(){
  const staffSel = document.getElementById('ds-staff');
  if(!staffSel || staffOpcionesCargadas) return;
  try{
    const data = await fetch(sheetUrl({ action:'getReporteDetalleStaff' })).then(r=>r.json());
    if(!data.ok) throw new Error(data.error || 'Error de consulta');
    const staff = data.staffDisponibles || [];
    staffSel.innerHTML = '<option value="">Seleccioná una staff</option>' + staff.map(s=>`<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('');
    staffOpcionesCargadas = true;
  }catch(err){
    staffSel.innerHTML = '<option value="">Error al cargar staff</option>';
  }
}

function renderDetalleStaffEstadoInicial(){
  const resumen = document.getElementById('ds-resumen');
  const detalle = document.getElementById('ds-detalle');
  if(resumen) resumen.innerHTML = '<div class="no-data">Seleccioná una staff y presioná Buscar</div>';
  if(detalle) detalle.innerHTML = '';
}

async function buscarDetalleStaff(){
  if(detalleStaffConsultando) return;
  const staffSel = document.getElementById('ds-staff');
  const mesSel = document.getElementById('ds-mes');
  const anioSel = document.getElementById('ds-anio');
  const resumen = document.getElementById('ds-resumen');
  const detalle = document.getElementById('ds-detalle');
  const btn = document.getElementById('ds-buscar');
  const staff = staffSel ? staffSel.value : '';
  if(!resumen || !detalle) return;
  if(!staff){
    resumen.innerHTML = '<div class="no-data">Seleccioná una staff y presioná Buscar</div>';
    detalle.innerHTML = '';
    return;
  }
  detalleStaffConsultando = true;
  if(btn){ btn.disabled = true; btn.textContent = 'Buscando...'; }
  resumen.innerHTML = '<div class="no-data">Buscando...</div>';
  detalle.innerHTML = '';
  try{
    const data = await fetch(sheetUrl({ action:'getReporteDetalleStaff', staff, mes: mesSel.value, anio: anioSel.value })).then(r=>r.json());
    if(!data.ok) throw new Error(data.error || 'Error de consulta');
    renderDetalleStaffResultado(data);
  }catch(err){
    resumen.innerHTML = `<div class="no-data">Error de consulta: ${escapeHtml(err.message)}</div>`;
  }finally{
    detalleStaffConsultando = false;
    if(btn){ btn.disabled = false; btn.textContent = 'BUSCAR'; }
  }
}

function renderDetalleStaffResultado(data){
  const resumen = document.getElementById('ds-resumen');
  const detalle = document.getElementById('ds-detalle');
  const ingresos = data.ingresos || {movimientos:0,unidades:0,valor:0};
  const salidas = data.salidas || {movimientos:0,unidades:0,valor:0};
  if((ingresos.movimientos + salidas.movimientos) === 0){
    resumen.innerHTML = `<div class="no-data">No existen movimientos para esta staff en ${escapeHtml((data.periodo || {}).etiqueta || '')}.</div>`;
    detalle.innerHTML = '';
    return;
  }
  resumen.innerHTML = `<div style="font-size:15px;font-weight:700;margin-bottom:4px">DETALLE DE MOVIMIENTOS — ${escapeHtml(data.staff || '')}</div>
    <div style="font-size:12px;color:var(--text2);margin-bottom:12px">${escapeHtml((data.periodo || {}).etiqueta || '')}</div>
    <div class="rep-summary">
      <div class="rep-sum-box entrada"><div class="rep-sum-val">${ingresos.movimientos}</div><div class="rep-sum-lbl">Ingresos · $${Number(ingresos.valor||0).toFixed(2)}</div></div>
      <div class="rep-sum-box salida"><div class="rep-sum-val">${salidas.movimientos}</div><div class="rep-sum-lbl">Salidas · $${Number(salidas.valor||0).toFixed(2)}</div></div>
    </div>`;
  const productosData = data.productos || [];
  detalle.innerHTML = '<div class="info-card-title">Productos</div>' + (productosData.length ? productosData.map(p=>`
    <div class="gasto-item">
      <div class="gasto-item-info"><div class="gasto-item-name">${escapeHtml(p.producto)}</div><div class="gasto-item-meta">Ingresos: ${p.ingresos} · Salidas: ${p.salidas}</div></div>
    </div>`).join('') : '<div class="no-data">Sin productos</div>');
}

function renderTopUsados(){
  const container = document.getElementById('r-top-usados');
  if(!container) return;
  const {start, end} = getWeekRange();
  const salidasSemana = movimientos.filter(m => {
    if(m.tipo !== 'salida') return false;
    const d = new Date(m.fecha + 'T12:00:00');
    return d >= start && d <= end;
  });

  if(salidasSemana.length === 0){
    container.innerHTML = '<div class="no-data">Sin salidas esta semana</div>';
    return;
  }

  const byProd = {};
  salidasSemana.forEach(m => {
    const key = m.producto;
    if(!byProd[key]) byProd[key] = {total: 0, areas: {}};
    byProd[key].total += m.cant;
    const area = m.area || 'Sin área';
    byProd[key].areas[area] = (byProd[key].areas[area] || 0) + m.cant;
  });

  const sorted = Object.entries(byProd)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 20);
  const maxTotal = sorted[0][1].total;
  const areaColores = {
    'Cejas': '#BFA26F',
    'Pestañas': '#34A853',
    'Depilaciones': '#4285F4',
    'Limpieza Facial': '#F5A623',
    'Local': '#8A8A8A',
    'Coffee': '#6D4C41',
    'Sin área': '#B0B0B0'
  };

  container.innerHTML = sorted.map(([nombre, data], i) => {
    const pct = Math.max(8, (data.total / maxTotal) * 100);
    const areaEntries = Object.entries(data.areas).sort((a, b) => b[1] - a[1]);
    const areaBarsHtml = areaEntries.map(([area, cant]) => {
      const areaPct = Math.round((cant / data.total) * 100);
      const color = areaColores[area] || '#B0B0B0';
      return `<div style="display:flex;align-items:center;gap:6px;margin-top:3px">
        <div style="width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0"></div>
        <span style="font-size:11px;color:var(--text2);flex:1">${escapeHtml(area)}</span>
        <div style="width:60px;height:6px;background:var(--border);border-radius:3px;overflow:hidden">
          <div style="width:${areaPct}%;height:100%;background:${color};border-radius:3px"></div>
        </div>
        <span style="font-size:11px;font-weight:700;color:var(--text);min-width:32px;text-align:right">${areaPct}%</span>
      </div>`;
    }).join('');

    return `<div style="background:var(--card);border:1px solid var(--border);border-radius:var(--r2);padding:14px 16px;margin-bottom:8px;box-shadow:var(--shadow)">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
        <div style="width:28px;height:28px;border-radius:50%;background:${i<3?'var(--primary)':'var(--border)'};display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <span style="font-size:12px;font-weight:700;color:${i<3?'white':'var(--text2)'}">${i+1}</span>
        </div>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escapeHtml(nombre)}</div>
        </div>
        <div style="text-align:right;flex-shrink:0">
          <div style="font-size:18px;font-weight:700;color:var(--text)">${data.total}</div>
          <div style="font-size:10px;color:var(--text2)">unid.</div>
        </div>
      </div>
      <div style="width:100%;height:6px;background:var(--border);border-radius:3px;overflow:hidden;margin-bottom:8px">
        <div style="width:${pct}%;height:100%;background:var(--primary);border-radius:3px;transition:width 500ms"></div>
      </div>
      ${areaBarsHtml}
    </div>`;
  }).join('');
}

function renderStaffMes(){
  const now = new Date();
  const mesActualIdx = now.getMonth();
  const anioAct = now.getFullYear();
  const mesLabel = MESES_NOMBRES[mesActualIdx] + ' ' + anioAct;
  const labelEl = document.getElementById('r-mes-label-staff');
  if(labelEl) labelEl.textContent = mesLabel;

  const movsMes = movimientos.filter(m => {
    if(!m.fecha) return false;
    const parts = m.fecha.split('-');
    if(parts.length<3) return false;
    return parseInt(parts[0])===anioAct && parseInt(parts[1])===(mesActualIdx+1);
  });
  const staffNames = usuarios.filter(u => u.id !== 'humberto').map(u => u.nombre);
  const data = staffNames.map(nombre => {
    const movsPers = movsMes.filter(m => m.resp === nombre);
    let entradas = 0, salidas = 0, totalDolares = 0;
    movsPers.forEach(m => {
      const prod = productos.find(p => norm(p.nombre) === norm(m.producto));
      const costo = (prod ? prod.costo : 0) * m.cant;
      if(m.tipo === 'entrada'){
        entradas += m.cant;
        totalDolares += costo;
      } else {
        salidas += m.cant;
        totalDolares += costo;
      }
    });
    return { nombre, entradas, salidas, totalDolares };
  });

  const list = document.getElementById('r-staff-mes-list');
  if(!list) return;
  list.innerHTML = data.map((d, i) => {
    const bg = i % 2 === 0 ? 'var(--white)' : 'var(--bg)';
    return `<div style="display:grid;grid-template-columns:1fr 55px 55px 70px;padding:10px 14px;gap:4px;background:${bg};border-bottom:1px solid var(--border);align-items:center">
      <span style="font-size:13px;font-weight:500;color:var(--text)">${escapeHtml(d.nombre)}</span>
      <span style="font-size:14px;font-weight:700;color:var(--ok);text-align:center">${d.entradas}</span>
      <span style="font-size:14px;font-weight:700;color:var(--danger);text-align:center">${d.salidas}</span>
      <span style="font-size:14px;font-weight:600;color:var(--text);text-align:right">$${d.totalDolares.toFixed(0)}</span>
    </div>`;
  }).join('');

  const totalE = data.reduce((s, d) => s + d.entradas, 0);
  const totalS = data.reduce((s, d) => s + d.salidas, 0);
  const totalD = data.reduce((s, d) => s + d.totalDolares, 0);
  const totalEl = document.getElementById('r-staff-mes-total');
  if(totalEl){
    totalEl.innerHTML = `
      <span style="font-size:13px;font-weight:700;color:var(--text)">Total</span>
      <span style="font-size:14px;font-weight:700;color:var(--ok);text-align:center">${totalE}</span>
      <span style="font-size:14px;font-weight:700;color:var(--danger);text-align:center">${totalS}</span>
      <span style="font-size:14px;font-weight:700;color:var(--primary);text-align:right">$${totalD.toFixed(0)}</span>`;
  }
}

let rgMes = new Date().getMonth();
let rgAnio = new Date().getFullYear();

function cambiarMesResumen(dir){
  rgMes += dir;
  if(rgMes > 11){ rgMes=0; rgAnio++; }
  if(rgMes < 0){ rgMes=11; rgAnio--; }
  renderResumenGeneral();
}

function renderResumenGeneral(){
  const labelEl = document.getElementById('rg-mes-label');
  if(labelEl) labelEl.textContent = MESES_NOMBRES[rgMes] + ' ' + rgAnio;

  const movsMes = movimientos.filter(m => {
    if(!m.fecha) return false;
    const parts = m.fecha.split('-');
    if(parts.length<3) return false;
    return parseInt(parts[0])===rgAnio && parseInt(parts[1])===(rgMes+1);
  });
  const gvMes = gastosVarios.filter(g => {
    if(!g.fecha) return false;
    const parts = g.fecha.split('-');
    if(parts.length<3) return false;
    return parseInt(parts[0])===rgAnio && parseInt(parts[1])===(rgMes+1);
  });
  const staffNames = usuarios.filter(u => u.id !== 'humberto').map(u => u.nombre);
  const staffData = staffNames.map(nombre => {
    const movsPers = movsMes.filter(m => m.resp === nombre);
    let totalDolares = 0;
    movsPers.forEach(m => {
      const prod = productos.find(p => norm(p.nombre) === norm(m.producto));
      totalDolares += (prod ? prod.costo : 0) * m.cant;
    });
    return { nombre, movs: movsPers.length, total: totalDolares };
  }).filter(d => d.movs > 0);

  const staffList = document.getElementById('rg-staff-list');
  if(staffList){
    if(staffData.length === 0){
      staffList.innerHTML = '<div style="padding:16px;text-align:center;font-size:13px;color:var(--text2)">Sin movimientos</div>';
    } else {
      staffList.innerHTML = staffData.map((d, i) => {
        const u = usuarios.find(x => x.nombre === d.nombre);
        const bg = i % 2 === 0 ? 'var(--card)' : 'var(--bg)';
        return `<div style="display:grid;grid-template-columns:1fr 60px 80px;padding:11px 16px;background:${bg};border-bottom:1px solid var(--border);align-items:center">
          <div>
            <span style="font-size:13px;font-weight:600;color:var(--text)">${escapeHtml(d.nombre)}</span>
            <span style="font-size:10px;color:var(--text2);margin-left:4px">${escapeHtml(u?.cargo||'')}</span>
          </div>
          <span style="font-size:13px;font-weight:600;color:var(--text2);text-align:center">${d.movs}</span>
          <span style="font-size:14px;font-weight:700;color:var(--text);text-align:right">$${d.total.toFixed(2)}</span>
        </div>`;
      }).join('');
    }
  }

  const totalMovs = staffData.reduce((s,d) => s + d.movs, 0);
  const totalStaff = staffData.reduce((s,d) => s + d.total, 0);
  const staffTotal = document.getElementById('rg-staff-total');
  if(staffTotal){
    staffTotal.innerHTML = `
      <span style="font-size:13px;font-weight:700;color:var(--text)">Subtotal productos</span>
      <span style="font-size:13px;font-weight:700;color:var(--text2);text-align:center">${totalMovs}</span>
      <span style="font-size:14px;font-weight:700;color:var(--primary);text-align:right">$${totalStaff.toFixed(2)}</span>`;
  }

  const gvList = document.getElementById('rg-gv-list');
  const totalGV = gvMes.reduce((s,g) => s + g.monto, 0);
  document.getElementById('rg-gv-total').textContent = '$' + totalGV.toFixed(2);

  if(gvList){
    if(gvMes.length === 0){
      gvList.innerHTML = '<div style="padding:12px 16px;font-size:13px;color:var(--text2)">Sin gastos varios</div>';
    } else {
      const gvByPerson = {};
      gvMes.forEach(g => {
        if(!gvByPerson[g.resp]) gvByPerson[g.resp] = {items:[], total:0};
        gvByPerson[g.resp].items.push(g);
        gvByPerson[g.resp].total += g.monto;
      });
      gvList.innerHTML = Object.entries(gvByPerson).map(([nombre, data]) => {
        const detalles = data.items.map(g =>
          `<div style="display:flex;justify-content:space-between;padding:6px 16px 6px 32px;font-size:12px;border-bottom:1px solid var(--border)">
            <span style="color:var(--text)">${escapeHtml(g.desc)} <span style="color:var(--text2)">(${escapeHtml(g.cat)})</span></span>
            <span style="font-weight:600;color:#8e44ad">$${g.monto.toFixed(2)}</span>
          </div>`
        ).join('');
        const gvId = safeDomId('rg-gv', nombre, 0);
        return `<div style="border-bottom:1px solid var(--border)">
          <div style="display:flex;justify-content:space-between;padding:10px 16px;cursor:pointer;background:var(--card)" onclick="toggleAc('${gvId}')">
            <span style="font-size:13px;font-weight:600;color:var(--text)">${escapeHtml(nombre)}</span>
            <div style="display:flex;align-items:center;gap:6px">
              <span style="font-size:13px;font-weight:700;color:#8e44ad">$${data.total.toFixed(2)}</span>
              <span style="font-size:10px;color:var(--text2)">▾</span>
            </div>
          </div>
          <div class="ac-dia-body" id="${gvId}">${detalles}</div>
        </div>`;
      }).join('');
    }
  }

  const granTotal = totalStaff + totalGV;
  document.getElementById('rg-gran-total').textContent = '$' + granTotal.toFixed(2);
  document.getElementById('rg-total-preview').textContent = 'Total: $' + granTotal.toFixed(2);
}

let flujoTab = 'dia';

function setFlujoTab(tab, el){
  flujoTab = tab;
  document.querySelectorAll('#rf-tab-dia,#rf-tab-semana,#rf-tab-mes').forEach(t=>t.classList.remove('active'));
  if(el) el.classList.add('active');
  renderFlujoFinanciero();
}

function toggleAc(id){
  const el=document.getElementById(id);
  if(el) el.classList.toggle('open');
  const hdr=document.querySelector('[data-target="'+id+'"]');
  if(hdr) hdr.classList.toggle('open');
}

async function renderFlujoFinanciero(){
  const container=document.getElementById('rf-acordeon');
  if(!container) return;
  container.innerHTML = '<div class="empty" style="padding:20px"><div class="empty-text">Consultando reportes...</div></div>';
  try{
    const data = await fetch(sheetUrl({ action:'getReporteFlujoMovimientos', vista: flujoTab })).then(r=>r.json());
    if(!data.ok) throw new Error(data.error || 'Error de consulta');
    renderFlujoFinancieroResultado(data);
  }catch(err){
    container.innerHTML = `<div class="no-data">Error de consulta: ${escapeHtml(err.message)}</div>`;
  }
}

function renderFlujoFinancieroResultado(data){
  const container=document.getElementById('rf-acordeon');
  if(!container) return;
  if(data.vista === 'mes'){
    const meses = data.meses || [];
    container.innerHTML = meses.length ? meses.map((mes, idx)=>renderMesFlujo_(mes, idx)).join('') : '<div class="no-data">No existen movimientos registrados.</div>';
    return;
  }
  if(data.vista === 'semana'){
    const semanas = data.semanas || [];
    container.innerHTML = semanas.length ? semanas.map((semana, idx)=>renderSemanaFlujo_(semana, 'rf-semana-'+idx)).join('') : '<div class="no-data">No existen movimientos registrados.</div>';
    return;
  }
  const dias = data.dias || [];
  container.innerHTML = dias.length ? dias.map((dia, idx)=>renderDiaFlujo_(dia, 'rf-dia-'+idx, idx === 0)).join('') : '<div class="no-data">No existen movimientos registrados.</div>';
}

function renderMesFlujo_(mes, idx){
  const id = 'rf-mes-'+idx;
  return `<div class="ac-dia"><div class="ac-dia-header" onclick="toggleAc('${id}')" data-target="${id}"><span>${escapeHtml(mes.etiqueta)}</span><span class="ac-dia-arrow">▾</span></div><div class="ac-dia-body" id="${id}">${(mes.semanas || []).map((s,sIdx)=>renderSemanaFlujo_(s, id+'-s-'+sIdx)).join('')}</div></div>`;
}

function renderSemanaFlujo_(semana, id){
  return `<div class="ac-sec"><div class="ac-sec-header" onclick="toggleAc('${id}')" data-target="${id}"><span>${escapeHtml(semana.etiqueta)}</span><span style="font-size:11px;color:var(--text2)">▾</span></div><div class="ac-sec-body" id="${id}">${(semana.dias || []).map((d,dIdx)=>renderDiaFlujo_(d, id+'-d-'+dIdx, false)).join('')}</div></div>`;
}

function renderDiaFlujo_(dia, id, abierto){
  const staffHtml = (dia.staff || []).map((s,idx)=>renderStaffFlujo_(s, id+'-p-'+idx)).join('');
  const gvHtml = renderGastosVariosFlujo_(dia, id+'-gv');
  return `<div class="ac-dia"><div class="ac-dia-header ${abierto?'open':''}" onclick="toggleAc('${id}')" data-target="${id}"><span>${escapeHtml(dia.etiqueta || dia.fecha)}</span><span class="ac-dia-arrow">▾</span></div><div class="ac-dia-body ${abierto?'open':''}" id="${id}"><div class="ac-sec"><div class="ac-sec-header" onclick="toggleAc('${id}-gen')" data-target="${id}-gen"><span>Gastos generales</span><div class="ac-totals">${dia.totalEntradas>0?'<span class="te">↑$'+Number(dia.totalEntradas).toFixed(0)+'</span>':''}${dia.totalSalidas>0?'<span class="ts">↓$'+Number(dia.totalSalidas).toFixed(0)+'</span>':''}<span style="font-size:11px;color:var(--text2)">▾</span></div></div><div class="ac-sec-body" id="${id}-gen">${staffHtml || '<div class="no-data">Sin movimientos de inventario</div>'}<div class="ac-total-row"><span>Total</span><div class="ac-totals"><span class="te">↑$${Number(dia.totalEntradas||0).toFixed(0)}</span><span class="ts">↓$${Number(dia.totalSalidas||0).toFixed(0)}</span></div></div></div></div>${gvHtml}</div></div>`;
}

function renderStaffFlujo_(staff, id){
  const movsHtml = (staff.movimientos || []).map(m=>`<div class="ac-prod-row"><span class="ac-prod-name ${m.tipo === 'Entrada' ? 'entrada' : 'salida'}">${escapeHtml(m.tipo)} · ${escapeHtml(m.producto)}</span><span style="font-size:12px;color:var(--text2);margin-right:8px">Cantidad: ${Number(m.cantidad||0)}</span><span class="${m.tipo === 'Entrada' ? 'ac-val-e' : 'ac-val-s'}">$${Number(m.valor||0).toFixed(2)}</span></div>`).join('');
  return `<div class="ac-person"><div class="ac-person-header" onclick="toggleAc('${id}')" data-target="${id}"><span>${escapeHtml(staff.nombre)}</span><div class="ac-totals">${staff.totalEntradas>0?'<span class="te">↑$'+Number(staff.totalEntradas).toFixed(0)+'</span>':''}${staff.totalSalidas>0?'<span class="ts">↓$'+Number(staff.totalSalidas).toFixed(0)+'</span>':''}<span style="font-size:11px;color:var(--text2)">▾</span></div></div><div class="ac-person-body" id="${id}">${movsHtml}</div></div>`;
}

function renderGastosVariosFlujo_(dia, id){
  const gastos = dia.gastosVarios || [];
  if(!gastos.length) return '';
  const personas = gastos.map((g,idx)=>{
    const pid = id+'-p-'+idx;
    const items = (g.items || []).map(item=>`<div class="ac-gv-item"><span class="ac-gv-desc" style="padding-left:16px">${escapeHtml(item.descripcion)} <span style="color:var(--text2)">(${escapeHtml(item.categoria)})</span></span><span class="ac-gv-val">$${Number(item.monto||0).toFixed(2)}</span></div>`).join('');
    return `<div class="ac-person-header" style="background:#f5f0ff;margin:4px 0" onclick="toggleAc('${pid}')" data-target="${pid}"><span>${escapeHtml(g.nombre)}</span><span class="ac-gv-val">$${Number(g.total||0).toFixed(2)} ▾</span></div><div class="ac-person-body" id="${pid}">${items}</div>`;
  }).join('');
  return `<div class="ac-sec" style="margin-top:6px"><div class="ac-sec-header gv" onclick="toggleAc('${id}')" data-target="${id}"><span>Gastos varios</span><span class="ac-gv-val">$${Number(dia.totalGastosVarios||0).toFixed(2)} ▾</span></div><div class="ac-sec-body" id="${id}">${personas}<div class="ac-total-row"><span>Total</span><span class="ac-gv-val">$${Number(dia.totalGastosVarios||0).toFixed(2)}</span></div></div></div>`;
}
