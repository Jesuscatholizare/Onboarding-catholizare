/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CATHOLIZARE PRO - SISTEMA DE ONBOARDING COMPLETO
 * Versión: 5.3 - Correos actualizados + WhatsApp
 * Fecha: Febrero 2026
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// CONSTANTES GLOBALES
// ============================================================================

// ⚠️ CAMBIA ESTE NÚMERO POR EL NÚMERO REAL DE WHATSAPP DE COORDINACIÓN
var WA_NUMBER = '5215510223883';
var WA_LINK = 'https://wa.me/' + WA_NUMBER;

// Folder de Google Drive con documentos legales para descarga
var LEGAL_DOCS_FOLDER = '1ZoZdAj9xBXlbZQh07lJAwuNQNp9h4SUs';

function getEmailFooter(nombre) {
  return '<tr><td style="padding:20px 30px;text-align:center;">' +
    '<a href="' + WA_LINK + '?text=' + encodeURIComponent('Hola, soy ' + nombre + ' y necesito ayuda con mi integración en Catholizare Pro') + '" ' +
    'style="display:inline-block;background:#25D366;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:50px;font-size:15px;font-weight:700;">' +
    '💬 Atención al Profesional (WhatsApp)</a></td></tr>' +
    '<tr><td style="background-color:#f8f9fa;padding:25px 30px;text-align:center;border-top:1px solid #e9ecef;">' +
    '<p style="margin:0 0 8px 0;color:#666;font-size:13px;">¿Necesitas ayuda? Escríbenos por WhatsApp o al correo <strong>soporte@catholizare.com</strong></p>' +
    '<p style="margin:0;color:#999;font-size:12px;">&copy; 2026 Catholizare Pro. Todos los derechos reservados.</p></td></tr>';
}

// ============================================================================
// CONFIGURACIÓN INICIAL
// ============================================================================

function setupConfiguration() {
  const props = PropertiesService.getScriptProperties();
  props.setProperties({
    'BREVO_API_KEY': 'PEGAR_TU_API_KEY_AQUI',
    'BREVO_LIST_FASE1': '14',
    'BREVO_LIST_FASE2': '15',
    'BREVO_LIST_FASE3': '16',
    'BREVO_LIST_FASE4': '17',
    'PARENT_FOLDER_ID': '1KNS---a_KVRrmvvjQ-rp7tWSmyooKVPE',
    'ZOOM_LINK': 'https://us06web.zoom.us/j/TU-LINK-ZOOM',
    'ADMIN_EMAIL': 'sistemascatholizare@gmail.com',
    'SELECCION_URL': ''
  });
  Logger.log('✅ Configuración guardada');
}

// Ejecutar esta función para actualizar SOLO los IDs de listas Brevo sin tocar la API key
function actualizarListasBrevo() {
  const props = PropertiesService.getScriptProperties();
  props.setProperties({
    'BREVO_LIST_FASE1': '14',
    'BREVO_LIST_FASE2': '15',
    'BREVO_LIST_FASE3': '16',
    'BREVO_LIST_FASE4': '17'
  });
  Logger.log('✅ Listas Brevo actualizadas: Fase1=#14, Fase2=#15, Fase3=#16, Fase4=#17');
}

// Ejecutar esta función para actualizar SOLO la carpeta raíz de Drive
// (donde se suben CV, cédula, foto, carta) sin tocar el resto de la configuración.
function actualizarCarpetaDrive() {
  const NUEVA_CARPETA_ID = '1KNS---a_KVRrmvvjQ-rp7tWSmyooKVPE';
  const props = PropertiesService.getScriptProperties();
  props.setProperty('PARENT_FOLDER_ID', NUEVA_CARPETA_ID);
  Logger.log('✅ PARENT_FOLDER_ID actualizado a: ' + NUEVA_CARPETA_ID);

  // Verificación opcional: intentar abrir la carpeta
  try {
    var folder = DriveApp.getFolderById(NUEVA_CARPETA_ID);
    Logger.log('📁 Carpeta verificada: ' + folder.getName());
  } catch (e) {
    Logger.log('⚠️ No se pudo abrir la carpeta. Revisa permisos y que el ID sea correcto.');
  }
}

function verificarConfiguracion() {
  const props = PropertiesService.getScriptProperties();
  const config = {
    'BREVO_API_KEY': props.getProperty('BREVO_API_KEY'),
    'BREVO_LIST_FASE1': props.getProperty('BREVO_LIST_FASE1'),
    'BREVO_LIST_FASE2': props.getProperty('BREVO_LIST_FASE2'),
    'BREVO_LIST_FASE3': props.getProperty('BREVO_LIST_FASE3'),
    'BREVO_LIST_FASE4': props.getProperty('BREVO_LIST_FASE4'),
    'PARENT_FOLDER_ID': props.getProperty('PARENT_FOLDER_ID'),
    'ZOOM_LINK': props.getProperty('ZOOM_LINK'),
    'ADMIN_EMAIL': props.getProperty('ADMIN_EMAIL')
  };
  Logger.log('📋 CONFIGURACIÓN ACTUAL:');
  for (let key in config) {
    const value = config[key];
    Logger.log(`${value ? '✅' : '❌'} ${key}: ${value || 'NO CONFIGURADO'}`);
  }
}

// ============================================================================
// CONSTANTES Y CONFIGURACIÓN DINÁMICA
// ============================================================================

// Use getter functions instead of global constants (which fail in web app context)
function getSS() {
  // HARDCODED ID - obtenido de setupSpreadsheetId()
  return SpreadsheetApp.openById('1YgbnsB0_oLbSlYBUNqhe2V9QqlbEu8nGotYTWHHXW4I');
}

function getSHEET() {
  return getSS().getSheetByName("Onboarding");
}

/**
 * EJECUTAR UNA VEZ desde el editor para guardar el ID del spreadsheet
 */
function setupSpreadsheetId() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var id = ss.getId();
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', id);
  Logger.log('✅ SPREADSHEET_ID guardado: ' + id);
}

function getConfig() {
  const props = PropertiesService.getScriptProperties();
  return {
    BREVO_API_KEY: props.getProperty('BREVO_API_KEY'),
    PARENT_FOLDER_ID: props.getProperty('PARENT_FOLDER_ID'),
    ZOOM_LINK: props.getProperty('ZOOM_LINK'),
    ADMIN_EMAIL: props.getProperty('ADMIN_EMAIL'),
    SELECCION_URL: props.getProperty('SELECCION_URL'),
    LIST_IDS: {
      "Fase 1": parseInt(props.getProperty('BREVO_LIST_FASE1')),
      "Fase 2": parseInt(props.getProperty('BREVO_LIST_FASE2')),
      "Fase 3": parseInt(props.getProperty('BREVO_LIST_FASE3')),
      "Fase 4": parseInt(props.getProperty('BREVO_LIST_FASE4'))
    }
  };
}

const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';

const FILE_SIZE_LIMITS = {
  foto: 1 * 1024 * 1024,
  cv: 5 * 1024 * 1024,
  cedula: 5 * 1024 * 1024,
  titulo: 5 * 1024 * 1024,
  carta: 5 * 1024 * 1024
};

const ALLOWED_TYPES = {
  foto: ['image/jpeg', 'image/jpg', 'image/png'],
  documents: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
};

// ============================================================================
// URL BASE DEL SERVIDOR WORDPRESS (donde están los HTML migrados)
// ============================================================================

var SERVER_BASE = 'https://profesionales.catholizare.com/catholizare_sistem/onboarding';

// ============================================================================
// HELPER: REDIRIGIR A PÁGINA ADMIN EN SERVIDOR
// ============================================================================

function serveAdminPage(fileName, title, adminToken, user) {
  // Mapeo de archivos GAS → rutas del servidor
  var pageMap = {
    'Admin_Dashboard_Complete': '/dashboard-admin.html',
    'Admin_Gestion_Usuarios': '/Admin_Gestion_Usuarios.html',
    'Admin_profesionales': '/Admin_profesionales.html',
    'Admin_legal': '/Admin_legal.html',
    'Admin_analitica': '/Admin_analitica.html',
    'Admin_superadmin': '/Admin_superadmin.html',
    'Admin_health': '/Admin_health.html'
  };

  var path = pageMap[fileName] || '/dashboard-admin.html';
  var url = SERVER_BASE + path +
    '?adminToken=' + encodeURIComponent(adminToken) +
    '&userName=' + encodeURIComponent(user.nombre) +
    '&userRole=' + encodeURIComponent(user.role) +
    '&userEmail=' + encodeURIComponent(user.email || '');

  return HtmlService.createHtmlOutput(
    '<html><head><meta http-equiv="refresh" content="0;url=' + url + '"></head>' +
    '<body>Redirigiendo... <a href="' + url + '">Click aquí si no se redirige</a></body></html>'
  ).setTitle(title + ' - Catholizare')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ============================================================================
// VALIDAR TOKEN PROFESIONAL
// ============================================================================

function validateProfessionalToken(token) {
  try {
    if (!token) return null;
    
    var data = getSHEET().getDataRange().getValues();
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] == token) {
        return {
          token: data[i][0],
          nombre: data[i][1],
          email: data[i][2],
          especialidad: data[i][3],
          fase: data[i][8],
          estado: data[i][9],
          categoria: data[i][10],
          row: i + 1
        };
      }
    }
    
    return null;
    
  } catch (error) {
    Logger.log('Error en validateProfessionalToken: ' + error);
    return null;
  }
}

// ============================================================================
// doGet - ROUTING PRINCIPAL
// ============================================================================

function doGet(e) {
  var page = e.parameter.page;
  var token = e.parameter.token;
  var action = e.parameter.action;
  var admin = e.parameter.admin;
  var adminToken = e.parameter.adminToken;

  // === BLOQUE 1: ENDPOINTS API (JSON) ===
  
  if (action === 'getTimeline') {
    var timeline = getTimeline(token);
    return ContentService.createTextOutput(JSON.stringify(timeline))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === 'getStatus') {
    var status = getProfessionalStatus(token);
    return ContentService.createTextOutput(JSON.stringify(status))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // === BLOQUE 2: ADMIN DASHBOARD ===
  
  // Detectar automáticamente si es token de admin (para URLs directas)
  if (!admin && token && token.toString().indexOf('ADMIN-') === 0) {
    admin = 'true';
    adminToken = token;
  }
  
  if (admin === 'true') {
    adminToken = adminToken || token; // Fallback: usar token si adminToken no existe
    var user = validateAdminToken(adminToken);
    
    if (!user) {
      return HtmlService.createHtmlOutput(
        '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#f5f7fa}' +
        '.error{text-align:center;padding:40px;background:white;border-radius:12px;box-shadow:0 2px 10px rgba(0,0,0,0.1);max-width:400px}</style></head>' +
        '<body><div class="error"><h1 style="color:#dc3545;font-size:48px;margin:0 0 16px 0">🔒</h1>' +
        '<h2 style="color:#001A55;margin:0 0 12px 0">Acceso Denegado</h2>' +
        '<p style="color:#6c757d;font-size:16px">Token de admin inválido o inactivo</p></div></body></html>'
      ).setTitle('Acceso Denegado');
    }
    
    // ROUTING DE PÁGINAS ADMIN
    var adminPage = e.parameter.page;
    
    if (adminPage === 'usuarios') {
      return serveAdminPage('Admin_Gestion_Usuarios', 'Gestión de Usuarios', adminToken, user);
    }
    if (adminPage === 'profesionales') {
      return serveAdminPage('Admin_profesionales', 'Profesionales', adminToken, user);
    }
    if (adminPage === 'legal') {
      return serveAdminPage('Admin_legal', 'Gestión Legal', adminToken, user);
    }
    if (adminPage === 'analitica') {
      return serveAdminPage('Admin_analitica', 'Analítica', adminToken, user);
    }
    if (adminPage === 'superadmin') {
      if (user.role !== 'superadmin') {
        return HtmlService.createHtmlOutput(
          '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#f5f7fa}' +
          '.error{text-align:center;padding:40px;background:white;border-radius:12px;box-shadow:0 2px 10px rgba(0,0,0,0.1)}</style></head>' +
          '<body><div class="error"><h1 style="font-size:48px;margin:0">⚠️</h1>' +
          '<h2 style="color:#001A55">Acceso Restringido</h2><p style="color:#6c757d">Solo super admins pueden acceder</p></div></body></html>'
        ).setTitle('Acceso Restringido');
      }
      return serveAdminPage('Admin_superadmin', 'Super Admin', adminToken, user);
    }
    if (adminPage === 'health') {
      return serveAdminPage('Admin_health', 'System Health', adminToken, user);
    }
    
    // DEFAULT: Dashboard
    return serveAdminPage('Admin_Dashboard_Complete', 'Admin Dashboard', adminToken, user);
  }

  // === BLOQUE 3: VALIDACIÓN TOKEN PROFESIONAL ===
  
  var professional = validateProfessionalToken(token);
  
  if (!professional) {
    return HtmlService.createHtmlOutput(
      '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#f5f7fa}' +
      '.error{text-align:center;padding:40px;background:white;border-radius:12px;box-shadow:0 2px 10px rgba(0,0,0,0.1);max-width:400px}</style></head>' +
      '<body><div class="error"><h1 style="color:#dc3545;font-size:48px;margin:0 0 16px 0">🔒</h1>' +
      '<h2 style="color:#001A55;margin:0 0 12px 0">Token Inválido</h2>' +
      '<p style="color:#6c757d;font-size:16px">El enlace ha expirado o no es válido</p></div></body></html>'
    ).setTitle('Token Inválido');
  }

  // === BLOQUE 4: PÁGINAS PROFESIONALES → REDIRIGIR AL SERVIDOR ===

  function redirectToServer(path, params) {
    var url = SERVER_BASE + path;
    var qs = [];
    for (var key in params) {
      if (params[key]) qs.push(key + '=' + encodeURIComponent(params[key]));
    }
    if (qs.length) url += '?' + qs.join('&');
    return HtmlService.createHtmlOutput(
      '<html><head><meta http-equiv="refresh" content="0;url=' + url + '"></head>' +
      '<body>Redirigiendo... <a href="' + url + '">Click aquí</a></body></html>'
    ).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  if (page === 'aceptacion_terminos') {
    return redirectToServer('/acepto-terminos.html', { token: token, nombre: professional.nombre });
  }

  if (page === 'informacion_perfil') {
    return redirectToServer('/Public_Perfil.html', { token: token, nombre: professional.nombre });
  }

  // Dashboard del profesional (página por defecto)
  return redirectToServer('/index.html', { token: token, nombre: professional.nombre });
}

// ============================================================================
// doPost - ROUTER PARA PROXY PHP
// ============================================================================
// El proxy PHP (proxy.php) envía POST con { action: "nombreFuncion", ...params }
// y este router despacha a la función correcta del backend.
// ============================================================================

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action;
    Logger.log('[doPost] Action: ' + action);
    var result;

    switch (action) {
      // === Profesional ===
      case 'saveLegalAcceptance':
        result = saveLegalAcceptance(data.token, data.version, data.signerName);
        break;
      case 'saveProfileInfo':
        result = saveProfileInfo(data.token, data.formData);
        break;
      case 'uploadFile':
        result = uploadFile(data.token, data.base64Data, data.fileName, data.fileType);
        break;

      // === Admin: gestión de profesionales ===
      case 'getAllProfesionales':
        result = { success: true, data: getAllProfesionales() };
        break;
      case 'getProfessionalStatus':
        result = getProfessionalStatus(data.token);
        break;
      case 'sendManualEmailFromDashboard':
        result = sendManualEmailFromDashboard(data.token, data.emailType);
        break;
      case 'adminAdvancePhase':
        result = adminAdvancePhase(data.token);
        break;
      case 'adminSetStatus':
        result = adminSetStatus(data.token, data.nuevoEstado);
        break;
      case 'adminMarkAction':
        result = adminMarkAction(data.token, data.actionId);
        break;
      case 'adminDeleteProfessional':
        result = adminDeleteProfessional(data.token);
        break;
      case 'adminResetOnboarding':
        result = adminResetOnboarding(data.token);
        break;
      case 'initializeNewProfessional':
        result = initializeNewProfessional(data.nombre, data.email, data.especialidad, data.categoria);
        break;

      // === Admin: usuarios admin ===
      case 'validateAdminToken':
        var user = validateAdminToken(data.token, data.email);
        result = user ? { success: true, data: user } : { success: false, message: 'Clave o correo incorrectos' };
        break;
      case 'getAllAdminUsers':
        result = { success: true, data: getAllAdminUsers() };
        break;
      case 'generateAdminToken':
        result = generateAdminToken(data.email, data.role, data.nombre, data.currentUserToken, data.pin);
        break;
      case 'deactivateAdminToken':
        result = deactivateAdminToken(data.tokenToDeactivate, data.currentUserToken);
        break;
      case 'activateAdminToken':
        result = activateAdminToken(data.tokenToActivate, data.currentUserToken);
        break;
      case 'getSuperadminPin':
        result = getSuperadminPin(data.currentUserToken);
        break;
      case 'setSuperadminPin':
        result = setSuperadminPin(data.currentUserToken, data.newPin);
        break;

      // === Timeline y estado ===
      case 'getTimeline':
        result = getTimeline(data.token);
        break;
      case 'getEmailHistory':
        result = { success: true, data: getEmailHistory(data.token) };
        break;
      case 'getStatus':
        result = getProfessionalStatus(data.token, data.loginEmail);
        break;
      case 'diagnosticoRemoto':
        result = diagnosticoRemoto();
        break;
      case 'sendTestEmail':
        result = sendTestEmail(data.email, data.adminToken);
        break;

      // === Documentos Legales ===
      case 'getDocumentoLegal':
        result = getDocumentoLegal(data.docId);
        break;
      case 'getDocumentosStatus':
        result = getDocumentosStatus(data.token);
        break;
      case 'aceptarDocumento':
        result = aceptarDocumento(data);
        break;
      case 'solicitarCodigoFirma':
        result = solicitarCodigoFirma(data);
        break;
      case 'listLegalAcceptances':
        result = listLegalAcceptances(data.query, data.adminToken);
        break;
      case 'getLegalAcceptanceDetail':
        result = getLegalAcceptanceDetail(data.folio, data.adminToken);
        break;

      default:
        result = { success: false, message: 'Accion no reconocida: ' + action };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('[doPost ERROR] ' + error.message);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Error del servidor: ' + error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================================================
// FUNCIONES DE PERSISTENCIA
// ============================================================================

function saveLegalAcceptance(token, version, signerName) {
  try {
    var data = getSHEET().getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] == token) {
        var rowNum = i + 1;
        var acceptInfo = 'ACEPTADO | ' + (version || 'sin versión') + ' | Firmado: ' + (signerName || 'N/A') + ' | ' + new Date().toISOString();
        getSHEET().getRange(rowNum, 12).setValue(acceptInfo);
        getSHEET().getRange(rowNum, 13).setValue(new Date());
        logAction(token, data[i][2], 'Legal aceptado (' + (version||'') + ') por ' + (signerName||''), 'Legal_Aceptacion', '', acceptInfo, 'Profesional');
        checkAndAdvancePhase(rowNum, data[i]);
        return { success: true, message: "Documentos legales aceptados" };
      }
    }
    throw new Error("Token no encontrado.");
  } catch (error) {
    Logger.log('Error en saveLegalAcceptance: ' + error);
    return { success: false, message: error.toString() };
  }
}

function saveProfileInfo(token, formData) {
  try {
    var data = getSHEET().getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] == token) {
        var rowNum = i + 1;
        getSHEET().getRange(rowNum, 14).setValue(formData.poblaciones);
        getSHEET().getRange(rowNum, 15).setValue(formData.modalidad);
        getSHEET().getRange(rowNum, 16).setValue(formData.terapias);
        getSHEET().getRange(rowNum, 17).setValue(formData.horarios);
        logAction(token, data[i][2], 'Perfil completado', 'Perfil', '', 'Datos guardados', 'Profesional');
        checkAndAdvancePhase(rowNum, data[i]);
        return { success: true, message: "Perfil guardado exitosamente" };
      }
    }
    throw new Error("Token no encontrado.");
  } catch (error) {
    Logger.log('Error en saveProfileInfo: ' + error);
    return { success: false, message: error.toString() };
  }
}

