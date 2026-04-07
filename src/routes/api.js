const { Router } = require('express');
const { proxyPost, proxyGet } = require('../middleware/proxy');

const router = Router();

/**
 * POST /api/:action
 * Proxy genérico: añade "action" al body y lo reenvía al GAS.
 *
 * Ejemplo: POST /api/initial_registration  { candidate: {...} }
 *   → GAS recibe { action: "initial_registration", candidate: {...} }
 */
router.post('/:action', async (req, res) => {
  try {
    const payload = { ...req.body, action: req.params.action };
    const data = await proxyPost(payload);
    res.json(data);
  } catch (err) {
    res.status(502).json({ success: false, message: 'Error de comunicación con GAS: ' + err.message });
  }
});

/**
 * GET /api
 * Proxy genérico: reenvía query params al GAS doGet.
 *
 * Ejemplo: GET /api?action=get_exam&token=xxx&exam=E1
 */
router.get('/', async (req, res) => {
  try {
    const data = await proxyGet(req.query);
    res.json(data);
  } catch (err) {
    res.status(502).json({ success: false, message: 'Error de comunicación con GAS: ' + err.message });
  }
});

module.exports = router;
