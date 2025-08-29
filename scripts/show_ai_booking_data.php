<?php
header('Content-Type: application/json');

require_once __DIR__ . '/../backend/config/database.php';

try {
    $db = (new Database())->getConnection();
    if (!$db) {
        echo json_encode(['success' => false, 'message' => 'DB connection failed']);
        exit(1);
    }

    $limit = 20;
    if (isset($_GET['limit'])) {
        $limit = max(1, (int)$_GET['limit']);
    }

    $sql = "SELECT id, user_id, session_id, room_id, topic, meeting_date, meeting_time, duration, participants, meeting_type, food_order, booking_state, created_at, updated_at
            FROM ai_booking_data
            ORDER BY id DESC
            LIMIT :limit";

    $stmt = $db->prepare($sql);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'count' => count($rows),
        'data' => $rows
    ], JSON_PRETTY_PRINT);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
