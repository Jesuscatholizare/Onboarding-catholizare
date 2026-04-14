# Reporte de Sistema — Catholizare Pro Onboarding v5.2

**Fecha del reporte**: 2026-04-14
**Versión**: 5.2
**Rama activa**: `claude/setup-onboarding-repo-BbmoG`
**Estado**: ✅ Listo para QA de aceptación

---

## 1. Resumen ejecutivo

Catholizare Pro Onboarding es la plataforma que recibe a los profesionales de
salud mental católicos, los guía por un proceso de 4 fases, captura su
documentación, firma de contratos legales con trazabilidad auditable, y los
gradúa hacia la red activa.

**v5.2** cierra los huecos críticos del flujo de fases (auto-avance Fase 2 → 3 y
3 → 4), unifica la lectura de aceptaciones legales (case-insensitive), repara
la métrica "Tiempo en la red" del panel admin, y amplía la visibilidad de las
reuniones futuras en el dashboard del profesional.

---

## 2. Arquitectura general

```
┌────────────────────────────────────────────────────────────────────┐
│                      FRONTEND (HTML/JS/CSS)                         │
│                                                                     │
│  Público (profesional)            Privado (admin)                   │
│  ────────────────────             ─────────────────                 │
│  · index.html                     · dashboard-admin.html            │
│  · Public_Dashboard.html          · Admin_Dashboard_Complete.html   │
│  · Public_Perfil.html             · Admin_profesionales.html        │
│  · Public_Legal_Viewer.html       · Admin_legal.html                │
│  · Public_Upload.html             · Admin_Gestion_Usuarios.html     │
│  · Public_Legal.html              · Admin_analitica.html            │
│  · acepto-terminos.html           · Admin_health.html               │
│                                    · Admin_superadmin.html          │
└──────────────────────────┬──────────────────────────────────────────┘
                           │  fetch JSON
                           ▼
┌────────────────────────────────────────────────────────────────────┐
│  PHP Proxy  (api.php)   ·  CORS hardening, same-origin routing      │
└──────────────────────────┬──────────────────────────────────────────┘
                           │  forward a Apps Script
                           ▼
┌────────────────────────────────────────────────────────────────────┐
│  Google Apps Script  (gas/Code.gs, gas/Tests.gs)                    │
│  · doPost(e) como router                                             │
│  · Lógica de negocio + Spreadsheet + Drive + Gmail stub             │
└───┬─────────────────────┬─────────────────────┬────────────────────┘
    ▼                     ▼                     ▼
┌────────────┐   ┌──────────────────┐   ┌──────────────────┐
│ Spreadsheet│   │ Google Drive     │   │ Brevo API        │
│ (datos)    │   │ (documentos PDF) │   │ (emails + listas)│
└────────────┘   └──────────────────┘   └──────────────────┘
```

---

## 3. Estructura del código

### 3.1 Métricas de tamaño

| Área                          | Archivos | Líneas     |
| ----------------------------- | -------- | ---------- |
| Apps Script (backend)         | 2        | 3,444      |
| Público profesional           | 7        | 3,253      |
| Panel administrativo          | 8        | 3,841      |
| Proxy PHP + landing           | 2        | 559        |
| Documentación                 | 3        | (este set) |
| **Total código**              | **19**   | **~11,097** |

### 3.2 Archivos principales

| Archivo                            | Rol                                                       |
| ---------------------------------- | --------------------------------------------------------- |
| `gas/Code.gs`                      | Backend completo (router, auth, legal, fases, emails)     |
| `gas/Tests.gs` ⭐ **nuevo v5.2**    | Suite de 25+ tests unitarios + integración                |
| `api.php`                          | Proxy CORS-safe de WordPress a Apps Script                |
| `index.html`                       | Login (email + token)                                     |
| `Public_Dashboard.html`            | Dashboard del profesional (progreso, docs, reuniones)     |
| `Public_Perfil.html`               | Formulario de perfil profesional                          |
| `Public_Legal_Viewer.html`         | Lector + firma de contratos legales                       |
| `Admin_Dashboard_Complete.html`    | Panel admin con tabs Perfil/Triggers/Documentos           |

---

## 4. Componentes funcionales

### 4.1 Autenticación

- **Profesional**: token + email via `validateProfessionalToken()`.
- **Admin**: token persistido en `Admin_Users` con roles `superadmin` / `admin`.
- **Storage**: `sessionStorage.onb_token` — no aparece en la URL (sanitizado a
  `history.replaceState`).
- **Case-insensitive**: todas las comparaciones de token hacen
  `.trim().toLowerCase()`.

### 4.2 Fases del onboarding

| Fase | Duración | Requisitos de salida                                                          | Auto-avance |
| ---- | -------- | ----------------------------------------------------------------------------- | ----------- |
| 1    | 3 sem    | 3 legales (CONTRATO + TERMINOS + PRIVACIDAD) + perfil + 4 docs               | ✅ Sí       |
| 2    | 3 sem    | Sincronización de calendario + reunión Zoom de bienvenida                    | ✅ Sí (v5.2) |
| 3    | 2 sem    | Supervisión de fe y espiritualidad                                           | ✅ Sí (v5.2) |
| 4    | 1 año    | Actualización anual de CV                                                    | Manual (cíclico) |

