<?php
// Previne cache
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

// CORS: Permitir tudo (Wildcard)
// Como o frontend não usa cookies de sessão (credentials: omit), isso é seguro e elimina erros de rede.
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header('Content-Type: application/json; charset=utf-8');

// Responde imediatamente a requisições OPTIONS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

ob_start();

// Produção: Esconder erros HTML para não quebrar JSON
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

// Configurações do Banco de Dados
define('DB_HOST', 'localhost');
define('DB_USER', 'u816010328_blogazul360par'); 
define('DB_PASS', 'Blogazul360par');       
define('DB_NAME', 'u816010328_blogazul360par'); 

function getDbConnection() {
    ob_clean();
    try {
        $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8", DB_USER, DB_PASS);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $pdo;
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Database connection failed: " . $e->getMessage()]);
        exit();
    }
}
?>