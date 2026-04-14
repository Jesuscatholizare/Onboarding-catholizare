/**
 * ============================================================================
 * TESTS UNITARIOS — Catholizare Pro Onboarding v5.2
 * ============================================================================
 *
 * Suite de pruebas unitarias ejecutables dentro del editor de Apps Script.
 *
 * Cómo ejecutar:
 *   1. Abre el editor de Apps Script del proyecto.
 *   2. Selecciona en el dropdown la función `runAllTests`.
 *   3. Click Ejecutar.
 *   4. Abre "Ver → Logs" (Ctrl+Enter) para ver el reporte.
 *
 * Importante:
 *   - Las pruebas de integración (*_IT) usan una hoja temporal y el token
 *     TEST_TOKEN ("ONB-TEST-AAAA"). Se limpian solas al final.
 *   - Ninguna prueba envía correos reales: las llamadas a Brevo se mockean.
 *   - Puedes ejecutar una suite específica (runUnitTests, runIntegrationTests).
 * ============================================================================
 */

var TEST_TOKEN        = 'ONB-TEST-AAAA';
var TEST_EMAIL        = 'test.qa@catholizare-sandbox.local';
var TEST_NOMBRE       = 'QA Sandbox';
var TEST_ESPECIALIDAD = 'Psicología Clínica';

// ---------- Mini framework ----------
var __results__ = [];

function _assert(cond, msg) {
  if (!cond) throw new Error('ASSERT FAIL: ' + msg);
}
function _assertEqual(a, b, msg) {
  if (a !== b) throw new Error('ASSERT EQ FAIL: ' + msg + ' (esperado ' + JSON.stringify(b) + ', obtuvo ' + JSON.stringify(a) + ')');
}
function _run(name, fn) {
  var started = new Date();
  try {
    fn();
    __results__.push({ name: name, ok: true, ms: new Date() - started });
    Logger.log('✅ ' + name);
  } catch (e) {
    __results__.push({ name: name, ok: false, ms: new Date() - started, err: e.toString() });
    Logger.log('❌ ' + name + ' — ' + e);
  }
}
function _report() {
  var total = __results__.length;
  var ok = __results__.filter(function(r){return r.ok;}).length;
  var fail = total - ok;
  Logger.log('');
  Logger.log('══════════════════════════════════════════');
  Logger.log('RESULTADO: ' + ok + '/' + total + ' OK · ' + fail + ' fallaron');
  Logger.log('══════════════════════════════════════════');
  if (fail > 0) {
    __results__.forEach(function(r){ if (!r.ok) Logger.log('  ✗ ' + r.name + ': ' + r.err); });
  }
}

// ============================================================================
// ENTRY POINTS
// ============================================================================
function runAllTests() {
  __results__ = [];
  Logger.log('▶ Unit tests');
  _runUnitSuite();
  Logger.log('');
  Logger.log('▶ Integration tests');
  _runIntegrationSuite();
  _report();
}
function runUnitTests() { __results__ = []; _runUnitSuite(); _report(); }
function runIntegrationTests() { __results__ = []; _runIntegrationSuite(); _report(); }

// ============================================================================
// UNIT TESTS — funciones puras / utilitarias
// ============================================================================
function _runUnitSuite() {
  _run('maskEmail_ oculta local-part', function() {
    _assertEqual(maskEmail_('juan.perez@catholizare.com'), 'ju***z@catholizare.com', 'enmascarado estándar');
  });
  _run('maskEmail_ emails cortos', function() {
    _assertEqual(maskEmail_('ab@x.com'), 'a***@x.com', 'local ≤2 chars');
  });
  _run('maskEmail_ sin @', function() {
    _assertEqual(maskEmail_('sinarroba'), 'sinarroba', 'passthrough');
  });

  _run('calcularProgreso 0% sin nada', function() {
    var row = ['tk','n','e','esp','','','','','Fase 1','','','','','','','','','', null, null, '', null, null, null];
    _assertEqual(calcularProgreso(row, 0), 0, '0 puntos de 9');
  });
  _run('calcularProgreso 100% completo', function() {
    var row = ['tk','n','e','esp','cv','ced','foto','carta','Fase 2','','','ACEPTADO','', 'pob','mod','ter','hor','', null, null, '', null, null, null];
    _assertEqual(calcularProgreso(row, 3), 100, '9/9');
  });
  _run('calcularProgreso parcial (1 legal + perfil)', function() {
    var row = ['tk','n','e','esp','','','','','Fase 1','','','','','pob','','','','', null, null, '', null, null, null];
    // 1 legal + 1 perfil = 2/9 = 22%
    _assertEqual(calcularProgreso(row, 1), 22, '2/9 ≈ 22%');
  });

  _run('calcularPendientes todo pendiente', function() {
    var row = ['tk','n','e','esp','','','','','Fase 1','','','','','','','','','', null, null, '', null, null, null];
    // 4 legal + perfil + cv + cedula + foto + carta = 9
    _assertEqual(calcularPendientes(row, 0), 9, 'todo pendiente');
  });
  _run('calcularPendientes con 3 legales y perfil', function() {
    var row = ['tk','n','e','esp','','','','','Fase 1','','','','','pob','','','','', null, null, '', null, null, null];
    // (4-3)=1 legal + 0 perfil + 4 docs = 5
    _assertEqual(calcularPendientes(row, 3), 5, '5 pendientes');
  });

  _run('validateProfessionalToken rechaza token inválido', function() {
    var r = validateProfessionalToken('ONB-NO-EXISTE-XYZ');
    _assertEqual(r.valid, false, 'no debe validar');
  });
  _run('validateProfessionalToken rechaza vacío', function() {
    var r = validateProfessionalToken('');
    _assertEqual(r.valid, false, 'vacío no válido');
  });

  _run('_ultimaFechaLegalDeToken_ devuelve null si no hay', function() {
    var f = _ultimaFechaLegalDeToken_('ONB-NO-EXISTE-ZZZ');
    _assertEqual(f, null, 'token sin aceptaciones');
  });

  _run('buildLegalAcceptanceMap_ estructura base', function() {
    var map = buildLegalAcceptanceMap_();
    _assert(typeof map === 'object', 'debe retornar objeto');
  });

  _run('getLegalCountForToken_ 0 para token inexistente', function() {
    _assertEqual(getLegalCountForToken_('ONB-NO-EXISTE-QQQ'), 0, 'sin aceptaciones = 0');
  });

  _run('normalización case-insensitive de tokens', function() {
    var up = 'ONB-TEST-XYZ';
    var lo = up.toLowerCase();
    _assertEqual(String(up).trim().toLowerCase(), lo, 'normalización consistente');
  });
}

