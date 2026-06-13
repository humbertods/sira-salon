function renderDashboard(prefix){
  const alertas=productos.filter(p=>p.stock<=p.min);
  const ok=productos.filter(p=>p.stock>p.min);
  const valor=productos.reduce((s,p)=>s+p.stock*p.costo,0);
  document.getElementById(prefix+'-total').textContent=productos.length;
  document.getElementById(prefix+'-alertas').textContent=alertas.length;
  document.getElementById(prefix+'-ok').textContent=ok.length;
  if(prefix!=='ceo') document.getElementById(prefix+'-valor').textContent='$'+Math.round(valor);
  const list=document.getElementById(prefix+'-alerts');
  if(!list) return;
  if(alertas.length===0){list.innerHTML=`<div class="ok-banner">✅ Todo el stock está en orden</div>`;return;}
  list.innerHTML=alertas.slice(0,4).map(p=>`
    <div class="alert-strip" onclick="${prefix==='ow'?'owNav':'ceoNav'}('stock')">
      <span class="al-icon">${p.stock===0?'🚫':'⚠️'}</span>
      <div class="al-body"><div class="al-title">${p.nombre}</div><div class="al-sub">${p.area} · Stock: ${p.stock} / Mín: ${p.min}</div></div>
      <span class="al-arrow">›</span>
    </div>`).join('');
}

function renderOwnerInicio(){renderDashboard('ow');}
function renderCEOInicio(){renderDashboard('ceo');}

function renderStock(prefix){
  const searchId = prefix+'-search';
  const listId   = prefix+'-prod-list';
  const q=(document.getElementById(searchId)||{value:''}).value.toLowerCase();
  const f=productos.filter(p=>(activeArea==='Todos'||p.area===activeArea)&&p.nombre.toLowerCase().includes(q));
  const list=document.getElementById(listId);
  if(!list) return;
  if(f.length===0){list.innerHTML=`<div class="empty"><div class="empty-icon">🔍</div><div class="empty-text">Sin resultados</div></div>`;return;}
  list.innerHTML=f.map(p=>{
    const st=p.stock===0?'danger':p.stock<=p.min?'warn':'ok';
    const col=p.stock===0?'var(--danger)':p.stock<=p.min?'var(--warn)':'var(--ok)';
    return`<div class="prod-card st-${st}">
      <div class="prod-av ${currentUser&&currentUser.rol==='owner'?'owner-tap':''}" ${currentUser&&currentUser.rol==='owner'?'onclick="abrirFoto(\''+p.nombre.replace(/'/g,"\\'")+'\')"':''}>${productoFotos[p.nombre]?'<img src="'+productoFotos[p.nombre]+'" alt="">':''}</div>
      <div class="prod-info">
        <div class="prod-name">${p.nombre}</div>
        <div class="prod-meta">${p.area} · ${p.unidad}</div>
      </div>
      <div class="prod-stk"><div class="prod-stk-n" style="color:${col}">${p.stock}</div><div class="prod-stk-l">unid.</div></div>
      <div class="sdot ${st}"></div>
    </div>`;}).join('');
}

function setArea(a,el,prefix){
  activeArea=a;
  document.querySelectorAll('.pill').forEach(p=>p.classList.remove('active'));
  el.classList.add('active');
  renderStock(prefix);
}
