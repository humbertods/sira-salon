// ============================================================
//  SIRA — Estado central de la app
//  Variables globales compartidas entre módulos.
//  Debe cargarse antes que cualquier módulo que las use
//  (en la práctica, antes de auth/session.js que dispara autoLogin).
// ============================================================

// Inventario en memoria (se llena desde Apps Script al entrar)
let productos = [];

// Historial de movimientos en memoria
let movimientos = [];

// Filtro de área activo en el dashboard de inventario
let activeArea = 'Todos';

// Enlace del grupo de WhatsApp del equipo
const WA_GROUP = 'https://chat.whatsapp.com/G0B5u1opWm66yLR4pRizd6';
