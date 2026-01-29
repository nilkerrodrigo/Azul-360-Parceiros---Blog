<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['file'])) {
    $uploadDir = 'uploads/';
    
    // Cria pasta se não existir
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $fileName = uniqid() . '-' . basename($_FILES['file']['name']);
    $targetPath = $uploadDir . $fileName;
    
    if (move_uploaded_file($_FILES['file']['tmp_name'], $targetPath)) {
        // Gera URL completa
        $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
        $domain = $_SERVER['HTTP_HOST'];
        
        // Ajuste o caminho conforme onde o script está rodando
        // Se este arquivo está em /api/upload.php, a imagem está em /api/uploads/
        $url = "$protocol://$domain/api/$targetPath";
        
        echo json_encode(["success" => true, "url" => $url]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Falha ao mover arquivo"]);
    }
} else {
    echo json_encode(["success" => false, "error" => "Nenhum arquivo enviado"]);
}
?>