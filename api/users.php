<?php
require_once 'config.php';
$pdo = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT id, name, email FROM users");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}
elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $email = $data['email'];
    
    // Verifica duplicidade
    $check = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $check->execute([$email]);
    if ($check->rowCount() > 0) {
        echo json_encode(["success" => false, "error" => "E-mail já cadastrado"]);
        exit;
    }

    $sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    // Nota: Em produção, use password_hash($data['password'], PASSWORD_DEFAULT)
    $stmt->execute([$data['name'], $email, $data['password']]);
    
    echo json_encode(["success" => true, "id" => $pdo->lastInsertId()]);
}
elseif ($method === 'DELETE') {
    $data = json_decode(file_get_contents("php://input"), true);
    $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
    $stmt->execute([$data['id']]);
    echo json_encode(["success" => true]);
}
?>