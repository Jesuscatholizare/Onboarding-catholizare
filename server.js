require('dotenv').config();
const express = require('express');
const path = require('path');
const config = require('./src/config');
const apiRoutes = require('./src/routes/api');
const pageRoutes = require('./src/routes/pages');

const app = express();

// Body parser - limite alto para upload de archivos base64
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const base = config.basePath;

// Archivos estaticos
app.use(base + '/public', express.static(path.join(__dirname, 'src', 'public')));

// API proxy hacia GAS
app.use(base + '/api', apiRoutes);

// Paginas HTML
app.use(base, pageRoutes);

app.listen(config.port, () => {
  console.log(`Servidor corriendo en puerto ${config.port}`);
  console.log(`App: http://localhost:${config.port}${base}`);
});
