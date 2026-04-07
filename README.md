# Onboarding Catholizare Pro

Sistema de Onboarding para profesionales de la red Catholizare Pro.
Frontend Node.js/Express con proxy a Google Apps Script.

## Arquitectura

```
Browser  →  Express (Node.js)  →  Google Apps Script  →  Google Sheets
              |                         |
         Sirve HTML              Backend: datos, emails,
         + static assets         Brevo, Drive uploads
```

### Flujo del profesional

1. Recibe email con link `?token=ONB-XXXXXXXX`
2. Dashboard: ve sus pasos pendientes
3. Acepta terminos y condiciones (firma digital)
4. Completa perfil profesional (poblaciones, enfoques, horarios)
5. Sube documentos (CV, cedula, foto, carta sacerdotal)
6. Coordina reuniones por WhatsApp
7. Al completar Fase 1 → avanza automaticamente a Fase 2

## Estructura

```
server.js                          # Entry point Express
src/
  config/index.js                  # Variables de entorno
  routes/
    api.js                         # Proxy POST/GET hacia GAS
    pages.js                       # Rutas HTML
  middleware/
    proxy.js                       # gasPost() / gasGet()
  public/
    css/styles.css                 # Estilos base
    js/api.js                      # Cliente API (reemplaza google.script.run)
views/
  dashboard.html                   # Panel del profesional (principal)
  aceptacion-terminos.html         # Firma de documentos legales
  informacion-perfil.html          # Formulario de perfil
  error.html                       # Token invalido / error
gas/
  Code.gs                          # Referencia del GAS backend
```

## Setup

```bash
cp .env.example .env
# Editar .env con la URL de tu Web App GAS
npm install
npm start
```

## URLs

Base: `profesionales.catholizare.com/catholizare_sistem/onboarding`

| Ruta | Descripcion |
|------|-------------|
| `/?token=X` | Dashboard del profesional |
| `/aceptacion-terminos?token=X` | Terminos y condiciones |
| `/informacion-perfil?token=X` | Perfil profesional |
| `/error` | Pagina de error |
| `/api/status?token=X` | GET: estado del profesional |
| `/api/timeline?token=X` | GET: timeline de eventos |
| `/api/saveLegalAcceptance` | POST: aceptar terminos |
| `/api/saveProfileInfo` | POST: guardar perfil |
| `/api/uploadFile` | POST: subir documento |
| `/api/admin/:action` | POST: acciones admin |

## GAS Backend

El GAS original maneja:
- Almacenamiento en Google Sheets (hoja "Onboarding")
- Envio de emails via Brevo
- Gestion de archivos en Google Drive
- Integracion con listas Brevo por fase
- Sistema de recordatorios automaticos
- Dashboard admin (se sirve directamente desde GAS)