**Nota**: ETICA (Código de Ética) es obligatorio como aceptación, pero **NO bloquea** el avance de fase (flujo simplificado v5.1).

### 4.3 Legal — firma con trazabilidad

- **Hash SHA-256** del contenido del documento guardado con cada aceptación.
- **OTP de 6 dígitos** enviado al email del profesional, válido 15 min.
- **Folio**: `ACC-YYYY-MM-NNNNN` por aceptación.
- **Audit trail** en `Aceptaciones_Legales` con columnas: Folio, doc_id,
  Version, Fecha_Hora, Token, Nombre, Correo, Teléfono, RFC, IP, Método,
  Token_OTP, Hash, Ref_Sesion, Copia_Enviada, Fecha_Envio.
- **Copia por correo** al profesional **y** al admin.

### 4.4 Emails (Brevo)

| Tipo                        | Trigger                                       |
| --------------------------- | --------------------------------------------- |
| Welcome + link              | Al crear profesional                          |
| Recordatorio día 7          | `checkAndSendReminders` (time-driven)         |
| Recordatorio día 14         | `checkAndSendReminders`                       |
| Incompleto día 21+          | `checkAndSendReminders`                       |
| Bienvenida Fase 2           | Auto al avance                                |
| Bienvenida Fase 3           | Auto al avance (v5.2)                         |
| Guías de uso                | Manual desde admin                            |
| Recordatorio Zoom 24h antes | Programado                                    |
| Actualización anual CV      | Triggered al cumplir 1 año                    |

### 4.5 Documentos (Drive)

| Tipo         | Tamaño máximo |
| ------------ | ------------- |
| CV           | 5 MB          |
| Cédula       | 5 MB          |
| Carta        | 5 MB          |
| Foto         | 1 MB          |

- Carpeta raíz configurable (`PARENT_FOLDER_ID`); subcarpetas por profesional.
- URL pública guardada en la fila del profesional (cols E/F/G/H).

### 4.6 Triggers manuales (admin)

Persistidos como JSON en columna 24 de la hoja `Onboarding`:

- `trigMarkProfile`
- `trigMarkSyncDone`, `trigMarkZoomDone`
- `trigMarkSupervisionDone`
- `trigMarkAnnualDone`

Los marcados de triggers disparan `adminMarkAction()` que en v5.2 **también
evalúa avance automático de fase**.

---

## 5. Cambios introducidos en v5.2

### 5.1 Backend (`gas/Code.gs`)

| # | Cambio                                                                           | Commit      |
| - | -------------------------------------------------------------------------------- | ----------- |
| 1 | `checkAndAdvancePhase` usa `buildLegalAcceptanceMap_` en lugar de legacy `row[11]` | 0b87077     |
| 2 | Nuevo `_ultimaFechaLegalDeToken_()` para obtener timestamp de último legal       | 7dce3ad     |
| 3 | Backfill automático de cols legacy L (legal info) y M (legal fecha)              | 7dce3ad     |
| 4 | `adminMarkAction` dispara Fase 2 → 3 y Fase 3 → 4                                | 7dce3ad     |
| 5 | `aceptarDocumento` dispara re-evaluación de fase post-aceptación                 | 0b87077     |
| 6 | `getProfessionalStatus` auto-check para usuarios "atorados"                      | 0b87077     |
| 7 | Normalización case-insensitive de token y doc_id                                 | 0b87077     |
| 8 | Nuevo helper `getLegalCountForToken_()` y `actualizarCarpetaDrive()`             | 0b87077 / 8f7bd7d |

### 5.2 Frontend profesional

| # | Cambio                                                                           | Commit      |
| - | -------------------------------------------------------------------------------- | ----------- |
| 1 | Nav global con iconos, sticky, responsive                                        | 0932b52     |
| 2 | Tarjeta "Reuniones y Citas" con 4 meetings + estados done/active/upcoming       | 7dce3ad     |
| 3 | Botones WhatsApp con mensaje prellenado por tipo                                 | 0b87077     |
| 4 | Upload con overlay spinner + toast + permanencia en pestaña                      | 0932b52     |
| 5 | Poblaciones con checkboxes (no Ctrl), rename "Ancianos" → "Adultos Mayores", "Otros" | 0932b52 |
| 6 | Fix checkbox: clic directo ahora sí togglea                                      | 0932b52     |
| 7 | Helper "Podrás editar horarios más adelante…"                                    | 0932b52     |
| 8 | Títulos: "Dashboard del Profesional · Catholizare Pro"                           | 0932b52     |

### 5.3 Panel admin

| # | Cambio                                                                           | Commit      |
| - | -------------------------------------------------------------------------------- | ----------- |
| 1 | Eliminada sección "URLs de Formularios Públicos"                                 | 0b87077     |
| 2 | "Ingreso a la red" y "Tiempo en la red" ahora funcionan                          | 7dce3ad     |

