function abrirFoto(nombre){
  if(currentUser.rol !== 'owner') return;
  document.getElementById('foto-producto-nombre').value = nombre;
  document.getElementById('foto-preview').style.display = 'none';
  document.getElementById('foto-opciones').style.display = 'block';
  document.getElementById('foto-guardar').style.display = 'none';
  document.getElementById('foto-camera').value = '';
  document.getElementById('foto-gallery').value = '';
  fotoTempBase64 = '';
  if(productoFotos[nombre]){
    document.getElementById('foto-preview-img').src = productoFotos[nombre];
    document.getElementById('foto-preview').style.display = 'block';
  }
  openModal('foto');
}

function procesarFoto(input){
  if(!input.files || !input.files[0]) return;
  const file = input.files[0];
  const reader = new FileReader();
  reader.onload = function(e){
    const img = new Image();
    img.onload = function(){
      const MAX = 200;
      let w = img.width, h = img.height;
      if(w > h){ if(w > MAX){ h = h*(MAX/w); w = MAX; } }
      else { if(h > MAX){ w = w*(MAX/h); h = MAX; } }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      fotoTempBase64 = canvas.toDataURL('image/jpeg', 0.7);
      document.getElementById('foto-preview-img').src = fotoTempBase64;
      document.getElementById('foto-preview').style.display = 'block';
      document.getElementById('foto-guardar').style.display = 'block';
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

async function guardarFoto(){
  const nombre = document.getElementById('foto-producto-nombre').value;
  if(!nombre || !fotoTempBase64) return;
  productoFotos[nombre] = fotoTempBase64;
  closeModal('foto');
  showToast('Foto guardada');
  renderStock(currentUser.rol==='owner'?'ow':'ceo');
  try{
    await postSheet({action:'guardarFoto', nombre, foto:fotoTempBase64});
  }catch(e){console.log('Foto sync error:',e)}
  fotoTempBase64 = '';
}

async function cargarFotosDesdeSheet(){
  if(!SHEET_URL) return;
  try{
    const resp = await fetch(sheetUrl({action:'getFotos',t:Date.now()}),{method:'GET'});
    const text = await resp.text();
    const data = JSON.parse(text);
    if(data.ok && data.fotos){
      data.fotos.forEach(f=>{ if(f.nombre && f.foto) productoFotos[f.nombre] = f.foto; });
      if(currentUser){
        if(currentUser.rol==='owner') renderStock('ow');
        else if(currentUser.rol==='ceo') renderStock('ceo');
      }
    }
  }catch(e){console.log('Fotos load error:',e)}
}

function getProductoFoto(nombre){
  if(productoFotos[nombre]) return `<img src="${productoFotos[nombre]}" alt="">`;
  return AREA_EMOJI[productos.find(p=>p.nombre===nombre)?.area]||'';
}
