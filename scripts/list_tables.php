<?php
header('Content-Type: application/json');

require_once __DIR__ . '/../backend/config/database.php';

try {
    $db = (new Database())->getConnection();
    if (!$db) {
        echo json_encode(['success' => false, 'message' => 'DB connection failed']);
        exit(1);
    }

    // Get current database name
    $info = $db->query('SELECT DATABASE() as db')->fetch(PDO::FETCH_ASSOC);
    $dbName = $info && isset($info['db']) ? $info['db'] : 'spacio_meeting_db';

    $stmt = $db->prepare("SELECT table_name FROM information_schema.tables WHERE table_schema = :db ORDER BY table_name");
    $stmt->bindValue(':db', $dbName);
    $stmt->execute();
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);

    echo json_encode([
        'success' => true,
        'database' => $dbName,
        'table_count' => count($tables),
        'tables' => $tables
    ], JSON_PRETTY_PRINT);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
