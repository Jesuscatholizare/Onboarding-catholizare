/**
 * Cliente API - comunica con el proxy Express que reenvía a GAS.
 * Todas las llamadas van a /catholizare_sistem/onboarding/api/
 */
const API = (() => {
  const BASE = '/catholizare_sistem/onboarding/api';

  async function post(action, body = {}) {
    const res = await fetch(`${BASE}/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return res.json();
  }

  async function get(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE}?${qs}`);
    return res.json();
  }

  return { post, get };
})();
