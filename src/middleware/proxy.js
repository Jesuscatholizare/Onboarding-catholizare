const config = require('../config');

/**
 * Proxy POST: invoca una funcion del GAS backend.
 * El GAS no tiene doPost generico, asi que usamos doGet con action
 * para queries, y para mutaciones enviamos JSON al webapp URL.
 */
async function gasPost(action, params = {}) {
  const url = config.gasWebappUrl;
  if (!url) throw new Error('GAS_WEBAPP_URL no configurado');

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...params }),
    redirect: 'follow',
  });

  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { success: false, message: 'Respuesta no JSON del GAS', raw: text };
  }
}

/**
 * Proxy GET: llama a doGet del GAS con query params.
 * Usado para action=getStatus, action=getTimeline, etc.
 */
async function gasGet(params = {}) {
  const url = config.gasWebappUrl;
  if (!url) throw new Error('GAS_WEBAPP_URL no configurado');

  const qs = new URLSearchParams(params).toString();
  const fullUrl = qs ? `${url}?${qs}` : url;

  const res = await fetch(fullUrl, { method: 'GET', redirect: 'follow' });

  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { success: false, message: 'Respuesta no JSON del GAS', raw: text };
  }
}

module.exports = { gasPost, gasGet };
