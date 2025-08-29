<?php
// Simple test insert into ai_booking_data
require_once __DIR__ . '/../backend/config/database.php';

header('Content-Type: application/json');

try {
    $db = (new Database())->getConnection();
    if (!$db) {
        echo json_encode(['success' => false, 'message' => 'DB connection failed']);
        exit;
    }

    // Sample data
    $data = [
        'user_id' => 1,
        'session_id' => 'test_' . time(),
        'room_id' => 1,
        'topic' => 'Uji coba insert AI booking',
        'meeting_date' => date('Y-m-d', strtotime('+1 day')),
        'meeting_time' => '09:00:00',
        'duration' => 60,
        'participants' => 4,
        'meeting_type' => 'internal',
        'food_order' => 'tidak',
        'booking_state' => 'BOOKED'
    ];

    $sql = "INSERT INTO ai_booking_data (user_id, session_id, room_id, topic, meeting_date, meeting_time, duration, participants, meeting_type, food_order, booking_state)
            VALUES (:user_id, :session_id, :room_id, :topic, :meeting_date, :meeting_time, :duration, :participants, :meeting_type, :food_order, :booking_state)";

    $stmt = $db->prepare($sql);
    foreach ($data as $key => $value) {
        $stmt->bindValue(':' . $key, $value);
    }
    $stmt->execute();

    $insertId = $db->lastInsertId();

    // Fetch back
    $q = $db->prepare('SELECT * FROM ai_booking_data WHERE id = :id');
    $q->bindValue(':id', $insertId, PDO::PARAM_INT);
    $q->execute();
    $row = $q->fetch(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'message' => 'Insert OK', 'insert_id' => $insertId, 'row' => $row], JSON_PRETTY_PRINT);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
