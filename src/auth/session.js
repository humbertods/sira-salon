let usuarios = [
  { id: 'humberto', nombre: 'Humberto', rol: 'owner', activo: true, cargo: 'Dueño' },
  { id: 'mikaela', nombre: 'Mikaela', rol: 'ceo', activo: true, cargo: 'CEO' },
  { id: 'diana', nombre: 'Diana', rol: 'staff', activo: true, cargo: 'Lashista' },
  { id: 'yadira', nombre: 'Yadira', rol: 'staff', activo: true, cargo: 'Lashista' },
  { id: 'keyla', nombre: 'Keyla', rol: 'staff', activo: true, cargo: 'Cajista' },
  { id: 'lesly', nombre: 'Lesly', rol: 'staff', activo: true, cargo: 'Cejista' },
  { id: 'maria', nombre: 'Maria', rol: 'staff', activo: true, cargo: 'Cejista' },
  { id: 'laura', nombre: 'Laura', rol: 'staff', activo: true, cargo: 'Cosmetóloga' }
];

let currentUser = null;
let currentRole = null;

async function loginConCodigo() {
  const input = document.getElementById('login-code');
  const codigo = (input.value || '').trim().toLowerCase();
  if (!codigo) { showLoginError(); return; }

  try {
    const data = await postSheet({ action: 'login', codigo });
    if (!data.ok || !data.user) { showLoginError(); return; }
    const meta = usuarios.find(u => u.id === data.user.id) || {};
    const user = { ...meta, ...data.user, sessionToken: data.sessionToken || '', sessionExp: data.sessionExp || 0 };

    currentUser = user;
    currentRole = user.rol;
    input.value = '';
    enterApp();
  } catch (e) {
    console.log('Login error:', e);
    showLoginError();
  }
}

function showLoginError() {
  const err = document.getElementById('login-error');
  err.style.opacity = '1';
  setTimeout(() => err.style.opacity = '0', 2000);
}

function updateLoginUser() {
  const input = document.getElementById('login-code');
  const display = document.getElementById('login-user-display');
  const codigo = (input.value || '').trim().toLowerCase();
  if (codigo) {
    display.value = 'Validación segura al entrar';
    display.style.color = 'var(--text)';
  } else {
    display.value = '';
    display.style.color = 'var(--text2)';
  }
}

function enterApp() {
  if (!currentUser) return;
  try { localStorage.setItem('sira_session', JSON.stringify({ user: currentUser })); } catch (e) {}
  document.getElementById('login').classList.add('hidden');
  setDate();
  populateSelects();
  if (currentUser.rol === 'owner') {
    renderOwnerInicio(); renderStock('ow'); renderMovs('ow'); renderEquipo(); renderReportes(); renderGastos();
    document.getElementById('app-owner').classList.remove('hidden');
    cargarProductosDesdeSheet();
    cargarMarcaDesdeSheet();
    cargarMovimientosDesdeSheet();
    cargarGastosVariosDesdeSheet();
    cargarFotosDesdeSheet();
    cargarVigilanciaDesdeSheet();
  } else if (currentUser.rol === 'ceo') {
    renderCEOInicio(); renderStock('ceo'); renderMovs('ceo');
    document.getElementById('app-ceo').classList.remove('hidden');
    cargarProductosDesdeSheet();
    cargarMarcaDesdeSheet();
    cargarMovimientosDesdeSheet();
    cargarGastosVariosDesdeSheet();
    cargarFotosDesdeSheet();
    cargarVigilanciaDesdeSheet();
  } else {
    document.getElementById('staff-user-lbl').textContent = currentUser.nombre + ' · ' + currentUser.cargo;
    document.getElementById('staff-name-disp').textContent = currentUser.nombre;
    renderStaffHoy();
    document.getElementById('app-staff').classList.remove('hidden');
    cargarProductosDesdeSheet();
    cargarMovimientosDesdeSheet();
    cargarFotosDesdeSheet();
  }
}

function logout() {
  try { localStorage.removeItem('sira_session'); } catch (e) {}
  currentUser = null; currentRole = null;
  ['app-owner', 'app-ceo', 'app-staff'].forEach(id => document.getElementById(id).classList.add('hidden'));
  document.getElementById('login').classList.remove('hidden');
  const code = document.getElementById('login-code');
  const user = document.getElementById('login-user-display');
  if (code) code.value = '';
  if (user) user.value = '';
}

