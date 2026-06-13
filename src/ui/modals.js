function openModal(t){
  if(t==='entrada'||t==='salida') populateSelects();
  if(t==='nuevo-pedido') poblarModalPedido();
  if(t==='gasto-varios'){
    const sel = document.getElementById('gv-resp');
    sel.innerHTML = '<option value="'+currentUser.nombre+'" selected>'+currentUser.nombre+'</option>'
      + (currentUser.nombre!=='Humberto'?'<option>Humberto</option>':'')
      + (currentUser.nombre!=='Mikaela'?'<option>Mikaela</option>':'');
  }
  document.getElementById('modal-'+t).classList.add('open');
  if(t==='entrada'){ const s=document.getElementById('e-search'); if(s){s.value='';filtrarSelect('e-prod','');} }
  if(t==='salida'){  const s=document.getElementById('s-search'); if(s){s.value='';filtrarSelect('s-prod','');} }
}

function closeModal(t){
  document.getElementById('modal-'+t).classList.remove('open');
  const c=t[0];
  const cant=document.getElementById(c+'-cant');
  if(cant) cant.value='';
}

document.querySelectorAll('.modal-ov').forEach(o=>{
  o.addEventListener('click',function(e){if(e.target===this)this.classList.remove('open')});
});
