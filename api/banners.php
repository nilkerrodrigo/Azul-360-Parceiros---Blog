<?php
require_once 'config.php';

try {
    $pdo = getDbConnection();
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT * FROM banners ORDER BY id DESC");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }
    elseif ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        $sql = "INSERT INTO banners (image_url, title, subtitle, cta, link) VALUES (?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['image_url'], 
            $data['title'], 
            $data['subtitle'], 
            $data['cta'],
            $data['link'] ?? ''
        ]);
        echo json_encode(["success" => true, "id" => $pdo->lastInsertId()]);
    }
    elseif ($method === 'DELETE') {
        $data = json_decode(file_get_contents("php://input"), true);
        $stmt = $pdo->prepare("DELETE FROM banners WHERE id = ?");
        $stmt->execute([$data['id']]);
        echo json_encode(["success" => true]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>