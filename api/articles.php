<?php
require_once 'config.php';

try {
    $pdo = getDbConnection();
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        // Verifica se a tabela existe antes de consultar
        $stmt = $pdo->query("SELECT * FROM articles ORDER BY publish_date DESC");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }
    elseif ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data) throw new Exception("Dados inválidos enviados");

        $sql = "INSERT INTO articles (title, excerpt, content, category, image_url, author, publish_date) VALUES (?, ?, ?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['title'] ?? 'Sem título', 
            $data['excerpt'] ?? '', 
            $data['content'] ?? '', 
            $data['category'] ?? 'Geral', 
            $data['image_url'] ?? '', 
            $data['author'] ?? 'Admin', 
            $data['publish_date'] ?? date('d M, Y')
        ]);
        echo json_encode(["success" => true, "id" => $pdo->lastInsertId()]);
    }
    elseif ($method === 'DELETE') {
        $data = json_decode(file_get_contents("php://input"), true);
        $stmt = $pdo->prepare("DELETE FROM articles WHERE id = ?");
        $stmt->execute([$data['id']]);
        echo json_encode(["success" => true]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>