function checkAndAdvancePhase(rowNum, rowData) {
  try {
    var token = rowData[0];
    var nombre = rowData[1];
    var email = rowData[2];

    // Contar legales aceptados desde la hoja Aceptaciones_Legales (nuevo sistema).
    // Requerimos los 3 documentos legales (CONTRATO, TERMINOS, PRIVACIDAD). ETICA
    // no se considera bloqueante para el avance de fase porque no es documento legal.
    var legalMap = buildLegalAcceptanceMap_();
    var tk = String(token || '').trim().toLowerCase();
    var entry = legalMap[tk] || { CONTRATO: false, TERMINOS: false, PRIVACIDAD: false };
    var legalOk = !!(entry.CONTRATO && entry.TERMINOS && entry.PRIVACIDAD);

    // Fallback: si el campo legacy (col 12) dice ACEPTADO, también cuenta
    if (!legalOk && rowData[11] && rowData[11].toString().indexOf("ACEPTADO") === 0) {
      legalOk = true;
    }

    var required = {
      legal: legalOk,
      perfil: rowData[13] !== "" && rowData[13] !== null,
      cv: rowData[4] !== "" && rowData[4] !== null,
      cedula: rowData[5] !== "" && rowData[5] !== null,
      foto: rowData[6] !== "" && rowData[6] !== null,
      carta: rowData[7] !== "" && rowData[7] !== null
    };

    var allComplete = Object.values(required).every(function(v) { return v === true; });

    if (allComplete && rowData[8] === "Fase 1") {
      getSHEET().getRange(rowNum, 9).setValue("Fase 2");
      getSHEET().getRange(rowNum, 22).setValue(true);
      getSHEET().getRange(rowNum, 23).setValue(new Date());

      // Actualizar columnas legacy: col 12 (L = Legal info) y col 13 (M = Fecha legal)
      // para que admin dashboard muestre "Ingreso a la red" y "Tiempo en la red".
      var fechaLegalWrite = _ultimaFechaLegalDeToken_(token) || new Date();
      try {
        var existingLegalInfo = String(rowData[11] || '');
        if (existingLegalInfo.indexOf('ACEPTADO') !== 0) {
          getSHEET().getRange(rowNum, 12).setValue('ACEPTADO (3 docs legales)');
        }
        if (!rowData[12]) {
          getSHEET().getRange(rowNum, 13).setValue(fechaLegalWrite);
        }
      } catch(legErr) { Logger.log('Error actualizando cols legacy legal: ' + legErr); }

      sendPhase2WelcomeEmail(email, nombre);
      moveContactToBrevoPhase(email, nombre, "Fase 2", token);
      notifyAdminForZoomScheduling(email, nombre, token);

      logAction(token, email, 'Avance a Fase 2', 'Fase_Actual', 'Fase 1', 'Fase 2', 'Sistema');
      Logger.log('✅ ' + nombre + ' avanzó a Fase 2');
    }
  } catch (error) {
    Logger.log('Error en checkAndAdvancePhase: ' + error);
  }
}

/**
 * Devuelve la fecha (Date) de la última aceptación legal (CONTRATO/TERMINOS/PRIVACIDAD)
 * registrada en Aceptaciones_Legales para el token dado. Null si no hay.
 */
function _ultimaFechaLegalDeToken_(token) {
  try {
    var sheet = getSS().getSheetByName("Aceptaciones_Legales");
    if (!sheet || sheet.getLastRow() < 2) return null;
    var data = sheet.getDataRange().getValues();
    var tk = String(token || '').trim().toLowerCase();
    var legales = { CONTRATO: true, TERMINOS: true, PRIVACIDAD: true };
    var maxFecha = null;
    for (var i = 1; i < data.length; i++) {
      var rowTk = String(data[i][4] || '').trim().toLowerCase();
      var docId = String(data[i][1] || '').trim().toUpperCase();
      if (rowTk === tk && legales[docId]) {
        var f = new Date(data[i][3]);
        if (!isNaN(f.getTime()) && (!maxFecha || f > maxFecha)) maxFecha = f;
      }
    }
    return maxFecha;
  } catch(e) { Logger.log('_ultimaFechaLegalDeToken_ error: ' + e); return null; }
}

/**
 * Pre-carga el mapa de aceptaciones legales por token.
 * Devuelve { "ONB-xxx": { CONTRATO: true, TERMINOS: false, PRIVACIDAD: true, count: 2 }, ... }
 */
function buildLegalAcceptanceMap_() {
  var map = {};
  try {
    var sheet = getSS().getSheetByName("Aceptaciones_Legales");
    if (sheet && sheet.getLastRow() > 1) {
      var data = sheet.getDataRange().getValues();
      for (var i = 1; i < data.length; i++) {
        var tk = String(data[i][4] || '').trim().toLowerCase(); // token normalizado
        var docId = String(data[i][1] || '').trim().toUpperCase(); // doc_id normalizado
        if (!tk) continue;
        if (!map[tk]) map[tk] = { CONTRATO: false, TERMINOS: false, PRIVACIDAD: false, ETICA: false, count: 0 };
        if (map[tk][docId] !== undefined && !map[tk][docId]) {
          map[tk][docId] = true;
          map[tk].count++;
        }
      }
    }
  } catch(e) { Logger.log('buildLegalAcceptanceMap_ error: ' + e); }
  return map;
}

/**
 * Devuelve el conteo de documentos legales aceptados por un token
 * (usando la hoja Aceptaciones_Legales, con comparación case-insensitive).
 */
function getLegalCountForToken_(token) {
  var map = buildLegalAcceptanceMap_();
  var tk = String(token || '').trim().toLowerCase();
  return (map[tk] && map[tk].count) ? map[tk].count : 0;
}

/**
 * Calcula el progreso del onboarding (0-100%).
 * 8 ítems totales: 3 contratos + 4 documentos + 1 perfil.
 * legalCount (0-3) es opcional; si no se pasa usa el campo legacy row[11].
 */
function calcularProgreso(row, legalCount) {
  var puntos = 0;
  if (legalCount !== undefined && legalCount !== null) {
    puntos += legalCount;
  } else {
    // Fallback legacy: 1 punto si ACEPTADO (compatibilidad)
    if (row[11] && row[11].toString().indexOf("ACEPTADO") === 0) puntos++;
  }
  if (row[13] !== "" && row[13] !== null) puntos++;
  if (row[4] !== "" && row[4] !== null) puntos++;
  if (row[5] !== "" && row[5] !== null) puntos++;
  if (row[6] !== "" && row[6] !== null) puntos++;
  if (row[7] !== "" && row[7] !== null) puntos++;
  var total = (legalCount !== undefined && legalCount !== null) ? 9 : 6;
  return Math.round((puntos / total) * 100);
}

/**
 * Cuenta los pendientes. legalCount (0-3) opcional.
 */
function calcularPendientes(row, legalCount) {
  var pendientes = 0;
  if (legalCount !== undefined && legalCount !== null) {
    pendientes += (4 - legalCount);
  } else {
    if (!row[11] || row[11].toString().indexOf("ACEPTADO") !== 0) pendientes++;
  }
  if (!row[13] || row[13] === "") pendientes++;
  if (!row[4] || row[4] === "") pendientes++;
  if (!row[5] || row[5] === "") pendientes++;
  if (!row[6] || row[6] === "") pendientes++;
  if (!row[7] || row[7] === "") pendientes++;
  return pendientes;
}

// ============================================================================
// ACCIONES DE ADMIN
// ============================================================================

// Envío manual de cualquier tipo de email desde el dashboard
function sendManualEmailFromDashboard(token, emailType) {
  try {
    var data = getSHEET().getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] == token) {
        var email = data[i][2];
        var nombre = data[i][1];
        var firstName = nombre.split(' ')[0];
        var progreso = calcularProgreso(data[i]);
        
        switch(emailType) {
          case 'welcome': return sendWelcomeEmail(email, nombre, token);
          case 'reminder1': return sendReminder1(email, nombre, progreso, token);
          case 'reminder2': return sendReminder2(email, nombre, progreso, token);
          case 'incomplete': return sendIncompleteNotification(email, nombre);
          case 'phase2': return sendPhase2AndGuidesEmail(email, firstName, token);
          case 'guides': return sendPhase2AndGuidesEmail(email, firstName, token);
          case 'zoomReminder': return sendZoomReminderEmail(email, nombre, 'Por confirmar');
          case 'annualUpdate': return sendAnnualUpdateEmail(email, nombre, token, 1);
          case 'trainingMaterials': return sendPhase3WelcomeEmail(email, firstName, token);
          case 'blogInvite': return sendBlogInviteEmail(email, firstName, token);
          case 'monthlyMeeting': return sendMonthlyMeetingEmail(email, firstName, token);
          case 'supervisionInvite': return { success: true, message: 'Supervisión se agenda por WhatsApp' };
          default: return { success: false, message: 'Tipo de email no reconocido: ' + emailType };
        }
      }
    }
    return { success: false, message: 'Token no encontrado' };
  } catch(e) {
    Logger.log('Error en sendManualEmailFromDashboard: ' + e);
    return { success: false, message: e.toString() };
  }
}

// ============================================================================
// EMAIL FASE 2: Bienvenida + Guías de Uso (template real)
// ============================================================================
function sendPhase2AndGuidesEmail(email, firstName, token) {
  var subject = '🎉 Bienvenido a la Fase 2 — Configuración Técnica';
  var htmlContent = '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>' +
    '<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,sans-serif;background-color:#f4f7fa;">' +
    '<table role="presentation" style="width:100%;border-collapse:collapse;background-color:#f4f7fa;"><tr><td style="padding:40px 20px;">' +
    '<table role="presentation" style="max-width:600px;margin:0 auto;background-color:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1);">' +
    '<tr><td style="background:linear-gradient(135deg,#003ABA 0%,#001A55 100%);padding:30px;text-align:center;">' +
    '<h1 style="margin:0;color:#fff;font-size:26px;font-weight:700;">Bienvenido a la Fase 2</h1>' +
    '<p style="margin:10px 0 0 0;color:rgba(255,255,255,0.9);font-size:16px;">Configuración Técnica</p></td></tr>' +
    '<tr><td style="padding:40px 30px;">' +
    '<h2 style="margin:0 0 20px 0;color:#001A55;font-size:22px;font-weight:600;">¡Bienvenido, ' + firstName + '!</h2>' +
    '<p style="margin:0 0 25px 0;color:#333;font-size:16px;line-height:1.6;">Felicitaciones por completar la Fase 1. Ahora entrarás en la <strong>configuración técnica</strong> de tu perfil en la plataforma.</p>' +
    '<h3 style="margin:0 0 20px 0;color:#001A55;font-size:20px;font-weight:600;">📚 Guías disponibles:</h3>' +
    '<table role="presentation" style="width:100%;border-collapse:collapse;margin-bottom:15px;"><tr>' +
    '<td style="padding:20px;background:#f8f9fa;border-radius:10px;border-left:4px solid #003ABA;">' +
    '<p style="margin:0 0 8px 0;color:#001A55;font-size:17px;font-weight:700;">📖 Procedimiento de reserva</p>' +
    '<p style="margin:0 0 12px 0;color:#666;font-size:14px;">Cómo es que tus pacientes reservan en la plataforma</p>' +
    '<a href="https://drive.google.com/file/d/1GARHnR6mMwjChPH1Bw4bCrSA0EhwG8ky/view?usp=sharing" style="color:#003ABA;text-decoration:none;font-weight:600;font-size:14px;">→ Descarga el PDF</a></td></tr></table>' +
    '<table role="presentation" style="width:100%;border-collapse:collapse;margin-bottom:15px;"><tr>' +
    '<td style="padding:20px;background:#f8f9fa;border-radius:10px;border-left:4px solid #28a745;">' +
    '<p style="margin:0 0 8px 0;color:#001A55;font-size:17px;font-weight:700;">📅 Cómo gestionar tus citas</p>' +
    '<p style="margin:0 0 12px 0;color:#666;font-size:14px;">Agenda, cancela y reprograma sesiones fácilmente</p>' +
    '<a href="https://drive.google.com/file/d/1GARHnR6mMwjChPH1Bw4bCrSA0EhwG8ky/view?usp=sharing" style="color:#28a745;text-decoration:none;font-weight:600;font-size:14px;">→ Descarga el PDF</a></td></tr></table>' +
    '<table role="presentation" style="width:100%;border-collapse:collapse;margin-bottom:30px;"><tr>' +
    '<td style="padding:20px;background:#f8f9fa;border-radius:10px;border-left:4px solid #ffc107;">' +
    '<p style="margin:0 0 8px 0;color:#001A55;font-size:17px;font-weight:700;">📄 Contacta a tus pacientes</p>' +
    '<p style="margin:0 0 12px 0;color:#666;font-size:14px;">Notas para contactar a tus pacientes</p>' +
    '<a href="https://drive.google.com/file/d/1cmbn9-azJ0v1iCpdYvse6xBPNoGHeLYv/view?usp=sharing" style="color:#b8860b;text-decoration:none;font-weight:600;font-size:14px;">→ Descarga el PDF</a></td></tr></table>' +
    '<table role="presentation" style="width:100%;border-collapse:collapse;margin:35px 0;"><tr><td style="text-align:center;">' +
    '<a href="https://drive.google.com/file/d/1tCzYAzO9EXpzquvHGcsTnFZntsyCqApn/view?usp=drive_link" style="display:inline-block;background-color:#001A55;background:linear-gradient(135deg,#001A55 0%,#003ABA 100%);color:#fff;text-decoration:none;padding:16px 40px;border-radius:50px;font-size:17px;font-weight:700;box-shadow:0 4px 12px rgba(0,26,85,0.25);">📚 VER TODAS LAS GUÍAS</a></td></tr></table>' +
    '<table role="presentation" style="width:100%;border-collapse:collapse;background:#e3f2fd;border-radius:10px;margin:25px 0;"><tr><td style="padding:20px;">' +
    '<p style="margin:0;color:#001A55;font-size:14px;line-height:1.6;">📅 <strong>Próximo paso:</strong> Recibirás un email para agendar tu reunión de bienvenida por Zoom.</p></td></tr></table>' +
    '<p style="margin:30px 0 0 0;color:#333;font-size:15px;">Saludos,<br><strong style="color:#001A55;">Equipo Catholizare Pro</strong></p>' +
    '</td></tr><tr><td style="background-color:#f8f9fa;padding:20px;text-align:center;"><p style="margin:0;color:#999;font-size:12px;">© 2026 Catholizare Pro</p></td></tr>' +
    '</table></td></tr></table></body></html>';
  
  var result = sendEmailViaBrevo(email, subject, htmlContent);
  logEmailSent(token, email, 'PHASE2_GUIDES', subject, result.success);
  return result;
}

// ============================================================================
// EMAIL FASE 3: Bienvenida + Materiales de Formación (template real)
// ============================================================================
function sendPhase3WelcomeEmail(email, firstName, token) {
  var subject = '🎓 Bienvenido a la Fase 3 — Integración Académica y Comunitaria';
  var htmlContent = '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>' +
    '<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,sans-serif;background-color:#f4f7fa;">' +
    '<table role="presentation" style="width:100%;border-collapse:collapse;background-color:#f4f7fa;"><tr><td style="padding:40px 20px;">' +
    '<table role="presentation" style="max-width:600px;margin:0 auto;background-color:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1);">' +
    '<tr><td style="background:linear-gradient(135deg,#28a745 0%,#20c997 100%);padding:35px;text-align:center;">' +
    '<h1 style="margin:0 0 10px 0;color:#fff;font-size:28px;font-weight:800;">Bienvenido a la Fase 3</h1>' +
    '<p style="margin:0;color:rgba(255,255,255,0.95);font-size:17px;font-weight:600;">Integración Académica y Comunitaria</p></td></tr>' +
    '<tr><td style="padding:40px 30px;">' +
    '<h2 style="margin:0 0 20px 0;color:#001A55;font-size:22px;font-weight:600;">¡Excelente progreso, ' + firstName + '!</h2>' +
    '<p style="margin:0 0 25px 0;color:#333;font-size:16px;line-height:1.6;">Ahora tendrás acceso a nuestra <strong>biblioteca de formación continua</strong> diseñada específicamente para profesionales católicos de la salud mental.</p>' +
    '<table role="presentation" style="width:100%;border-collapse:collapse;background:linear-gradient(135deg,#f0fff4 0%,#d4edda 100%);border-radius:12px;border-left:5px solid #28a745;margin:25px 0;"><tr><td style="padding:25px;">' +
    '<h3 style="margin:0 0 20px 0;color:#28a745;font-size:20px;font-weight:700;">📚 Materiales disponibles:</h3>' +
    '<div style="margin-bottom:20px;"><p style="margin:0 0 5px 0;color:#001A55;font-size:17px;font-weight:700;">1. Integración Fe y Psicología</p>' +
    '<p style="margin:0 0 10px 0;color:#666;font-size:14px;">Lee nuestros post, respuestas de nuestros mentores.</p>' +
    '<a href="https://profesionales.catholizare.com/recursos-psicologicos/" style="display:inline-block;background:#28a745;color:white;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:600;">Acceder a recursos →</a></div>' +
    '<div style="margin-bottom:20px;"><p style="margin:0 0 5px 0;color:#001A55;font-size:17px;font-weight:700;">2. Curso Derecho Canónico en el Matrimonio</p>' +
    '<p style="margin:0 0 10px 0;color:#666;font-size:14px;">Cursa nuestro curso para entender cómo se funda el sacramento del matrimonio y cómo se puede determinar su no existencia.</p>' +
    '<a href="https://academia.catholizare.com/courses/descubriendo-el-sacramento-matrimonio/lesson/01-bienvenida/" style="display:inline-block;background:#003ABA;color:white;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:600;">Ver webinars →</a></div>' +
    '<div><p style="margin:0 0 5px 0;color:#001A55;font-size:17px;font-weight:700;">3. Discusión de Casos Clínicos desde la Ciencia y la Fe</p>' +
    '<p style="margin:0 0 10px 0;color:#666;font-size:14px;">Puedes revisar aquel caso del cual tienes dudas, de manera individual o en grupo con nuestras reuniones clínicas.</p>' +
    '<a href="https://profesionales.catholizare.com/" style="display:inline-block;background:#ffc107;color:#000;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:600;">Explorar casos →</a></div>' +
    '</td></tr></table>' +
    '<table role="presentation" style="width:100%;border-collapse:collapse;background:#fff3cd;border-radius:10px;border-left:4px solid #D4AF37;margin:25px 0;"><tr><td style="padding:20px;">' +
    '<p style="margin:0;color:#666;font-size:14px;line-height:1.6;">🎓 <strong>Extra:</strong> Si tienes dudas de un caso también las puedes externar para que puedan ser contestadas en un post por uno de nuestros expertos.</p></td></tr></table>' +
    '<table role="presentation" style="width:100%;border-collapse:collapse;margin:35px 0;"><tr><td style="text-align:center;">' +
    '<a href="https://profesionales.catholizare.com/" style="display:inline-block;background-color:#001A55;background:linear-gradient(135deg,#001A55 0%,#003ABA 100%);color:#fff;text-decoration:none;padding:18px 50px;border-radius:50px;font-size:18px;font-weight:700;box-shadow:0 4px 15px rgba(0,26,85,0.3);">🚀 COMENZAR MI FORMACIÓN</a></td></tr></table>' +
    '<p style="margin:30px 0 0 0;color:#333;font-size:15px;">Bendiciones,<br><strong style="color:#001A55;">Equipo Catholizare Pro</strong></p>' +
    '</td></tr><tr><td style="background-color:#f8f9fa;padding:20px;text-align:center;"><p style="margin:0;color:#999;font-size:12px;">© 2026 Catholizare Pro</p></td></tr>' +
    '</table></td></tr></table></body></html>';
  
  var result = sendEmailViaBrevo(email, subject, htmlContent);
  logEmailSent(token, email, 'PHASE3_WELCOME', subject, result.success);
  return result;
}

