<?php
require_once 'config.php';

$response = [];

try {
    $pdo = getDbConnection();
    $response["connection"] = "OK";
    
    // Tabela Users
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    $response["table_users"] = "OK";

    // Admin Padrão
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE email = ?");
    $stmt->execute(['admin@azul360.com.br']);
    if ($stmt->fetchColumn() == 0) {
        $pdo->exec("INSERT INTO users (name, email, password) VALUES ('Admin', 'admin@azul360.com.br', 'admin123')");
        $response["admin_user"] = "Created";
    } else {
        $response["admin_user"] = "Exists";
    }

    // Tabela Categories
    $pdo->exec("CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        icon VARCHAR(50) DEFAULT 'fa-tag',
        description VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    $response["table_categories"] = "OK";
    
    // Tabela Articles
    $pdo->exec("CREATE TABLE IF NOT EXISTS articles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        excerpt TEXT,
        content LONGTEXT,
        category VARCHAR(50),
        image_url VARCHAR(255),
        author VARCHAR(100),
        publish_date VARCHAR(50),
        views INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    $response["table_articles"] = "OK";

    // Tabela Banners
    $pdo->exec("CREATE TABLE IF NOT EXISTS banners (
        id INT AUTO_INCREMENT PRIMARY KEY,
        image_url VARCHAR(255) NOT NULL,
        title VARCHAR(100),
        subtitle VARCHAR(255),
        cta VARCHAR(50),
        link VARCHAR(255),
        clicks INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    $response["table_banners"] = "OK";

    echo json_encode(["success" => true, "details" => $response]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>