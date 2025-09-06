<?php
/**
 * Script untuk membuat test booking data
 */

require_once __DIR__ . '/../backend/config/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    echo "=== MEMBUAT TEST BOOKING DATA ===\n\n";
    
    // Insert test booking
    $sql = "INSERT INTO ai_bookings_success (
        user_id, session_id, room_id, room_name, topic, pic, participants, 
        meeting_date, meeting_time, duration, meeting_type, food_order, booking_state
    ) VALUES (
        1, 'test_session_123', 1, 'Test Room', 'Test Meeting', 'Test PIC', 10,
        '2025-09-10', '10:00:00', 60, 'internal', 'ringan', 'BOOKED'
    )";
    
    $stmt = $conn->prepare($sql);
    $result = $stmt->execute();
    
    if ($result) {
        $testId = $conn->lastInsertId();
        echo "✅ Test booking berhasil dibuat dengan ID: $testId\n";
        
        // Cek data yang baru dibuat
        $stmt = $conn->prepare("SELECT id, session_id, room_name, topic FROM ai_bookings_success WHERE id = ?");
        $stmt->execute([$testId]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo "📋 Data yang dibuat:\n";
        echo "- ID: {$data['id']}\n";
        echo "- Session: {$data['session_id']}\n";
        echo "- Room: {$data['room_name']}\n";
        echo "- Topic: {$data['topic']}\n";
        
    } else {
        echo "❌ Gagal membuat test booking\n";
    }
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}
?>