// ============================================================================
// EMAIL FASE 3: Invitación Blog (template real)
// ============================================================================
function sendBlogInviteEmail(email, firstName, token) {
  var subject = '✍️ Comparte tu experiencia — Invitación al Blog';
  var htmlContent = '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>' +
    '<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,sans-serif;background-color:#f4f7fa;">' +
    '<table role="presentation" style="width:100%;border-collapse:collapse;background-color:#f4f7fa;"><tr><td style="padding:40px 20px;">' +
    '<table role="presentation" style="max-width:600px;margin:0 auto;background-color:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1);">' +
    '<tr><td style="background:linear-gradient(135deg,#003ABA 0%,#001A55 100%);padding:30px;text-align:center;">' +
    '<h1 style="margin:0;color:#fff;font-size:26px;font-weight:700;">✍️ Comparte tu experiencia</h1></td></tr>' +
    '<tr><td style="padding:40px 30px;">' +
    '<h2 style="margin:0 0 20px 0;color:#001A55;font-size:22px;font-weight:600;">Hola ' + firstName + ',</h2>' +
    '<p style="margin:0 0 25px 0;color:#333;font-size:16px;line-height:1.6;">Como miembro de Catholizare Pro, te invitamos a <strong>colaborar en nuestro blog comunitario</strong> y compartir tu conocimiento con otros profesionales y el público general.</p>' +
    '<h3 style="margin:0 0 15px 0;color:#001A55;font-size:20px;font-weight:600;">✍️ ¿Sobre qué puedes escribir?</h3>' +
    '<ul style="margin:0 0 30px 0;padding-left:20px;color:#333;font-size:15px;line-height:1.8;">' +
    '<li style="margin-bottom:10px;">Casos clínicos (debidamente anonimizados)</li>' +
    '<li style="margin-bottom:10px;">Reflexiones sobre la integración de fe y psicología</li>' +
    '<li style="margin-bottom:10px;">Artículos técnicos de tu especialidad</li>' +
    '<li style="margin-bottom:10px;">Reseñas de libros o recursos</li>' +
    '<li>Entrevistas o colaboraciones con otros profesionales</li></ul>' +
    '<table role="presentation" style="width:100%;border-collapse:collapse;background:linear-gradient(135deg,#fff3cd 0%,#fffaeb 100%);border-radius:12px;border-left:5px solid #D4AF37;margin:25px 0;"><tr><td style="padding:25px;">' +
    '<p style="margin:0 0 15px 0;color:#001A55;font-size:18px;font-weight:700;">📝 Beneficios de participar:</p>' +
    '<ul style="margin:0;padding-left:20px;color:#666;font-size:14px;line-height:1.7;">' +
    '<li style="margin-bottom:8px;">Mayor visibilidad profesional</li>' +
    '<li style="margin-bottom:8px;">Networking con otros profesionales católicos</li>' +
    '<li style="margin-bottom:8px;">Contribuir al crecimiento de la comunidad</li>' +
    '<li>Posicionamiento como experto en tu área</li></ul></td></tr></table>' +
    '<table role="presentation" style="width:100%;border-collapse:collapse;margin:35px 0;"><tr><td style="text-align:center;">' +
    '<a href="https://wa.me/5215510223883?text=Quiero%20participar%20escribiendo%20un%20post" style="display:inline-block;background-color:#001A55;background:linear-gradient(135deg,#001A55 0%,#003ABA 100%);color:#fff;text-decoration:none;padding:18px 50px;border-radius:50px;font-size:18px;font-weight:700;box-shadow:0 4px 15px rgba(0,26,85,0.3);">✍️ ENVIAR MI PRIMER ARTÍCULO</a></td></tr></table>' +
    '<table role="presentation" style="width:100%;border-collapse:collapse;background:#e3f2fd;border-radius:10px;margin:25px 0;"><tr><td style="padding:15px;">' +
    '<p style="margin:0;color:#666;font-size:13px;line-height:1.6;">💡 <strong>Nota:</strong> No te preocupes por el formato perfecto. Nuestro equipo editorial te ayudará a pulir y dar formato a tu artículo antes de publicarlo.</p></td></tr></table>' +
    '<p style="margin:30px 0 0 0;color:#333;font-size:15px;">Saludos,<br><strong style="color:#001A55;">Equipo Catholizare Pro</strong></p>' +
    '</td></tr><tr><td style="background-color:#f8f9fa;padding:20px;text-align:center;"><p style="margin:0;color:#999;font-size:12px;">© 2026 Catholizare Pro</p></td></tr>' +
    '</table></td></tr></table></body></html>';
  
  var result = sendEmailViaBrevo(email, subject, htmlContent);
  logEmailSent(token, email, 'BLOG_INVITE', subject, result.success);
  return result;
}

// ============================================================================
// EMAIL FASE 3: Reunión Mensual (template real)
// ============================================================================
function sendMonthlyMeetingEmail(email, firstName, token) {
  var subject = '🤝 Te esperamos — Reunión mensual de profesionales';
  var htmlContent = '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>' +
    '<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,sans-serif;background-color:#f4f7fa;">' +
    '<table role="presentation" style="width:100%;border-collapse:collapse;background-color:#f4f7fa;"><tr><td style="padding:40px 20px;">' +
    '<table role="presentation" style="max-width:600px;margin:0 auto;background-color:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1);">' +
    '<tr><td style="background:linear-gradient(135deg,#6f42c1 0%,#5a32a3 100%);padding:30px;text-align:center;">' +
    '<h1 style="margin:0;color:#fff;font-size:26px;font-weight:700;">🤝 Te esperamos</h1>' +
    '<p style="margin:10px 0 0 0;color:rgba(255,255,255,0.9);font-size:16px;">Reunión mensual de profesionales</p></td></tr>' +
    '<tr><td style="padding:40px 30px;">' +
    '<h2 style="margin:0 0 20px 0;color:#001A55;font-size:22px;font-weight:600;">Hola ' + firstName + ',</h2>' +
    '<p style="margin:0 0 25px 0;color:#333;font-size:16px;line-height:1.6;">Como parte de la comunidad de Catholizare Pro, estás invitado a nuestras <strong>reuniones mensuales de profesionales</strong> donde nos reunimos para crecer juntos.</p>' +
    '<table role="presentation" style="width:100%;border-collapse:collapse;background:linear-gradient(135deg,#e3f2fd 0%,#bbdefb 100%);border-radius:12px;border-left:5px solid #003ABA;margin:25px 0;"><tr><td style="padding:25px;">' +
    '<h3 style="margin:0 0 20px 0;color:#001A55;font-size:20px;font-weight:700;">📅 Próxima reunión:</h3>' +
    '<p style="margin:0 0 10px 0;color:#001A55;font-size:15px;"><strong>Fecha:</strong> Primer viernes de cada mes</p>' +
    '<p style="margin:0 0 10px 0;color:#001A55;font-size:15px;"><strong>Hora:</strong> 8:30 hrs (hora de México)</p>' +
    '<p style="margin:0 0 10px 0;color:#001A55;font-size:15px;"><strong>Modalidad:</strong> Zoom</p>' +
    '<p style="margin:0 0 8px 0;color:#001A55;font-size:15px;font-weight:700;">Link:</p>' +
    '<p style="margin:0;font-size:13px;word-break:break-all;"><a href="https://us06web.zoom.us/j/83347662979?pwd=gQDTtfI5x3wduMYYJOXXINFCgqsWx8.1" style="color:#003ABA;text-decoration:underline;">https://us06web.zoom.us/j/83347662979?pwd=gQDTtfI5x3wduMYYJOXXINFCgqsWx8.1</a></p>' +
    '</td></tr></table>' +
    '<h3 style="margin:0 0 15px 0;color:#001A55;font-size:20px;font-weight:600;">🗣️ Temas a tratar:</h3>' +
    '<ul style="margin:0 0 30px 0;padding-left:20px;color:#333;font-size:15px;line-height:1.8;">' +
    '<li style="margin-bottom:10px;">Casos clínicos para supervisión grupal</li>' +
    '<li style="margin-bottom:10px;">Actualización en técnicas terapéuticas desde la fe</li>' +
    '<li style="margin-bottom:10px;">Networking y oportunidades de colaboración</li>' +
    '<li style="margin-bottom:10px;">Espacio de oración comunitaria</li>' +
    '<li>Actualizaciones de la plataforma</li></ul>' +
    '<table role="presentation" style="width:100%;border-collapse:collapse;margin:35px 0;"><tr><td style="text-align:center;">' +
    '<a href="https://us06web.zoom.us/j/83347662979?pwd=gQDTtfI5x3wduMYYJOXXINFCgqsWx8.1" style="display:inline-block;background-color:#28a745;background:linear-gradient(135deg,#28a745 0%,#20c997 100%);color:#fff;text-decoration:none;padding:18px 50px;border-radius:50px;font-size:18px;font-weight:700;box-shadow:0 4px 15px rgba(40,167,69,0.3);">✅ CONFIRMAR ASISTENCIA</a></td></tr></table>' +
    '<p style="margin:30px 0 0 0;color:#333;font-size:15px;">En Cristo,<br><strong style="color:#001A55;">Equipo Catholizare Pro</strong></p>' +
    '</td></tr><tr><td style="background-color:#f8f9fa;padding:20px;text-align:center;"><p style="margin:0;color:#999;font-size:12px;">© 2026 Catholizare Pro</p></td></tr>' +
    '</table></td></tr></table></body></html>';
  
  var result = sendEmailViaBrevo(email, subject, htmlContent);
  logEmailSent(token, email, 'MONTHLY_MEETING', subject, result.success);
  return result;
}

// Marcar acciones manuales - persiste en columna X (24)
function adminMarkAction(token, actionId) {
  try {
    var data = getSHEET().getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] == token) {
        var rowNum = i + 1;
        var actionName = actionId.replace('trigMark','');
        
        // Leer marcas existentes de columna 24
        var marksRaw = data[i][23] || '{}';
        var marks = {};
        try { marks = JSON.parse(marksRaw); } catch(e) { marks = {}; }
        
        // Marcar como completado con fecha
        marks[actionId] = new Date().toISOString();
        
        // Guardar
        getSHEET().getRange(rowNum, 24).setValue(JSON.stringify(marks));
        logAction(token, data[i][2], actionName + ' completado (manual)', 'Trigger_' + actionName, '', 'Completado', 'Admin');

        // Auto-avance de fase según triggers completados
        try {
          var currentPhase = String(data[i][8] || 'Fase 1');
          var nombreRow = data[i][1];
          var emailRow = data[i][2];
          // Fase 2 → Fase 3: sync + zoom ambos marcados
          if (currentPhase === 'Fase 2' && marks['trigMarkSyncDone'] && marks['trigMarkZoomDone']) {
            getSHEET().getRange(rowNum, 9).setValue('Fase 3');
            logAction(token, emailRow, 'Avance automático a Fase 3', 'Fase_Actual', 'Fase 2', 'Fase 3', 'Sistema');
            try { sendPhase3WelcomeEmail(emailRow, nombreRow, token); } catch(_){}
            try { moveContactToBrevoPhase(emailRow, nombreRow, 'Fase 3', token); } catch(_){}
            Logger.log('✅ ' + nombreRow + ' avanzó a Fase 3 (auto)');
          }
          // Fase 3 → Fase 4: supervisión realizada
          else if (currentPhase === 'Fase 3' && marks['trigMarkSupervisionDone']) {
            getSHEET().getRange(rowNum, 9).setValue('Fase 4');
            logAction(token, emailRow, 'Avance automático a Fase 4', 'Fase_Actual', 'Fase 3', 'Fase 4', 'Sistema');
            try { moveContactToBrevoPhase(emailRow, nombreRow, 'Fase 4', token); } catch(_){}
            Logger.log('✅ ' + nombreRow + ' avanzó a Fase 4 (auto)');
          }
        } catch(advErr) { Logger.log('Error auto-avance por trigger: ' + advErr); }

        return { success: true, message: actionName + ' marcado como completado' };
      }
    }
    return { success: false, message: 'Token no encontrado' };
  } catch(e) { return { success: false, message: e.toString() }; }
}

function adminAdvancePhase(token) {
  try {
    var data = getSHEET().getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] == token) {
        var rowNum = i + 1;
        var currentPhase = String(data[i][8] || 'Fase 1');
        var nextPhase = '';
        if (currentPhase === 'Fase 1') nextPhase = 'Fase 2';
        else if (currentPhase === 'Fase 2') nextPhase = 'Fase 3';
        else if (currentPhase === 'Fase 3') nextPhase = 'Fase 4';
        else return { success: false, message: 'Ya está en la fase final' };
        
        getSHEET().getRange(rowNum, 9).setValue(nextPhase);
        logAction(token, data[i][2], 'Avance manual a ' + nextPhase, 'Fase_Actual', currentPhase, nextPhase, 'Admin');
        
        // Mover contacto en Brevo a la nueva lista
        try {
          moveContactToBrevoPhase(data[i][2], data[i][1], nextPhase, token);
        } catch(be) { Logger.log('Brevo move error: ' + be); }
        
        return { success: true, message: 'Avanzado a ' + nextPhase };
      }
    }
    return { success: false, message: 'Token no encontrado' };
  } catch (e) { return { success: false, message: e.toString() }; }
}

function adminSetStatus(token, nuevoEstado) {
  try {
    var data = getSHEET().getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] == token) {
        var rowNum = i + 1;
        var oldStatus = String(data[i][9] || '');
        getSHEET().getRange(rowNum, 10).setValue(nuevoEstado);
        logAction(token, data[i][2], 'Estado cambiado a ' + nuevoEstado, 'Estado', oldStatus, nuevoEstado, 'Admin');
        return { success: true, message: 'Estado: ' + nuevoEstado };
      }
    }
    return { success: false, message: 'Token no encontrado' };
  } catch (e) { return { success: false, message: e.toString() }; }
}

function adminDeleteProfessional(token) {
  try {
    var data = getSHEET().getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] == token) {
        var rowNum = i + 1;
        logAction(token, data[i][2], 'Profesional eliminado', 'Sistema', '', 'ELIMINADO', 'Admin');
        getSHEET().deleteRow(rowNum);
        return { success: true, message: 'Profesional eliminado' };
      }
    }
    return { success: false, message: 'Token no encontrado' };
  } catch (e) { return { success: false, message: e.toString() }; }
}

function adminResetOnboarding(token) {
  try {
    var data = getSHEET().getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] == token) {
        var rowNum = i + 1;
        getSHEET().getRange(rowNum, 9).setValue('Fase 1');
        getSHEET().getRange(rowNum, 10).setValue('Activo');
        getSHEET().getRange(rowNum, 18).setValue(new Date()); // nueva fecha inicio
        // Limpiar legal y perfil
        getSHEET().getRange(rowNum, 12).setValue('');
        getSHEET().getRange(rowNum, 13).setValue('');
        getSHEET().getRange(rowNum, 14).setValue('');
        getSHEET().getRange(rowNum, 15).setValue('');
        getSHEET().getRange(rowNum, 16).setValue('');
        getSHEET().getRange(rowNum, 17).setValue('');
        getSHEET().getRange(rowNum, 22).setValue(false);
        logAction(token, data[i][2], 'Onboarding reiniciado', 'Sistema', '', 'Reinicio completo', 'Admin');
        return { success: true, message: 'Onboarding reiniciado' };
      }
    }
    return { success: false, message: 'Token no encontrado' };
  } catch (e) { return { success: false, message: e.toString() }; }
}

// ============================================================================
// GESTIÓN DE ARCHIVOS
// ============================================================================

function uploadFile(token, base64Data, fileName, fileType) {
  try {
    var config = getConfig();
    var maxSize = FILE_SIZE_LIMITS[fileType];
    var estimatedSize = base64Data.length * 0.75;
    
    if (estimatedSize > maxSize) {
      var maxMB = (maxSize / (1024 * 1024)).toFixed(0);
      throw new Error('El archivo excede el tamaño máximo permitido (' + maxMB + 'MB)');
    }
    
    var contentType = 'application/octet-stream';
    if (base64Data.indexOf('data:') === 0) {
      contentType = base64Data.substring(5, base64Data.indexOf(';'));
    }
    
    // Determine allowed types based on fileType
    var allowedTypes = fileType === 'foto' ? ALLOWED_TYPES.foto : ALLOWED_TYPES.documents;
    // For CV, also allow Word docs
    if (fileType === 'cv') {
      allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    }
    
    if (allowedTypes.indexOf(contentType) === -1) {
      throw new Error("Tipo de archivo no permitido. Solo PDF, JPG o PNG");
    }
    
    var data = getSHEET().getDataRange().getValues();
    var userRow = -1;
    var userName = "";
    var userEmail = "";

    for (var i = 1; i < data.length; i++) {
      if (data[i][0] == token) {
        userRow = i + 1;
        userName = data[i][1];
        userEmail = data[i][2];
        break;
      }
    }

    if (userRow === -1) throw new Error("Token no válido");

    var parentFolder = DriveApp.getFolderById(config.PARENT_FOLDER_ID);
    var userFolder = null;

    // Buscar carpeta existente por token (clave única, nunca cambia)
    var allFolders = parentFolder.getFolders();
    while (allFolders.hasNext()) {
      var f = allFolders.next();
      if (f.getName().indexOf(token) >= 0) {
        userFolder = f;
        break;
      }
    }

    if (!userFolder) {
      // Compatibilidad: buscar por nombre (carpetas viejas sin token)
      var byName = parentFolder.getFoldersByName(userName);
      if (byName.hasNext()) {
        userFolder = byName.next();
        // Renombrar para incluir token y evitar duplicados futuros
        userFolder.setName(userName + ' (' + token + ')');
      } else {
        userFolder = parentFolder.createFolder(userName + ' (' + token + ')');
      }
    }

    var bytes = Utilities.base64Decode(base64Data.split(',')[1]);
    var blob = Utilities.newBlob(bytes, contentType, fileName);
    var file = userFolder.createFile(blob);
    
    var columnMap = { 'cv': 5, 'cedula': 6, 'titulo': 6, 'foto': 7, 'carta': 8 };
    var colToUpdate = columnMap[fileType];
    getSHEET().getRange(userRow, colToUpdate).setValue(file.getUrl());
    
    var docNames = { 'cv': 'CV', 'cedula': 'Cédula', 'titulo': 'Título', 'foto': 'Foto de perfil', 'carta': 'Carta de sacerdote' };
    logAction(token, userEmail, 'Subió ' + docNames[fileType], docNames[fileType] + '_Url', '', file.getUrl(), 'Profesional');
    
    var rowData = data[userRow - 1];
    checkAndAdvancePhase(userRow, rowData);
    
    return { success: true, url: file.getUrl(), message: docNames[fileType] + ' subido correctamente' };
  } catch (error) {
    Logger.log('Error en uploadFile: ' + error);
    return { success: false, message: error.toString() };
  }
}

// ============================================================================
// SISTEMA DE EMAILS VÍA BREVO
// ============================================================================

