<?php
require_once 'config.php';

try {
    $pdo = getDbConnection();
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT * FROM categories ORDER BY name ASC");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }
    elseif ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        
        $check = $pdo->prepare("SELECT id FROM categories WHERE name = ?");
        $check->execute([$data['name']]);
        if ($check->rowCount() > 0) {
             echo json_encode(["success" => false, "error" => "Categoria já existe"]);
             exit;
        }

        $sql = "INSERT INTO categories (name, icon, description) VALUES (?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$data['name'], $data['icon'] ?? 'fa-tag', $data['description'] ?? '']);
        echo json_encode(["success" => true, "id" => $pdo->lastInsertId()]);
    }
    elseif ($method === 'DELETE') {
        $data = json_decode(file_get_contents("php://input"), true);
        $stmt = $pdo->prepare("DELETE FROM categories WHERE id = ?");
        $stmt->execute([$data['id']]);
        echo json_encode(["success" => true]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>