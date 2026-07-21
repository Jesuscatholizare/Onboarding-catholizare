<?php
/**
 * Proxy PHP para comunicar los HTML con el Google Apps Script backend
 * Reemplaza las llamadas google.script.run por peticiones HTTP
 *
 * Uso: api.php?action=NOMBRE_ACCION
 * Los parámetros se envían por POST (JSON)
 */

// ============================================================
// CONTROL DE ORIGEN - SIEMPRE PRIMERO, antes de cualquier error posible
// ------------------------------------------------------------
// Solo se aceptan peticiones que provengan del propio sitio
// (cualquier host *.catholizare.com). Esto bloquea el abuso desde
// otros sitios y el escaneo automático que no envía un Origin válido.
// Un atacante decidido puede falsificar la cabecera Origin con curl,
// por eso esto es una barrera, NO la seguridad definitiva: la
// validación real debe hacerse por token en cada acción de admin (GAS).
// ============================================================

// Hosts permitidos: el dominio raíz y cualquier subdominio de catholizare.com
function origenPermitido($host) {
    if (!$host) return false;
    $host = strtolower($host);
    return ($host === 'catholizare.com' || substr($host, -16) === '.catholizare.com');
}

// Extrae el host de una URL (Origin o Referer)
function hostDeUrl($url) {
    if (!$url) return '';
    $h = parse_url($url, PHP_URL_HOST);
    return $h ? $h : '';
}

$reqOrigin   = isset($_SERVER['HTTP_ORIGIN'])  ? $_SERVER['HTTP_ORIGIN'] : '';
$reqReferer  = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : '';
$originHost  = $reqOrigin ? hostDeUrl($reqOrigin) : hostDeUrl($reqReferer);

// ============================================================
// HEADERS CORS - reflejar SOLO el origen permitido (nunca '*')
// ============================================================
if ($reqOrigin && origenPermitido(hostDeUrl($reqOrigin))) {
    header('Access-Control-Allow-Origin: ' . $reqOrigin);
    header('Vary: Origin');
}
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Max-Age: 3600');
header('Content-Type: application/json; charset=utf-8');

// Manejar preflight OPTIONS INMEDIATAMENTE
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Bloquear peticiones que NO provienen del sitio.
// Excepción: 'ping' (diagnóstico sin datos sensibles, se hace por GET
// y en ese caso el navegador no envía Origin en peticiones same-origin).
$accionSolicitada = isset($_GET['action']) ? $_GET['action'] : '';
if ($accionSolicitada !== 'ping') {
    if (!origenPermitido($originHost)) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'error'   => 'Origen no autorizado.'
        ]);
        exit;
    }
}

// Evitar que cualquier error fatal rompa la respuesta sin CORS
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error'   => 'PHP error: ' . $errstr,
        'file'    => basename($errfile),
        'line'    => $errline
    ]);
    exit;
});

register_shutdown_function(function() {
    $err = error_get_last();
    if ($err && in_array($err['type'], [E_ERROR, E_CORE_ERROR, E_COMPILE_ERROR, E_PARSE])) {
        if (!headers_sent()) {
            header('Access-Control-Allow-Origin: *');
            header('Content-Type: application/json; charset=utf-8');
            http_response_code(500);
        }
        echo json_encode([
            'success' => false,
            'error'   => 'Fatal error: ' . $err['message'],
            'file'    => basename($err['file']),
            'line'    => $err['line']
        ]);
    }
});

// URL del Web App de Google Apps Script (doPost)
define('GAS_WEBAPP_URL', 'https://script.google.com/macros/s/AKfycbxf5ykD0zdxM3f_CqMbA2_s1saJ0fpfqfpVZEHUuG-Dj5FOgTIBmsAecu8KZmJgqNiZ/exec');

// Obtener la acción solicitada
$action = isset($_GET['action']) ? $_GET['action'] : '';

if (empty($action)) {
    echo json_encode(['success' => false, 'error' => 'No action specified']);
    exit;
}

// Ping de prueba (no contacta GAS) - útil para diagnosticar
if ($action === 'ping') {
    echo json_encode([
        'success' => true,
        'message' => 'Proxy OK',
        'php'     => phpversion(),
        'curl'    => function_exists('curl_init'),
        'method'  => $_SERVER['REQUEST_METHOD'],
        'origin'  => isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : 'n/a',
        'time'    => date('c')
    ]);
    exit;
}

// Obtener datos del body (JSON) o de GET params
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);
if (!$input) {
    $input = [];
}

// Merge GET params (para token, etc.)
foreach ($_GET as $k => $v) {
    if ($k !== 'action' && !isset($input[$k])) {
        $input[$k] = $v;
    }
}

// Incluir IP del cliente para audit trail legal
$clientIP = '';
if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
    $clientIP = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0];
} elseif (!empty($_SERVER['HTTP_X_REAL_IP'])) {
    $clientIP = $_SERVER['HTTP_X_REAL_IP'];
} elseif (!empty($_SERVER['REMOTE_ADDR'])) {
    $clientIP = $_SERVER['REMOTE_ADDR'];
}
$payload = array_merge($input, ['action' => $action, 'clientIP' => trim($clientIP)]);

// Verificar que cURL esté disponible
if (!function_exists('curl_init')) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'cURL no disponible en este servidor']);
    exit;
}

// Enviar petición al GAS
$ch = curl_init(GAS_WEBAPP_URL);
curl_setopt_array($ch, [
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => json_encode($payload),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_TIMEOUT        => 120,
    CURLOPT_SSL_VERIFYPEER => true,
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error    = curl_error($ch);
curl_close($ch);

if ($error) {
    http_response_code(502);
    echo json_encode(['success' => false, 'error' => 'Error conectando con GAS: ' . $error]);
    exit;
}

// Devolver la respuesta del GAS tal cual
http_response_code($httpCode);
echo $response;