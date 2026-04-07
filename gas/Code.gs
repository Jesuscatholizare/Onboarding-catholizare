/**
 * CATHOLIZARE PRO - SISTEMA DE ONBOARDING COMPLETO
 * Version: 5.3 - Correos actualizados + WhatsApp
 * Fecha: Febrero 2026
 *
 * NOTA: Este archivo es referencia del backend GAS original.
 * El servidor Node.js sirve las paginas HTML y actua como proxy
 * hacia este GAS via doGet (JSON endpoints).
 *
 * Funciones que el frontend llama via proxy:
 *   GET  ?action=getStatus&token=X    -> getProfessionalStatus()
 *   GET  ?action=getTimeline&token=X   -> getTimeline()
 *   POST saveLegalAcceptance(token, version, signerName)
 *   POST saveProfileInfo(token, formData)
 *   POST uploadFile(token, base64, fileName, fileType)
 *   POST sendManualEmailFromDashboard(token, emailType)
 *   POST adminAdvancePhase(token)
 *   POST adminSetStatus(token, status)
 *   POST adminMarkAction(token, actionId)
 *   POST getAllProfesionales()
 *   POST validateAdminToken(token)
 *   POST generateAdminToken(email, role, nombre, currentUserToken)
 *   POST initializeNewProfessional(nombre, email, especialidad, categoria)
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
