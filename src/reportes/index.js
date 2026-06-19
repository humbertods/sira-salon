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
  renderStaffMes();
  renderResumenGeneral();
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
        <span style="font-size:11px;color:var(--text2);flex:1">${area}</span>
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
          <div style="font-size:13px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${nombre}</div>
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
      <span style="font-size:13px;font-weight:500;color:var(--text)">${d.nombre}</span>
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
            <span style="font-size:13px;font-weight:600;color:var(--text)">${d.nombre}</span>
            <span style="font-size:10px;color:var(--text2);margin-left:4px">${u?.cargo||''}</span>
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
            <span style="color:var(--text)">${g.desc} <span style="color:var(--text2)">(${g.cat})</span></span>
            <span style="font-weight:600;color:#8e44ad">$${g.monto.toFixed(2)}</span>
          </div>`
        ).join('');
        return `<div style="border-bottom:1px solid var(--border)">
          <div style="display:flex;justify-content:space-between;padding:10px 16px;cursor:pointer;background:var(--card)" onclick="toggleAc('rg-gv-${nombre}')">
            <span style="font-size:13px;font-weight:600;color:var(--text)">${nombre}</span>
            <div style="display:flex;align-items:center;gap:6px">
              <span style="font-size:13px;font-weight:700;color:#8e44ad">$${data.total.toFixed(2)}</span>
              <span style="font-size:10px;color:var(--text2)">▾</span>
            </div>
          </div>
          <div class="ac-dia-body" id="rg-gv-${nombre}">${detalles}</div>
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
  document.querySelectorAll('#ow-reportes .g-tab').forEach(t=>t.classList.remove('active'));
  if(el) el.classList.add('active');
  renderFlujoFinanciero();
}

function getDiasSemana(){
  const {start} = getWeekRange();
  const dias = [];
  for(let i=0;i<7;i++){
    const d=new Date(start);d.setDate(start.getDate()+i);
    const ds=d.getFullYear()+'-'+(d.getMonth()+1).toString().padStart(2,'0')+'-'+d.getDate().toString().padStart(2,'0');
    dias.push({date:d, dateStr:ds});
  }
  return dias;
}

function getDiasMes(){
  const now=new Date();
  const start=new Date(now.getFullYear(),now.getMonth(),1);
  const end=new Date(now.getFullYear(),now.getMonth()+1,0);
  const dias=[];
  for(let d=new Date(start);d<=end;d.setDate(d.getDate()+1)){
    const ds=d.getFullYear()+'-'+(d.getMonth()+1).toString().padStart(2,'0')+'-'+d.getDate().toString().padStart(2,'0');
    dias.push({date:new Date(d), dateStr:ds});
  }
  return dias;
}

