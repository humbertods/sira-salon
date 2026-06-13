const AREAS = ['Cejas','Pestañas','Depilaciones','Limpieza Facial','Local','Coffee'];
const AREA_EMOJI = {Cejas:'✦',Pestañas:'👁',Depilaciones:'🪶','Limpieza Facial':'✨',Local:'🏪',Coffee:'☕'};

let productoFotos = {};
let fotoTempBase64 = '';

function hoy(){
  const ahora = new Date();
  const y = ahora.toLocaleString('en-CA',{timeZone:'America/Guayaquil',year:'numeric'});
  const m = ahora.toLocaleString('en-CA',{timeZone:'America/Guayaquil',month:'2-digit'});
  const d = ahora.toLocaleString('en-CA',{timeZone:'America/Guayaquil',day:'2-digit'});
  return y+'-'+m+'-'+d;
}

function horaGuayaquil(){
  const ahora = new Date();
  const opciones = {hour:'2-digit',minute:'2-digit',hour12:false,timeZone:'America/Guayaquil'};
  return ahora.toLocaleTimeString('es-EC', opciones).substring(0,5);
}

function norm(str){
  return String(str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
}

function getEstado(stock, min){
  if(stock===0) return 'Agotado';
  if(stock<=min) return 'Stock Bajo';
  return 'OK';
}

function avatarSVG(color='#8a7060'){
  return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="8" r="4" fill="${color}"/>
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="${color}" stroke-width="1.5" stroke-linecap="round" fill="none"/>
  </svg>`;
}

function setDate(){
  const d=new Date();
  const dias=['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  const meses=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const str=`${dias[d.getDay()]} ${d.getDate()} de ${meses[d.getMonth()]}`;
  ['ow-date','ceo-date'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=str;});
}
