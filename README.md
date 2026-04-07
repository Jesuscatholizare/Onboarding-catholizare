# Onboarding-catholizare

Sistema de Seleccion de Candidatos RCCC - Frontend Node.js/Express con proxy a Google Apps Script.

## Estructura

```
server.js                 # Entry point Express
src/
  config/index.js         # Variables de entorno
  routes/
    api.js                # Proxy POST/GET hacia GAS
    pages.js              # Rutas HTML
  middleware/
    proxy.js              # Funciones proxyPost / proxyGet
  public/                 # CSS, JS, imagenes
views/                    # HTML (registro, examen, terminos, dashboard, login)
gas/                      # Codigo GAS original (referencia)
```

## Setup

```bash
cp .env.example .env
# Editar .env con la URL de tu Web App GAS
npm install
npm start
```

## URLs

Base path: `/catholizare_sistem/onboarding`

| Ruta | Descripcion |
|------|-------------|
| `/` | Registro de candidatos |
| `/examen?token=X&exam=E1` | Examen (E1, E2, E3) |
| `/terminos?candidate_id=X` | Terminos y condiciones |
| `/admin/login` | Login administrador |
| `/admin/dashboard` | Dashboard admin |
| `/api/:action` | Proxy POST a GAS |
| `/api?action=X` | Proxy GET a GAS |
