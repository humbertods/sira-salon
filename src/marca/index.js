let productosMarca = [
  {id:1,  nombre:'Gel fijador de cejas tipo brow',          stock:0, min:3, precio:0, unidad:'Unidad'},
  {id:2,  nombre:'Gel fijador de cejas tipo rimel',         stock:0, min:3, precio:0, unidad:'Unidad'},
  {id:3,  nombre:'Pomada de cejas — Dark Brown',            stock:0, min:3, precio:0, unidad:'Unidad'},
  {id:4,  nombre:'Pomada de cejas — Medium Brown',          stock:0, min:3, precio:0, unidad:'Unidad'},
  {id:5,  nombre:'Pomada de cejas — Auburn',                stock:0, min:3, precio:0, unidad:'Unidad'},
  {id:6,  nombre:'Pomada de cejas — Soft Brown',            stock:0, min:3, precio:0, unidad:'Unidad'},
  {id:7,  nombre:'Brocha de cejas',                         stock:0, min:3, precio:0, unidad:'Unidad'},
  {id:8,  nombre:'Brocha de contorno de cejas',             stock:0, min:3, precio:0, unidad:'Unidad'},
  {id:9,  nombre:'Brocha para difuminar',                   stock:0, min:3, precio:0, unidad:'Unidad'},
  {id:10, nombre:'Brocha de contorno',                      stock:0, min:3, precio:0, unidad:'Unidad'},
  {id:11, nombre:'Brocha de rubor',                         stock:0, min:3, precio:0, unidad:'Unidad'},
  {id:12, nombre:'Tijera',                                  stock:0, min:2, precio:0, unidad:'Unidad'},
  {id:13, nombre:'Pinza de cejas',                          stock:0, min:2, precio:0, unidad:'Unidad'},
  {id:14, nombre:'Brocha Laura 2 en 1',                     stock:0, min:3, precio:0, unidad:'Unidad'},
];
let pedidosMarca=[];
let movsMarca=[];
let tipoMovMarca='entrada';

function renderMarca(prefix){
  const alertas=productosMarca.filter(p=>p.stock<=p.min);
  const ok=productosMarca.filter(p=>p.stock>p.min);
  const totalU=productosMarca.reduce((s,p)=>s+p.stock,0);
  const pre=prefix==='ow';
  const ids=pre?['m-total','m-alertas','m-ok','m-total-u']:['cm-total','cm-alertas','cm-ok','cm-total-u'];
  const listId=pre?'marca-prod-list':'cmarca-prod-list';
  const pedId=pre?'marca-pedidos-list':'cmarca-pedidos-list';
  const movId=pre?'marca-movs-list':'cmarca-movs-list';
  ids.forEach((id,i)=>{ const el=document.getElementById(id); if(el) el.textContent=[productosMarca.length,alertas.length,ok.length,totalU][i]; });
  const list=document.getElementById(listId);
  if(list) list.innerHTML=productosMarca.map(p=>{
    const st=p.stock===0?'danger':p.stock<=p.min?'warn':'ok';
    const col=p.stock===0?'var(--danger)':p.stock<=p.min?'var(--warn)':'var(--ok)';
    return`<div class="prod-card st-${st}"><div class="prod-av">💄</div>
      <div class="prod-info"><div class="prod-name">${p.nombre}</div><div class="prod-meta">${p.unidad} · $${p.precio.toFixed(2)}</div></div>
      <div class="prod-stk"><div class="prod-stk-n" style="color:${col}">${p.stock}</div><div class="prod-stk-l">unid.</div></div>
      <div style="display:flex;flex-direction:column;gap:4px;margin-left:4px">
        <button class="btn-mini ok" onclick="abrirMovMarca(${p.id},'entrada')">+</button>
        <button class="btn-mini del" onclick="abrirMovMarca(${p.id},'salida')">−</button>
      </div></div>`;
  }).join('');
  const pedList=document.getElementById(pedId);
  if(pedList) pedList.innerHTML=pedidosMarca.length===0
    ?'<div class="empty" style="padding:16px"><div class="empty-text">Sin pedidos pendientes</div></div>'
    :pedidosMarca.map((p,i)=>`<div class="pedido-card">
      <div class="pedido-info"><div class="pedido-prod">${p.producto}</div><div class="pedido-det">Proveedor: ${p.proveedor} · Llega: ${p.fechaEstimada || p.fecha}</div></div>
      <div class="pedido-cant">${p.cantidad}</div>
      <div class="pedido-actions">
        <button class="btn-mini ok" onclick="recibirPedido(${i})">✓</button>
        <button class="btn-mini del" onclick="cancelarPedido(${i})">✗</button>
      </div></div>`).join('');
  const movList=document.getElementById(movId);
  if(movList) movList.innerHTML=movsMarca.length===0
    ?'<div class="empty" style="padding:16px"><div class="empty-text">Sin movimientos aún</div></div>'
    :[...movsMarca].reverse().slice(0,10).map(m=>`<div class="mov-card">
      <div class="mov-badge ${m.tipo}">${m.tipo==='entrada'?'📥':'📤'}</div>
      <div class="mov-info"><div class="mov-prod">${m.producto}</div><div class="mov-det">${m.resp} · ${m.fecha}</div></div>
      <div class="mov-qty ${m.tipo}">${m.tipo==='entrada'?'+':'-'}${m.cant}</div></div>`).join('');
}

