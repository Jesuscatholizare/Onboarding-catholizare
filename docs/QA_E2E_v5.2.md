# QA End-to-End — Catholizare Pro Onboarding v5.2

> **Fecha de referencia**: 2026-04-14
> **Alcance**: validación manual completa del flujo de onboarding del profesional,
> panel administrativo y backend de Apps Script.

## Preparación del entorno

1. **Backend**: Apps Script desplegado (Deploy → Manage → New version).
2. **Frontend**: archivos HTML publicados en `https://profesionales.catholizare.com/catholizare_sistem/onboarding/`.
3. **Hoja de cálculo** con pestañas: `Onboarding`, `Admin_Users`, `Documentos_Legales`, `Aceptaciones_Legales`, `OTP_Firma`, `Email_History`, `Audit_Log`.
4. **Brevo** con listas configuradas (Fase 1–4) y API key presente en Script Properties.
5. **Carpeta Drive** raíz con permisos para la cuenta de servicio.

## Datos de prueba

| Campo           | Valor                              |
| --------------- | ---------------------------------- |
| Nombre          | QA Test Pro                        |
| Email           | qa.onboarding+01@tudominio.mx      |
| Especialidad    | Psicología Clínica                 |
| Token asignado  | generado por el sistema (ONB-…)    |

---

## Matriz de pruebas

### A. Autenticación profesional

| ID     | Caso                                                                 | Resultado esperado |
| ------ | -------------------------------------------------------------------- | ------------------ |
| A-01   | Acceso con token válido vía URL (`?token=ONB-…`)                     | Redirige a dashboard, guarda token en `sessionStorage`. |
| A-02   | Acceso con token inválido                                            | Redirige a `index.html`. |
| A-03   | Refresh del dashboard (sin token en URL)                             | Lee `onb_token` de sessionStorage y carga estado. |
| A-04   | Logout desde nav global                                              | `sessionStorage.removeItem('onb_token')` + redirect a index. |
| A-05   | Cierre de navegador → reapertura                                     | sessionStorage expira (comportamiento esperado); debe re-autenticar. |

### B. Legales (Fase 1)

| ID     | Caso                                                                 | Resultado esperado |
| ------ | -------------------------------------------------------------------- | ------------------ |
| B-01   | Abrir dashboard recién creado                                        | "Acciones Pendientes" muestra los 3 legales + ETICA + perfil + 4 docs. |
| B-02   | Abrir Public_Legal_Viewer.html?doc=CONTRATO                          | Muestra contenido HTML completo, formulario de firma visible. |
| B-03   | Click checkbox directamente (no sobre el texto)                      | ✅ El check se marca (fix v5.1). |
| B-04   | Solicitar OTP                                                        | Llega correo con 6 dígitos + folio OTP; válido 15 min. |
| B-05   | Ingresar OTP incorrecto                                              | Mensaje "Código inválido" — **no consume** OTP. |
| B-06   | Aceptar CONTRATO con OTP correcto                                    | Folio ACC-…, correo de copia llega a profesional Y admin. |
| B-07   | Aceptar TERMINOS y PRIVACIDAD igual                                  | 3 aceptaciones registradas en `Aceptaciones_Legales`. |
| B-08   | Volver al dashboard                                                  | Los 3 legales aparecen como ✅ "Aceptado (v1.0)". |
| B-09   | **Avance automático a Fase 2**                                       | Si ya hay perfil + 4 docs + 3 legales → pasa a Fase 2 automáticamente al aceptar el último legal. Envía email de bienvenida Fase 2. |
| B-10   | Aceptar ETICA                                                        | Flujo simplificado: solo checkbox, sin OTP, sin datos adicionales. Folio ACC-…-ETICA generado. Correo de copia. |
| B-11   | Versión en hoja es Date (no string)                                  | `normalizeVersion()` lo presenta como "vYYYY-MM-DD" sin romper UI. |
| B-12   | Reintentar aceptar mismo doc misma versión                           | Error "Ya aceptaste este documento (versión X)". |

### C. Perfil profesional