function sendEmailViaBrevo(to, subject, htmlContent) {
  try {
    var config = getConfig();
    if (!config.BREVO_API_KEY || config.BREVO_API_KEY === 'PEGAR_TU_API_KEY_AQUI') {
      Logger.log('⚠️ BREVO_API_KEY no configurada o es placeholder. Key: ' + (config.BREVO_API_KEY ? config.BREVO_API_KEY.substring(0,10) + '...' : 'VACÍA'));
      return { success: false, message: "API Key de Brevo no configurada. Ve a Propiedades del script." };
    }
    
    var payload = {
      sender: { name: "Catholizare Pro", email: "integracion@catholizare.com" },
      to: [{ email: to }],
      subject: subject,
      htmlContent: htmlContent
    };
    
    var options = {
      method: 'post',
      contentType: 'application/json',
      headers: { 'api-key': config.BREVO_API_KEY, 'accept': 'application/json' },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    Logger.log('📧 Enviando vía Brevo a: ' + to + ' | Subject: ' + subject);
    var response = UrlFetchApp.fetch(BREVO_ENDPOINT, options);
    var responseCode = response.getResponseCode();
    var responseText = response.getContentText();
    Logger.log('📧 Brevo response code: ' + responseCode + ' | Body: ' + responseText);
    
    var result = JSON.parse(responseText);
    
    if (responseCode === 201) {
      Logger.log('✅ Email enviado via Brevo a: ' + to + ' | MessageId: ' + result.messageId);
      return { success: true, messageId: result.messageId };
    } else {
      Logger.log('❌ Brevo error ' + responseCode + ': ' + responseText);
      return { success: false, message: 'Brevo error ' + responseCode + ': ' + (result.message || responseText) };
    }
  } catch (error) {
    Logger.log('❌ Error en sendEmailViaBrevo: ' + error);
    return { success: false, message: error.toString() };
  }
}

// ============================================================================
// EMAIL #1: Bienvenida (Día 0)
// ============================================================================

/**
 * Genera el HTML de un checklist visual con el estado real de pendientes.
 * Consulta Aceptaciones_Legales para los 3 contratos y la hoja principal
 * para archivos y perfil. Devuelve { html, pendingCount, totalCount }.
 */
function buildPendingChecklistHtml_(token) {
  var check = '&#9745;';    // ☑
  var uncheck = '&#9744;';  // ☐
  var green = '#28a745';
  var gray = '#9CA3B4';

  // Contratos firmados
  var contratos = { CONTRATO: false, TERMINOS: false, PRIVACIDAD: false, ETICA: false };
  try {
    var aSheet = getSS().getSheetByName("Aceptaciones_Legales");
    if (aSheet && aSheet.getLastRow() > 1) {
      var aData = aSheet.getDataRange().getValues();
      for (var a = 1; a < aData.length; a++) {
        if (aData[a][4] === token && contratos[aData[a][1]] !== undefined) {
          contratos[aData[a][1]] = true;
        }
      }
    }
  } catch(e) {}

  // Row data for files + profile
  var row = null;
  try {
    var sData = getSHEET().getDataRange().getValues();
    for (var s = 1; s < sData.length; s++) {
      if (sData[s][0] === token) { row = sData[s]; break; }
    }
  } catch(e) {}

  var hasCV = !!(row && row[4] && row[4] !== '');
  var hasCedula = !!(row && row[5] && row[5] !== '');
  var hasFoto = !!(row && row[6] && row[6] !== '');
  var hasCarta = !!(row && row[7] && row[7] !== '');
  var hasPerfil = !!(row && row[13] && row[13] !== '');

  function item(done, label) {
    var ic = done ? check : uncheck;
    var col = done ? green : gray;
    var strike = done ? 'text-decoration:line-through;color:#999;' : 'color:#333;';
    return '<tr><td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">' +
      '<span style="color:' + col + ';font-size:17px;margin-right:8px;">' + ic + '</span>' +
      '<span style="font-size:14px;' + strike + '">' + label + '</span></td></tr>';
  }

  var items = [
    item(contratos.CONTRATO, 'Contrato de Intermediación'),
    item(contratos.TERMINOS, 'Términos y Condiciones'),
    item(contratos.PRIVACIDAD, 'Aviso de Privacidad'),
    item(contratos.ETICA, 'Código de Ética'),
    item(hasCV, 'CV'),
    item(hasCedula, 'Cédula Profesional'),
    item(hasFoto, 'Foto de Perfil'),
    item(hasCarta, 'Carta de Sacerdote'),
    item(hasPerfil, 'Perfil Profesional completo')
  ];

  var total = 9;
  var done = [contratos.CONTRATO, contratos.TERMINOS, contratos.PRIVACIDAD, contratos.ETICA, hasCV, hasCedula, hasFoto, hasCarta, hasPerfil].filter(function(x){ return x; }).length;
  var pending = total - done;

  var html = '<table role="presentation" style="width:100%;border-collapse:collapse;margin:16px 0;">' +
    items.join('') + '</table>';

  return { html: html, pendingCount: pending, totalCount: total, doneCount: done, contratos: contratos };
}

function sendWelcomeEmail(email, nombre, token) {
  var dashboardLink = SERVER_BASE + '/index.html?token=' + token;
  var subject = "¡Bienvenido a Catholizare Pro! - Inicia tu Integración";

  var htmlContent = '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>' +
    '<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,sans-serif;background-color:#f4f7fa;">' +
    '<table role="presentation" style="width:100%;border-collapse:collapse;background-color:#f4f7fa;"><tr><td style="padding:40px 20px;">' +
    '<table role="presentation" style="max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,26,85,0.1);">' +
    '<tr><td style="background:linear-gradient(135deg,#001A55 0%,#003ABA 100%);padding:40px 30px;text-align:center;">' +
    '<h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;">¡Bienvenido a Catholizare Pro!</h1>' +
    '<p style="margin:15px 0 0 0;color:rgba(255,255,255,0.9);font-size:16px;">Tu camino hacia la integración profesional</p></td></tr>' +
    '<tr><td style="padding:40px 30px;">' +
    '<h2 style="margin:0 0 20px 0;color:#001A55;font-size:24px;">Hola ' + nombre + ',</h2>' +
    '<p style="margin:0 0 20px 0;color:#333333;font-size:16px;line-height:1.6;">Es un <strong>honor y alegría</strong> darte la bienvenida a nuestra red de profesionales católicos de la salud mental.</p>' +

    '<table role="presentation" style="width:100%;border-collapse:collapse;background:linear-gradient(135deg,#fff3cd 0%,#fffaeb 100%);border-radius:12px;border-left:5px solid #D4AF37;margin-bottom:30px;">' +
    '<tr><td style="padding:20px;"><p style="margin:0 0 10px 0;color:#001A55;font-size:18px;font-weight:700;">Tienes 3 semanas para completar la Fase 1</p>' +
    '<p style="margin:0;color:#666666;font-size:14px;">Te enviaremos recordatorios para ayudarte en el proceso.</p></td></tr></table>' +

    '<h3 style="margin:0 0 15px 0;color:#001A55;font-size:20px;">Pasos a completar:</h3>' +
    '<table role="presentation" style="width:100%;border-collapse:collapse;margin-bottom:20px;">' +
    '<tr><td style="padding:12px;border-bottom:1px solid #e9ecef;"><span style="color:#9CA3B4;font-size:16px;margin-right:8px;">&#9744;</span><span style="color:#333;font-size:15px;"><strong>Firmar contratos:</strong> Contrato de Intermediación, Términos y Condiciones, Aviso de Privacidad</span></td></tr>' +
    '<tr><td style="padding:12px;border-bottom:1px solid #e9ecef;"><span style="color:#9CA3B4;font-size:16px;margin-right:8px;">&#9744;</span><span style="color:#333;font-size:15px;"><strong>Subir documentos:</strong> CV, Cédula Profesional, Foto de Perfil, Carta de Sacerdote</span></td></tr>' +
    '<tr><td style="padding:12px;"><span style="color:#9CA3B4;font-size:16px;margin-right:8px;">&#9744;</span><span style="color:#333;font-size:15px;"><strong>Completar tu perfil:</strong> Servicios, modalidad, horarios, enfoque terapéutico</span></td></tr></table>' +

    '<table role="presentation" style="width:100%;margin:30px 0;"><tr><td style="text-align:center;">' +
    '<a href="' + dashboardLink + '" style="display:inline-block;background-color:#001A55;background:linear-gradient(135deg,#001A55 0%,#003ABA 100%);color:#ffffff;text-decoration:none;padding:18px 40px;border-radius:50px;font-size:17px;font-weight:700;box-shadow:0 4px 15px rgba(0,26,85,0.3);">Entrar a mi Dashboard</a></td></tr></table>' +

    '<p style="margin:30px 0 0 0;color:#333;font-size:16px;">Con gratitud y en Cristo,<br><strong style="color:#001A55;">Equipo de Catholizare Pro</strong></p>' +
    '</td></tr>' +
    getEmailFooter(nombre) +
    '</table></td></tr></table></body></html>';

  var result = sendEmailViaBrevo(email, subject, htmlContent);
  logEmailSent(token, email, 'WELCOME', subject, result.success);
  return result;
}

// ============================================================================
// EMAIL #2: Recordatorio Amigable (Día 20)
// ============================================================================

function sendReminder1(email, nombre, progreso, token) {
  var dashboardLink = SERVER_BASE + '/index.html?token=' + token;
  var subject = "Recordatorio amigable - Completa tu integración en Catholizare Pro";
  var checklist = buildPendingChecklistHtml_(token);

  var htmlContent = '<!DOCTYPE html><html><head><meta charset="UTF-8"></head>' +
    '<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,sans-serif;background-color:#f4f7fa;">' +
    '<table role="presentation" style="width:100%;border-collapse:collapse;background-color:#f4f7fa;"><tr><td style="padding:40px 20px;">' +
    '<table role="presentation" style="max-width:600px;margin:0 auto;background-color:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1);">' +
    '<tr><td style="background:linear-gradient(135deg,#20c997 0%,#28a745 100%);padding:30px;text-align:center;">' +
    '<h1 style="margin:0;color:#fff;font-size:26px;font-weight:700;">Un recordatorio amigable</h1></td></tr>' +
    '<tr><td style="padding:40px 30px;">' +
    '<h2 style="margin:0 0 20px 0;color:#001A55;font-size:22px;">Hola ' + nombre + ',</h2>' +
    '<p style="margin:0 0 15px 0;color:#333;font-size:16px;line-height:1.6;">Ha pasado <strong>1 semana</strong> desde tu registro en Catholizare Pro.</p>' +
    '<p style="margin:0 0 25px 0;color:#333;font-size:16px;">Te quedan <strong style="color:#28a745;">2 semanas</strong> para completar la Fase 1.</p>' +

    '<table role="presentation" style="width:100%;border-collapse:collapse;background:#f8f9fc;border-radius:12px;margin-bottom:30px;"><tr><td style="padding:20px;">' +
    '<p style="margin:0 0 6px 0;color:#001A55;font-size:16px;font-weight:700;">Tu checklist (' + checklist.doneCount + ' de ' + checklist.totalCount + '):</p>' +
    checklist.html +
    '</td></tr></table>' +

    '<table role="presentation" style="width:100%;margin:30px 0;"><tr><td style="text-align:center;">' +
    '<a href="' + dashboardLink + '" style="display:inline-block;background-color:#001A55;background:linear-gradient(135deg,#001A55 0%,#003ABA 100%);color:#fff;text-decoration:none;padding:16px 45px;border-radius:50px;font-size:17px;font-weight:700;">Entrar a mi Dashboard</a>' +
    '</td></tr></table>' +
    '<p style="margin:30px 0 0 0;color:#333;font-size:15px;">Saludos,<br><strong style="color:#001A55;">Equipo Catholizare Pro</strong></p>' +
    '</td></tr>' +
    getEmailFooter(nombre) +
    '</table></td></tr></table></body></html>';

  var result = sendEmailViaBrevo(email, subject, htmlContent);
  logEmailSent(token, email, 'REMINDER_1', subject, result.success);
  return result;
}

// ============================================================================
// EMAIL #3: Recordatorio URGENTE (Día 40)
// ============================================================================

function sendReminder2(email, nombre, progreso, token) {
  var dashboardLink = SERVER_BASE + '/index.html?token=' + token;
  var subject = "Atención - Solo quedan 7 días para completar tu integración";
  var checklist = buildPendingChecklistHtml_(token);

  var htmlContent = '<!DOCTYPE html><html><head><meta charset="UTF-8"></head>' +
    '<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,sans-serif;background-color:#f4f7fa;">' +
    '<table role="presentation" style="width:100%;border-collapse:collapse;background-color:#f4f7fa;"><tr><td style="padding:40px 20px;">' +
    '<table role="presentation" style="max-width:600px;margin:0 auto;background-color:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(220,53,69,0.15);border:3px solid #dc3545;">' +
    '<tr><td style="background:linear-gradient(135deg,#dc3545 0%,#c82333 100%);padding:35px;text-align:center;">' +
    '<h1 style="margin:0 0 10px 0;color:#fff;font-size:28px;font-weight:800;">Atención urgente</h1>' +
    '<p style="margin:0;color:rgba(255,255,255,0.95);font-size:16px;font-weight:600;">Tiempo crítico para completar tu integración</p></td></tr>' +
    '<tr><td style="padding:40px 30px;">' +
    '<h2 style="margin:0 0 20px 0;color:#dc3545;font-size:24px;font-weight:700;">Hola ' + nombre + ',</h2>' +
    '<p style="margin:0 0 15px 0;color:#333;font-size:17px;line-height:1.6;">Han pasado <strong style="color:#dc3545;">14 días</strong> y aún tienes pendientes.</p>' +
    '<table role="presentation" style="width:100%;border-collapse:collapse;background:linear-gradient(135deg,#fff3cd 0%,#ffe8a1 100%);border-radius:12px;border-left:6px solid #ffc107;margin:25px 0;">' +
    '<tr><td style="padding:20px;"><p style="margin:0 0 10px 0;color:#001A55;font-size:20px;font-weight:800;">Te quedan 7 días</p>' +
    '<p style="margin:0;color:#666;font-size:14px;">Si no completas antes del día 21, tu registro será marcado como <strong style="color:#dc3545;">"Incompleto"</strong>.</p></td></tr></table>' +

    '<table role="presentation" style="width:100%;border-collapse:collapse;background:#f8f9fc;border-radius:12px;margin-bottom:30px;"><tr><td style="padding:20px;">' +
    '<p style="margin:0 0 6px 0;color:#001A55;font-size:16px;font-weight:700;">Tu checklist (' + checklist.doneCount + ' de ' + checklist.totalCount + '):</p>' +
    checklist.html +
    '</td></tr></table>' +

    '<table role="presentation" style="width:100%;margin:30px 0;"><tr><td style="text-align:center;">' +
    '<a href="' + dashboardLink + '" style="display:inline-block;background-color:#c82333;background:linear-gradient(135deg,#dc3545 0%,#c82333 100%);color:#fff;text-decoration:none;padding:18px 50px;border-radius:50px;font-size:18px;font-weight:800;">Completar ahora</a>' +
    '</td></tr></table>' +
    '<p style="margin:30px 0 0 0;color:#333;font-size:15px;">Estamos aquí para ayudarte,<br><strong style="color:#001A55;">Equipo Catholizare Pro</strong></p>' +
    '</td></tr>' +
    getEmailFooter(nombre) +
    '</table></td></tr></table></body></html>';

  var result = sendEmailViaBrevo(email, subject, htmlContent);
  logEmailSent(token, email, 'REMINDER_2', subject, result.success);
  return result;
}

// ============================================================================
// EMAIL #4: Marcado como Incompleto (Día 60+)
// ============================================================================

function sendIncompleteNotification(email, nombre) {
  var config = getConfig();
  var subject = "Tu registro en Catholizare Pro ha sido marcado como Incompleto";
  
  var htmlContent = '<!DOCTYPE html><html><head><meta charset="UTF-8"></head>' +
    '<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,sans-serif;background-color:#f4f7fa;">' +
    '<table role="presentation" style="width:100%;border-collapse:collapse;background-color:#f4f7fa;"><tr><td style="padding:40px 20px;">' +
    '<table role="presentation" style="max-width:600px;margin:0 auto;background-color:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1);">' +
    '<tr><td style="background:linear-gradient(135deg,#6c757d 0%,#495057 100%);padding:30px;text-align:center;">' +
    '<h1 style="margin:0;color:#fff;font-size:24px;">Estado de tu registro</h1></td></tr>' +
    '<tr><td style="padding:40px 30px;">' +
    '<h2 style="margin:0 0 20px 0;color:#001A55;font-size:22px;">Hola ' + nombre + ',</h2>' +
    '<p style="margin:0 0 25px 0;color:#333;font-size:16px;line-height:1.6;">Lamentamos informarte que han pasado <strong>60 días</strong> desde tu registro y no has completado el proceso.</p>' +
    '<table role="presentation" style="width:100%;border-collapse:collapse;background:#f8f9fa;border-radius:10px;border-left:4px solid #6c757d;margin:25px 0;">' +
    '<tr><td style="padding:20px;"><p style="margin:0;color:#495057;font-size:16px;font-weight:600;">Tu estado ha sido cambiado a <strong>"Incompleto"</strong>.</p></td></tr></table>' +
    '<table role="presentation" style="width:100%;margin:35px 0;"><tr><td style="text-align:center;">' +
    '<a href="mailto:' + config.ADMIN_EMAIL + '?subject=Solicitud%20de%20extensión" style="display:inline-block;background-color:#001A55;background:linear-gradient(135deg,#001A55 0%,#003ABA 100%);color:#fff;text-decoration:none;padding:16px 40px;border-radius:50px;font-size:17px;font-weight:700;">📧 CONTACTAR A SOPORTE</a>' +
    '</td></tr></table>' +
    '<p style="margin:30px 0 0 0;color:#333;font-size:15px;">Con aprecio,<br><strong style="color:#001A55;">Equipo Catholizare Pro</strong></p>' +
    '</td></tr>' +
    getEmailFooter(nombre) +
    '</table></td></tr></table></body></html>';
  
  var result = sendEmailViaBrevo(email, subject, htmlContent);
  
  // Buscar token para log
  var data = getSHEET().getDataRange().getValues();
  var token = '';
  for (var i = 1; i < data.length; i++) {
    if (data[i][2] === email) { token = data[i][0]; break; }
  }
  logEmailSent(token, email, 'INCOMPLETE', subject, result.success);
  return result;
}

// ============================================================================
// EMAIL #5: Fase 1 Completada → Bienvenida Fase 2 (usa template real)
// ============================================================================

function sendPhase2WelcomeEmail(email, nombre) {
  // Buscar token para usar el template nuevo
  var data = getSHEET().getDataRange().getValues();
  var token = '';
  for (var i = 1; i < data.length; i++) {
    if (data[i][2] === email) { token = data[i][0]; break; }
  }
  var firstName = nombre.split(' ')[0];
  return sendPhase2AndGuidesEmail(email, firstName, token);
}

// ============================================================================
// EMAIL #6: Recordatorio Zoom 24hrs antes
// ============================================================================

function sendZoomReminderEmail(email, nombre, fechaReunion) {
  var config = getConfig();
  var fechaFormateada = Utilities.formatDate(new Date(fechaReunion), "GMT-6", "EEEE, dd 'de' MMMM 'de' yyyy 'a las' HH:mm");
  var googleCalendarLink = createGoogleCalendarLink(new Date(fechaReunion), nombre);
  var subject = "Recordatorio: Tu reunión de bienvenida es mañana";
  
  var htmlContent = '<!DOCTYPE html><html><head><meta charset="UTF-8"></head>' +
    '<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,sans-serif;background-color:#f4f7fa;">' +
    '<table role="presentation" style="width:100%;border-collapse:collapse;background-color:#f4f7fa;"><tr><td style="padding:40px 20px;">' +
    '<table role="presentation" style="max-width:600px;margin:0 auto;background-color:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1);">' +
    '<tr><td style="background:linear-gradient(135deg,#003ABA 0%,#001A55 100%);padding:30px;text-align:center;">' +
    '<h1 style="margin:0;color:#fff;font-size:26px;">📅 Recordatorio de Reunión</h1></td></tr>' +
    '<tr><td style="padding:40px 30px;">' +
    '<h2 style="margin:0 0 20px 0;color:#001A55;font-size:22px;">Hola ' + nombre + ',</h2>' +
    '<p style="margin:0 0 25px 0;color:#333;font-size:16px;line-height:1.6;">Te recordamos que tu <strong>reunión de bienvenida técnica</strong> es <strong style="color:#003ABA;">mañana</strong>.</p>' +
    '<table role="presentation" style="width:100%;border-collapse:collapse;background:linear-gradient(135deg,#f0f9ff 0%,#e3f2fd 100%);border-radius:12px;border-left:5px solid #001A55;margin:25px 0;">' +
    '<tr><td style="padding:25px;">' +
    '<p style="margin:0 0 12px 0;color:#001A55;font-size:16px;"><strong>📅 Fecha:</strong> ' + fechaFormateada + '</p>' +
    '<p style="margin:0 0 12px 0;color:#001A55;font-size:16px;"><strong>🕐 Duración:</strong> 20 minutos</p>' +
    '<p style="margin:0 0 8px 0;color:#001A55;font-size:16px;font-weight:700;">🔗 Link de Zoom:</p>' +
    '<p style="margin:0;font-size:14px;word-break:break-all;"><a href="' + config.ZOOM_LINK + '" style="color:#003ABA;">' + config.ZOOM_LINK + '</a></p></td></tr></table>' +
    '<table role="presentation" style="width:100%;margin:30px 0;"><tr><td style="text-align:center;">' +
    '<a href="' + googleCalendarLink + '" target="_blank" style="display:inline-block;background-color:#28a745;background:linear-gradient(135deg,#28a745 0%,#20c997 100%);color:#fff;text-decoration:none;padding:16px 40px;border-radius:50px;font-size:17px;font-weight:700;">📅 AGREGAR A MI CALENDARIO</a>' +
    '</td></tr></table>' +
    '<p style="margin:30px 0 0 0;color:#333;font-size:15px;">Saludos,<br><strong style="color:#001A55;">Equipo Catholizare Pro</strong></p>' +
    '</td></tr>' +
    getEmailFooter(nombre) +
    '</table></td></tr></table></body></html>';
  
  var result = sendEmailViaBrevo(email, subject, htmlContent);
  var data = getSHEET().getDataRange().getValues();
  var token = '';
  for (var i = 1; i < data.length; i++) {
    if (data[i][2] === email) { token = data[i][0]; break; }
  }
  logEmailSent(token, email, 'ZOOM_REMINDER', subject, result.success);
  return result;
}

function createGoogleCalendarLink(fecha, nombre) {
  var config = getConfig();
  var start = Utilities.formatDate(fecha, "GMT-6", "yyyyMMdd'T'HHmmss");
  var fechaFin = new Date(fecha.getTime() + 20*60000);
  var end = Utilities.formatDate(fechaFin, "GMT-6", "yyyyMMdd'T'HHmmss");
  var title = encodeURIComponent("Reunión de Bienvenida - Catholizare Pro");
  var details = encodeURIComponent("Reunión técnica de bienvenida");
  var location = encodeURIComponent(config.ZOOM_LINK);
  return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + title + '&dates=' + start + '/' + end + '&details=' + details + '&location=' + location;
}

// ============================================================================
// EMAIL #7: Actualización CV Anual
// ============================================================================

function sendAnnualUpdateEmail(email, nombre, token, anios) {
  anios = anios || 1;
  var dashboardLink = SERVER_BASE + '/index.html?token=' + token;

  // Mensajes personalizados por año
  var mensajes = {
    1: { emoji: '🎉', titulo: '¡Feliz Primer Aniversario!', color: '#D4AF37', msg: 'Ha pasado <strong>un año increíble</strong> desde que te uniste a nuestra familia de profesionales católicos. ¡Estamos muy orgullosos de tenerte!' },
    2: { emoji: '🌟', titulo: '¡2 Años Juntos!', color: '#003ABA', msg: '<strong>Dos años</strong> caminando juntos al servicio de la salud mental con valores católicos. Tu dedicación nos inspira profundamente.' },
    3: { emoji: '💫', titulo: '¡3 Años de Compromiso!', color: '#7e22ce', msg: '<strong>Tres años</strong> de servicio fiel. Tu permanencia y compromiso son un testimonio vivo de tu vocación profesional y espiritual.' },
    4: { emoji: '🏆', titulo: '¡4 Años de Excelencia!', color: '#15803d', msg: '<strong>Cuatro años</strong> acompañando a quienes más lo necesitan. Tu experiencia enriquece enormemente nuestra red.' },
    5: { emoji: '⭐', titulo: '¡Media Década Juntos!', color: '#D4AF37', msg: '¡<strong>5 años</strong> de servicio ejemplar! Medio lustro caminando juntos. Eres un pilar fundamental de Catholizare Pro.' },
    6: { emoji: '💎', titulo: '¡6 Años de Servicio!', color: '#003ABA', msg: '<strong>Seis años</strong> de entrega y profesionalismo. Tu constancia es un ejemplo para toda nuestra comunidad.' },
    7: { emoji: '🌿', titulo: '¡7 Años de Crecimiento!', color: '#15803d', msg: '<strong>Siete años</strong> de crecimiento continuo. Tu evolución profesional ha tocado incontables vidas.' },
    8: { emoji: '✨', titulo: '¡8 Años de Dedicación!', color: '#7e22ce', msg: '<strong>Ocho años</strong> de dedicación inquebrantable. Tu perseverancia es verdaderamente admirable.' },
    9: { emoji: '🕊️', titulo: '¡9 Años de Vocación!', color: '#001A55', msg: '<strong>Nueve años</strong> viviendo tu vocación con nosotros. Estás a un paso de una década completa de servicio.' },
    10: { emoji: '👑', titulo: '¡UNA DÉCADA JUNTOS!', color: '#D4AF37', msg: '¡<strong>10 AÑOS</strong> de servicio extraordinario! Una década completa dedicada a la salud mental con valores católicos. Eres leyenda en Catholizare Pro.' }
  };
  
  var m = mensajes[anios] || { emoji: '🎉', titulo: '¡' + anios + ' Años Juntos!', color: '#D4AF37', msg: '<strong>' + anios + ' años</strong> de servicio fiel. ¡Estamos muy felices y orgullosos de contar contigo!' };
  
  var subject = m.emoji + ' ¡Feliz Aniversario ' + anios + (anios === 1 ? 'er' : '°') + ' año en Catholizare Pro, ' + nombre + '!';
  
  var htmlContent = '<!DOCTYPE html><html><head><meta charset="UTF-8"></head>' +
    '<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,sans-serif;background-color:#f4f7fa;">' +
    '<table role="presentation" style="width:100%;border-collapse:collapse;background-color:#f4f7fa;"><tr><td style="padding:40px 20px;">' +
    '<table role="presentation" style="max-width:600px;margin:0 auto;background-color:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1);">' +
    '<tr><td style="background:linear-gradient(135deg,' + m.color + ' 0%,#001A55 100%);padding:40px 30px;text-align:center;">' +
    '<div style="font-size:60px;margin-bottom:10px;">' + m.emoji + '</div>' +
    '<h1 style="margin:0;color:#fff;font-size:26px;">' + m.titulo + '</h1>' +
    '<p style="margin:10px 0 0;color:rgba(255,255,255,0.9);font-size:16px;">' + anios + (anios === 1 ? ' año' : ' años') + ' en Catholizare Pro</p></td></tr>' +
    '<tr><td style="padding:40px 30px;">' +
    '<h2 style="margin:0 0 20px 0;color:#001A55;font-size:22px;">Querido(a) ' + nombre + ',</h2>' +
    '<p style="margin:0 0 25px 0;color:#333;font-size:16px;line-height:1.6;">' + m.msg + '</p>' +
    '<div style="background:linear-gradient(135deg,#fff3cd 0%,#fffaeb 100%);padding:25px;border-radius:12px;border-left:5px solid #D4AF37;margin:25px 0;">' +
    '<p style="margin:0 0 5px 0;color:#001A55;font-size:16px;font-weight:700;">❤️ Gracias por ' + anios + (anios === 1 ? ' año' : ' años') + ' de servicio</p>' +
    '<p style="margin:0;color:#666;font-size:14px;">Tu labor transforma vidas y glorifica a Dios a través de la ciencia y la fe.</p></div>' +
    '<table role="presentation" style="width:100%;border-collapse:collapse;background:#f0f9ff;border-radius:12px;margin:25px 0;">' +
    '<tr><td style="padding:25px;"><p style="margin:0 0 15px 0;color:#001A55;font-size:18px;font-weight:700;">📋 Actualización anual de datos:</p>' +
    '<ul style="margin:0;padding-left:20px;color:#333;font-size:15px;line-height:1.8;">' +
    '<li style="margin-bottom:8px;">Tu Curriculum Vitae</li><li style="margin-bottom:8px;">Certificaciones nuevas</li>' +
    '<li style="margin-bottom:8px;">Especialidades o enfoques</li><li>Disponibilidad de horarios</li></ul></td></tr></table>' +
    '<table role="presentation" style="width:100%;margin:35px 0;"><tr><td style="text-align:center;">' +
    '<a href="' + dashboardLink + '" style="display:inline-block;background-color:#001A55;background:linear-gradient(135deg,#001A55 0%,#003ABA 100%);color:#fff;text-decoration:none;padding:18px 50px;border-radius:50px;font-size:18px;font-weight:700;">✏️ ACTUALIZAR MI PERFIL</a>' +
    '</td></tr></table>' +
    '<p style="margin:30px 0 0 0;color:#333;font-size:15px;">Con inmensa gratitud y cariño,<br><strong style="color:#001A55;">Equipo de Catholizare Pro</strong></p>' +
    '</td></tr>' +
    getEmailFooter(nombre) +
    '</table></td></tr></table></body></html>';
  
  var result = sendEmailViaBrevo(email, subject, htmlContent);
  logEmailSent(token, email, 'ANNUAL_UPDATE_Y' + anios, subject, result.success);
  return result;
}

// ============================================================================
// EMAIL #8: Notificación a Admin (interno)
// ============================================================================

function notifyAdminForZoomScheduling(profesionalEmail, profesionalNombre, token) {
  var config = getConfig();
  var dashboardLink = SERVER_BASE + '/Admin_Dashboard_Complete.html';
  var subject = '[Acción requerida] Agendar reunión Zoom para ' + profesionalNombre;
  
  var htmlContent = '<!DOCTYPE html><html><head><meta charset="UTF-8"></head>' +
    '<body style="font-family:Arial,sans-serif;padding:20px;background:#f4f7fa;">' +
    '<div style="max-width:600px;margin:0 auto;background:white;padding:30px;border-radius:10px;">' +
    '<div style="background:#ffc107;color:#000;padding:15px;border-radius:8px;margin-bottom:20px;text-align:center;">' +
    '<h2 style="margin:0;font-size:20px;">⚡ ACCIÓN REQUERIDA</h2></div>' +
    '<h3 style="color:#001A55;">Nuevo profesional listo para Fase 2</h3>' +
    '<table style="width:100%;border-collapse:collapse;margin:20px 0;">' +
    '<tr style="background:#f8f9fa;"><td style="padding:12px;border:1px solid #dee2e6;font-weight:bold;">Nombre:</td>' +
    '<td style="padding:12px;border:1px solid #dee2e6;">' + profesionalNombre + '</td></tr>' +
    '<tr><td style="padding:12px;border:1px solid #dee2e6;font-weight:bold;">Email:</td>' +
    '<td style="padding:12px;border:1px solid #dee2e6;"><a href="mailto:' + profesionalEmail + '">' + profesionalEmail + '</a></td></tr>' +
    '<tr style="background:#f8f9fa;"><td style="padding:12px;border:1px solid #dee2e6;font-weight:bold;">Perfil:</td>' +
    '<td style="padding:12px;border:1px solid #dee2e6;"><a href="' + dashboardLink + '" target="_blank">Ver dashboard</a></td></tr></table>' +
    '<div style="background:#fff3cd;padding:20px;border-radius:8px;border-left:4px solid #ffc107;margin:20px 0;">' +
    '<h4 style="margin:0 0 10px 0;color:#001A55;">📋 Acción requerida:</h4>' +
    '<p style="margin:0;color:#666;">Agendar reunión de bienvenida técnica por Zoom (20 minutos)</p></div>' +
    '<h4 style="color:#001A55;margin:20px 0 10px 0;">Link de Zoom:</h4>' +
    '<div style="background:#e3f2fd;padding:15px;border-radius:8px;word-break:break-all;">' +
    '<a href="' + config.ZOOM_LINK + '" style="color:#003ABA;">' + config.ZOOM_LINK + '</a></div>' +
    '<div style="text-align:center;margin:30px 0;"><a href="' + dashboardLink + '" style="display:inline-block;background:#001A55;color:white;text-decoration:none;padding:15px 30px;border-radius:8px;font-weight:bold;">VER PERFIL DEL PROFESIONAL</a></div>' +
    '<hr style="border:none;border-top:1px solid #dee2e6;margin:30px 0;">' +
    '<p style="color:#999;font-size:12px;text-align:center;">© 2026 Catholizare Pro</p></div></body></html>';
  
  var result = sendEmailViaBrevo(config.ADMIN_EMAIL, subject, htmlContent);
  logEmailSent(token, profesionalEmail, 'ADMIN_NOTIFICATION', subject, result.success);
  return result;
}

// ============================================================================
// SISTEMA DE RECORDATORIOS
// ============================================================================

function checkAndSendReminders() {
  try {
    var data = getSHEET().getDataRange().getValues();
    var ahora = new Date();
    var recordatoriosEnviados = 0;
    var marcadosIncompletos = 0;

    // Pre-cargar mapa de aceptaciones legales (3 contratos)
    var legalMap = buildLegalAcceptanceMap_();

    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var rowNum = i + 1;
      var token = row[0];
      var nombre = row[1];
      var email = row[2];
      var estado = row[9];
      var fechaInicio = row[17];
      var fase1Completada = row[21];

      if (estado !== "Activo" || fase1Completada) continue;
      if (!fechaInicio) continue;

      var diasDesdeInicio = Math.floor((ahora - new Date(fechaInicio)) / (1000 * 60 * 60 * 24));
      getSHEET().getRange(rowNum, 21).setValue(diasDesdeInicio);

      var lc = (legalMap[token] && legalMap[token].count) || 0;
      var pendientes = calcularPendientes(row, lc);
      var porcentajeProgreso = calcularProgreso(row, lc);

      // Recordatorio 1 (día 7): si falta al menos 1 contrato o tiene pendientes
      if (diasDesdeInicio >= 7 && !row[18]) {
        if (pendientes > 0) {
          sendReminder1(email, nombre, porcentajeProgreso, token);
          getSHEET().getRange(rowNum, 19).setValue(ahora);
          logAction(token, email, 'Recordatorio 1 enviado (Día ' + diasDesdeInicio + ', pendientes: ' + pendientes + ')', 'Fecha_Recordatorio_1', '', ahora, 'Sistema');
          recordatoriosEnviados++;
        }
      }

      // Recordatorio 2 (día 14): si aún tiene pendientes
      if (diasDesdeInicio >= 14 && !row[19]) {
        if (pendientes > 0) {
          sendReminder2(email, nombre, porcentajeProgreso, token);
          getSHEET().getRange(rowNum, 20).setValue(ahora);
          logAction(token, email, 'Recordatorio 2 URGENTE (Día ' + diasDesdeInicio + ', pendientes: ' + pendientes + ')', 'Fecha_Recordatorio_2', '', ahora, 'Sistema');
          recordatoriosEnviados++;
        }
      }

      // Incompleto (día 21): si no completó todo
      if (diasDesdeInicio >= 21 && pendientes > 0) {
        getSHEET().getRange(rowNum, 10).setValue("Incompleto");
        sendIncompleteNotification(email, nombre);
        logAction(token, email, 'Marcado Incompleto (' + diasDesdeInicio + ' días, pendientes: ' + pendientes + ')', 'Estado', 'Activo', 'Incompleto', 'Sistema');
        marcadosIncompletos++;
      }
    }

    Logger.log('Revisión: ' + recordatoriosEnviados + ' recordatorios, ' + marcadosIncompletos + ' incompletos');
  } catch (error) {
    Logger.log('Error en checkAndSendReminders: ' + error);
  }
}

