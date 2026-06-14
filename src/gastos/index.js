let gastoTab = 'dia';
const AREA_COLORS = ['c1','c2','c3','c4','c5','c6'];
const DIAS_SEMANA_CORTO = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
let gastosVarios = [];

function setGastoTab(tab, el){
  gastoTab = tab;
  document.querySelectorAll('.g-tab').forEach(t=>t.classList.remove('active'));
  if(el) el.classList.add('active');
  renderGastos();
}

function filtrarEntradasPorPeriodo(periodo){
  const hoyStr = hoy();
  const entradas = movimientos.filter(m => m.tipo==='entrada');

  if(periodo==='dia'){
    return entradas.filter(m => m.fecha === hoyStr);
  }
  if(periodo==='semana'){
    const {start, end} = getWeekRange();
    return entradas.filter(m => {
      const d = new Date(m.fecha+'T12:00:00');
      return d >= start && d <= end;
    });
  }
  if(periodo==='mes'){
    const {start, end} = getMonthRange();
    return entradas.filter(m => {
      const d = new Date(m.fecha+'T12:00:00');
      return d >= start && d <= end;
    });
  }
  return entradas;
}

function calcularGastoProducto(mov){
  const prod = productos.find(p => norm(p.nombre) === norm(mov.producto));
  const costo = prod ? prod.costo : 0;
  return costo * mov.cant;
}

function renderGastos(){
  const entradas = filtrarEntradasPorPeriodo(gastoTab);
  let totalGasto = 0;
  entradas.forEach(m => { totalGasto += calcularGastoProducto(m); });

  const periodoLabels = {dia:'Hoy', semana:'Esta semana', mes:'Este mes'};
  document.getElementById('g-total-hero').textContent = '$' + totalGasto.toFixed(2);
  document.getElementById('g-periodo-lbl').textContent = periodoLabels[gastoTab];

  const prodsUnicos = new Set(entradas.map(m=>m.producto));
  const totalUnidades = entradas.reduce((s,m)=>s+m.cant, 0);
  document.getElementById('g-entradas-n').textContent = entradas.length;
  document.getElementById('g-productos-n').textContent = prodsUnicos.size;
  document.getElementById('g-unidades-n').textContent = totalUnidades;

  const byArea = {};
  entradas.forEach(m => {
    const area = m.area || 'Sin área';
    if(!byArea[area]) byArea[area] = 0;
    byArea[area] += calcularGastoProducto(m);
  });
  const areasOrdenadas = Object.entries(byArea).sort((a,b)=>b[1]-a[1]);
  const maxArea = areasOrdenadas.length > 0 ? areasOrdenadas[0][1] : 1;
  const chartAreas = document.getElementById('g-chart-areas');
  if(areasOrdenadas.length === 0){
    chartAreas.innerHTML = '<div style="font-size:13px;color:var(--text2);text-align:center;padding:12px">Sin datos</div>';
  } else {
    chartAreas.innerHTML = areasOrdenadas.map(([area, val], i) => {
      const pct = Math.max(5, (val/maxArea)*100);
      const color = AREA_COLORS[i % AREA_COLORS.length];
      return `<div class="chart-bar-row">
        <div class="chart-bar-label">${AREA_EMOJI[area]||'📦'} ${area}</div>
        <div class="chart-bar-track">
          <div class="chart-bar-fill ${color}" style="width:${pct}%">
            <span class="chart-bar-val">$${val.toFixed(0)}</span>
          </div>
        </div>
      </div>`;
    }).join('');
  }

  const chartDias = document.getElementById('g-chart-dias');
  const chartDiasTitle = document.getElementById('g-chart-dias-title');

  if(gastoTab === 'dia'){
    chartDiasTitle.textContent = 'Últimos 7 días';
    const dias = [];
    for(let i=6; i>=0; i--){
      const d = new Date();
      d.setDate(d.getDate()-i);
      const ds = d.getFullYear()+'-'+(d.getMonth()+1).toString().padStart(2,'0')+'-'+d.getDate().toString().padStart(2,'0');
      const dayName = i===0 ? 'Hoy' : i===1 ? 'Ayer' : DIAS_SEMANA_CORTO[d.getDay()];
      const gastosDia = movimientos.filter(m=>m.tipo==='entrada'&&m.fecha===ds);
      let total = 0;
      gastosDia.forEach(m=>{ total += calcularGastoProducto(m); });
      dias.push({label: dayName, val: total});
    }
    const maxDia = Math.max(...dias.map(d=>d.val), 1);
    chartDias.innerHTML = dias.map((d,i)=>{
      const pct = d.val > 0 ? Math.max(5, (d.val/maxDia)*100) : 0;
      const color = AREA_COLORS[i % AREA_COLORS.length];
      return `<div class="chart-bar-row">
        <div class="chart-bar-label">${d.label}</div>
        <div class="chart-bar-track">
          ${d.val > 0 ? `<div class="chart-bar-fill ${color}" style="width:${pct}%">
            <span class="chart-bar-val">$${d.val.toFixed(0)}</span>
          </div>` : ''}
        </div>
      </div>`;
    }).join('');

  } else if(gastoTab === 'semana'){
    chartDiasTitle.textContent = 'Desglose de la semana';
    const {start} = getWeekRange();
    const dias = [];
    for(let i=0; i<7; i++){
      const d = new Date(start);
      d.setDate(start.getDate()+i);
      const ds = d.getFullYear()+'-'+(d.getMonth()+1).toString().padStart(2,'0')+'-'+d.getDate().toString().padStart(2,'0');
      const dayName = DIAS_SEMANA_CORTO[d.getDay()] + ' ' + d.getDate();
      const gastosDia = movimientos.filter(m=>m.tipo==='entrada'&&m.fecha===ds);
      let total = 0;
      gastosDia.forEach(m=>{ total += calcularGastoProducto(m); });
      dias.push({label: dayName, val: total});
    }
    const maxDia = Math.max(...dias.map(d=>d.val), 1);
    chartDias.innerHTML = dias.map((d,i)=>{
      const pct = d.val > 0 ? Math.max(5, (d.val/maxDia)*100) : 0;
      const color = AREA_COLORS[i % AREA_COLORS.length];
      return `<div class="chart-bar-row">
        <div class="chart-bar-label">${d.label}</div>
        <div class="chart-bar-track">
          ${d.val > 0 ? `<div class="chart-bar-fill ${color}" style="width:${pct}%">
            <span class="chart-bar-val">$${d.val.toFixed(0)}</span>
          </div>` : ''}
        </div>
      </div>`;
    }).join('');

  } else {
    chartDiasTitle.textContent = 'Gasto por semana del mes';
    const {start, end} = getMonthRange();
    const semanas = [];
    let ws = new Date(start);
    let semNum = 1;
    while(ws <= end){
      const we = new Date(ws);
      we.setDate(ws.getDate()+6);
      if(we > end) we.setTime(end.getTime());
      const wsStr = ws.getDate() + '/' + (ws.getMonth()+1);
      const weStr = we.getDate() + '/' + (we.getMonth()+1);
      const label = 'Sem ' + semNum;
      const gastosS = movimientos.filter(m => {
        if(m.tipo!=='entrada') return false;
        const d = new Date(m.fecha+'T12:00:00');
        return d >= ws && d <= we;
      });
      let total = 0;
      gastosS.forEach(m=>{ total += calcularGastoProducto(m); });
      semanas.push({label, val: total, rango: wsStr+' - '+weStr});
      ws = new Date(we);
      ws.setDate(we.getDate()+1);
      semNum++;
    }
    const maxSem = Math.max(...semanas.map(s=>s.val), 1);
    chartDias.innerHTML = semanas.map((s,i)=>{
      const pct = s.val > 0 ? Math.max(5, (s.val/maxSem)*100) : 0;
      const color = AREA_COLORS[i % AREA_COLORS.length];
      return `<div class="chart-bar-row">
        <div class="chart-bar-label" title="${s.rango}">${s.label}</div>
        <div class="chart-bar-track">
          ${s.val > 0 ? `<div class="chart-bar-fill ${color}" style="width:${pct}%">
            <span class="chart-bar-val">$${s.val.toFixed(0)}</span>
          </div>` : ''}
        </div>
      </div>`;
    }).join('');
  }

  const detalle = document.getElementById('g-detalle-list');
  if(entradas.length === 0){
    detalle.innerHTML = '<div class="empty" style="padding:20px"><div class="empty-icon">💰</div><div class="empty-text">Sin compras registradas</div></div>';
  } else {
    const byProd = {};
    entradas.forEach(m => {
      const key = m.producto;
      if(!byProd[key]) byProd[key] = {cant:0, gasto:0, area:m.area};
      byProd[key].cant += m.cant;
      byProd[key].gasto += calcularGastoProducto(m);
    });
    const prodOrdenados = Object.entries(byProd).sort((a,b)=>b[1].gasto-a[1].gasto);
    detalle.innerHTML = prodOrdenados.map(([nombre, data])=>{
      return `<div class="gasto-item">
        <div class="gasto-item-icon">${AREA_EMOJI[data.area]||'📦'}</div>
        <div class="gasto-item-info">
          <div class="gasto-item-name">${nombre}</div>
          <div class="gasto-item-meta">${data.area||'—'} · ${data.cant} unid.</div>
        </div>
        <div class="gasto-item-val">$${data.gasto.toFixed(2)}</div>
      </div>`;
    }).join('');
  }
}

