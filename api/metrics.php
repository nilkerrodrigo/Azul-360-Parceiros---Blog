<?php
require_once 'config.php';
$pdo = getDbConnection();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $type = $data['type'];
    $id = $data['id'];

    if ($type === 'view') {
        $stmt = $pdo->prepare("UPDATE articles SET views = views + 1 WHERE id = ?");
        $stmt->execute([$id]);
    } 
    elseif ($type === 'click') {
        $stmt = $pdo->prepare("UPDATE banners SET clicks = clicks + 1 WHERE id = ?");
        $stmt->execute([$id]);
    }
    
    echo json_encode(["success" => true]);
}
?>