function sendZoomMeetingReminders() {
  var data = getSHEET().getDataRange().getValues();
  var manana = new Date();
  manana.setDate(manana.getDate() + 1);
  var mananaDia = Utilities.formatDate(manana, "GMT-6", "yyyy-MM-dd");
  
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[23]) continue;
    var fechaReunionStr = Utilities.formatDate(new Date(row[23]), "GMT-6", "yyyy-MM-dd");
    if (fechaReunionStr === mananaDia) {
      sendZoomReminderEmail(row[2], row[1], row[23]);
    }
  }
}

function sendAnnualCVUpdateReminders() {
  var data = getSHEET().getDataRange().getValues();
  var ahora = new Date();
  var enviados = 0;
  
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[17] || row[9] === 'Incompleto') continue;
    var inicio = new Date(row[17]);
    
    // Verificar aniversarios del año 1 al 10
    for (var anio = 1; anio <= 10; anio++) {
      var aniversario = new Date(inicio);
      aniversario.setFullYear(inicio.getFullYear() + anio);
      
      // Si estamos en el mismo mes y año del aniversario
      if (ahora.getMonth() === aniversario.getMonth() && ahora.getFullYear() === aniversario.getFullYear()) {
        sendAnnualUpdateEmail(row[2], row[1], row[0], anio);
        logAction(row[0], row[2], 'Aniversario ' + anio + ' año(s) - Email enviado', 'ANNUAL', '', anio + ' años', 'Sistema');
        enviados++;
        break; // Solo un correo por profesional por ejecución
      }
    }
  }
  Logger.log('✅ Aniversarios enviados: ' + enviados);
}

// ============================================================================
// INTEGRACIÓN CON BREVO
// ============================================================================

function moveContactToBrevoPhase(email, nombre, nuevaFase, token) {
  var config = getConfig();
  var dashboardLink = SERVER_BASE + '/index.html?token=' + token;
  var nombreParts = nombre.split(' ');
  
  var endpoint = 'https://api.brevo.com/v3/contacts/' + encodeURIComponent(email);
  var payload = {
    attributes: { FIRSTNAME: nombreParts[0], LASTNAME: nombreParts.slice(1).join(' ') || '', FASE_ACTUAL: nuevaFase, DASHBOARD_LINK: dashboardLink, TOKEN: token },
    listIds: [config.LIST_IDS[nuevaFase]],
    unlinkListIds: Object.values(config.LIST_IDS).filter(function(id) { return id !== config.LIST_IDS[nuevaFase]; })
  };
  
  try {
    var response = UrlFetchApp.fetch(endpoint, {
      method: 'put', contentType: 'application/json',
      headers: { 'api-key': config.BREVO_API_KEY },
      payload: JSON.stringify(payload), muteHttpExceptions: true
    });
    var code = response.getResponseCode();
    if (code === 204 || code === 200) {
      Logger.log('✅ Contacto ' + email + ' movido a ' + nuevaFase);
      return { success: true };
    }
    Logger.log('⚠️ Brevo: ' + response.getContentText());
    return { success: false };
  } catch (error) {
    Logger.log('❌ Error Brevo: ' + error);
    return { success: false };
  }
}

function addContactToBrevo(email, nombre, token, fase) {
  var config = getConfig();
  var dashboardLink = SERVER_BASE + '/index.html?token=' + token;
  var nombreParts = nombre.split(' ');
  var listId = config.LIST_IDS[fase];

  Logger.log('📋 Brevo: Agregando ' + email + ' a lista ' + fase + ' (ID: ' + listId + ')');

  var payload = {
    email: email,
    attributes: { FIRSTNAME: nombreParts[0], LASTNAME: nombreParts.slice(1).join(' ') || '', DASHBOARD_LINK: dashboardLink, TOKEN: token, FASE_ACTUAL: fase, FECHA_INICIO: new Date().toISOString().split('T')[0] },
    listIds: [listId],
    updateEnabled: true
  };
  
  try {
    var response = UrlFetchApp.fetch('https://api.brevo.com/v3/contacts', {
      method: 'post', contentType: 'application/json',
      headers: { 'api-key': config.BREVO_API_KEY },
      payload: JSON.stringify(payload), muteHttpExceptions: true
    });
    var code = response.getResponseCode();
    Logger.log('📋 Brevo response: ' + code + ' | ' + response.getContentText());
    if (code === 201 || code === 204) {
      Logger.log('✅ Contacto ' + email + ' agregado a Brevo lista #' + listId);
      return { success: true };
    }
    Logger.log('⚠️ Brevo error: ' + response.getContentText());
    return { success: false, message: response.getContentText() };
  } catch (error) {
    Logger.log('❌ Error Brevo addContact: ' + error);
    return { success: false, message: error.toString() };
  }
}

// ============================================================================
// LOGS Y AUDITORÍA
// ============================================================================

function logAction(token, email, action, field, oldValue, newValue, actor) {
  try {
    var logSheet = getSS().getSheetByName("Logs");
    if (!logSheet) {
      logSheet = getSS().insertSheet("Logs");
      logSheet.appendRow(["Fecha", "Hora", "Token", "Email", "Acción", "Campo", "Valor_Anterior", "Valor_Nuevo", "Actor", "Usuario"]);
      logSheet.getRange(1, 1, 1, 10).setFontWeight("bold").setBackground("#001A55").setFontColor("#FFFFFF");
    }
    var now = new Date();
    logSheet.appendRow([
      Utilities.formatDate(now, "GMT-6", "yyyy-MM-dd"),
      Utilities.formatDate(now, "GMT-6", "HH:mm:ss"),
      token, email, action, field || "-", oldValue || "-", newValue || "-", actor,
      Session.getActiveUser().getEmail() || "Sistema"
    ]);
  } catch (error) {
    Logger.log('Error al registrar log: ' + error);
  }
}

