<?php
require_once 'config.php';
// Se chegou aqui, config.php carregou e headers foram enviados.
$status = ["status" => "online", "message" => "API Azul 360 Parceiros Operational"];

try {
    $pdo = getDbConnection();
    $status["database"] = "Connected";
    
    // Testar tabelas
    $tables = [];
    $res = $pdo->query("SHOW TABLES");
    while($row = $res->fetch(PDO::FETCH_NUM)) {
        $tables[] = $row[0];
    }
    $status["tables"] = $tables;
    
} catch (Exception $e) {
    $status["database_error"] = $e->getMessage();
}

echo json_encode($status);
?>