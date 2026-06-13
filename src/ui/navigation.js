function owNav(s){
  document.querySelectorAll('#app-owner .screen').forEach(x=>x.classList.remove('active'));
  document.querySelectorAll('#app-owner .nav-item').forEach(x=>x.classList.remove('active'));
  document.getElementById('ow-'+s).classList.add('active');
  const nav = document.getElementById('onav-'+s);
  if(nav) nav.classList.add('active');
  if(s==='inicio') renderOwnerInicio();
  if(s==='stock')  renderStock('ow');
  if(s==='movs')   renderMovs('ow');
  if(s==='equipo') renderEquipo();
  if(s==='reportes') renderReportes();
  if(s==='marca') renderMarca('ow');
  if(s==='gastos') renderGastos();
}

function ceoNav(s){
  document.querySelectorAll('#app-ceo .screen').forEach(x=>x.classList.remove('active'));
  document.querySelectorAll('#app-ceo .nav-item').forEach(x=>x.classList.remove('active'));
  document.getElementById('ceo-'+s).classList.add('active');
  document.getElementById('cnav-'+s).classList.add('active');
  if(s==='inicio') renderCEOInicio();
  if(s==='stock')  renderStock('ceo');
  if(s==='movs')   renderMovs('ceo');
  if(s==='marca')  renderMarca('ceo');
}