function logEmailSent(token, email, emailType, subject, success) {
  try {
    var emailLogSheet = getSS().getSheetByName("Email_Log");
    if (!emailLogSheet) {
      emailLogSheet = getSS().insertSheet("Email_Log");
      emailLogSheet.appendRow(["Fecha", "Hora", "Token", "Email_Profesional", "Tipo_Email", "Subject", "Estado", "Timestamp"]);
      emailLogSheet.getRange(1, 1, 1, 8).setFontWeight("bold").setBackground("#001A55").setFontColor("#FFFFFF");
      emailLogSheet.setFrozenRows(1);
    }
    var now = new Date();
    emailLogSheet.appendRow([
      Utilities.formatDate(now, "GMT-6", "yyyy-MM-dd"),
      Utilities.formatDate(now, "GMT-6", "HH:mm:ss"),
      token, email, emailType, subject,
      success ? "ENVIADO" : "ERROR",
      now.toISOString()
    ]);
    var lastRow = emailLogSheet.getLastRow();
    if (success) {
      emailLogSheet.getRange(lastRow, 7).setBackground("#d4edda").setFontColor("#155724");
    } else {
      emailLogSheet.getRange(lastRow, 7).setBackground("#f8d7da").setFontColor("#721c24");
    }
  } catch (error) {
    Logger.log('Error en logEmailSent: ' + error);
  }
}

function getEmailHistory(token) {
  try {
    var emailLogSheet = getSS().getSheetByName("Email_Log");
    if (!emailLogSheet) return [];
    
    var data = emailLogSheet.getDataRange().getValues();
    var history = [];
    for (var i = 1; i < data.length; i++) {
      if (data[i][2] === token) {
        history.push({ 
          fecha: data[i][0] ? String(data[i][0]) : '', 
          hora: data[i][1] ? String(data[i][1]) : '', 
          tipo: String(data[i][4] || ''), 
          subject: String(data[i][5] || ''), 
          estado: String(data[i][6] || ''), 
          timestamp: data[i][7] ? String(data[i][7]) : '' 
        });
      }
    }
    history.sort(function(a, b) { return new Date(b.timestamp) - new Date(a.timestamp); });
    return history;
  } catch (error) {
    Logger.log('Error en getEmailHistory: ' + error);
    return [];
  }
}

function getEmailTypeInfo(emailType) {
  var types = {
    'WELCOME': { nombre: 'Email de Bienvenida', icono: '🚀', fase: 'Fase 1' },
    'REMINDER_1': { nombre: 'Recordatorio Amigable (Día 20)', icono: '📧', fase: 'Fase 1' },
    'REMINDER_2': { nombre: 'Recordatorio Urgente (Día 40)', icono: '⚠️', fase: 'Fase 1' },
    'INCOMPLETE': { nombre: 'Marcado como Incompleto', icono: '❌', fase: 'Fase 1' },
    'PHASE2_WELCOME': { nombre: 'Bienvenida Fase 2', icono: '🎉', fase: 'Fase 2' },
    'ZOOM_REMINDER': { nombre: 'Recordatorio Zoom', icono: '📅', fase: 'Fase 2' },
    'ANNUAL_UPDATE': { nombre: 'Actualización Anual CV', icono: '📋', fase: 'Fase 4' },
    'ADMIN_NOTIFICATION': { nombre: 'Notificación a Admin', icono: '👤', fase: 'Interno' }
  };
  return types[emailType] || { nombre: emailType, icono: '📬', fase: 'Desconocido' };
}

// ============================================================================
// ESTADO DEL PROFESIONAL Y TIMELINE
// ============================================================================

function getProfessionalStatus(token, expectedEmail) {
  try {
    var data = getSHEET().getDataRange().getValues();
    var tokenNorm = String(token || '').trim().toLowerCase();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0] || '').trim().toLowerCase() === tokenNorm) {
        var row = data[i];
        // Verificación opcional de email (doble factor en login manual)
        if (expectedEmail) {
          var storedEmail = String(row[2] || '').trim().toLowerCase();
          var provided = String(expectedEmail).trim().toLowerCase();
          if (!storedEmail || storedEmail !== provided) {
            return { success: false, message: 'El correo no coincide con la clave proporcionada.' };
          }
        }

        // Auto-check: si está en Fase 1 y ya cumplió todo, avanzarlo ahora.
        if (String(row[8] || '').trim() === 'Fase 1') {
          try {
            checkAndAdvancePhase(i + 1, row);
            // Releer la fila por si la fase cambió
            row = getSHEET().getRange(i + 1, 1, 1, getSHEET().getLastColumn()).getValues()[0];
          } catch (phErr) {
            Logger.log('Auto-check fase falló: ' + phErr);
          }
        }
        var diasDesdeInicio = null;
        var diasRestantes = null;
        var diasEnRed = null;
        var fechaInicioISO = null;
        var legalFechaStr = '';
        
        // Plazo Fase 1: desde registro (row[17])
        try {
          if (row[17]) {
            var fechaRegistro = new Date(row[17]);
            if (!isNaN(fechaRegistro.getTime())) {
              diasDesdeInicio = Math.floor((new Date() - fechaRegistro) / 86400000);
              diasRestantes = Math.max(0, 21 - diasDesdeInicio);
              fechaInicioISO = fechaRegistro.toISOString();
            }
          }
        } catch(e) { Logger.log('Error fecha registro: ' + e); }
        
        // Tiempo en la Red: desde aceptación legal (row[12] = columna M = fecha legal)
        // Si no está poblado pero ya aceptó los 3 legales en Aceptaciones_Legales,
        // se usa la fecha de la última aceptación (y se backfillea la celda).
        try {
          var fechaLegal = null;
          if (row[12]) {
            var fL = new Date(row[12]);
            if (!isNaN(fL.getTime())) fechaLegal = fL;
          }
          if (!fechaLegal) {
            var maxF = _ultimaFechaLegalDeToken_(row[0]);
            if (maxF) {
              fechaLegal = maxF;
              try { getSHEET().getRange(i + 1, 13).setValue(maxF); } catch(_){}
              // También marcar legacy legal info si vacío
              try {
                if (!row[11] || String(row[11]).indexOf('ACEPTADO') !== 0) {
                  getSHEET().getRange(i + 1, 12).setValue('ACEPTADO (3 docs legales)');
                }
              } catch(_){}
            }
          }
          if (fechaLegal) {
            diasEnRed = Math.floor((new Date() - fechaLegal) / 86400000);
            legalFechaStr = fechaLegal.toLocaleDateString('es-MX');
          }
        } catch(e) { Logger.log('Error fecha legal: ' + e); }
        
        var emailHistory = [];
        try { emailHistory = getEmailHistory(token); } catch(e) { Logger.log('Error emailHistory: ' + e); }
        
        var rec1 = null, rec2 = null;
        try { if (row[18]) rec1 = new Date(row[18]).toISOString(); } catch(e){}
        try { if (row[19]) rec2 = new Date(row[19]).toISOString(); } catch(e){}
        
        return {
          success: true,
          token: String(row[0] || ''),
          nombre: String(row[1] || ''), 
          email: String(row[2] || ''), 
          especialidad: String(row[3] || ''),
          fase: String(row[8] || 'Fase 1'), 
          estado: String(row[9] || 'Activo'), 
          categoria: String(row[10] || ''),
          legal: (function(){
            // Considera "legal" verdadero si tiene los 3 documentos legales
            // aceptados en Aceptaciones_Legales, o si el campo legacy dice ACEPTADO.
            try {
              var map = buildLegalAcceptanceMap_();
              var tkLC = String(row[0] || '').trim().toLowerCase();
              var e = map[tkLC];
              if (e && e.CONTRATO && e.TERMINOS && e.PRIVACIDAD) return true;
            } catch(_){}
            return !!(row[11] && row[11].toString().indexOf("ACEPTADO") === 0);
          })(),
          legalInfo: row[11] ? row[11].toString() : '',
          legalFecha: legalFechaStr,
          perfil: !!(row[13] && row[13] !== ""),
          perfilData: { 
            poblaciones: String(row[13] || ""), 
            modalidad: String(row[14] || ""), 
            terapias: String(row[15] || ""), 
            horarios: String(row[16] || "") 
          },
          documentos: {
            cv: !!(row[4] && row[4] !== ""),
            cedula: !!(row[5] && row[5] !== ""),
            foto: !!(row[6] && row[6] !== ""),
            carta: !!(row[7] && row[7] !== "")
          },
          documentosUrls: { 
            cv: String(row[4] || ""), 
            cedula: String(row[5] || ""), 
            foto: String(row[6] || ""), 
            carta: String(row[7] || "") 
          },
          plazos: {
            fechaInicio: fechaInicioISO, 
            diasDesdeInicio: diasDesdeInicio, 
            diasRestantes: diasRestantes,
            diasEnRed: diasEnRed,
            recordatorio1: rec1, 
            recordatorio2: rec2, 
            fase1Completada: row[21] ? true : false
          },
          progreso: calcularProgreso(row),
          emailHistory: emailHistory,
          triggerMarks: (function(){ try { return JSON.parse(row[23] || '{}'); } catch(e) { return {}; } })()
        };
      }
    }
    return { success: false, message: "No se encontró el registro con token: " + token };
  } catch (error) {
    Logger.log('Error en getProfessionalStatus: ' + error);
    return { success: false, message: 'Error: ' + error.toString() };
  }
}

function getTimeline(token) {
  try {
    var status = getProfessionalStatus(token);
    if (!status.success) return { success: false, message: "Token no encontrado" };
    
    var timeline = [];
    
    if (status.plazos.fechaInicio) {
      timeline.push({ fecha: status.plazos.fechaInicio, tipo: 'REGISTRO', titulo: 'Registro Inicial', descripcion: 'Te dimos la bienvenida', icono: '🎯', completado: true });
    }
    
    status.emailHistory.forEach(function(e) {
      var info = getEmailTypeInfo(e.tipo);
      timeline.push({ fecha: e.timestamp, tipo: 'EMAIL', titulo: info.nombre, descripcion: e.subject, icono: info.icono, completado: e.estado === 'ENVIADO', fase: info.fase });
    });
    
    if (status.legal) {
      timeline.push({ fecha: status.legalFecha, tipo: 'LEGAL', titulo: 'Documentos Legales Aceptados', descripcion: 'Código de ética firmado', icono: '📄', completado: true });
    }
    if (status.perfil) {
      timeline.push({ fecha: null, tipo: 'PERFIL', titulo: 'Perfil Completado', descripcion: 'Información profesional', icono: '👤', completado: true });
    }
    
    var docsCompletados = Object.values(status.documentos).filter(function(v) { return v; }).length;
    timeline.push({ fecha: null, tipo: 'DOCUMENTOS', titulo: 'Documentos (' + docsCompletados + '/4)', descripcion: 'CV, cédula, foto, carta', icono: '📎', completado: docsCompletados === 4, progreso: Math.round((docsCompletados / 4) * 100) });
    
    if (status.plazos.fase1Completada) {
      timeline.push({ fecha: status.plazos.fase1Completada, tipo: 'MILESTONE', titulo: '🎉 Fase 1 Completada', descripcion: 'Avanzó a Fase 2', icono: '✅', completado: true });
    }
    
    timeline.sort(function(a, b) {
      if (!a.fecha) return 1;
      if (!b.fecha) return -1;
      return new Date(b.fecha) - new Date(a.fecha);
    });
    
    return { success: true, timeline: timeline, resumen: { totalEventos: timeline.length, eventosCompletados: timeline.filter(function(e) { return e.completado; }).length, emailsEnviados: status.emailHistory.length } };
  } catch (error) {
    Logger.log('Error en getTimeline: ' + error);
    return { success: false, message: error.toString() };
  }
}

// ============================================================================
// INICIALIZACIÓN DE PROFESIONAL
// ============================================================================

function initializeNewProfessional(nombre, email, especialidad, categoria) {
  try {
    especialidad = especialidad || "S/E";
    categoria = categoria || "Junior";
    var token = "ONB-" + Utilities.getUuid().substring(0, 8);
    var ahora = new Date();
    
    var sheet = getSHEET();
    // Insertar en fila 2 (después del encabezado) para que el último registrado aparezca primero
    sheet.insertRowAfter(1);
    var newRow = [
      token, nombre, email, especialidad,
      "", "", "", "",
      "Fase 1", "Activo", categoria,
      "", "", "", "", "", "",
      ahora, "", "", 0,
      false, "", "", false, false, false, ""
    ];
    sheet.getRange(2, 1, 1, newRow.length).setValues([newRow]);
    
    var emailResult = sendWelcomeEmail(email, nombre, token);
    addContactToBrevo(email, nombre, token, "Fase 1");
    logAction(token, email, 'Profesional creado', 'Sistema', '', 'Nuevo registro', 'Admin');
    
    if (emailResult.success) {
      Logger.log('✅ Profesional ' + nombre + ' creado. Token: ' + token);
      return { success: true, token: token };
    } else {
      return { success: true, token: token, warning: "Email no enviado" };
    }
  } catch (error) {
    Logger.log('Error en initializeNewProfessional: ' + error);
    return { success: false, message: error.toString() };
  }
}

// ============================================================================
// MENÚ Y ACCIONES DE SPREADSHEET
// ============================================================================

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('🚀 Onboarding')
    .addItem('▶️ Iniciar Onboarding', 'iniciarOnboardingSeleccionado')
    .addSeparator()
    .addItem('📊 Ver Estadísticas', 'mostrarEstadisticas')
    .addToUi();
}

function iniciarOnboardingSeleccionado() {
  var ui = SpreadsheetApp.getUi();
  var sheet = getSS().getSheetByName("Onboarding");
  var activeRow = sheet.getActiveRange().getRow();
  
  if (activeRow === 1) {
    ui.alert('⚠️ Error', 'Selecciona una fila de candidato (no el encabezado).', ui.ButtonSet.OK);
    return;
  }
  
  var data = sheet.getRange(activeRow, 1, 1, sheet.getLastColumn()).getValues()[0];
  var token = data[0];
  var nombre = data[1];
  var email = data[2];
  var especialidad = data[3] || "Psicología Clínica";
  var categoria = data[10] || "intermediate";
  
  if (!nombre || !email) {
    ui.alert('❌ Error', 'Esta fila no tiene nombre o email.', ui.ButtonSet.OK);
    return;
  }
  
  if (token && token.toString().startsWith('ONB-')) {
    ui.alert('⚠️ Ya iniciado', 'Este candidato ya tiene onboarding:\nToken: ' + token + '\nEstado: ' + data[9], ui.ButtonSet.OK);
    return;
  }
  
  var confirmacion = ui.alert('🚀 Confirmar', '¿Iniciar onboarding para:\n\nNombre: ' + nombre + '\nEmail: ' + email + '\n\nSe enviará email de bienvenida.', ui.ButtonSet.YES_NO);
  if (confirmacion !== ui.Button.YES) return;
  
  var result = initializeNewProfessional(nombre, email, especialidad, categoria);
  
  if (result.success) {
    sheet.getRange(activeRow, 1).setValue(result.token);
    ui.alert('✅ Éxito', 'Onboarding iniciado\nToken: ' + result.token + '\nEmail enviado a: ' + email, ui.ButtonSet.OK);
  } else {
    ui.alert('❌ Error', result.message, ui.ButtonSet.OK);
  }
}

function mostrarEstadisticas() {
  var ui = SpreadsheetApp.getUi();
  var data = getSHEET().getDataRange().getValues();
  var total = data.length - 1;
  var activos = 0, incompletos = 0, fase1 = 0, fase2 = 0, fase3 = 0, fase4 = 0;
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][9] === 'Activo') activos++;
    else if (data[i][9] === 'Incompleto') incompletos++;
    if (data[i][8] === 'Fase 1') fase1++;
    else if (data[i][8] === 'Fase 2') fase2++;
    else if (data[i][8] === 'Fase 3') fase3++;
    else if (data[i][8] === 'Fase 4') fase4++;
  }
  
  ui.alert('📊 Estadísticas', 'Total: ' + total + '\n\nEstados:\n• Activos: ' + activos + '\n• Incompletos: ' + incompletos + '\n\nFases:\n• Fase 1: ' + fase1 + '\n• Fase 2: ' + fase2 + '\n• Fase 3: ' + fase3 + '\n• Fase 4: ' + fase4, ui.ButtonSet.OK);
}

// ============================================================================
// AUTENTICACIÓN ADMIN
// ============================================================================

function validateAdminToken(token, expectedEmail) {
  try {
    if (!token) return null;
    var sheet = getSS().getSheetByName("Admin_Users");
    if (!sheet) { Logger.log("❌ Hoja Admin_Users no existe"); return null; }

    var data = sheet.getDataRange().getValues();
    var tokenNorm = String(token || '').trim().toLowerCase();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0] || '').trim().toLowerCase() === tokenNorm && data[i][4] === true) {
        // Verificación opcional de email (doble factor en login manual)
        if (expectedEmail) {
          var storedEmail = String(data[i][1] || '').trim().toLowerCase();
          var provided = String(expectedEmail).trim().toLowerCase();
          if (!storedEmail || storedEmail !== provided) {
            return null;
          }
        }
        return { token: data[i][0], email: data[i][1], role: data[i][2], nombre: data[i][3], activo: data[i][4] };
      }
    }
    return null;
  } catch (error) {
    Logger.log("❌ Error en validateAdminToken: " + error);
    return null;
  }
}

function getAllAdminUsers() {
  try {
    var sheet = getSS().getSheetByName("Admin_Users");
    if (!sheet) throw new Error("Hoja Admin_Users no existe");
    var data = sheet.getDataRange().getValues();
    var users = [];
    for (var i = 1; i < data.length; i++) {
      users.push({ 
        token: String(data[i][0] || ''), 
        email: String(data[i][1] || ''), 
        role: String(data[i][2] || ''), 
        nombre: String(data[i][3] || ''), 
        activo: data[i][4] === true || data[i][4] === 'TRUE',
        fechaCreacion: data[i][5] ? new Date(data[i][5]).toLocaleDateString('es-MX') : '-'
      });
    }
    return users;
  } catch (error) {
    Logger.log("Error en getAllAdminUsers: " + error);
    throw error;
  }
}

function generateAdminToken(email, role, nombre, currentUserToken, pin) {
  try {
    var currentUser = validateAdminToken(currentUserToken);
    if (!currentUser || currentUser.role !== 'superadmin') throw new Error("Solo super admins pueden generar tokens");

    // Validar PIN de autorización (configurable en Script Properties: SUPERADMIN_PIN)
    var expectedPin = PropertiesService.getScriptProperties().getProperty('SUPERADMIN_PIN');
    if (!expectedPin) {
      throw new Error("SUPERADMIN_PIN no configurado. Ve a Propiedades del script y define SUPERADMIN_PIN.");
    }
    if (!pin || String(pin).trim() !== String(expectedPin).trim()) {
      throw new Error("PIN de autorización incorrecto");
    }

    var sheet = getSS().getSheetByName("Admin_Users");
    if (!sheet) throw new Error("Hoja Admin_Users no existe");

    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][1] === email) throw new Error("Este email ya tiene un token");
    }

    // Token corto: ADMIN- + 6 caracteres alfanuméricos (ej: ADMIN-f67z9I)
    var alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var randomPart = '';
    for (var j = 0; j < 6; j++) {
      randomPart += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }
    var token = "ADMIN-" + randomPart;

    // Nombre = email si no se provee
    var nombreFinal = (nombre && nombre.trim()) ? nombre.trim() : email.split('@')[0];
    sheet.appendRow([token, email, role, nombreFinal, true, new Date()]);

    var serverBase = 'https://profesionales.catholizare.com/catholizare_sistem/onboarding';
    var url = serverBase + '/admin-dashboard.html?adminToken=' + token;
    return {
      success: true,
      token: token,
      url: url,
      message: "Admin creado correctamente"
    };
  } catch (error) {
    Logger.log("❌ Error en generateAdminToken: " + error);
    return { success: false, message: error.toString() };
  }
}

function deactivateAdminToken(tokenToDeactivate, currentUserToken) {
  try {
    var currentUser = validateAdminToken(currentUserToken);
    if (!currentUser || currentUser.role !== 'superadmin') throw new Error("Solo super admins pueden desactivar tokens");
    var sheet = getSS().getSheetByName("Admin_Users");
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === tokenToDeactivate) {
        sheet.getRange(i + 1, 5).setValue(false);
        return { success: true, message: "Token desactivado exitosamente" };
      }
    }
    throw new Error("Token no encontrado");
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}

function activateAdminToken(tokenToActivate, currentUserToken) {
  try {
    var currentUser = validateAdminToken(currentUserToken);
    if (!currentUser || currentUser.role !== 'superadmin') throw new Error("Solo super admins pueden activar tokens");
    var sheet = getSS().getSheetByName("Admin_Users");
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === tokenToActivate) {
        sheet.getRange(i + 1, 5).setValue(true);
        return { success: true, message: "Token activado exitosamente" };
      }
    }
    throw new Error("Token no encontrado");
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}

