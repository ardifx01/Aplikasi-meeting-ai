<?php
require_once __DIR__ . '/../config/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    echo "=== ALTERNATIVE ROOMS FOR 14:00-15:00 ===\n";
    
    $stmt = $conn->prepare("
        SELECT r.id, r.room_name, r.capacity
        FROM meeting_rooms r
        WHERE r.capacity >= 5 
        AND r.is_available = 1 
        AND r.is_maintenance = 0
        AND r.id NOT IN (
            SELECT DISTINCT room_id
            FROM ai_booking_data
            WHERE meeting_date = '2025-08-29'
            AND (
                (meeting_time <= '14:00:00' AND ADDTIME(meeting_time, SEC_TO_TIME(duration * 60)) > '14:00:00') OR
                (meeting_time < '15:00:00' AND ADDTIME(meeting_time, SEC_TO_TIME(duration * 60)) >= '15:00:00')
            )
        )
        ORDER BY r.capacity
    ");
    $stmt->execute();
    $available_rooms = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($available_rooms)) {
        echo "❌ No rooms available at 14:00-15:00\n";
    } else {
        echo "✅ Available rooms for 14:00-15:00:\n";
        foreach ($available_rooms as $room) {
            echo "- Room {$room['id']}: {$room['room_name']} (Capacity: {$room['capacity']})\n";
        }
        
        echo "\n📋 POSTMAN JSON EXAMPLE:\n";
        $first_room = $available_rooms[0];
        echo "{\n";
        echo "  \"user_id\": 1,\n";
        echo "  \"room_id\": {$first_room['id']},\n";
        echo "  \"topic\": \"Tes Postman\",\n";
        echo "  \"meeting_date\": \"2025-08-29\",\n";
        echo "  \"meeting_time\": \"14:00:00\",\n";
        echo "  \"duration\": 60,\n";
        echo "  \"participants\": 5,\n";
        echo "  \"meeting_type\": \"internal\",\n";
        echo "  \"food_order\": \"tidak\",\n";
        echo "  \"booking_state\": \"BOOKED\"\n";
        echo "}\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
