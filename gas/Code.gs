/**
 * CATHOLIZARE PRO - SISTEMA DE ONBOARDING
 * Version: 5.3
 *
 * ═══════════════════════════════════════════════════════════════
 * ARCHIVO DE REFERENCIA + doPost ROUTER
 *
 * Este archivo contiene el doPost() que DEBES agregar al GAS
 * para que el proxy Express pueda invocar funciones del backend.
 *
 * INSTRUCCIONES:
 *   1. Abre tu proyecto GAS en https://script.google.com
 *   2. Copia la funcion doPost() de abajo
 *   3. Pegala en tu Code.gs (NO reemplaces el doGet existente)
 *   4. Haz un nuevo deploy: Deploy > New deployment > Web app
 *      - Execute as: Me
 *      - Who has access: Anyone
 *   5. Copia la URL del deployment y ponla en .env como GAS_WEBAPP_URL
 * ═══════════════════════════════════════════════════════════════
 *
 * Spreadsheet ID: 1YgbnsB0_oLbSlYBUNqhe2V9QqlbEu8nGotYTWHHXW4I
 * Hoja principal: "Onboarding"
 *
 * Columnas Onboarding (0-indexed):
 *   0: ID_Token       1: Nombre         2: Email
 *   3: Especialidad   4: CV_Url         5: Docs_Profesion (cedula)
 *   6: Foto_Url       7: Carta_Sacerdote 8: Fase_Actual
 *   9: Estado        10: Categoria      11: Legal_Aceptacion
 *  12: Legal_Fecha   13: Poblaciones    14: Modalidad
 *  15: Terapias      16: Horarios       17: Fecha_Inicio
 *  18: Fecha_Rec1    19: Fecha_Rec2     20: Dias_Desde_Inicio
 *  21: Fase1_Completada 22: Fase1_Fecha 23: Trigger_Marks
 */

// ============================================================================
// doPost - ROUTER PARA PROXY EXPRESS
// ============================================================================
// Copia esta funcion en tu Code.gs del proyecto GAS.
// El proxy Express envia POST con { action: "nombreFuncion", ...params }
// y este router despacha a la funcion correcta.
// ============================================================================

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action;

    Logger.log('[doPost] Action: ' + action);

    var result;

    switch (action) {
      // === Profesional: desde las paginas HTML ===
      case 'saveLegalAcceptance':
        result = saveLegalAcceptance(data.token, data.version, data.signerName);
        break;

      case 'saveProfileInfo':
        result = saveProfileInfo(data.token, data.formData);
        break;

      case 'uploadFile':
        result = uploadFile(data.token, data.base64Data, data.fileName, data.fileType);
        break;

      // === Admin: gestion de profesionales ===
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

      // === Admin: gestion de usuarios admin ===
      case 'validateAdminToken':
        var user = validateAdminToken(data.token);
        result = user ? { success: true, data: user } : { success: false, message: 'Token invalido' };
        break;

      case 'getAllAdminUsers':
        result = { success: true, data: getAllAdminUsers() };
        break;

      case 'generateAdminToken':
        result = generateAdminToken(data.email, data.role, data.nombre, data.currentUserToken);
        break;

      case 'deactivateAdminToken':
        result = deactivateAdminToken(data.tokenToDeactivate, data.currentUserToken);
        break;

      case 'activateAdminToken':
        result = activateAdminToken(data.tokenToActivate, data.currentUserToken);
        break;

      // === Timeline y estado ===
      case 'getTimeline':
        result = getTimeline(data.token);
        break;

      case 'getEmailHistory':
        result = { success: true, data: getEmailHistory(data.token) };
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