function getSuperadminPin(currentUserToken) {
  try {
    var user = validateAdminToken(currentUserToken);
    if (!user || user.role !== 'superadmin') throw new Error('Solo super admins pueden ver el PIN');
    var pin = PropertiesService.getScriptProperties().getProperty('SUPERADMIN_PIN') || '';
    return { success: true, pin: pin };
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}

function setSuperadminPin(currentUserToken, newPin) {
  try {
    var user = validateAdminToken(currentUserToken);
    if (!user || user.role !== 'superadmin') throw new Error('Solo super admins pueden cambiar el PIN');
    if (!newPin || String(newPin).trim().length < 4) throw new Error('El PIN debe tener al menos 4 caracteres');
    PropertiesService.getScriptProperties().setProperty('SUPERADMIN_PIN', String(newPin).trim());
    return { success: true, message: 'PIN actualizado correctamente' };
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}

// ============================================================================
// DATOS PARA ADMIN DASHBOARD
// ============================================================================

function getAllProfesionales() {
  try {
    var sheet = getSHEET();
    Logger.log('getAllProfesionales - sheet: ' + (sheet ? sheet.getName() : 'NULL'));
    var data = sheet.getDataRange().getValues();
    Logger.log('getAllProfesionales - rows: ' + data.length);
    var profesionales = [];
    
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (row[0]) {
        profesionales.push({
          token: String(row[0]),
          nombre: String(row[1] || ""),
          email: String(row[2] || ""),
          especialidad: String(row[3] || ""),
          fase: String(row[8] || "Fase 1"),
          estado: String(row[9] || "En Progreso"),
          categoria: String(row[10] || ""),
          progreso: calcularProgreso(row),
          pendientes: calcularPendientes(row),
          fechaRegistro: row[17] ? new Date(row[17]).toISOString() : new Date().toISOString()
        });
      }
    }
    
    Logger.log('getAllProfesionales - returning: ' + profesionales.length + ' profesionales');
    return profesionales;
  } catch (error) {
    Logger.log("❌ Error en getAllProfesionales: " + error);
    throw error;
  }
}

// ============================================================================
// TESTING
// ============================================================================

function testCreateProfessional() {
  var result = initializeNewProfessional("Dr. Juan Pérez Test", "test@catholizare.com", "Psicología Clínica", "intermediate");
  Logger.log(result);
}

function testTimeline() {
  var timeline = getTimeline("ONB-12345678");
  Logger.log(JSON.stringify(timeline, null, 2));
}
// ============================================================================
// TESTING
// ============================================================================

function testCreateProfessional() {
  var result = initializeNewProfessional("Dr. Juan Pérez Test", "test@catholizare.com", "Psicología Clínica", "intermediate");
  Logger.log(result);
}

function testTimeline() {
  var timeline = getTimeline("ONB-12345678");
  Logger.log(JSON.stringify(timeline, null, 2));
}
/**
 * Diagnóstico remoto - devuelve resultados JSON para el proxy
 */
function diagnosticoRemoto() {
  var results = [];
  try {
    // 1. Hoja Onboarding
    var sheet = getSS().getSheetByName("Onboarding");
    if (sheet) {
      var data = sheet.getDataRange().getValues();
      results.push({ name: 'Hoja Onboarding', status: 'ok', detail: data.length + ' filas de datos' });
    } else {
      results.push({ name: 'Hoja Onboarding', status: 'error', detail: 'NO EXISTE' });
    }

    // 2. Conexión Spreadsheet
    var ssId = getSS().getId();
    results.push({ name: 'Conexión Spreadsheet', status: 'ok', detail: 'ID: ' + ssId.substring(0,8) + '...' + ssId.slice(-4) });

    // 3. Brevo API
    var brevoKey = PropertiesService.getScriptProperties().getProperty('BREVO_API_KEY');
    results.push({ name: 'Brevo API', status: brevoKey ? 'ok' : 'error', detail: brevoKey ? 'Configurada en Properties' : 'NO CONFIGURADA' });

    // 4. Google Drive
    var folderId = PropertiesService.getScriptProperties().getProperty('PARENT_FOLDER_ID');
    if (folderId) {
      try {
        DriveApp.getFolderById(folderId);
        results.push({ name: 'Google Drive', status: 'ok', detail: 'Carpeta configurada' });
      } catch(e) {
        results.push({ name: 'Google Drive', status: 'warning', detail: 'Folder ID inválido' });
      }
    } else {
      results.push({ name: 'Google Drive', status: 'error', detail: 'PARENT_FOLDER_ID no configurado' });
    }

    // 5. Admin_Users
    var adminSheet = getSS().getSheetByName("Admin_Users");
    if (adminSheet) {
      results.push({ name: 'Admin_Users', status: 'ok', detail: adminSheet.getLastRow() + ' usuarios' });
    } else {
      results.push({ name: 'Admin_Users', status: 'error', detail: 'Hoja NO EXISTE' });
    }

    // 6. Implementación
    var url = ScriptApp.getService().getUrl();
    results.push({ name: 'Implementación', status: url ? 'ok' : 'warning', detail: url ? 'Web App activa' : 'Sin deploy' });

    // 7. getAllProfesionales
    try {
      var profs = getAllProfesionales();
      results.push({ name: 'getAllProfesionales()', status: 'ok', detail: (profs ? profs.length : 0) + ' profesionales' });
    } catch(e) {
      results.push({ name: 'getAllProfesionales()', status: 'error', detail: e.message });
    }

    var allOk = results.every(function(r) { return r.status === 'ok'; });
    return { success: true, status: allOk ? 'Operativo' : 'Con advertencias', results: results, timestamp: new Date().toISOString() };

  } catch (error) {
    return { success: false, message: error.message, results: results };
  }
}

// ============================================================================
// MÓDULO DE DOCUMENTOS LEGALES — Aceptación con audit trail
// ============================================================================

/**
 * Obtiene un documento legal activo por su ID
 * Hoja: Documentos_Legales (doc_id, titulo, version, contenido_html, fecha_vigencia, estado)
 */
function getDocumentoLegal(docId) {
  try {
    var sheet = getSS().getSheetByName("Documentos_Legales");
    if (!sheet) return { success: false, message: "La hoja Documentos_Legales no existe. Créala en la spreadsheet." };

    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === docId && data[i][5] === 'activo') {
        return {
          success: true,
          documento: {
            id: data[i][0],
            titulo: data[i][1],
            version: String(data[i][2]),
            contenido: data[i][3],
            fechaVigencia: data[i][4]
          }
        };
      }
    }
    return { success: false, message: "Documento no encontrado o sin versión activa: " + docId };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}

/**
 * Obtiene el estado de aceptación de todos los documentos para un profesional
 * Hoja: Aceptaciones_Legales
 */
function getDocumentosStatus(token) {
  try {
    // Obtener datos del profesional
    var profData = getProfessionalByToken(token);

    var sheet = getSS().getSheetByName("Aceptaciones_Legales");
    var aceptados = {};
    var tokenNorm = String(token || '').trim().toLowerCase();

    if (sheet && sheet.getLastRow() > 1) {
      var data = sheet.getDataRange().getValues();
      for (var i = 1; i < data.length; i++) {
        var rowToken = String(data[i][4] || '').trim().toLowerCase();
        if (rowToken === tokenNorm) { // col E = token
          var accDocIdKey = String(data[i][1] || '').trim().toUpperCase(); // col B = doc_id (normalizado)
          aceptados[accDocIdKey] = {
            folio: data[i][0],
            version: String(data[i][2]),
            fecha: data[i][3],
            nombre: data[i][5]
          };
        }
      }
    }

    // Lista de documentos requeridos
    var docsSheet = getSS().getSheetByName("Documentos_Legales");
    var documentos = [];
    if (docsSheet) {
      var docsData = docsSheet.getDataRange().getValues();
      for (var j = 1; j < docsData.length; j++) {
        if (docsData[j][5] === 'activo') {
          var docId = String(docsData[j][0] || '').trim();
          var docIdKey = docId.toUpperCase();
          documentos.push({
            id: docId,
            titulo: docsData[j][1],
            version: String(docsData[j][2]),
            aceptado: !!aceptados[docIdKey],
            datosAceptacion: aceptados[docIdKey] || null
          });
        }
      }
    }

    return {
      success: true,
      documentos: documentos,
      profesional: profData || {}
    };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}

/**
 * Busca un profesional por token y retorna sus datos básicos
 */
function getProfessionalByToken(token) {
  var sheet = getSHEET();
  var data = sheet.getDataRange().getValues();
  var tokenNorm = String(token || '').trim().toLowerCase();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0] || '').trim().toLowerCase() === tokenNorm) {
      return {
        nombre: data[i][1],
        email: data[i][2],
        token: data[i][0]
      };
    }
  }
  return null;
}

/**
 * Registra la aceptación de un documento legal con audit trail completo
 * Hoja: Aceptaciones_Legales
 * Columnas: Folio | doc_id | version | fecha_hora | token | nombre | correo | telefono | rfc | ip | metodo | token_otp | hash | ref_sesion | copia_enviada | fecha_envio
 */
function aceptarDocumento(data) {
  try {
    var token = data.token;
    var docId = data.docId;
    if (!token || !docId) return { success: false, message: "Faltan datos obligatorios (token, docId)" };

    // Verificar que el profesional existe
    var prof = getProfessionalByToken(token);
    if (!prof) return { success: false, message: "Token de profesional no válido" };

    // Obtener el documento activo
    var docResult = getDocumentoLegal(docId);
    if (!docResult.success) return docResult;
    var doc = docResult.documento;

    // Verificar que no haya aceptado ya esta versión
    var aceptSheet = getSS().getSheetByName("Aceptaciones_Legales");
    if (!aceptSheet) {
      // Crear la hoja si no existe
      aceptSheet = getSS().insertSheet("Aceptaciones_Legales");
      aceptSheet.appendRow([
        'Folio', 'doc_id', 'Version', 'Fecha_Hora', 'Token', 'Nombre_Completo',
        'Correo', 'Telefono', 'RFC', 'IP', 'Metodo_Aceptacion', 'Token_OTP',
        'Hash_Documento', 'Ref_Sesion', 'Copia_Enviada', 'Fecha_Envio_Copia'
      ]);
    }

    var existingData = aceptSheet.getDataRange().getValues();
    var tokenNormAcc = String(token || '').trim().toLowerCase();
    for (var i = 1; i < existingData.length; i++) {
      var rowTokenAcc = String(existingData[i][4] || '').trim().toLowerCase();
      if (rowTokenAcc === tokenNormAcc && existingData[i][1] === docId && String(existingData[i][2]) === doc.version) {
        return { success: false, message: "Ya aceptaste este documento (versión " + doc.version + ")" };
      }
    }

    // === Código de Ética: flujo simplificado (no es documento legal) ===
    // Solo requiere checkbox de aceptación. No pide OTP, ni nombre/correo/teléfono/RFC.
    var esEtica = String(docId).toUpperCase() === 'ETICA';
    var folioOtp = '';

    if (!esEtica) {
      // === Validación obligatoria del código de firma (OTP) solo para documentos legales ===
      var codigoIngresado = String(data.otp || '').replace(/\s+/g, '');
      if (!codigoIngresado) {
        return { success: false, message: "Falta el código de firma. Solicítalo y escribe los 6 dígitos que llegaron a tu correo." };
      }
      var otpCheck = consumirCodigoFirma(token, docId, doc.version, codigoIngresado, data.clientIP);
      if (!otpCheck.success) {
        return { success: false, message: otpCheck.message };
      }
      folioOtp = otpCheck.folioOtp;
    }

    // Generar folio
    var now = new Date();
    var year = now.getFullYear();
    var month = ('0' + (now.getMonth() + 1)).slice(-2);
    var seq = ('00000' + aceptSheet.getLastRow()).slice(-5);
    var folio = 'ACC-' + year + '-' + month + '-' + seq;

    // Generar hash SHA-256 del contenido del documento
    var hashBytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, doc.contenido || '');
    var hash = hashBytes.map(function(b) { return ('0' + (b & 0xFF).toString(16)).slice(-2); }).join('');

    // Referencia de sesión
    var refSesion = 'SES-' + Math.floor(now.getTime() / 1000) + '-' + token.replace('ONB-', '').substring(0, 4);

    // Datos del profesional (para ETICA se usan los del perfil; para legales los que captura el formulario)
    var nombreCompleto, correo, telefono, rfc, metodo, tokenOtp;
    if (esEtica) {
      nombreCompleto = prof.nombre || '';
      correo = prof.email || '';
      telefono = '';
      rfc = '';
      metodo = 'Checkbox de aceptación — Código de Ética (documento interno, no legal)';
      tokenOtp = '';
    } else {
      nombreCompleto = data.nombreCompleto || prof.nombre;
      correo = data.correo || prof.email;
      telefono = data.telefono || '';
      rfc = data.rfc || '';
      metodo = 'Checkbox + botón "Firmar y aceptar" + código de firma (6 dígitos) enviado por correo';
      tokenOtp = folioOtp;
    }
    var ip = data.clientIP || 'No disponible';

    // Registrar la aceptación
    aceptSheet.appendRow([
      folio, docId, doc.version, now, token, nombreCompleto,
      correo, telefono, rfc, ip, metodo, tokenOtp,
      hash, refSesion, 'Pendiente', ''
    ]);

    // Enviar emails
    var emailResult = sendAcceptanceEmails(folio, doc, nombreCompleto, correo, telefono, rfc, ip, metodo, hash, refSesion, now);

    // Actualizar columna de copia enviada
    if (emailResult.success) {
      var lastRow = aceptSheet.getLastRow();
      aceptSheet.getRange(lastRow, 15).setValue('Sí');
      aceptSheet.getRange(lastRow, 16).setValue(new Date());
    }

    // Disparar avance automático de fase si ya completó todos los requisitos
    try {
      var sheet = getSHEET();
      var allRows = sheet.getDataRange().getValues();
      var tokenLC = String(token).trim().toLowerCase();
      for (var r = 1; r < allRows.length; r++) {
        if (String(allRows[r][0] || '').trim().toLowerCase() === tokenLC) {
          checkAndAdvancePhase(r + 1, allRows[r]);
          break;
        }
      }
    } catch (advErr) {
      Logger.log('No se pudo verificar avance de fase: ' + advErr);
    }

    return {
      success: true,
      folio: folio,
      message: doc.titulo + " aceptado exitosamente. Folio: " + folio,
      emailEnviado: emailResult.success
    };
  } catch (error) {
    Logger.log("Error en aceptarDocumento: " + error);
    return { success: false, message: error.toString() };
  }
}

// ============================================================================
// CÓDIGO DE FIRMA (OTP) — Un solo uso por contrato
// ============================================================================
// Hoja: OTP_Firma
// Columnas: Folio_OTP | Token | DocId | Version | Email | Codigo | Estado |
//           Fecha_Generacion | Fecha_Envio | Fecha_Uso | IP_Solicitud | IP_Uso | Intentos
// Estados: PENDIENTE | USADO | EXPIRADO | CANCELADO
// Vigencia: 15 minutos desde generación
// ============================================================================

var OTP_VIGENCIA_MIN = 15;
var OTP_MAX_INTENTOS = 5;

function getOtpSheet_() {
  var sheet = getSS().getSheetByName("OTP_Firma");
  if (!sheet) {
    sheet = getSS().insertSheet("OTP_Firma");
    sheet.appendRow([
      'Folio_OTP', 'Token', 'DocId', 'Version', 'Email', 'Codigo', 'Estado',
      'Fecha_Generacion', 'Fecha_Envio', 'Fecha_Uso', 'IP_Solicitud', 'IP_Uso', 'Intentos'
    ]);
  }
  return sheet;
}

/**
 * Genera un código de firma de 6 dígitos para un contrato específico,
 * lo registra en OTP_Firma (cancelando cualquier otro pendiente del mismo
 * profesional+contrato) y lo envía por correo.
 *
 * Data: { token, docId, email (opcional) }
 */
function solicitarCodigoFirma(data) {
  try {
    var token = String(data.token || '').trim();
    var docId = String(data.docId || '').trim();
    if (!token || !docId) return { success: false, message: 'Faltan datos (token, docId).' };

    var prof = getProfessionalByToken(token);
    if (!prof) return { success: false, message: 'Token de profesional inválido.' };

    var docResult = getDocumentoLegal(docId);
    if (!docResult.success) return docResult;
    var doc = docResult.documento;

    // Si ya firmó este contrato en esta versión, rechazar
    var aceptSheet = getSS().getSheetByName("Aceptaciones_Legales");
    if (aceptSheet && aceptSheet.getLastRow() > 1) {
      var existing = aceptSheet.getDataRange().getValues();
      for (var i = 1; i < existing.length; i++) {
        if (existing[i][4] === token && existing[i][1] === docId && String(existing[i][2]) === doc.version) {
          return { success: false, message: 'Este contrato ya fue firmado (folio ' + existing[i][0] + ').' };
        }
      }
    }

    var otpSheet = getOtpSheet_();
    var values = otpSheet.getDataRange().getValues();

    // Cancelar cualquier código PENDIENTE previo del mismo profesional+doc+version
    for (var j = 1; j < values.length; j++) {
      if (values[j][1] === token && values[j][2] === docId && String(values[j][3]) === doc.version && values[j][6] === 'PENDIENTE') {
        otpSheet.getRange(j + 1, 7).setValue('CANCELADO');
      }
    }

    // Generar código de 6 dígitos (rango 100000–999999 para evitar ceros a la izquierda confusos)
    var codigo = String(Math.floor(100000 + Math.random() * 900000));

    // Folio OTP
    var now = new Date();
    var year = now.getFullYear();
    var month = ('0' + (now.getMonth() + 1)).slice(-2);
    var seq = ('00000' + (otpSheet.getLastRow())).slice(-5);
    var folioOtp = 'OTP-' + year + '-' + month + '-' + seq;

    var email = String(data.email || prof.email || '').trim();
    var ip = data.clientIP || 'No disponible';

    otpSheet.appendRow([
      folioOtp, token, docId, doc.version, email, codigo, 'PENDIENTE',
      now, '', '', ip, '', 0
    ]);
    var newRow = otpSheet.getLastRow();

    // Enviar por correo
    var envio = sendCodigoFirmaEmail_(email, prof.nombre, doc, codigo, folioOtp);
    if (envio.success) {
      otpSheet.getRange(newRow, 9).setValue(new Date()); // Fecha_Envio
    }

    // Log
    try {
      logAction(token, email, 'Código de firma solicitado para ' + docId + ' (v' + doc.version + ') — Folio ' + folioOtp, 'OTP_Solicitud', '', folioOtp, 'Profesional');
    } catch(e) {}

    if (!envio.success) {
      return { success: false, message: 'No pudimos enviar el código por correo: ' + (envio.message || 'error desconocido') };
    }

    return {
      success: true,
      folioOtp: folioOtp,
      email: maskEmail_(email),
      vigenciaMinutos: OTP_VIGENCIA_MIN,
      message: 'Código enviado a tu correo. Vigencia: ' + OTP_VIGENCIA_MIN + ' minutos.'
    };
  } catch (error) {
    Logger.log('Error solicitarCodigoFirma: ' + error);
    return { success: false, message: error.toString() };
  }
}

/**
 * Valida y consume un código de firma. Se llama internamente desde aceptarDocumento.
 * Marca el código como USADO (single-use). Devuelve el folio OTP para audit trail.
 */
