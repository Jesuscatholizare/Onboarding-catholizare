<?php
/**
 * Proxy PHP para comunicar los HTML con el Google Apps Script backend
 * Reemplaza las llamadas google.script.run por peticiones HTTP
 *
 * Uso: proxy.php?action=NOMBRE_ACCION
 * Los parámetros se envían por POST (JSON)
 */

// URL del Web App de Google Apps Script (doPost)
define('GAS_WEBAPP_URL', 'https://script.google.com/macros/s/AKfycbz2AVRd7HEHLDUM1opo4r0J_PKKcxSa14elCjbkUeCMJOa6jzZOLRgHTHukvBrQoRQ/exec');

// CORS headers para permitir peticiones desde el mismo dominio
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Obtener la acción solicitada
$action = isset($_GET['action']) ? $_GET['action'] : '';

if (empty($action)) {
    echo json_encode(['success' => false, 'error' => 'No action specified']);
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

// Construir payload para el GAS (siempre via POST al doPost)
$payload = array_merge($input, ['action' => $action]);

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
$error = curl_error($ch);
curl_close($ch);

if ($error) {
    http_response_code(502);
    echo json_encode(['success' => false, 'error' => 'Error connecting to GAS: ' . $error]);
    exit;
}

// Devolver la respuesta del GAS tal cual
http_response_code($httpCode);
echo $response;