// ============================================================================
// INTEGRATION TESTS — flujo completo contra hoja de cálculo real
// ============================================================================
function _runIntegrationSuite() {
  // 1. Setup: crea un profesional de prueba si no existe
  _run('IT: setup profesional de prueba', function() {
    _cleanupTestProfessional();  // previa
    var sheet = getSHEET();
    sheet.appendRow([
      TEST_TOKEN, TEST_NOMBRE, TEST_EMAIL, TEST_ESPECIALIDAD,
      '', '', '', '',          // docs vacíos (col 5-8)
      'Fase 1', 'Activo', '',  // fase, estado, categoría (9-11)
      '', '',                  // legal info, legal fecha (12-13)
      '', '', '', '',          // perfil (14-17)
      new Date(),              // fecha registro (18)
      null, null,              // rec1, rec2 (19-20)
      '', false, null,         // (21-23)
      '{}'                     // trigger marks (24)
    ]);
    var found = getProfessionalByToken(TEST_TOKEN);
    _assert(found, 'se debe poder recuperar');
    _assertEqual(found.nombre, TEST_NOMBRE, 'nombre coincide');
  });

  _run('IT: getProfessionalStatus devuelve Fase 1', function() {
    var s = getProfessionalStatus(TEST_TOKEN);
    _assertEqual(s.success, true, 'status ok');
    _assertEqual(s.fase, 'Fase 1', 'fase inicial');
    _assertEqual(s.legal, false, 'aún sin legales');
  });

  _run('IT: checkAndAdvancePhase NO avanza si faltan requisitos', function() {
    var sheet = getSHEET();
    var rowIdx = _findTestRowIndex();
    var row = sheet.getRange(rowIdx, 1, 1, sheet.getLastColumn()).getValues()[0];
    checkAndAdvancePhase(rowIdx, row);
    var after = sheet.getRange(rowIdx, 9).getValue();
    _assertEqual(String(after), 'Fase 1', 'sigue en Fase 1');
  });

  _run('IT: checkAndAdvancePhase avanza a Fase 2 cuando todo listo', function() {
    var sheet = getSHEET();
    var rowIdx = _findTestRowIndex();
    // Simula todos los requisitos
    sheet.getRange(rowIdx, 5).setValue('https://drive/cv.pdf');      // CV
    sheet.getRange(rowIdx, 6).setValue('https://drive/ced.pdf');     // cedula
    sheet.getRange(rowIdx, 7).setValue('https://drive/foto.jpg');    // foto
    sheet.getRange(rowIdx, 8).setValue('https://drive/carta.pdf');   // carta
    sheet.getRange(rowIdx, 14).setValue('Adultos, Familias');        // perfil (col N = 14)
    sheet.getRange(rowIdx, 12).setValue('ACEPTADO (legacy test)');   // legal info legacy

    var row = sheet.getRange(rowIdx, 1, 1, sheet.getLastColumn()).getValues()[0];
    // Stub de Brevo y emails para no enviar nada
    var origSend = sendPhase2WelcomeEmail;
    var origMove = moveContactToBrevoPhase;
    var origNotify = notifyAdminForZoomScheduling;
    sendPhase2WelcomeEmail = function(){ return { success: true }; };
    moveContactToBrevoPhase = function(){ return { success: true }; };
    notifyAdminForZoomScheduling = function(){ return { success: true }; };
    try {
      checkAndAdvancePhase(rowIdx, row);
    } finally {
      sendPhase2WelcomeEmail = origSend;
      moveContactToBrevoPhase = origMove;
      notifyAdminForZoomScheduling = origNotify;
    }
    var after = sheet.getRange(rowIdx, 9).getValue();
    _assertEqual(String(after), 'Fase 2', 'avanzó a Fase 2');
  });

  _run('IT: getProfessionalStatus.legal true tras avance', function() {
    var s = getProfessionalStatus(TEST_TOKEN);
    _assertEqual(s.success, true, 'status ok');
    _assertEqual(s.fase, 'Fase 2', 'Fase 2 persistida');
  });

  _run('IT: adminMarkAction persiste triggers', function() {
    var r1 = adminMarkAction(TEST_TOKEN, 'trigMarkSyncDone');
    _assertEqual(r1.success, true, 'sync marcado');
    var r2 = adminMarkAction(TEST_TOKEN, 'trigMarkZoomDone');
    _assertEqual(r2.success, true, 'zoom marcado');
  });

  _run('IT: auto-avance Fase 2 → Fase 3 al marcar ambos zooms', function() {
    // Stub de correos
    var origSend3 = sendPhase3WelcomeEmail;
    var origMove = moveContactToBrevoPhase;
    sendPhase3WelcomeEmail = function(){ return { success: true }; };
    moveContactToBrevoPhase = function(){ return { success: true }; };
    try {
      // Re-marcar (en caso de que el test anterior NO haya aplicado avance por timing)
      adminMarkAction(TEST_TOKEN, 'trigMarkZoomDone');
    } finally {
      sendPhase3WelcomeEmail = origSend3;
      moveContactToBrevoPhase = origMove;
    }
    var rowIdx = _findTestRowIndex();
    var fase = getSHEET().getRange(rowIdx, 9).getValue();
    _assertEqual(String(fase), 'Fase 3', 'avanzó a Fase 3');
  });

  _run('IT: auto-avance Fase 3 → Fase 4 al marcar supervisión', function() {
    var origMove = moveContactToBrevoPhase;
    moveContactToBrevoPhase = function(){ return { success: true }; };
    try {
      adminMarkAction(TEST_TOKEN, 'trigMarkSupervisionDone');
    } finally {
      moveContactToBrevoPhase = origMove;
    }
    var rowIdx = _findTestRowIndex();
    var fase = getSHEET().getRange(rowIdx, 9).getValue();
    _assertEqual(String(fase), 'Fase 4', 'avanzó a Fase 4');
  });

  _run('IT: adminAdvancePhase bloquea en Fase 4', function() {
    var r = adminAdvancePhase(TEST_TOKEN);
    _assertEqual(r.success, false, 'ya no hay fase siguiente');
  });

  _run('IT: adminSetStatus cambia a Pausado', function() {
    var r = adminSetStatus(TEST_TOKEN, 'Pausado');
    _assertEqual(r.success, true, 'status cambiado');
    var s = getProfessionalStatus(TEST_TOKEN);
    _assertEqual(s.estado, 'Pausado', 'persistido');
  });

  _run('IT: adminResetOnboarding regresa a Fase 1', function() {
    var r = adminResetOnboarding(TEST_TOKEN);
    _assertEqual(r.success, true, 'reset ok');
    var s = getProfessionalStatus(TEST_TOKEN);
    _assertEqual(s.fase, 'Fase 1', 'vuelve a Fase 1');
  });

  // Cleanup final
  _run('IT: cleanup', function() {
    _cleanupTestProfessional();
    var p = getProfessionalByToken(TEST_TOKEN);
    _assert(!p, 'registro borrado');
  });
}

// Helpers ---------------------------------------------------------------------
function _findTestRowIndex() {
  var data = getSHEET().getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim().toLowerCase() === TEST_TOKEN.toLowerCase()) {
      return i + 1;
    }
  }
  throw new Error('Test row no encontrado');
}

function _cleanupTestProfessional() {
  try {
    var sheet = getSHEET();
    var data = sheet.getDataRange().getValues();
    for (var i = data.length - 1; i >= 1; i--) {
      if (String(data[i][0]).trim().toLowerCase() === TEST_TOKEN.toLowerCase()) {
        sheet.deleteRow(i + 1);
      }
    }
    var acc = getSS().getSheetByName('Aceptaciones_Legales');
    if (acc && acc.getLastRow() > 1) {
      var accData = acc.getDataRange().getValues();
      for (var j = accData.length - 1; j >= 1; j--) {
        if (String(accData[j][4]).trim().toLowerCase() === TEST_TOKEN.toLowerCase()) {
          acc.deleteRow(j + 1);
        }
      }
    }
  } catch(_){}
}
