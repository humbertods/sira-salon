let histTab = 'hoy';

function setHistTab(tab, el){
  histTab = tab;
  document.querySelectorAll('#ow-movs .g-tab').forEach(t=>t.classList.remove('active'));
  if(el) el.classList.add('active');
  renderMovs('ow');
}

function getHistFechas(){
  const hoyStr = hoy();
  if(histTab === 'hoy') return [hoyStr];
  if(histTab === 'ayer'){
    const d = new Date(); d.setDate(d.getDate()-1);
    return [d.getFullYear()+'-'+(d.getMonth()+1).toString().padStart(2,'0')+'-'+d.getDate().toString().padStart(2,'0')];
  }
  const {start} = getWeekRange();
  const fechas = [];
  for(let i=0;i<7;i++){
    const d = new Date(start); d.setDate(start.getDate()+i);
    fechas.push(d.getFullYear()+'-'+(d.getMonth()+1).toString().padStart(2,'0')+'-'+d.getDate().toString().padStart(2,'0'));
  }
  return fechas;
}

function renderMovs(prefix){
  const listId=prefix+'-mov-list';
  const list=document.getElementById(listId);
  if(!list) return;

  if(prefix==='ow'){
    const fechasValidas = getHistFechas();
    const movsFiltrados = movimientos.filter(m => fechasValidas.includes(m.fecha));

    if(movsFiltrados.length===0){
      list.innerHTML='<div class="empty" style="padding:30px"><div class="empty-icon">📋</div><div class="empty-text">Sin movimientos</div></div>';
      return;
    }

    const byPerson = {};
    movsFiltrados.forEach(m => {
      if(!byPerson[m.resp]) byPerson[m.resp] = [];
      byPerson[m.resp].push(m);
    });

    const personasOrdenadas = Object.entries(byPerson).sort((a,b) => b[1].length - a[1].length);

    list.innerHTML = personasOrdenadas.map(([nombre, movs], pIdx) => {
      const u = usuarios.find(x => x.nombre === nombre);
      const avColor = u?.rol==='ceo'?'#34A853':u?.rol==='owner'?'#BFA26F':'#8A8A8A';
      const totalE = movs.filter(m=>m.tipo==='entrada').reduce((s,m)=>s+m.cant,0);
      const totalS = movs.filter(m=>m.tipo==='salida').reduce((s,m)=>s+m.cant,0);
      const pId = 'hist-p-'+pIdx;

      const grupos = {};
      const orden = [];
      [...movs].reverse().forEach(m => {
        const gid = m.grupo || (m.resp+'_'+m.fecha+'_'+m.hora+'_'+Math.random());
        if(!grupos[gid]){
          grupos[gid] = {fecha:m.fecha, hora:m.hora||'', tipo:m.tipo, items:[], esCombo:m.esCombo||false, esKit:m.esKit||false};
          orden.push(gid);
        }
        grupos[gid].items.push(m);
      });

      const movsHtml = orden.map(gid => {
        const g = grupos[gid];
        const fechaParts = g.fecha ? g.fecha.split('-') : ['','',''];
        const fechaCorta = fechaParts.length===3 ? fechaParts[2]+'/'+fechaParts[1] : g.fecha;
        const icono = g.esCombo ? '☕' : g.esKit ? '👁' : g.tipo==='entrada' ? '📥' : '📤';

        return g.items.map(m =>
          `<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid var(--border)">
            <span style="font-size:14px">${icono}</span>
            <div style="flex:1;min-width:0">
              <div style="font-size:12px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${m.producto}</div>
              <div style="font-size:10px;color:var(--text2)">${fechaCorta} ${g.hora} · ${m.area||''}</div>
            </div>
            <span style="font-size:14px;font-weight:700;color:${m.tipo==='entrada'?'var(--ok)':'var(--danger)'}">${m.tipo==='entrada'?'+':'-'}${m.cant}</span>
          </div>`
        ).join('');
      }).join('');

      return `<div style="margin-bottom:10px">
        <div class="ac-dia-header" onclick="toggleAc('${pId}')" data-target="${pId}" style="background:var(--card);color:var(--text);border:1px solid var(--border);box-shadow:var(--shadow-sm)">
          <div style="display:flex;align-items:center;gap:10px">
            <div style="width:36px;height:36px;border-radius:50%;background:${avColor}15;display:flex;align-items:center;justify-content:center;flex-shrink:0">
              <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                <circle cx="12" cy="8" r="4" fill="${avColor}"/>
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="${avColor}" stroke-width="1.5" stroke-linecap="round" fill="none"/>
              </svg>
            </div>
            <div>
              <div style="font-size:14px;font-weight:600">${nombre}</div>
              <div style="font-size:11px;color:var(--text2);font-weight:400">${u?.cargo||''} · ${movs.length} mov.</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            ${totalE>0?'<span style="font-size:12px;font-weight:700;color:var(--ok)">+'+totalE+'</span>':''}
            ${totalS>0?'<span style="font-size:12px;font-weight:700;color:var(--danger)">-'+totalS+'</span>':''}
            <span class="ac-dia-arrow">▾</span>
          </div>
        </div>
        <div class="ac-dia-body" id="${pId}" style="background:var(--card);border:1px solid var(--border);border-top:0;border-radius:0 0 var(--r) var(--r);overflow:hidden">
          ${movsHtml}
        </div>
      </div>`;
    }).join('');

  } else {
    if(movimientos.length===0){list.innerHTML='<div class="empty"><div class="empty-icon">📋</div><div class="empty-text">Sin movimientos</div></div>';return;}
    list.innerHTML=[...movimientos].reverse().map(m=>`
      <div class="mov-card">
        <div class="mov-badge ${m.tipo}">${m.tipo==='entrada'?'📥':'📤'}</div>
        <div class="mov-info"><div class="mov-prod">${m.producto}</div><div class="mov-det">${m.resp} · ${m.area} · ${m.fecha}${m.hora?' '+m.hora:''}</div></div>
        <div class="mov-qty ${m.tipo}">${m.tipo==='entrada'?'+':'-'}${m.cant}</div>
      </div>`).join('');
  }
}

function renderStaffHoy(){
  const kitBtn = document.getElementById('kit-lashista-btn');
  if(kitBtn) kitBtn.style.display = (currentUser && currentUser.cargo==='Lashista') ? 'block' : 'none';
  const list=document.getElementById('staff-movs-hoy');
  if(!list) return;
  const mios=movimientos.filter(m=>m.resp===currentUser.nombre&&m.fecha===hoy());
  if(mios.length===0){list.innerHTML=`<div class="empty" style="padding:20px"><div class="empty-icon">📋</div><div class="empty-text">Todavía no registraste nada hoy</div></div>`;return;}
  list.innerHTML=[...mios].reverse().map(m=>`
    <div class="mov-card">
      <div class="mov-badge ${m.tipo}">${m.tipo==='entrada'?'📥':'📤'}</div>
      <div class="mov-info"><div class="mov-prod">${m.producto}</div><div class="mov-det">${m.tipo==='entrada'?'Entrada':'Salida'} · ${m.cant} unid.</div></div>
      <div class="mov-qty ${m.tipo}">${m.tipo==='entrada'?'+':'-'}${m.cant}</div>
    </div>`).join('');
}