function getNombreDia(d){
  const nombres=['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  return nombres[d.getDay()];
}

function costoMov(m){
  const prod=productos.find(p=>norm(p.nombre)===norm(m.producto));
  return (prod?prod.costo:0)*m.cant;
}

function toggleAc(id){
  const el=document.getElementById(id);
  if(el) el.classList.toggle('open');
  const hdr=document.querySelector('[data-target="'+id+'"]');
  if(hdr) hdr.classList.toggle('open');
}

function renderFlujoFinanciero(){
  const container=document.getElementById('rf-acordeon');
  if(!container) return;

  let diasData=[];
  if(flujoTab==='dia'){
    const ds=hoy();
    const d=new Date();
    diasData=[{date:d,dateStr:ds}];
  } else if(flujoTab==='semana'){
    diasData=getDiasSemana();
  } else {
    diasData=getDiasMes();
  }

  const diasConData=diasData.filter(dia=>{
    const tieneMovs=movimientos.some(m=>m.fecha===dia.dateStr);
    const tieneGV=gastosVarios.some(g=>g.fecha===dia.dateStr);
    return tieneMovs||tieneGV;
  });

  if(diasConData.length===0){
    container.innerHTML='<div class="empty" style="padding:20px"><div class="empty-text">Sin movimientos en el período</div></div>';
    return;
  }

  container.innerHTML=diasConData.reverse().map((dia,dIdx)=>{
    const movsDia=movimientos.filter(m=>m.fecha===dia.dateStr);
    const gvDia=gastosVarios.filter(g=>g.fecha===dia.dateStr);
    const nombreDia=getNombreDia(dia.date);
    const fechaCorta=dia.date.getDate()+'/'+(dia.date.getMonth()+1);
    let totalEntradas=0,totalSalidas=0,totalGV=0;
    movsDia.forEach(m=>{
      if(m.tipo==='entrada') totalEntradas+=costoMov(m);
      else totalSalidas+=costoMov(m);
    });
    gvDia.forEach(g=>{totalGV+=g.monto;});

    const byPerson={};
    movsDia.forEach(m=>{
      if(!byPerson[m.resp]) byPerson[m.resp]={entradas:[],salidas:[]};
      if(m.tipo==='entrada') byPerson[m.resp].entradas.push(m);
      else byPerson[m.resp].salidas.push(m);
    });
    const gvByPerson={};
    gvDia.forEach(g=>{
      if(!gvByPerson[g.resp]) gvByPerson[g.resp]=[];
      gvByPerson[g.resp].push(g);
    });

    const isToday=dia.dateStr===hoy();
    const diaId='ac-dia-'+dIdx;
    const personasHtml=Object.entries(byPerson).map(([nombre,data],pIdx)=>{
      const pId=diaId+'-p-'+pIdx;
      let pEntradas=0,pSalidas=0;
      data.entradas.forEach(m=>{pEntradas+=costoMov(m);});
      data.salidas.forEach(m=>{pSalidas+=costoMov(m);});
      const prodEntradas={};
      data.entradas.forEach(m=>{
        if(!prodEntradas[m.producto]) prodEntradas[m.producto]=0;
        prodEntradas[m.producto]+=costoMov(m);
      });
      const prodSalidas={};
      data.salidas.forEach(m=>{
        if(!prodSalidas[m.producto]) prodSalidas[m.producto]=0;
        prodSalidas[m.producto]+=costoMov(m);
      });
      const prodsHtml=[
        ...Object.entries(prodEntradas).map(([prod,val])=>
          `<div class="ac-prod-row"><span class="ac-prod-name entrada">+ ${prod}</span><span class="ac-val-e">↑$${val.toFixed(0)}</span></div>`),
        ...Object.entries(prodSalidas).map(([prod,val])=>
          `<div class="ac-prod-row"><span class="ac-prod-name salida">- ${prod}</span><span class="ac-val-s">↓$${val.toFixed(0)}</span></div>`)
      ].join('');

      return `<div class="ac-person">
        <div class="ac-person-header" onclick="toggleAc('${pId}')" data-target="${pId}">
          <span>${nombre}</span>
          <div class="ac-totals">
            ${pEntradas>0?'<span class="te">↑$'+pEntradas.toFixed(0)+'</span>':''}
            ${pSalidas>0?'<span class="ts">↓$'+pSalidas.toFixed(0)+'</span>':''}
            <span style="font-size:11px;color:var(--text2)">▾</span>
          </div>
        </div>
        <div class="ac-person-body" id="${pId}">${prodsHtml}</div>
      </div>`;
    }).join('');

    let gvHtml='';
    if(gvDia.length>0){
      const gvId=diaId+'-gv';
      const gvPersonasHtml=Object.entries(gvByPerson).map(([nombre,gastos])=>{
        const totalP=gastos.reduce((s,g)=>s+g.monto,0);
        const detalle=gastos.map(g=>
          `<div class="ac-gv-item"><span class="ac-gv-desc" style="padding-left:16px">${g.desc}</span><span class="ac-gv-val">$${g.monto.toFixed(0)}</span></div>`
        ).join('');
        return `<div class="ac-person-header" style="background:#f5f0ff;margin:4px 0" onclick="toggleAc('${gvId}-${nombre}')">
          <span>${nombre}</span><span class="ac-gv-val">$${totalP.toFixed(0)} ▾</span>
        </div>
        <div class="ac-person-body" id="${gvId}-${nombre}">${detalle}</div>`;
      }).join('');

      gvHtml=`<div class="ac-sec" style="margin-top:6px">
        <div class="ac-sec-header gv" onclick="toggleAc('${gvId}')">
          <span>Gastos varios</span>
          <span class="ac-gv-val">$${totalGV.toFixed(0)} ▾</span>
        </div>
        <div class="ac-sec-body" id="${gvId}">${gvPersonasHtml}
          <div class="ac-total-row"><span>Total</span><span class="ac-gv-val">$${totalGV.toFixed(0)}</span></div>
        </div>
      </div>`;
    }

    return `<div class="ac-dia">
      <div class="ac-dia-header ${isToday?'open':''}" onclick="toggleAc('${diaId}')" data-target="${diaId}">
        <span>${nombreDia} ${fechaCorta}</span>
        <div style="display:flex;align-items:center;gap:8px">
          <span class="ac-dia-arrow">▾</span>
        </div>
      </div>
      <div class="ac-dia-body ${isToday?'open':''}" id="${diaId}">
        <div class="ac-sec">
          <div class="ac-sec-header" onclick="toggleAc('${diaId}-gen')">
            <span>Gastos generales</span>
            <div class="ac-totals">
              ${totalEntradas>0?'<span class="te">↑$'+totalEntradas.toFixed(0)+'</span>':''}
              ${totalSalidas>0?'<span class="ts">↓$'+totalSalidas.toFixed(0)+'</span>':''}
              <span style="font-size:11px;color:var(--text2)">▾</span>
            </div>
          </div>
          <div class="ac-sec-body" id="${diaId}-gen">
            ${personasHtml}
            <div class="ac-total-row">
              <span>Total</span>
              <div class="ac-totals">
                <span class="te">↑$${totalEntradas.toFixed(0)}</span>
                <span class="ts">↓$${totalSalidas.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>
        ${gvHtml}
      </div>
    </div>`;
  }).join('');
}
