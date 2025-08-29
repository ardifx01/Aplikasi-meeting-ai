<?php
require_once __DIR__ . '/../config/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    echo "=== CHECKING EXISTING BOOKINGS ===\n";
    
    // Check bookings for 2025-08-29
    $date = '2025-08-29';
    $stmt = $conn->prepare("
        SELECT 
            b.id,
            b.room_id,
            r.room_name,
            b.meeting_date,
            b.meeting_time,
            b.duration,
            b.topic,
            b.participants,
            TIME_FORMAT(ADDTIME(b.meeting_time, SEC_TO_TIME(b.duration * 60)), '%H:%i:%s') as end_time
        FROM ai_booking_data b
        LEFT JOIN meeting_rooms r ON b.room_id = r.id
        WHERE b.meeting_date = ?
        ORDER BY b.room_id, b.meeting_time
    ");
    $stmt->execute([$date]);
    $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($bookings)) {
        echo "✅ No bookings found for $date\n";
    } else {
        echo "📅 Bookings for $date:\n";
        foreach ($bookings as $booking) {
            echo "- Room {$booking['room_id']} ({$booking['room_name']}): {$booking['meeting_time']} - {$booking['end_time']} ({$booking['duration']}min) - {$booking['topic']}\n";
        }
    }
    
    echo "\n=== FINDING AVAILABLE SLOTS ===\n";
    
    // Check room 4 availability for different times
    $room_id = 4;
    $test_times = ['09:00:00', '10:00:00', '11:00:00', '13:00:00', '15:00:00', '16:00:00'];
    
    echo "Room 4 (Komodo Meeting Room) availability for $date:\n";
    foreach ($test_times as $time) {
        $end_time = date('H:i:s', strtotime($time) + 3600); // +1 hour
        
        $stmt = $conn->prepare("
            SELECT COUNT(*) as conflicts
            FROM ai_booking_data
            WHERE room_id = ? 
            AND meeting_date = ?
            AND (
                (meeting_time <= ? AND ADDTIME(meeting_time, SEC_TO_TIME(duration * 60)) > ?) OR
                (meeting_time < ? AND ADDTIME(meeting_time, SEC_TO_TIME(duration * 60)) >= ?)
            )
        ");
        $stmt->execute([$room_id, $date, $time, $time, $end_time, $end_time]);
        $conflicts = $stmt->fetchColumn();
        
        $status = $conflicts > 0 ? '❌ BOOKED' : '✅ AVAILABLE';
        echo "  $time - $end_time: $status\n";
    }
    
    echo "\n=== ALTERNATIVE ROOMS ===\n";
    echo "Available rooms with capacity >= 5 for 14:00-15:00:\n";
    
    $stmt = $conn->prepare("
        SELECT r.id, r.room_name, r.capacity
        FROM meeting_rooms r
        WHERE r.capacity >= 5
        AND r.is_available = 1
        AND r.is_maintenance = 0
        AND r.id NOT IN (
            SELECT DISTINCT room_id
            FROM ai_booking_data
            WHERE meeting_date = ?
            AND (
                (meeting_time <= '14:00:00' AND ADDTIME(meeting_time, SEC_TO_TIME(duration * 60)) > '14:00:00') OR
                (meeting_time < '15:00:00' AND ADDTIME(meeting_time, SEC_TO_TIME(duration * 60)) >= '15:00:00')
            )
        )
        ORDER BY r.capacity
    ");
    $stmt->execute([$date]);
    $available_rooms = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($available_rooms)) {
        echo "❌ No rooms available at 14:00-15:00\n";
    } else {
        foreach ($available_rooms as $room) {
            echo "✅ Room {$room['id']}: {$room['room_name']} (Capacity: {$room['capacity']})\n";
        }
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
