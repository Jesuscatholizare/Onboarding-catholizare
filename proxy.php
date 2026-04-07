<?php
/**
 * Proxy PHP para comunicar los HTML con el Google Apps Script backend
 * Reemplaza las llamadas google.script.run por peticiones HTTP
 *
 * Uso: proxy.php?action=NOMBRE_ACCION
 * Los parámetros se envían por POST (JSON)
 */

// URL del Web App de Google Apps Script (doPost)
define('GAS_WEBAPP_URL', 'TU_URL_DEL_GAS_WEBAPP_AQUI');

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

// Obtener datos del body (JSON)
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);
if (!$input) {
    $input = [];
}

// Construir payload para el GAS
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
