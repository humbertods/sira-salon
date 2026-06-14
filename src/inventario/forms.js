function populateSelects(){
  const opts='<option value="">Seleccioná un producto</option>'+
    productos.map(p=>`<option value="${p.id}">${p.nombre} (${p.stock} ${p.unidad})</option>`).join('');
  ['e-prod','s-prod'].forEach(id=>document.getElementById(id).innerHTML=opts);

  const areaOpts='<option value="">— Área —</option>'+AREAS.map(a=>`<option>${a}</option>`).join('');
  ['e-area-mov','s-area-mov'].forEach(id=>document.getElementById(id).innerHTML=areaOpts);

  const respOpts=`<option value="${currentUser.nombre}" selected>${currentUser.nombre}</option>`+
    usuarios.filter(u=>u.nombre!==currentUser.nombre).map(u=>`<option>${u.nombre}</option>`).join('');
  ['e-resp','s-resp'].forEach(id=>document.getElementById(id).innerHTML=respOpts);
}

function filtrarSelect(selectId, query){
  const select = document.getElementById(selectId);
  const q = query.toLowerCase().trim();
  const opts = productos
    .filter(p => !q || p.nombre.toLowerCase().includes(q))
    .sort((a,b) => a.nombre.localeCompare(b.nombre));
  select.innerHTML = '<option value="">Seleccioná un producto</option>' +
    opts.map(p => `<option value="${p.id}">${p.nombre} (${p.stock} ${p.unidad})</option>`).join('');
}

function agregarProducto(){
  const nombre=document.getElementById('np-nombre').value.trim();
  const area=document.getElementById('np-area').value;
  const unidad=document.getElementById('np-unidad').value;
  const stock=parseInt(document.getElementById('np-stock').value)||0;
  const min=parseInt(document.getElementById('np-min').value)||0;
  const costo=parseFloat(document.getElementById('np-costo').value)||0;
  const notas=document.getElementById('np-notas').value.trim();
  if(!nombre){showToast('⚠️ Ingresá el nombre del producto');return}
  if(!area){showToast('⚠️ Seleccioná el área');return}
  const newProd={id:Date.now(),nombre,area,unidad,stock,min,costo,notas,
    estado:getEstado(stock,min)};
  productos.push(newProd);
  closeModal('nuevo-producto');
  ['np-nombre','np-stock','np-min','np-costo','np-notas'].forEach(id=>document.getElementById(id).value='');
  showToast(`✅ ${nombre} guardando en Drive...`);
  guardarProductoEnSheet(newProd).then(()=>{
    showToast(`✅ ${nombre} guardado en Drive`);
  });
  refreshAll();
  populateSelects();
}