function consumirCodigoFirma(token, docId, version, codigo, clientIP) {
  try {
    var otpSheet = getOtpSheet_();
    if (otpSheet.getLastRow() < 2) {
      return { success: false, message: 'No hay ningún código de firma activo. Solicítalo primero.' };
    }
    var values = otpSheet.getDataRange().getValues();
    var now = new Date();
    var vigenciaMs = OTP_VIGENCIA_MIN * 60 * 1000;

    // Buscar el PENDIENTE más reciente para ese profesional+doc+version
    var matchIdx = -1;
    for (var i = values.length - 1; i >= 1; i--) {
      if (values[i][1] === token && values[i][2] === docId && String(values[i][3]) === String(version) && values[i][6] === 'PENDIENTE') {
        matchIdx = i;
        break;
      }
    }
    if (matchIdx === -1) {
      return { success: false, message: 'No hay código pendiente para este contrato. Solicítalo de nuevo.' };
    }

    var row = values[matchIdx];
    var rowNum = matchIdx + 1;
    var intentos = Number(row[12] || 0);

    // Expiración
    var fechaGen = row[7] instanceof Date ? row[7] : new Date(row[7]);
    if (now.getTime() - fechaGen.getTime() > vigenciaMs) {
      otpSheet.getRange(rowNum, 7).setValue('EXPIRADO');
      return { success: false, message: 'El código expiró (vigencia de ' + OTP_VIGENCIA_MIN + ' minutos). Solicita uno nuevo.' };
    }

    // Comparación estricta (6 dígitos)
    var stored = String(row[5] || '').replace(/\s+/g, '');
    var provided = String(codigo || '').replace(/\s+/g, '');
    if (stored !== provided) {
      intentos++;
      otpSheet.getRange(rowNum, 13).setValue(intentos);
      if (intentos >= OTP_MAX_INTENTOS) {
        otpSheet.getRange(rowNum, 7).setValue('CANCELADO');
        return { success: false, message: 'Demasiados intentos fallidos. Solicita un código nuevo.' };
      }
      return { success: false, message: 'Código incorrecto. Te quedan ' + (OTP_MAX_INTENTOS - intentos) + ' intento(s).' };
    }

    // OK: marcar como USADO
    otpSheet.getRange(rowNum, 7).setValue('USADO');
    otpSheet.getRange(rowNum, 10).setValue(now);
    otpSheet.getRange(rowNum, 12).setValue(clientIP || 'No disponible');

    try {
      logAction(token, row[4] || '', 'Código de firma usado para ' + docId + ' (v' + version + ') — Folio ' + row[0], 'OTP_Uso', '', row[0], 'Profesional');
    } catch(e) {}

    return { success: true, folioOtp: row[0] };
  } catch (error) {
    Logger.log('Error consumirCodigoFirma: ' + error);
    return { success: false, message: 'Error al validar el código: ' + error.toString() };
  }
}

/**
 * Envía el código de firma por correo usando Brevo.
 */
function sendCodigoFirmaEmail_(email, nombre, doc, codigo, folioOtp) {
  try {
    if (!email) return { success: false, message: 'Correo vacío' };
    var subject = 'Tu código de firma para ' + doc.titulo;
    var primerNombre = (nombre || '').split(' ')[0] || 'Profesional';
    var html =
      '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#f8f9fc;padding:20px;">' +
        '<div style="background:#001A55;color:white;padding:28px;text-align:center;border-radius:12px 12px 0 0;">' +
          '<h1 style="margin:0;font-size:22px;">Código de firma</h1>' +
          '<p style="margin:6px 0 0;opacity:0.85;font-size:13px;">Catholizare Pro — Integración</p>' +
        '</div>' +
        '<div style="padding:32px 28px;background:white;border:1px solid #eef0f5;">' +
          '<p style="margin:0 0 12px;font-size:15px;color:#001A55;">Hola <strong>' + primerNombre + '</strong>,</p>' +
          '<p style="margin:0 0 20px;font-size:14px;color:#5A6275;line-height:1.6;">' +
            'Este es el código de firma que necesitas para confirmar la aceptación de <strong>' + doc.titulo + '</strong> (versión ' + doc.version + ').' +
          '</p>' +
          '<div style="background:#f0f7ff;border:2px dashed #003ABA;border-radius:12px;padding:28px;text-align:center;margin:24px 0;">' +
            '<div style="font-size:12px;color:#5A6275;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">Tu código</div>' +
            '<div style="font-size:42px;font-weight:800;color:#001A55;letter-spacing:12px;font-family:monospace;">' + codigo + '</div>' +
            '<div style="font-size:12px;color:#9CA3B4;margin-top:10px;">Vigencia: ' + OTP_VIGENCIA_MIN + ' minutos</div>' +
          '</div>' +
          '<p style="margin:16px 0;font-size:13px;color:#5A6275;line-height:1.6;">' +
            'Regresa a la pantalla del contrato, escribe estos 6 dígitos y pulsa <strong>Firmar y aceptar</strong>. El código es de <strong>un solo uso</strong> y solo sirve para este contrato.' +
          '</p>' +
          '<div style="background:#fef2f2;border-left:4px solid #DC3545;padding:12px 16px;border-radius:0 8px 8px 0;margin-top:20px;">' +
            '<p style="margin:0;font-size:12px;color:#991b1b;"><strong>¿No solicitaste este código?</strong> Ignora este correo y repórtalo al equipo de coordinación.</p>' +
          '</div>' +
          '<p style="margin-top:20px;font-size:11px;color:#9CA3B4;">Folio de emisión: ' + folioOtp + '</p>' +
        '</div>' +
        '<div style="padding:16px;text-align:center;font-size:11px;color:#9CA3B4;">Catholizare Pro — Red de Psicólogos Católicos</div>' +
      '</div>';
    return sendEmailViaBrevo(email, subject, html);
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}

function maskEmail_(email) {
  if (!email || email.indexOf('@') === -1) return email;
  var parts = email.split('@');
  var user = parts[0];
  var dom = parts[1];
  if (user.length <= 2) return user[0] + '***@' + dom;
  return user.substring(0, 2) + '***' + user.charAt(user.length - 1) + '@' + dom;
}

// ============================================================================
// ENDPOINTS ADMIN — Legales (pestaña del super admin)
// ============================================================================

/**
 * Lista todas las aceptaciones legales. query: { search, docId, from, to }
 * Requiere adminToken con rol superadmin.
 */
function listLegalAcceptances(query, adminToken) {
  try {
    var admin = validateAdminToken(adminToken);
    if (!admin) return { success: false, message: 'No autorizado.' };

    var sheet = getSS().getSheetByName("Aceptaciones_Legales");
    if (!sheet || sheet.getLastRow() < 2) {
      return { success: true, data: [] };
    }
    var values = sheet.getDataRange().getValues();
    var rows = [];
    var search = String((query && query.search) || '').trim().toLowerCase();
    var filterDoc = String((query && query.docId) || '').trim();

    for (var i = 1; i < values.length; i++) {
      var r = values[i];
      var fecha = r[3] instanceof Date ? r[3] : new Date(r[3]);
      var item = {
        folio: String(r[0] || ''),
        docId: String(r[1] || ''),
        version: String(r[2] || ''),
        fecha: fecha && !isNaN(fecha.getTime()) ? fecha.toISOString() : '',
        token: String(r[4] || ''),
        nombre: String(r[5] || ''),
        correo: String(r[6] || ''),
        telefono: String(r[7] || ''),
        rfc: String(r[8] || ''),
        ip: String(r[9] || ''),
        copiaEnviada: String(r[14] || '')
      };
      if (filterDoc && item.docId !== filterDoc) continue;
      if (search) {
        var hay = (item.folio + ' ' + item.nombre + ' ' + item.correo + ' ' + item.token + ' ' + item.docId).toLowerCase();
        if (hay.indexOf(search) === -1) continue;
      }
      rows.push(item);
    }
    // Orden desc por fecha
    rows.sort(function(a, b) { return (b.fecha || '').localeCompare(a.fecha || ''); });
    return { success: true, data: rows };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}

/**
 * Devuelve el detalle completo (los 14 campos legales) de una aceptación.
 */
function getLegalAcceptanceDetail(folio, adminToken) {
  try {
    var admin = validateAdminToken(adminToken);
    if (!admin) return { success: false, message: 'No autorizado.' };

    var sheet = getSS().getSheetByName("Aceptaciones_Legales");
    if (!sheet || sheet.getLastRow() < 2) return { success: false, message: 'No hay registros.' };
    var values = sheet.getDataRange().getValues();
    for (var i = 1; i < values.length; i++) {
      if (String(values[i][0]) === String(folio)) {
        var r = values[i];
        var fecha = r[3] instanceof Date ? r[3] : new Date(r[3]);
        var fechaEnvio = r[15] instanceof Date ? r[15] : (r[15] ? new Date(r[15]) : null);

        // Buscar datos del OTP asociado
        var otpInfo = null;
        try {
          var otpSheet = getSS().getSheetByName("OTP_Firma");
          if (otpSheet && otpSheet.getLastRow() > 1) {
            var otpValues = otpSheet.getDataRange().getValues();
            for (var j = 1; j < otpValues.length; j++) {
              if (String(otpValues[j][0]) === String(r[11])) {
                var fgen = otpValues[j][7] instanceof Date ? otpValues[j][7] : new Date(otpValues[j][7]);
                var fenv = otpValues[j][8] instanceof Date ? otpValues[j][8] : (otpValues[j][8] ? new Date(otpValues[j][8]) : null);
                var fuso = otpValues[j][9] instanceof Date ? otpValues[j][9] : (otpValues[j][9] ? new Date(otpValues[j][9]) : null);
                otpInfo = {
                  folio: String(otpValues[j][0] || ''),
                  estado: String(otpValues[j][6] || ''),
                  emailDestino: maskEmail_(String(otpValues[j][4] || '')),
                  fechaGeneracion: fgen && !isNaN(fgen.getTime()) ? fgen.toISOString() : '',
                  fechaEnvio: fenv && !isNaN(fenv.getTime()) ? fenv.toISOString() : '',
                  fechaUso: fuso && !isNaN(fuso.getTime()) ? fuso.toISOString() : ''
                };
                break;
              }
            }
          }
        } catch (e) { Logger.log('otpInfo lookup error: ' + e); }

        // Título legible del documento
        var docTitulo = String(r[1] || '');
        try {
          var dr = getDocumentoLegal(String(r[1] || ''));
          if (dr && dr.success) docTitulo = dr.documento.titulo;
        } catch(e) {}

        return {
          success: true,
          detail: {
            folio: String(r[0] || ''),
            docId: String(r[1] || ''),
            docTitulo: docTitulo,
            version: String(r[2] || ''),
            fecha: fecha && !isNaN(fecha.getTime()) ? fecha.toISOString() : '',
            token: String(r[4] || ''),
            nombre: String(r[5] || ''),
            correo: String(r[6] || ''),
            telefono: String(r[7] || ''),
            rfc: String(r[8] || ''),
            ip: String(r[9] || ''),
            metodo: String(r[10] || ''),
            tokenOtp: String(r[11] || ''),
            hash: String(r[12] || ''),
            refSesion: String(r[13] || ''),
            copiaEnviada: String(r[14] || ''),
            fechaEnvioCopia: fechaEnvio && !isNaN(fechaEnvio.getTime()) ? fechaEnvio.toISOString() : '',
            otp: otpInfo
          }
        };
      }
    }
    return { success: false, message: 'Folio no encontrado.' };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}

/**
 * Envía emails de confirmación de aceptación al profesional y al admin
 */
function sendAcceptanceEmails(folio, doc, nombre, correo, telefono, rfc, ip, metodo, hash, refSesion, fecha) {
  try {
    var config = getConfig();
    var fechaStr = fecha.toLocaleString('es-MX', { timeZone: 'America/Mexico_City' });

    var auditHtml =
      '<table style="width:100%;border-collapse:collapse;font-size:13px;margin:20px 0;">' +
        '<tr style="background:#f8f9fa;"><td style="padding:8px 12px;border:1px solid #dee2e6;font-weight:600;width:40%;">Folio de aceptación</td><td style="padding:8px 12px;border:1px solid #dee2e6;">' + folio + '</td></tr>' +
        '<tr><td style="padding:8px 12px;border:1px solid #dee2e6;font-weight:600;">Documento</td><td style="padding:8px 12px;border:1px solid #dee2e6;">' + doc.titulo + '</td></tr>' +
        '<tr style="background:#f8f9fa;"><td style="padding:8px 12px;border:1px solid #dee2e6;font-weight:600;">Versión</td><td style="padding:8px 12px;border:1px solid #dee2e6;">' + doc.version + '</td></tr>' +
        '<tr><td style="padding:8px 12px;border:1px solid #dee2e6;font-weight:600;">Fecha y hora</td><td style="padding:8px 12px;border:1px solid #dee2e6;">' + fechaStr + '</td></tr>' +
        '<tr style="background:#f8f9fa;"><td style="padding:8px 12px;border:1px solid #dee2e6;font-weight:600;">Nombre completo</td><td style="padding:8px 12px;border:1px solid #dee2e6;">' + nombre + '</td></tr>' +
        '<tr><td style="padding:8px 12px;border:1px solid #dee2e6;font-weight:600;">Correo electrónico</td><td style="padding:8px 12px;border:1px solid #dee2e6;">' + correo + '</td></tr>' +
        '<tr style="background:#f8f9fa;"><td style="padding:8px 12px;border:1px solid #dee2e6;font-weight:600;">Teléfono</td><td style="padding:8px 12px;border:1px solid #dee2e6;">' + (telefono || 'No proporcionado') + '</td></tr>' +
        '<tr><td style="padding:8px 12px;border:1px solid #dee2e6;font-weight:600;">RFC</td><td style="padding:8px 12px;border:1px solid #dee2e6;">' + (rfc || 'No proporcionado') + '</td></tr>' +
        '<tr style="background:#f8f9fa;"><td style="padding:8px 12px;border:1px solid #dee2e6;font-weight:600;">Dirección IP</td><td style="padding:8px 12px;border:1px solid #dee2e6;">' + ip + '</td></tr>' +
        '<tr><td style="padding:8px 12px;border:1px solid #dee2e6;font-weight:600;">Método de aceptación</td><td style="padding:8px 12px;border:1px solid #dee2e6;">' + metodo + '</td></tr>' +
        '<tr style="background:#f8f9fa;"><td style="padding:8px 12px;border:1px solid #dee2e6;font-weight:600;">Hash del documento (SHA-256)</td><td style="padding:8px 12px;border:1px solid #dee2e6;font-family:monospace;font-size:11px;word-break:break-all;">' + hash + '</td></tr>' +
        '<tr><td style="padding:8px 12px;border:1px solid #dee2e6;font-weight:600;">Referencia de sesión</td><td style="padding:8px 12px;border:1px solid #dee2e6;">' + refSesion + '</td></tr>' +
      '</table>';

    // Email al profesional
    var profHtml =
      '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">' +
        '<div style="background:#001A55;color:white;padding:30px;text-align:center;border-radius:12px 12px 0 0;">' +
          '<h1 style="margin:0;font-size:22px;">Confirmación de Aceptación</h1>' +
          '<p style="margin:8px 0 0;opacity:0.8;">Catholizare Pro — Integración</p>' +
        '</div>' +
        '<div style="padding:30px;background:white;border:1px solid #eee;">' +
          '<p>Estimado/a <strong>' + nombre + '</strong>,</p>' +
          '<p>Confirmamos que has aceptado el siguiente documento:</p>' +
          '<div style="background:#f0f7ff;border-left:4px solid #003ABA;padding:16px;margin:16px 0;border-radius:0 8px 8px 0;">' +
            '<strong style="color:#001A55;">' + doc.titulo + '</strong><br>' +
            '<span style="font-size:13px;color:#666;">Versión ' + doc.version + ' — Folio: ' + folio + '</span>' +
          '</div>' +
          '<h3 style="color:#001A55;margin-top:24px;">Registro de Aceptación</h3>' +
          auditHtml +
          '<p style="font-size:13px;color:#666;margin-top:20px;">Este correo sirve como constancia de aceptación del documento. Conserva este email para tu registro.</p>' +
          '<hr style="border:none;border-top:1px solid #eee;margin:24px 0;">' +
          '<h3 style="color:#001A55;">Copia del Documento Aceptado</h3>' +
          '<div style="background:#fafafa;padding:20px;border:1px solid #eee;border-radius:8px;margin-top:12px;font-size:13px;">' +
            doc.contenido +
          '</div>' +
        '</div>' +
        '<div style="padding:20px;text-align:center;font-size:11px;color:#999;background:#f8f9fa;border-radius:0 0 12px 12px;">' +
          'Catholizare Pro — Red de Psicólogos Católicos<br>Este es un correo automático, no responder.' +
        '</div>' +
      '</div>';

    var profResult = sendEmailViaBrevo(correo, 'Confirmación: ' + doc.titulo + ' — Folio ' + folio, profHtml);

    // Email al admin (incluye copia del documento igual que el del profesional)
    var adminHtml =
      '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">' +
        '<div style="background:#D4AF37;color:#001A55;padding:20px;text-align:center;border-radius:12px 12px 0 0;">' +
          '<h2 style="margin:0;">Notificación de Aceptación Legal</h2>' +
        '</div>' +
        '<div style="padding:30px;background:white;border:1px solid #eee;">' +
          '<p>El profesional <strong>' + nombre + '</strong> ha aceptado:</p>' +
          '<div style="background:#f0f7ff;border-left:4px solid #003ABA;padding:16px;margin:16px 0;border-radius:0 8px 8px 0;">' +
            '<strong>' + doc.titulo + '</strong> (v' + doc.version + ')<br>' +
            '<span style="font-size:13px;">Folio: ' + folio + ' — ' + fechaStr + '</span>' +
          '</div>' +
          '<h3>Datos del Registro</h3>' +
          auditHtml +
          '<hr style="border:none;border-top:1px solid #eee;margin:24px 0;">' +
          '<h3 style="color:#001A55;">Copia del Documento Aceptado</h3>' +
          '<div style="background:#fafafa;padding:20px;border:1px solid #eee;border-radius:8px;margin-top:12px;font-size:13px;">' +
            doc.contenido +
          '</div>' +
        '</div>' +
      '</div>';

    sendEmailViaBrevo(config.ADMIN_EMAIL, 'Aceptación Legal: ' + nombre + ' — ' + doc.titulo, adminHtml);

    return { success: profResult.success };
  } catch (error) {
    Logger.log("Error en sendAcceptanceEmails: " + error);
    return { success: false, message: error.toString() };
  }
}

// ============================================================================

function sendTestEmail(email, adminToken) {
  try {
    var user = validateAdminToken(adminToken);
    if (!user) return { success: false, message: 'Token de admin inválido' };

    if (!email) return { success: false, message: 'Email no proporcionado' };

    var subject = 'Prueba de sistema — Catholizare Pro Integración';
    var htmlContent = '<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:30px;border:1px solid #eee;border-radius:12px;">' +
      '<h2 style="color:#001A55;margin-bottom:10px;">Prueba de Email Exitosa</h2>' +
      '<p style="color:#333;">Este es un correo de prueba enviado desde el módulo <strong>System Health</strong> del sistema de onboarding.</p>' +
      '<hr style="border:none;border-top:1px solid #eee;margin:20px 0;">' +
      '<p style="font-size:13px;color:#999;">Enviado por: ' + user.nombre + ' (' + user.email + ')<br>' +
      'Fecha: ' + new Date().toLocaleString('es-MX') + '</p>' +
      '</div>';

    var result = sendEmailViaBrevo(email, subject, htmlContent);
    return result;
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}

function diagnostico() {
  try {
    Logger.log("1. Verificando hoja Onboarding...");
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Onboarding");
    if (!sheet) {
      Logger.log("❌ HOJA 'Onboarding' NO EXISTE");
      return;
    }
    Logger.log("✅ Hoja encontrada");
    
    Logger.log("2. Leyendo datos...");
    var data = sheet.getDataRange().getValues();
    Logger.log("✅ Filas: " + data.length + ", Columnas: " + data[0].length);
    
    Logger.log("3. Headers:");
    Logger.log(JSON.stringify(data[0]));
    
    Logger.log("4. Probando getAllProfesionales()...");
    var result = getAllProfesionales();
    Logger.log("✅ Resultado: " + JSON.stringify(result));
    
    Logger.log("5. Probando calcularProgreso...");
    if (data.length > 1) {
      var prog = calcularProgreso(data[1]);
      Logger.log("✅ Progreso fila 2: " + prog + "%");
    }
    
    Logger.log("6. Verificando Admin_Users...");
    var adminSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Admin_Users");
    if (adminSheet) {
      Logger.log("✅ Admin_Users existe con " + adminSheet.getLastRow() + " filas");
    } else {
      Logger.log("❌ Admin_Users NO EXISTE");
    }
    
    Logger.log("\n🎉 TODO OK - Si ves esto, el GS funciona correctamente");
    
  } catch (error) {
    Logger.log("❌ ERROR: " + error.toString());
    Logger.log("Stack: " + error.stack);
  }
}