| ID     | Caso                                                                 | Resultado esperado |
| ------ | -------------------------------------------------------------------- | ------------------ |
| C-01   | Abrir Public_Perfil.html sin selecciones                             | Todos los checkboxes de poblaciones desmarcados. |
| C-02   | Marcar "Adultos Mayores"                                             | Opción recién renombrada (antes "Ancianos"); highlight azul. |
| C-03   | Marcar "Otros"                                                       | Aparece campo de texto libre. |
| C-04   | Desmarcar "Otros" con texto escrito                                  | Campo se oculta y se vacía. |
| C-05   | Submit sin poblaciones                                               | Alert: "Selecciona al menos una población". |
| C-06   | Submit con "Otros" marcado pero texto vacío                          | Alert: "Escribe qué otras poblaciones atiendes…". |
| C-07   | Submit completo (poblaciones + modalidad + terapias + horarios)      | "Perfil actualizado exitosamente" + redirect al dashboard. |
| C-08   | Helper de horarios presente                                          | Texto: "Podrás editarlos más adelante en el panel del profesional". |

### D. Documentos (uploads)

| ID     | Caso                                                                 | Resultado esperado |
| ------ | -------------------------------------------------------------------- | ------------------ |
| D-01   | Subir CV > 5MB                                                       | Alert "Archivo supera el límite de 5MB". |
| D-02   | Subir Foto > 1MB                                                     | Alert "Archivo supera el límite de 1MB". |
| D-03   | Subir CV válido (PDF, 500KB)                                         | Spinner overlay + toast de éxito; permanece en pestaña Documentos. |
| D-04   | Recargar dashboard con `?tab=documentos`                             | Abre directamente la pestaña Documentos. |
| D-05   | Archivo guardado en Drive bajo carpeta del profesional               | Se crea subcarpeta `ONB-… - Nombre` si no existe. |
| D-06   | URL pública del archivo guardada en columna correspondiente          | Columnas E/F/G/H según tipo. |

### E. Avance de fases

| ID     | Caso                                                                 | Resultado esperado |
| ------ | -------------------------------------------------------------------- | ------------------ |
| E-01   | Fase 1 → Fase 2 automático                                           | Al completar 3 legales + perfil + 4 docs: avance + columnas legacy L y M actualizadas. |
| E-02   | "Tiempo en la red" / "Ingreso a la red" en admin                     | Muestra fecha real (backfill automático vía `_ultimaFechaLegalDeToken_`). |
| E-03   | Fase 2 → Fase 3 automático                                           | Admin marca ✓ "Sincronización realizada" + ✓ "Reunión Zoom realizada" → avance + email Fase 3 + mueve Brevo list. |
| E-04   | Fase 3 → Fase 4 automático                                           | Admin marca ✓ "Supervisión realizada" → avance + mueve Brevo list. |
| E-05   | Avance manual (botón "Avanzar Fase" en admin)                        | Fuerza next phase; log en Audit_Log. |
| E-06   | Intentar avance manual en Fase 4                                     | Mensaje: "Ya está en la fase final". |
| E-07   | Reset onboarding                                                     | Vuelve a Fase 1, limpia triggers y timestamps. |

### F. Reuniones en dashboard del profesional

| ID     | Caso                                                                 | Resultado esperado |
| ------ | -------------------------------------------------------------------- | ------------------ |
| F-01   | Fase 1: sin tarjeta de reuniones                                     | Card `meetings-card` oculto. |
| F-02   | Fase 2: ve las 4 reuniones                                           | Fase 2 = activas; Fase 3 y 4 = "Próximamente" bloqueadas 🔒. |
| F-03   | Botón WhatsApp de reunión activa                                     | Abre `wa.me/5215510223883?text=…` con mensaje prellenado + nombre del profesional. |
| F-04   | Fase 3: reuniones Fase 2 marcadas "Completada" (verde)               | Estilos visuales correctos (done). |
| F-05   | Fase 4: solo "Actualización anual" activa; el resto completadas      | Coherente con fase. |

### G. Panel administrativo

| ID     | Caso                                                                 | Resultado esperado |
| ------ | -------------------------------------------------------------------- | ------------------ |
| G-01   | Login con admin token válido                                         | Ve el dashboard completo. |
| G-02   | Lista de profesionales                                               | Muestra todos con filtros funcionales (fase/estado/búsqueda). |
| G-03   | Abrir ficha de profesional                                           | Tabs Perfil / Triggers / Documentos. |
| G-04   | Tab Triggers muestra estado correcto de cada paso                    | Iconos y etiquetas coherentes con la fase. |
| G-05   | "URLs de Formularios Públicos" **ya no existe**                      | Sección eliminada en v5.2. |
| G-06   | Marcar trigger manual → refresca estado                              | UI actualizada sin recargar; persistido en columna 24. |
| G-07   | Cambiar estado (Pausar / Reactivar / Atrasado)                       | Columna J actualizada, log en Audit_Log. |
| G-08   | Eliminar profesional                                                 | Fila borrada; Brevo contact eliminado (si aplica). |
| G-09   | Analytics                                                            | Totales por fase y estado correctos. |
| G-10   | Gestión de admin users (solo superadmin)                             | CRUD de tokens admin. |
| G-11   | Legales tab (solo superadmin)                                        | Lista aceptaciones con filtros; detalle por folio. |

