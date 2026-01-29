<?php
require_once 'config.php';
$pdo = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM articles ORDER BY publish_date DESC");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}
elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $sql = "INSERT INTO articles (title, excerpt, content, category, image_url, author, publish_date) VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$data['title'], $data['excerpt'], $data['content'], $data['category'], $data['image_url'], $data['author'], $data['publish_date']]);
    echo json_encode(["success" => true, "id" => $pdo->lastInsertId()]);
}
elseif ($method === 'DELETE') {
    $data = json_decode(file_get_contents("php://input"), true);
    $stmt = $pdo->prepare("DELETE FROM articles WHERE id = ?");
    $stmt->execute([$data['id']]);
    echo json_encode(["success" => true]);
}
?>