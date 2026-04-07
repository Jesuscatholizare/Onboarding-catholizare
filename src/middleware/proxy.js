const config = require('../config');

/**
 * Proxy POST hacia el GAS backend.
 * Reenvía el body JSON tal cual y retorna la respuesta de GAS.
 */
async function proxyPost(body) {
  const url = config.gasWebappUrl;
  if (!url) throw new Error('GAS_WEBAPP_URL no configurado');

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    redirect: 'follow',
  });

  return res.json();
}

/**
 * Proxy GET hacia el GAS backend.
 * Reenvía query params y retorna la respuesta de GAS.
 */
async function proxyGet(params) {
  const url = config.gasWebappUrl;
  if (!url) throw new Error('GAS_WEBAPP_URL no configurado');

  const qs = new URLSearchParams(params).toString();
  const fullUrl = qs ? `${url}?${qs}` : url;

  const res = await fetch(fullUrl, {
    method: 'GET',
    redirect: 'follow',
  });

  return res.json();
}

module.exports = { proxyPost, proxyGet };
