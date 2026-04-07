const { Router } = require('express');
const path = require('path');

const router = Router();
const viewsDir = path.join(__dirname, '..', '..', 'views');

// Dashboard del profesional (pagina principal con token)
router.get('/', (_req, res) => {
  res.sendFile(path.join(viewsDir, 'dashboard.html'));
});

// Aceptacion de terminos y condiciones
router.get('/aceptacion-terminos', (_req, res) => {
  res.sendFile(path.join(viewsDir, 'aceptacion-terminos.html'));
});

// Informacion de perfil profesional
router.get('/informacion-perfil', (_req, res) => {
  res.sendFile(path.join(viewsDir, 'informacion-perfil.html'));
});

// Token invalido / error generico
router.get('/error', (_req, res) => {
  res.sendFile(path.join(viewsDir, 'error.html'));
});

module.exports = router;