async function enviarGastoVariosAlSheet(g){
  if(!SHEET_URL) return;
  try{
    await postSheet({action:'gastoVarios',fecha:g.fecha,hora:g.hora,categoria:g.cat,descripcion:g.desc,monto:g.monto,responsable:g.resp,notas:g.notas});
  }catch(e){console.log('GV sync error:',e)}
}

async function cargarGastosVariosDesdeSheet(){
  if(!SHEET_URL) return;
  try{
    const resp = await fetch(sheetUrl({action:'getGastosVarios',t:Date.now()}),{method:'GET'});
    const text = await resp.text();
    const data = JSON.parse(text);
    if(data.ok && data.gastos && data.gastos.length>0){
      gastosVarios = data.gastos.map(g=>({
        id: g.id||Date.now(),
        cat: g.categoria||'Otro',
        desc: g.descripcion||'',
        monto: parseFloat(g.monto)||0,
        resp: g.responsable||'',
        notas: g.notas||'',
        fecha: g.fecha||'',
        hora: g.hora||''
      }));
      if(currentUser && currentUser.rol==='owner'){
        renderFlujoFinanciero();
        renderGastos();
      }
    }
  }catch(e){console.log('GV load error:',e)}
}

function filtrarGVPorPeriodo(periodo){
  const hoyStr = hoy();
  if(periodo==='dia') return gastosVarios.filter(g=>g.fecha===hoyStr);
  if(periodo==='semana'){
    const {start,end}=getWeekRange();
    return gastosVarios.filter(g=>{const d=new Date(g.fecha+'T12:00:00');return d>=start&&d<=end;});
  }
  if(periodo==='mes'){
    const {start,end}=getMonthRange();
    return gastosVarios.filter(g=>{const d=new Date(g.fecha+'T12:00:00');return d>=start&&d<=end;});
  }
  return gastosVarios;
}
