async function cargarProductosDesdeSheet(){
  if(!SHEET_URL) return;
  try{
    showSyncBadge('Sincronizando...');
    const resp = await fetch(sheetUrl({t:Date.now()}), {method: 'GET'});
    const text = await resp.text();
    const data = JSON.parse(text);
    if(!data.ok) throw new Error(data.error || 'Respuesta inválida del backend');
    if(!Array.isArray(data.productos)) throw new Error('El backend no devolvió productos');

    productos = data.productos.map((p,i) => ({
      id: p.id || (i+1),
      idEstable: p.idEstable || '',
      nombre: p.nombre,
      area: p.area || 'Sin área',
      unidad: p.unidad || 'Unidad',
      stock: parseInt(p.stock) || 0,
      min: parseInt(p.min) || 0,
      costo: parseFloat(p.costo) || 0,
      notas: p.notas || ''
    }));
    populateSelects();

    if(currentUser){
      if(currentUser.rol==='owner'){ renderOwnerInicio(); renderStock('ow'); renderReportes(); }
      else if(currentUser.rol==='ceo'){ renderCEOInicio(); renderStock('ceo'); }
      else { renderStaffHoy(); }
    }
    showSyncBadge('✓ Sincronizado');
    setTimeout(()=>hideSyncBadge(), 2000);
  }catch(e){
    console.error('Productos sync error:', e);
    showSyncBadge('Sin conexión');
    showToast('Error cargando productos');
    setTimeout(()=>hideSyncBadge(), 2000);
  }
}

async function enviarAlSheet(tipo,producto,cantidad,responsable,area,tipoUnidad,hora,grupo,idProducto){
  if(!SHEET_URL) return;
  try{
    await postSheet({action:'movimiento',tipo,producto,cantidad,responsable,area,fecha:hoy(),tipoUnidad:tipoUnidad||'Unidad',hora:hora||'',grupo:grupo||'',idProducto:idProducto||''});
  }catch(e){console.log('Sync error:',e)}
}

async function enviarBatchAlSheet(movs){
  if(!SHEET_URL || !movs || movs.length===0) return;
  try{
    await postSheet({action:'movimientoBatch',movimientos:movs});
  }catch(e){console.log('Batch sync error:',e)}
}

async function actualizarStockBatchEnSheet(items){
  if(!SHEET_URL || !items || items.length===0) return;
  try{
    await postSheet({action:'actualizarStockBatch',items:items});
  }catch(e){console.log('Stock batch sync error:',e)}
}

function actualizarStockEnSheet(nombre, nuevoStock, idProducto){
  if(!SHEET_URL) return;
  postSheet({action:'actualizarStock',producto:nombre,nuevoStock,fecha:hoy(),idProducto:idProducto||''}).catch(e=>console.log('Stock sync error:',e));
}

async function guardarProductoEnSheet(prod){
  if(!SHEET_URL || !prod) return;
  try{
    await postSheet({action:'nuevoProducto',nombre:prod.nombre,area:prod.area,unidad:prod.unidad,stock:prod.stock,min:prod.min,costo:prod.costo,notas:prod.notas});
  }catch(e){console.log('Producto sync error:',e)}
}