### H. Correos (Brevo)

| ID     | Caso                                                                 | Resultado esperado |
| ------ | -------------------------------------------------------------------- | ------------------ |
| H-01   | Welcome email al crear profesional                                   | Llega con nombre + token + link al dashboard. |
| H-02   | Copia de aceptación al profesional                                   | Incluye folio, hash SHA-256, IP, método. |
| H-03   | Copia a admin                                                        | Destino = email del script owner. |
| H-04   | Email Fase 2                                                         | Se dispara una sola vez. |
| H-05   | Email Fase 3                                                         | Se dispara al avance a Fase 3. |
| H-06   | Recordatorio día 7 y 14                                              | `checkAndSendReminders` trigger time-driven ejecutable. |
| H-07   | Email_History registra todos los envíos                              | Con timestamp, tipo, subject, success. |

### I. Seguridad y validaciones

| ID     | Caso                                                                 | Resultado esperado |
| ------ | -------------------------------------------------------------------- | ------------------ |
| I-01   | Llamar action administrativo sin adminToken                          | `{ success: false, message: 'No autorizado' }`. |
| I-02   | Tokens comparados case-insensitive                                   | Aceptación con token `onb-abc` encuentra `ONB-ABC`. |
| I-03   | OTP expirado (>15 min)                                               | Rechazo + registro en OTP_Firma. |
| I-04   | OTP ya usado                                                         | Rechazo "Código ya fue utilizado". |
| I-05   | XSS en campo nombre                                                  | Se muestra escapado (sin ejecutar). |
| I-06   | CORS — solo orígenes permitidos (api.php)                            | Orígenes externos reciben 403. |
| I-07   | Archivos tipo distinto a .pdf/.jpg/.png                              | Rechazado en frontend `accept`. |

---

## Regresión crítica para v5.2 (obligatoria antes de release)

- [ ] **R-01**: Aceptación de los 3 legales actualiza el estatus visible en el dashboard del profesional **sin refrescar** manualmente.
- [ ] **R-02**: Profesional avanza a Fase 2 automáticamente.
- [ ] **R-03**: En admin dashboard, "Ingreso a la red" y "Tiempo en la red" muestran datos reales (no "Pendiente").
- [ ] **R-04**: Fase 2 → Fase 3 auto-avance al marcar los dos triggers de Zoom.
- [ ] **R-05**: Fase 3 → Fase 4 auto-avance al marcar supervisión.
- [ ] **R-06**: Reuniones de Fase 3 y 4 visibles (como Próximamente) en un profesional en Fase 2.
- [ ] **R-07**: Upload de archivos respeta límites (CV/Cédula/Carta 5MB, Foto 1MB) y no saca al usuario de la pestaña Documentos.
- [ ] **R-08**: ETICA NO bloquea avance de fase pero sí aparece como doc a aceptar.
- [ ] **R-09**: "URLs de Formularios Públicos" removido del panel admin.
- [ ] **R-10**: Sección de poblaciones usa checkboxes con label clicable (no requiere Ctrl).

## Checklist de despliegue

1. [ ] Merge a rama principal.
2. [ ] Redesplegar Web App de Apps Script (nueva versión).
3. [ ] Subir `*.html` al servidor WordPress/PHP.
4. [ ] Invalidar caché del CDN.
5. [ ] Ejecutar `runAllTests` en editor de Apps Script → 100% OK.
6. [ ] Smoke test manual con un profesional nuevo de extremo a extremo.
7. [ ] Verificar correos de Brevo llegan sin marcarse como spam.
8. [ ] Revisar `Audit_Log` tras el smoke test (sin errores).

## Rollback

- Deshacer la implementación actual desde "Manage deployments" (volver a versión anterior).
- Restaurar archivos HTML previos desde backup del servidor.
- La hoja de cálculo es backwards-compatible: las columnas nuevas no rompen lecturas antiguas.