### 5.4 Testing y documentación ⭐ nuevo

| # | Archivo                          | Descripción                              |
| - | -------------------------------- | ---------------------------------------- |
| 1 | `gas/Tests.gs`                   | Suite de tests unitarios + integración   |
| 2 | `docs/QA_E2E_v5.2.md`            | Plan QA manual end-to-end                |
| 3 | `docs/REPORTE_SISTEMA_v5.2.md`   | Este reporte                             |

---

## 6. Cobertura de tests

### 6.1 Unitarios (`runUnitTests`)

- ✅ `maskEmail_` — 3 casos (estándar, corto, sin @)
- ✅ `calcularProgreso` — 3 casos (0%, 100%, parcial)
- ✅ `calcularPendientes` — 2 casos
- ✅ `validateProfessionalToken` — 2 casos (inválido, vacío)
- ✅ `_ultimaFechaLegalDeToken_` — null si no hay
- ✅ `buildLegalAcceptanceMap_` — estructura base
- ✅ `getLegalCountForToken_` — cero para inexistente
- ✅ Normalización case-insensitive

**Total**: 12 tests unitarios puros.

### 6.2 Integración (`runIntegrationTests`)

Flujo completo con profesional de prueba en sandbox de la misma hoja:

1. Setup profesional de prueba
2. `getProfessionalStatus` devuelve Fase 1
3. `checkAndAdvancePhase` NO avanza sin requisitos
4. `checkAndAdvancePhase` SÍ avanza con todo listo
5. Status confirma Fase 2
6. `adminMarkAction` persiste triggers
7. **Auto-avance Fase 2 → Fase 3** (con mocks de email)
8. **Auto-avance Fase 3 → Fase 4**
9. `adminAdvancePhase` bloquea en Fase 4
10. `adminSetStatus` cambia a Pausado
11. `adminResetOnboarding` vuelve a Fase 1
12. Cleanup sin residuos

**Total**: 13 tests de integración.

### 6.3 Cómo correrlos

```
Abrir editor de Apps Script
  → Seleccionar función `runAllTests`
  → Ejecutar
  → Ver → Logs (Ctrl+Enter)
```

---

## 7. Salud del sistema

### 7.1 Configuración requerida (Script Properties)

- `SPREADSHEET_ID`
- `PARENT_FOLDER_ID`
- `BREVO_API_KEY`
- `BREVO_LIST_FASE1` / `FASE2` / `FASE3` / `FASE4`
- `ADMIN_EMAIL`

### 7.2 Triggers time-driven recomendados

| Función                       | Frecuencia |
| ----------------------------- | ---------- |
| `checkAndSendReminders`       | Diaria     |
| `sendZoomMeetingReminders`    | Diaria     |
| `sendAnnualCVUpdateReminders` | Mensual    |

### 7.3 Logs y auditoría

- `Audit_Log`: cada cambio de estado, fase, y triggers.
- `Email_History`: cada envío con success/fail.
- `OTP_Firma`: cada código solicitado/consumido.

---

## 8. Deudas técnicas y próximos pasos

### Identificadas (no bloquean v5.2)

- **Rate limiting** de OTP: limitar a N solicitudes por hora por token.
- **Idempotencia** en `aceptarDocumento`: evitar doble submit si el cliente
  reintenta.
- **Batch Brevo sync**: al volumen actual funciona 1-a-1, pero si la red
  crece > 1,000 profesionales valdrá la pena batchear.
- **Internacionalización**: textos hardcoded en español; si llega LATAM no-
  hispanohablante, externalizar a un diccionario.
- **Tests frontend**: los HTML no tienen tests automáticos; se recomienda
  Playwright o Puppeteer para escenarios E2E en un siguiente ciclo.

### Sugerencias para v5.3

- Dashboard del profesional con visualización de su camino en el calendario.
- Notificaciones push/email cuando el admin marca triggers (hoy el profesional
  se entera al recargar).
- Reportes analíticos exportables (PDF/CSV) para el superadmin.

---

## 9. Contactos y responsables

- **Número de WhatsApp de soporte/coordinación**: `+52 1 55 1022 3883`
- **Admin email**: el configurado en `ADMIN_EMAIL` (Script Properties).
- **Dominio productivo**: `https://profesionales.catholizare.com/catholizare_sistem/onboarding/`

---

## 10. Conclusión

v5.2 deja el onboarding en un estado **end-to-end funcional**:

- ✅ Captura legal conforme, con trazabilidad completa.
- ✅ Auto-avance entre las 4 fases con los triggers adecuados.
- ✅ Métricas del admin (tiempo en red, progreso) correctas.
- ✅ UX del profesional clara, moderna, responsive y con hoja de ruta visible.
- ✅ Cobertura de pruebas (unitarias + integración) reproducible.
- ✅ Documentación QA y reporte de sistema disponibles.

**Recomendación**: pasar a QA manual con el plan `docs/QA_E2E_v5.2.md`,
redesplegar Apps Script, sincronizar HTML al servidor, y promover a
producción tras verificar los 10 ítems de regresión crítica (sección R- del
plan QA).
