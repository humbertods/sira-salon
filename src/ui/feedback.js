function showSyncBadge(msg){
  let badge = document.getElementById('sync-badge');
  if(!badge){
    badge = document.createElement('div');
    badge.id = 'sync-badge';
    badge.style.cssText='position:fixed;top:14px;left:50%;transform:translateX(-50%);background:var(--primary);color:white;padding:6px 16px;border-radius:50px;font-size:12px;z-index:9999;box-shadow:0 2px 10px rgba(0,0,0,.2);transition:opacity 250ms var(--ease)';
    document.body.appendChild(badge);
  }
  badge.textContent = msg;
  badge.style.opacity = '1';
}

function hideSyncBadge(){
  const badge = document.getElementById('sync-badge');
  if(badge) badge.style.opacity = '0';
}

function playPin(){
  try{
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o1 = ctx.createOscillator();
    const g1 = ctx.createGain();
    o1.type = 'sine';
    o1.frequency.setValueAtTime(1200, ctx.currentTime);
    o1.frequency.setValueAtTime(1500, ctx.currentTime + 0.08);
    g1.gain.setValueAtTime(0.3, ctx.currentTime);
    g1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    o1.connect(g1); g1.connect(ctx.destination);
    o1.start(ctx.currentTime); o1.stop(ctx.currentTime + 0.15);

    const o2 = ctx.createOscillator();
    const g2 = ctx.createGain();
    o2.type = 'sine';
    o2.frequency.setValueAtTime(1800, ctx.currentTime + 0.1);
    g2.gain.setValueAtTime(0, ctx.currentTime);
    g2.gain.setValueAtTime(0.25, ctx.currentTime + 0.1);
    g2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
    o2.connect(g2); g2.connect(ctx.destination);
    o2.start(ctx.currentTime + 0.1); o2.stop(ctx.currentTime + 0.35);
    setTimeout(()=>ctx.close(), 500);
  }catch(e){}
}

function playError(){
  try{
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(400, ctx.currentTime);
    o.frequency.setValueAtTime(300, ctx.currentTime + 0.1);
    g.gain.setValueAtTime(0.25, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    o.connect(g); g.connect(ctx.destination);
    o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.2);
    setTimeout(()=>ctx.close(), 400);
  }catch(e){}
}

function enviarWhatsApp(texto){
  const encoded = encodeURIComponent(texto);
  location.href = 'https://api.whatsapp.com/send?text=' + encoded;
}

function showConfirm(icon, msg, sub='', waMsg=''){
  playPin();
  const ov = document.createElement('div');
  ov.style.cssText='position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;flex-direction:column;color:white;text-align:center;padding:20px';

  let waBtn = '';
  if(waMsg){
    const encodedMsg = encodeURIComponent(waMsg);
    waBtn = `<div style="margin-top:16px;display:flex;gap:8px;justify-content:center">
      <a href="https://api.whatsapp.com/send?text=${encodedMsg}" target="_blank" rel="noopener" style="background:#25D366;color:white;border:none;border-radius:var(--r4);padding:12px 20px;font-family:var(--font);font-size:14px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:8px;box-shadow:0 4px 12px rgba(37,211,102,.3);text-decoration:none">
        📲 Notificar al grupo
      </a>
    </div>`;
  }

  ov.innerHTML = '<div style="font-size:64px;margin-bottom:16px">'+icon+'</div>'
    +'<div style="font-size:24px;font-weight:600;margin-bottom:8px">'+msg+'</div>'
    +'<div style="font-size:14px;opacity:.75">'+sub+'</div>'
    + waBtn;

  document.body.appendChild(ov);

  if(waMsg){
    ov.addEventListener('click', function(e){
      if(e.target === ov) ov.remove();
    });
    setTimeout(()=>{ if(ov.parentNode) ov.remove(); }, 8000);
  } else {
    setTimeout(()=>ov.remove(), 2500);
  }
}

function showToast(msg){
  const isError = msg.includes('⚠️') || msg.includes('Sin stock') || msg.includes('Error');
  if(isError) playError(); else if(msg.includes('✅')) playPin();
  const t=document.getElementById('toast');
  t.textContent=msg;t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2600);
}
