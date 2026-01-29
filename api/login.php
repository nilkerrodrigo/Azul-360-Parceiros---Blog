<?php
require_once 'config.php';
$pdo = getDbConnection();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $email = $data['email'];
    $password = $data['password'];

    // Para produção, use password_hash e password_verify!
    // Exemplo simplificado:
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? AND password = ?");
    $stmt->execute([$email, $password]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        unset($user['password']); // Não retorne a senha
        echo json_encode(["success" => true, "user" => $user]);
    } else {
        echo json_encode(["success" => false, "error" => "Credenciais inválidas"]);
    }
}
?>