async function cargarMovimientosDesdeSheet(){
  if(!SHEET_URL) return;
  try{
    const resp = await fetch(sheetUrl({action:'getMovimientos',t:Date.now()}), {method:'GET'});
    const text = await resp.text();
    const data = JSON.parse(text);
    if(data.ok && data.movimientos && data.movimientos.length > 0){
      movimientos = data.movimientos.map(m => {
        let fechaLimpia = '';
        if(m.fecha){
          const f = String(m.fecha);
          const match = f.match(/(\d{4})-(\d{2})-(\d{2})/);
          if(match) fechaLimpia = match[0];
          else fechaLimpia = f.substring(0,10);
        }

        let horaLimpia = '';
        if(m.hora){
          const h = String(m.hora);
          const matchH = h.match(/(\d{1,2}):(\d{2})/);
          if(matchH) horaLimpia = matchH[1].padStart(2,'0')+':'+matchH[2];
        }

        return {
          tipo: m.tipo==='Entrada'?'entrada':'salida',
          producto: m.producto,
          cant: parseInt(m.cantidad) || 1,
          resp: m.responsable,
          area: m.area || '',
          fecha: fechaLimpia,
          hora: horaLimpia,
          grupo: m.grupo || (m.responsable+'_'+fechaLimpia+'_'+horaLimpia),
          tipoUnidad: m.tipoUnidad || 'Unidad',
          esCombo: m.esCombo==='true'||m.esCombo===true,
          esKit: m.esKit==='true'||m.esKit===true,
          nombreCombo: m.nombreCombo || '',
          // Stage 2: idProducto estable (P-XXXXXXX) desde col N de Movimientos.
          // Permite cruzar movimientos con productos por ID en vez de por nombre,
          // necesario para reportes precisos cuando el nombre de un producto cambia.
          idProducto: m.idProducto || ''
        };
      });
      if(currentUser && currentUser.rol==='owner'){
        renderMovs('ow');
        renderReportes();
      } else if(currentUser && currentUser.rol==='ceo'){
        renderMovs('ceo');
      } else if(currentUser && currentUser.rol==='staff'){
        renderStaffHoy();
      }
      await cargarCierresDesdeSheet();
      if(currentUser && currentUser.rol==='owner'){
        renderReportes();
        renderGastos();
      }
    }
  }catch(e){ console.log('Movs sync error:',e); }
}
