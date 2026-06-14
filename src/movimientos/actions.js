function selectKit(n){
  document.querySelectorAll('.kit-num').forEach(el=>el.classList.remove('selected'));
  event.target.classList.add('selected');
  document.getElementById('kit-cantidad').value = n;
  const btn = document.getElementById('kit-confirm-btn');
  btn.style.opacity='1'; btn.style.pointerEvents='all';
}

function doKitLashista(){
  if(_procesando) return;
  _procesando = true;
  const cant = parseInt(document.getElementById('kit-cantidad').value) || 0;
  if(!cant){ showToast('⚠️ Seleccioná la cantidad'); _procesando=false; return; }
  const KIT = ['Frasco para shampo','Funda kit pestaña','Tarjeta pestaña'];
  const resp = currentUser ? currentUser.nombre : '—';
  const fecha = hoy();
  let errores = [];
  KIT.forEach(nombre => {
    const p = productos.find(x => norm(x.nombre) === norm(nombre));
    if(!p){ errores.push(nombre + ' (no existe)'); }
    else if(p.stock < cant){ errores.push(nombre + ' (stock insuficiente)'); }
  });
  if(errores.length > 0){ showToast('⚠️ ' + errores.join(', ')); _procesando=false; return; }
  const tsK = new Date();
  const horaK = horaGuayaquil();
  const grupoK = resp+'_kit_'+tsK.getTime();
  const batchMovs = [];
  const batchStock = [];
  KIT.forEach(nombre => {
    const p = productos.find(x => norm(x.nombre) === norm(nombre));
    if(p){
      p.stock = Math.max(0, p.stock - cant);
      movimientos.push({tipo:'salida',producto:p.nombre,cant,resp,area:'Pestañas',fecha,tipoUnidad:'Unidad',hora:horaK,grupo:grupoK,esKit:true});
      batchMovs.push({tipo:'salida',producto:p.nombre,cantidad:cant,responsable:resp,area:'Pestañas',fecha,tipoUnidad:'Unidad',hora:horaK,grupo:grupoK});
      batchStock.push({nombre:p.nombre,stock:p.stock});
    }
  });
  enviarBatchAlSheet(batchMovs);
  closeModal('kit');
  document.getElementById('kit-cantidad').value=0;
  document.querySelectorAll('.kit-num').forEach(el=>el.classList.remove('selected'));
  const btn=document.getElementById('kit-confirm-btn');
  btn.style.opacity='0.35'; btn.style.pointerEvents='none';
  refreshAll();
  setTimeout(()=>{ showConfirm('👁', cant+' Kit'+(cant>1?'s':'')+' registrado'+(cant>1?'s':''), cant+' × Frasco + Funda + Tarjeta descontados'); _procesando=false; }, 300);
}

const COMBOS = {
  'Capuccino frío':          ['Capuccino frio','Servilleta logo','Galleta'],
  'Capuccino caliente':      ['Capuccino caliente','Servilleta logo','Galleta'],
  'Café negro':              ['Cafe negro','Servilleta logo','Galleta'],
  'Té de manzanilla c/m':   ['Te de manzanilla c/m','Servilleta logo','Galleta'],
  'Té de manzanilla':       ['Te de manzanilla','Servilleta logo','Galleta'],
  'Té de anís':             ['Te de anis','Servilleta logo','Galleta'],
  'Té de frutos rojos':     ['Te de frutos rojos','Servilleta logo','Galleta'],
  'Té de frutos rojos c/J': ['Te de frutos rojos c/J','Servilleta logo','Galleta'],
  'Té relajante':           ['Te relajante','Servilleta logo','Galleta'],
  'Té de manzana con canela':['Te de manzana con canela','Servilleta logo','Galleta'],
  'Té de hierva luisa':     ['Te de hierva luisa','Servilleta logo','Galleta'],
  'Té de jamaica':          ['Te de jamaica','Servilleta logo','Galleta'],
  'Champagne':              ['Champagne','Servilleta logo','Galleta'],
  'Vino tinto':             ['Vino tinto','Servilleta logo','Galleta'],
  'Vino rosado':            ['Vino rosado','Servilleta logo','Galleta'],
};

document.addEventListener('change', function(e){
  if(e.target.id==='combo-sel'){
    const val = e.target.value;
    const preview = document.getElementById('combo-preview');
    const txt = document.getElementById('combo-preview-txt');
    const ck = Object.keys(COMBOS).find(k => norm(k) === norm(val));
    if(val && ck){
      txt.textContent = COMBOS[ck].join(' + ');
      preview.style.display='block';
    } else {
      preview.style.display='none';
    }
  }
});

var _procesando = false;

