let mesesCerrados = [];

function esMesCerrado(mesNum, anio){
  return mesesCerrados.some(c => c.mes === mesNum && c.anio === anio);
}

function filtrarMovsCerrados(){
  movimientos = movimientos.filter(m => {
    if(!m.fecha) return true;
    const parts = m.fecha.split('-');
    if(parts.length<3) return true;
    return !esMesCerrado(parseInt(parts[1]), parseInt(parts[0]));
  });
  gastosVarios = gastosVarios.filter(g => {
    if(!g.fecha) return true;
    const parts = g.fecha.split('-');
    if(parts.length<3) return true;
    return !esMesCerrado(parseInt(parts[1]), parseInt(parts[0]));
  });
}

async function cargarCierresDesdeSheet(){
  if(!SHEET_URL) return;
  try{
    const resp = await fetch(sheetUrl({action:'getCierres',t:Date.now()}),{method:'GET'});
    const text = await resp.text();
    const data = JSON.parse(text);
    if(data.ok && data.cierres && data.cierres.length>0){
      mesesCerrados = data.cierres.map(c=>({mes:parseInt(c.mesNum), anio:parseInt(c.anio)}));
      filtrarMovsCerrados();
    }
  }catch(e){console.log('Cierres load error:',e)}
}

function calcularResumenCierreDesdeDatos(mesNum, anio, movs, gastos, prods){
  const movsMes = movs.filter(m => {
    if(!m.fecha) return false;
    const parts = String(m.fecha).split('-');
    if(parts.length<3) return false;
    return parseInt(parts[0])===anio && parseInt(parts[1])===mesNum;
  });
  const gvMes = gastos.filter(g => {
    if(!g.fecha) return false;
    const parts = String(g.fecha).split('-');
    if(parts.length<3) return false;
    return parseInt(parts[0])===anio && parseInt(parts[1])===mesNum;
  });

  const staffResumen = {};
  movsMes.forEach(m => {
    if(!staffResumen[m.resp]) staffResumen[m.resp] = {movs:0, total:0};
    staffResumen[m.resp].movs++;
    const prod = prods.find(p => norm(p.nombre) === norm(m.producto));
    staffResumen[m.resp].total += (prod ? prod.costo : 0) * m.cant;
  });
  const totalProductos = Object.values(staffResumen).reduce((s,d) => s + d.total, 0);
  const totalGV = gvMes.reduce((s,g) => s + g.monto, 0);
  return {movsMes, gvMes, staffResumen, totalProductos, totalGV, granTotal: totalProductos + totalGV};
}

function calcularResumenCierreLocal(mesNum, anio){
  return calcularResumenCierreDesdeDatos(mesNum, anio, movimientos, gastosVarios, productos);
}

async function obtenerResumenCierreActualizado(mesNum, anio){
  if(!SHEET_URL) return calcularResumenCierreLocal(mesNum, anio);
  try{
    const [prodResp, movResp, gvResp] = await Promise.all([
      fetch(sheetUrl({action:'getProductos',t:Date.now()}),{method:'GET'}),
      fetch(sheetUrl({action:'getMovimientos',t:Date.now()}),{method:'GET'}),
      fetch(sheetUrl({action:'getGastosVarios',t:Date.now()}),{method:'GET'})
    ]);
    const [prodData, movData, gvData] = await Promise.all([prodResp.text(), movResp.text(), gvResp.text()]);
    const prods = JSON.parse(prodData).productos || productos;
    const movs = (JSON.parse(movData).movimientos || []).map(m => {
      let fechaLimpia = '';
      if(m.fecha){
        const f = String(m.fecha);
        const match = f.match(/(\d{4})-(\d{2})-(\d{2})/);
        fechaLimpia = match ? match[0] : f.substring(0,10);
      }
      return {tipo:m.tipo==='Entrada'?'entrada':'salida',producto:m.producto,cant:parseInt(m.cantidad)||1,resp:m.responsable,area:m.area||'',fecha:fechaLimpia};
    });
    const gastos = (JSON.parse(gvData).gastos || []).map(g => ({
      id:g.id||Date.now(),cat:g.categoria||'Otro',desc:g.descripcion||'',monto:parseFloat(g.monto)||0,resp:g.responsable||'',notas:g.notas||'',fecha:g.fecha||'',hora:g.hora||''
    }));
    return calcularResumenCierreDesdeDatos(mesNum, anio, movs, gastos, prods.map(p=>({
      ...p,
      stock: parseInt(p.stock)||0,
      min: parseInt(p.min)||0,
      costo: parseFloat(p.costo)||0
    })));
  }catch(e){
    console.log('Cierre fresh calc error:', e);
    return calcularResumenCierreLocal(mesNum, anio);
  }
}

