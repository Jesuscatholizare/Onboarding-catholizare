require('dotenv').config();
const express = require('express');
const path = require('path');
const config = require('./src/config');
const apiRoutes = require('./src/routes/api');
const pageRoutes = require('./src/routes/pages');

const app = express();

// --- Middleware global ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Rutas bajo BASE_PATH ---
const base = config.basePath;

// Archivos estaticos
app.use(base + '/public', express.static(path.join(__dirname, 'src', 'public')));

// API proxy hacia GAS
app.use(base + '/api', apiRoutes);

// Paginas HTML
app.use(base, pageRoutes);

// --- Start ---
app.listen(config.port, () => {
  console.log(`Servidor corriendo en puerto ${config.port}`);
  console.log(`App disponible en: http://localhost:${config.port}${base}`);
});
