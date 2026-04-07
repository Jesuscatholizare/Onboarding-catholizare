const { Router } = require('express');
const { gasPost, gasGet } = require('../middleware/proxy');

const router = Router();

// ─── GET endpoints (proxy to GAS doGet) ───

// GET /api/status?token=X  →  GAS ?action=getStatus&token=X
router.get('/status', async (req, res) => {
  try {
    const data = await gasGet({ action: 'getStatus', token: req.query.token });
    res.json(data);
  } catch (err) {
    res.status(502).json({ success: false, message: err.message });
  }
});

// GET /api/timeline?token=X  →  GAS ?action=getTimeline&token=X
router.get('/timeline', async (req, res) => {
  try {
    const data = await gasGet({ action: 'getTimeline', token: req.query.token });
    res.json(data);
  } catch (err) {
    res.status(502).json({ success: false, message: err.message });
  }
});

// ─── POST endpoints (proxy to GAS server-side functions) ───

// POST /api/saveLegalAcceptance
router.post('/saveLegalAcceptance', async (req, res) => {
  try {
    const { token, version, signerName } = req.body;
    const data = await gasPost('saveLegalAcceptance', { token, version, signerName });
    res.json(data);
  } catch (err) {
    res.status(502).json({ success: false, message: err.message });
  }
});

// POST /api/saveProfileInfo
router.post('/saveProfileInfo', async (req, res) => {
  try {
    const { token, formData } = req.body;
    const data = await gasPost('saveProfileInfo', { token, formData });
    res.json(data);
  } catch (err) {
    res.status(502).json({ success: false, message: err.message });
  }
});

// POST /api/uploadFile
router.post('/uploadFile', async (req, res) => {
  try {
    const { token, base64Data, fileName, fileType } = req.body;
    const data = await gasPost('uploadFile', { token, base64Data, fileName, fileType });
    res.json(data);
  } catch (err) {
    res.status(502).json({ success: false, message: err.message });
  }
});

// ─── Admin endpoints ───

// POST /api/admin/:action  (generic admin proxy)
router.post('/admin/:action', async (req, res) => {
  try {
    const data = await gasPost(req.params.action, req.body);
    res.json(data);
  } catch (err) {
    res.status(502).json({ success: false, message: err.message });
  }
});

module.exports = router;
