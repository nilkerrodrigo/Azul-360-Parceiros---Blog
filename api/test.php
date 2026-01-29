<?php
require_once 'config.php';

// Teste básico de JSON
$response = [
    "status" => "online",
    "message" => "A API está funcionando corretamente.",
    "server_time" => date('Y-m-d H:i:s'),
    "php_version" => phpversion()
];

try {
    $pdo = getDbConnection();
    $response['database'] = "Conectado com sucesso ao banco " . DB_NAME;
} catch (Exception $e) {
    $response['database'] = "Erro de conexão: " . $e->getMessage();
}

echo json_encode($response);
?>