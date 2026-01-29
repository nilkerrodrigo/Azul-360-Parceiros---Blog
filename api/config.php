<?php
// Define cabeçalhos de segurança e CORS imediatamente
// Permite qualquer origem (*) para eliminar problemas de desenvolvimento local vs produção
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json; charset=utf-8");

// Previne cache agressivamente
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

// Tratamento imediato de preflight request (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Inicia buffer para evitar output acidental (warnings, erros PHP) antes do JSON
ob_start();

// Configuração de erro: Em produção não mostrar HTML, apenas logar
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

// Credenciais do Banco
define('DB_HOST', 'localhost');
define('DB_USER', 'u816010328_blogazul360par'); 
define('DB_PASS', 'Blogazul360par');       
define('DB_NAME', 'u816010328_blogazul360par'); 

function getDbConnection() {
    try {
        $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8", DB_USER, DB_PASS);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        return $pdo;
    } catch(PDOException $e) {
        // Se houver erro de conexão, limpa tudo e retorna JSON 500
        ob_clean(); 
        http_response_code(500);
        echo json_encode([
            "success" => false, 
            "error" => "Database connection failed: " . $e->getMessage()
        ]);
        exit();
    }
}
?>