function confirmarLogout() {
  const nombre = currentUser ? currentUser.nombre : '';
  const ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;padding:20px';
  ov.innerHTML = `
    <div style="background:var(--card);border-radius:var(--r2);padding:28px 24px;max-width:300px;width:100%;text-align:center;box-shadow:0 12px 40px rgba(0,0,0,.2)">
      <div style="margin-bottom:12px"><svg viewBox="0 0 24 24" width="40" height="40" stroke="var(--text2)" fill="none" stroke-width="1.8" stroke-linecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg></div>
      <div style="font-size:17px;font-weight:700;color:var(--text);margin-bottom:6px">¿Cerrar sesión?</div>
      <div style="font-size:13px;color:var(--text2);margin-bottom:20px">${nombre}, tendrás que volver a ingresar tu PIN</div>
      <button id="btn-logout-yes" style="width:100%;padding:14px;background:var(--danger);border:none;border-radius:var(--r4);
        color:white;font-family:var(--font);font-size:14px;font-weight:600;cursor:pointer;margin-bottom:8px">
        Cerrar sesión
      </button>
      <button id="btn-logout-no" style="width:100%;padding:12px;background:var(--bg);border:1px solid var(--border);border-radius:var(--r4);
        color:var(--text2);font-family:var(--font);font-size:14px;cursor:pointer">
        Cancelar
      </button>
    </div>`;
  document.body.appendChild(ov);

  document.getElementById('btn-logout-no').onclick = () => ov.remove();
  ov.addEventListener('click', (e) => { if (e.target === ov) ov.remove(); });
  document.getElementById('btn-logout-yes').onclick = () => { ov.remove(); logout(); };
}

async function recargarApp() {
  if (!currentUser) {
    location.reload();
    return;
  }
  try {
    showSyncBadge('Actualizando…');
    if (currentUser.rol === 'owner') {
      await Promise.all([
        cargarProductosDesdeSheet(),
        cargarMarcaDesdeSheet(),
        cargarMovimientosDesdeSheet(),
        cargarGastosVariosDesdeSheet(),
        cargarFotosDesdeSheet(),
        cargarVigilanciaDesdeSheet()
      ]);
      refreshAll();
    } else if (currentUser.rol === 'ceo') {
      await Promise.all([
        cargarProductosDesdeSheet(),
        cargarMarcaDesdeSheet(),
        cargarMovimientosDesdeSheet(),
        cargarGastosVariosDesdeSheet(),
        cargarFotosDesdeSheet(),
        cargarVigilanciaDesdeSheet()
      ]);
      refreshAll();
    } else {
      await Promise.all([
        cargarProductosDesdeSheet(),
        cargarMovimientosDesdeSheet(),
        cargarFotosDesdeSheet()
      ]);
      renderStaffHoy();
    }
    showSyncBadge('✓ Actualizado');
    setTimeout(()=>hideSyncBadge(), 1500);
  } catch (e) {
    console.log('Refresh error:', e);
    showSyncBadge('Error actualizando');
    showToast('No se pudo actualizar');
    setTimeout(()=>hideSyncBadge(), 2000);
  }
}

function abrirMenuSesion() {
  const esOwner = currentUser && currentUser.rol === 'owner';
  const ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.35);display:flex;align-items:flex-start;justify-content:flex-end;padding:64px 16px 0';
  ov.innerHTML = `
    <div style="background:var(--card);border-radius:var(--r2);padding:8px;min-width:210px;box-shadow:0 12px 40px rgba(0,0,0,.22);overflow:hidden">
      ${esOwner ? `
      <button id="menu-equipo" class="sesion-menu-opt">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--text)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
        <span>Equipo</span>
      </button>
      <button id="menu-gastos" class="sesion-menu-opt">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--text)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1v22"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
        <span>Gastos</span>
      </button>
      <button id="menu-vigilancia" class="sesion-menu-opt">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--text)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
        <span>Vigilar</span>
      </button>
      <button id="menu-reportes" class="sesion-menu-opt">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--text)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
        <span>Reportes</span>
      </button>
      <div style="height:1px;background:var(--border);margin:4px 8px"></div>` : ''}
      <button id="menu-logout" class="sesion-menu-opt danger">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--danger)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>
        <span>Cerrar sesión</span>
      </button>
    </div>`;
  document.body.appendChild(ov);
  ov.addEventListener('click', (e) => { if (e.target === ov) ov.remove(); });
  if (esOwner) {
    document.getElementById('menu-equipo').onclick = () => { ov.remove(); owNav('equipo'); };
    document.getElementById('menu-gastos').onclick = () => { ov.remove(); owNav('gastos'); };
    document.getElementById('menu-vigilancia').onclick = () => { ov.remove(); owNav('vigilancia'); };
    document.getElementById('menu-reportes').onclick = () => { ov.remove(); owNav('reportes'); };
  }
  document.getElementById('menu-logout').onclick = () => { ov.remove(); confirmarLogout(); };
}

async function autoLogin() {
  try {
    const saved = localStorage.getItem('sira_session');
    if (!saved) return;
    const session = JSON.parse(saved);
    const savedUser = session && (session.user || null);
    if (!savedUser || !savedUser.id || !savedUser.sessionToken) return logout();
    const valid = await postSheet({ action: 'validateSession', sessionToken: savedUser.sessionToken });
    if (!valid.ok || !valid.user) return logout();
    const meta = usuarios.find(u => u.id === savedUser.id) || {};
    const user = { ...meta, ...savedUser, ...valid.user, sessionToken: savedUser.sessionToken, sessionExp: valid.sessionExp || savedUser.sessionExp || 0 };
    if (!user || !user.activo) return;
    currentUser = user;
    currentRole = user.rol;
    enterApp();
  } catch (e) { console.error('autoLogin error:', e); }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', autoLogin);
} else {
  autoLogin();
}
