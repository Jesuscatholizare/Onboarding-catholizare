/**
 * Cliente API - comunica con el proxy Express → GAS.
 * Base path se detecta automaticamente desde la URL actual.
 */
const API = (() => {
  const BASE = '/catholizare_sistem/onboarding/api';

  async function post(endpoint, body = {}) {
    const res = await fetch(`${BASE}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return res.json();
  }

  async function get(endpoint, params = {}) {
    const qs = new URLSearchParams(params).toString();
    const url = qs ? `${BASE}/${endpoint}?${qs}` : `${BASE}/${endpoint}`;
    const res = await fetch(url);
    return res.json();
  }

  return {
    // Profesional
    getStatus: (token) => get('status', { token }),
    getTimeline: (token) => get('timeline', { token }),
    saveLegalAcceptance: (token, version, signerName) =>
      post('saveLegalAcceptance', { token, version, signerName }),
    saveProfileInfo: (token, formData) =>
      post('saveProfileInfo', { token, formData }),
    uploadFile: (token, base64Data, fileName, fileType) =>
      post('uploadFile', { token, base64Data, fileName, fileType }),

    // Admin (generico)
    admin: (action, params = {}) => post(`admin/${action}`, params),
  };
})();
