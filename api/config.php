<?php
// Configurações do Banco de Dados - Hostinger
define('DB_HOST', 'localhost');
define('DB_USER', 'u816010328_blogazul360par'); 
define('DB_PASS', 'Blogazul360par');       
define('DB_NAME', 'u816010328_blogazul360par'); 

// ORDEM IMPORTANTE: Headers devem vir ANTES de qualquer processamento
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header('Content-Type: application/json; charset=utf-8');

// Responde imediatamente a requisições OPTIONS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

function getDbConnection() {
    try {
        $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8", DB_USER, DB_PASS);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $pdo;
    } catch(PDOException $e) {
        echo json_encode(["success" => false, "error" => "Erro de conexão DB: " . $e->getMessage()]);
        exit();
    }
}
?>