function doCombo(){
  if(_procesando) return;
  _procesando = true;
  const bebida = document.getElementById('combo-sel').value;
  if(!bebida){ showToast('Seleccioná una bebida'); _procesando=false; return; }
  const comboKey = Object.keys(COMBOS).find(k => norm(k) === norm(bebida));
  const items = comboKey ? COMBOS[comboKey] : null;
  if(!items){ showToast('Combo no encontrado: '+bebida); _procesando=false; return; }
  const resp = currentUser ? currentUser.nombre : '—';
  const fecha = hoy();
  let errores = [];
  items.forEach(nombre => {
    const p = productos.find(x => norm(x.nombre) === norm(nombre));
    if(!p){ errores.push(nombre + ' (no existe)'); }
    else if(p.stock <= 0){ errores.push(nombre + ' (sin stock)'); }
  });
  if(errores.length > 0){ showToast('Sin stock: ' + errores.join(', ')); _procesando=false; return; }
  const tsC = new Date();
  const horaC = horaGuayaquil();
  const grupoC = resp+'_combo_'+tsC.getTime();
  const batchMovs = [];
  const batchStock = [];
  items.forEach(nombre => {
    const p = productos.find(x => norm(x.nombre) === norm(nombre));
    if(p){
      p.stock = Math.max(0, p.stock - 1);
      movimientos.push({tipo:'salida',producto:p.nombre,cant:1,resp,area:'Coffee',fecha,tipoUnidad:'Unidad',hora:horaC,grupo:grupoC,esCombo:true,nombreCombo:bebida});
      batchMovs.push({tipo:'salida',producto:p.nombre,cantidad:1,responsable:resp,area:'Coffee',fecha,tipoUnidad:'Unidad',hora:horaC,grupo:grupoC});
      batchStock.push({nombre:p.nombre,stock:p.stock});
    }
  });
  if(batchMovs.length !== items.length){
    showToast('⚠️ Error: solo se procesaron '+batchMovs.length+' de '+items.length+' items');
    _procesando=false;
    return;
  }
  enviarBatchAlSheet(batchMovs);
  closeModal('combos');
  document.getElementById('combo-sel').value='';
  document.getElementById('combo-preview').style.display='none';
  refreshAll();
  setTimeout(()=>{ showConfirm('☕', bebida, 'Bebida + Servilleta + Galleta descontados'); _procesando=false; }, 300);
}

function doMov(tipo){
  if(_procesando) return;
  _procesando = true;
  const c=tipo[0];
  const pid=parseInt(document.getElementById(c+'-prod').value);
  const cant=parseInt(document.getElementById(c+'-cant').value);
  const area=document.getElementById(c+'-area-mov').value;
  const resp=document.getElementById(c+'-resp').value;
  const tipoUnidad=tipo==='salida'?(document.getElementById('s-tipo-unidad').value||'Unidad'):'';
  if(!pid){showToast('⚠️ Seleccioná un producto');_procesando=false;return}
  if(!cant||cant<=0){showToast('⚠️ Ingresá una cantidad válida');_procesando=false;return}
  const prod=productos.find(p=>p.id===pid);
  if(!prod){_procesando=false;return}
  if(tipo==='salida'&&cant>prod.stock){showToast(`Sin stock suficiente (${prod.stock} unid.)`);_procesando=false;return}
  prod.stock+=tipo==='entrada'?cant:-cant;
  const ts = new Date();
  const horaStr = horaGuayaquil();
  const grupoId = resp+'_'+ts.getTime();
  movimientos.push({tipo,producto:prod.nombre,cant,resp,area:area||prod.area,fecha:hoy(),tipoUnidad,hora:horaStr,grupo:grupoId});
  closeModal(tipo);
  const waNotif = tipo==='entrada' ? '📦 *SIRA — Nuevo ingreso*\n\n✅ +'+cant+' '+prod.nombre+'\n📍 Área: '+(area||prod.area)+'\n👤 '+resp+'\n📊 Stock actual: '+prod.stock+' unid.\n\n_Inventario actualizado_' : '';
  showConfirm(tipo==='entrada'?'📥':'✅', tipo==='entrada'?'Entrada registrada':'Salida registrada', (tipo==='entrada'?'+':'-')+cant+' '+prod.nombre, waNotif);
  refreshAll();
  populateSelects();
  enviarAlSheet(tipo,prod.nombre,cant,resp,area||prod.area,tipoUnidad,horaStr,grupoId);
  setTimeout(()=>{_procesando=false;}, 500);
}

function refreshAll(){
  if(currentUser.rol==='owner'){renderOwnerInicio();renderStock('ow');renderMovs('ow');renderReportes();renderGastos();}
  else if(currentUser.rol==='ceo'){renderCEOInicio();renderStock('ceo');renderMovs('ceo');}
  else renderStaffHoy();
}
