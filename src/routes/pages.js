const { Router } = require('express');
const path = require('path');

const router = Router();
const viewsDir = path.join(__dirname, '..', '..', 'views');

// Pagina principal — registro de candidatos
router.get('/', (_req, res) => {
  res.sendFile(path.join(viewsDir, 'registro.html'));
});

router.get('/registro', (_req, res) => {
  res.sendFile(path.join(viewsDir, 'registro.html'));
});

// Examen (E1, E2, E3) — se pasa token y exam por query string
router.get('/examen', (_req, res) => {
  res.sendFile(path.join(viewsDir, 'examen.html'));
});

// Terminos y condiciones
router.get('/terminos', (_req, res) => {
  res.sendFile(path.join(viewsDir, 'terminos-y-condiciones.html'));
});

// Admin login
router.get('/admin/login', (_req, res) => {
  res.sendFile(path.join(viewsDir, 'login.html'));
});

// Admin dashboard
router.get('/admin/dashboard', (_req, res) => {
  res.sendFile(path.join(viewsDir, 'dashboard.html'));
});

module.exports = router;
