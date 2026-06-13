function renderEquipo(){
  const list=document.getElementById('ow-team-list');
  if(!list) return;
  const equipo=usuarios.filter(u=>u.id!=='humberto');
  list.innerHTML=equipo.map(u=>`
    <div class="team-card">
      <div class="team-av">${avatarSVG(u.rol==='ceo'?'#34A853':'#8A8A8A')}</div>
      <div class="team-info">
        <div class="team-name">${u.nombre}</div>
        <div class="team-role">${u.cargo||u.rol}</div>
      </div>
      <div class="team-right">
        <div class="toggle ${u.activo?'on':'off'}" onclick="toggleUsuario('${u.id}',this)"></div>
      </div>
    </div>`).join('');
}

function toggleUsuario(id, el){
  const u=usuarios.find(x=>x.id===id);
  if(!u) return;
  u.activo=!u.activo;
  el.classList.toggle('on',u.activo);
  el.classList.toggle('off',!u.activo);
  showToast(u.activo?`✅ ${u.nombre} activada`:`🔒 ${u.nombre} desactivada`);
}