function abrirMovMarca(pid,tipo){
  tipoMovMarca=tipo;
  document.getElementById('mov-marca-title').textContent=tipo==='entrada'?'📥 Entrada de Producto':'📤 Salida de Producto';
  document.getElementById('mm-prod').innerHTML=productosMarca.map(p=>`<option value="${p.id}" ${p.id===pid?'selected':''}>${p.nombre} (stock: ${p.stock})</option>`).join('');
  document.getElementById('mm-cant').value='';
  openModal('mov-marca');
}

function doMovMarca(){
  const pid=parseInt(document.getElementById('mm-prod').value);
  const cant=parseInt(document.getElementById('mm-cant').value);
  const resp=document.getElementById('mm-resp').value;
  if(!cant||cant<=0){showToast('⚠️ Ingresá una cantidad válida');return}
  const prod=productosMarca.find(p=>p.id===pid);
  if(!prod) return;
  if(tipoMovMarca==='salida'&&cant>prod.stock){showToast('Sin stock suficiente');return}
  prod.stock+=tipoMovMarca==='entrada'?cant:-cant;
  movsMarca.push({tipo:tipoMovMarca,producto:prod.nombre,cant,resp,fecha:hoy()});
  closeModal('mov-marca');
  showToast(tipoMovMarca==='entrada'?`✅ +${cant} ${prod.nombre}`:`✅ -${cant} ${prod.nombre}`);
  renderMarca(currentUser.rol==='owner'?'ow':'ceo');
  postSheet({action:'actualizarStockMarca',nombre:prod.nombre,stock:prod.stock}).catch(e=>console.log('Marca stock sync error:',e));
}

function agregarProductoMarca(){
  const nombre=document.getElementById('nm-nombre').value.trim();
  const stock=parseInt(document.getElementById('nm-stock').value)||0;
  const min=parseInt(document.getElementById('nm-min').value)||0;
  const precio=parseFloat(document.getElementById('nm-precio').value)||0;
  const unidad=document.getElementById('nm-unidad').value;
  if(!nombre){showToast('⚠️ Ingresá el nombre');return}
  const newProd={id:Date.now(),nombre,stock,min,precio,unidad};
  productosMarca.push(newProd);
  closeModal('nuevo-marca');
  ['nm-nombre','nm-stock','nm-min','nm-precio'].forEach(id=>document.getElementById(id).value='');
  showToast('✅ '+nombre+' agregado');
  renderMarca(currentUser.rol==='owner'?'ow':'ceo');
  postSheet({action:'nuevoProductoMarca',id:newProd.id,nombre,stock,min,precio,unidad}).catch(e=>console.log('Marca producto sync error:',e));
}

function poblarModalPedido(){
  document.getElementById('np2-prod').innerHTML=productosMarca.map(p=>`<option>${p.nombre}</option>`).join('');
}

function agregarPedido(){
  const prod=document.getElementById('np2-prod').value;
  const cant=parseInt(document.getElementById('np2-cant').value);
  const prov=document.getElementById('np2-prov').value.trim()||'Sin especificar';
  const fecha=document.getElementById('np2-fecha').value||'Sin fecha';
  if(!cant||cant<=0){showToast('⚠️ Ingresá una cantidad');return}
  const pedido={id:Date.now(),producto:prod,cantidad:cant,proveedor:prov,fechaEstimada:fecha,fecha:hoy(),responsable:currentUser?currentUser.nombre:''};
  pedidosMarca.push(pedido);
  closeModal('nuevo-pedido');
  ['np2-cant','np2-prov','np2-fecha'].forEach(id=>document.getElementById(id).value='');
  showToast('✅ Pedido registrado');
  renderMarca(currentUser.rol==='owner'?'ow':'ceo');
  postSheet({action:'nuevoPedidoMarca',...pedido}).catch(e=>console.log('Marca pedido sync error:',e));
}

function recibirPedido(idx){
  const p=pedidosMarca[idx];
  const prod=productosMarca.find(x=>x.nombre===p.producto);
  if(prod){prod.stock+=p.cantidad;movsMarca.push({tipo:'entrada',producto:prod.nombre,cant:p.cantidad,resp:'Sistema',fecha:hoy()});}
  pedidosMarca.splice(idx,1);
  showToast('✅ Pedido recibido — stock actualizado');
  renderMarca(currentUser.rol==='owner'?'ow':'ceo');
  if(p && p.id) postSheet({action:'recibirPedidoMarca',id:p.id}).catch(e=>console.log('Marca recibir pedido sync error:',e));
}

function cancelarPedido(idx){
  const p=pedidosMarca[idx];
  pedidosMarca.splice(idx,1);
  showToast('Pedido cancelado');
  renderMarca(currentUser.rol==='owner'?'ow':'ceo');
  if(p && p.id) postSheet({action:'cancelarPedidoMarca',id:p.id}).catch(e=>console.log('Marca cancelar pedido sync error:',e));
}

async function cargarMarcaDesdeSheet(){
  if(!SHEET_URL) return;
  try{
    const resp = await fetch(sheetUrl({action:'getMarca',t:Date.now()}), {method:'GET'});
    const text = await resp.text();
    const data = JSON.parse(text);
    if(data.ok && data.productos && data.productos.length > 0){
      productosMarca = data.productos;
      pedidosMarca = Array.isArray(data.pedidos) ? data.pedidos : [];
      renderMarca(currentUser.rol==='owner'?'ow':'ceo');
    }
  }catch(e){ console.log('Marca sync error:',e); }
}
