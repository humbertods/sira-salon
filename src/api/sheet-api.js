const SHEET_URL = window.SIRA_CONFIG.SHEET_URL;
const SIRA_API_TOKEN = window.SIRA_CONFIG.API_TOKEN;

function sheetUrl(params = {}) {
  const authUser = currentUser ? { sessionToken: currentUser.sessionToken || '' } : {};
  const qp = new URLSearchParams({ ...params, ...authUser, token: SIRA_API_TOKEN });
  return SHEET_URL + '?' + qp.toString();
}

async function postSheet(payload) {
  if (!SHEET_URL) return { ok: false, error: 'SHEET_URL no configurado' };
  const authUser = currentUser ? { sessionToken: currentUser.sessionToken || '' } : {};
  const resp = await fetch(SHEET_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ ...payload, ...authUser, token: SIRA_API_TOKEN })
  });
  const text = await resp.text();
  const data = text ? JSON.parse(text) : { ok: resp.ok };
  if (!data.ok) throw new Error(data.error || 'Error al sincronizar');
  return data;
}