async function confirmarCierreMes(){
  const mesNombre = MESES_NOMBRES[rgMes] + ' ' + rgAnio;
  const mesNum = rgMes + 1;
  showSyncBadge('Calculando cierre...');
  const resumenInicial = await obtenerResumenCierreActualizado(mesNum, rgAnio);
  hideSyncBadge();
  const total = '$' + resumenInicial.granTotal.toFixed(2);

  if(esMesCerrado(mesNum, rgAnio)){
    showToast('⚠️ ' + mesNombre + ' ya fue cerrado');
    return;
  }

  const ov = document.createElement('div');
  ov.style.cssText='position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;padding:20px';
  ov.innerHTML = `
    <div style="background:var(--card);border-radius:var(--r2);padding:28px 24px;max-width:320px;width:100%;text-align:center;box-shadow:0 12px 40px rgba(0,0,0,.2)">
      <div style="font-size:40px;margin-bottom:12px">🔒</div>
      <div style="font-size:18px;font-weight:700;color:var(--text);margin-bottom:6px">Cierre de ${mesNombre}</div>
      <div style="font-size:14px;color:var(--text2);margin-bottom:6px">Total del mes: <strong style="color:var(--primary)">${total}</strong></div>
      <div style="font-size:12px;color:var(--text2);margin-bottom:20px;line-height:1.5">
        Los contadores se reiniciarán a $0.<br>El registro queda guardado en tu Sheet.
      </div>
      <button id="btn-cierre-confirm" style="width:100%;padding:14px;background:var(--primary);border:none;border-radius:var(--r4);
        color:white;font-family:var(--font);font-size:15px;font-weight:600;cursor:pointer;margin-bottom:8px;
        box-shadow:0 4px 16px rgba(191,162,111,.3)">
        Confirmar cierre
      </button>
      <button id="btn-cierre-cancel" style="width:100%;padding:12px;background:var(--bg);border:1px solid var(--border);border-radius:var(--r4);
        color:var(--text2);font-family:var(--font);font-size:14px;cursor:pointer">
        Cancelar
      </button>
    </div>`;
  document.body.appendChild(ov);

  document.getElementById('btn-cierre-cancel').onclick = () => ov.remove();
  ov.addEventListener('click', (e) => { if(e.target === ov) ov.remove(); });

  document.getElementById('btn-cierre-confirm').onclick = async () => {
    const btn = document.getElementById('btn-cierre-confirm');
    btn.textContent = 'Cerrando...';
    btn.style.opacity = '0.5';
    btn.style.pointerEvents = 'none';

    const resumen = await obtenerResumenCierreActualizado(mesNum, rgAnio);

    try {
      await postSheet({
        action: 'cierreMes',
        mes: MESES_NOMBRES[rgMes],
        anio: rgAnio,
        mesNum: mesNum,
        totalProductos: resumen.totalProductos.toFixed(2),
        totalGastosVarios: resumen.totalGV.toFixed(2),
        granTotal: resumen.granTotal.toFixed(2),
        totalMovimientos: resumen.movsMes.length,
        staff: JSON.stringify(resumen.staffResumen),
        fecha: hoy(),
        hora: horaGuayaquil()
      });
    } catch(e) { console.log('Cierre sync error:', e); }

    mesesCerrados.push({mes: mesNum, anio: rgAnio});

    movimientos = movimientos.filter(m => {
      if(!m.fecha) return true;
      const parts = m.fecha.split('-');
      if(parts.length<3) return true;
      return !(parseInt(parts[0])===rgAnio && parseInt(parts[1])===mesNum);
    });
    gastosVarios = gastosVarios.filter(g => {
      if(!g.fecha) return true;
      const parts = g.fecha.split('-');
      if(parts.length<3) return true;
      return !(parseInt(parts[0])===rgAnio && parseInt(parts[1])===mesNum);
    });

    ov.remove();
    renderOwnerInicio();
    renderStock('ow');
    renderMovs('ow');
    renderReportes();
    renderGastos();
    playPin();
    showConfirm('🔒', 'Mes cerrado', mesNombre + ' archivado · Todo reiniciado a $0');
  };
}
