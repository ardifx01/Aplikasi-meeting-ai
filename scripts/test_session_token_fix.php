<?php
/**
 * Script untuk test perbaikan session token
 */

require_once __DIR__ . '/../backend/config/database.php';

$database = new Database();
$db = $database->getConnection();

echo "=== Session Token Fix Test ===\n\n";

try {
    // Check if table exists and has data
    $query = "SELECT COUNT(*) as total FROM ai_bookings_success";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $count = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo "📊 Total AI bookings: " . $count['total'] . "\n\n";
    
    if ($count['total'] > 0) {
        // Get latest booking
        $query = "SELECT * FROM ai_bookings_success ORDER BY created_at DESC LIMIT 1";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $latest = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo "=== Latest AI Booking ===\n";
        echo "ID: " . $latest['id'] . "\n";
        echo "User ID: " . $latest['user_id'] . "\n";
        echo "Session ID: " . $latest['session_id'] . "\n";
        echo "Room Name: " . $latest['room_name'] . "\n";
        echo "Topic: " . $latest['topic'] . "\n";
        echo "PIC: " . $latest['pic'] . "\n";
        echo "Participants: " . $latest['participants'] . "\n";
        echo "Meeting Date: " . $latest['meeting_date'] . "\n";
        echo "Meeting Time: " . $latest['meeting_time'] . " ⏰\n";
        echo "Duration: " . $latest['duration'] . " minutes\n";
        echo "Meeting Type: " . $latest['meeting_type'] . " 🤝\n";
        echo "Food Order: " . $latest['food_order'] . "\n";
        echo "Booking State: " . $latest['booking_state'] . "\n";
        echo "Created At: " . $latest['created_at'] . "\n";
        echo "\n";
        
        // Check session token fix
        $sessionIssues = [];
        
        // Check if user_id is valid
        if (empty($latest['user_id']) || $latest['user_id'] <= 0) {
            $sessionIssues[] = "⚠️ User ID is invalid or missing";
        } else {
            echo "✅ User ID is valid: " . $latest['user_id'] . "\n";
        }
        
        // Check if session_id is valid
        if (empty($latest['session_id'])) {
            $sessionIssues[] = "⚠️ Session ID is missing";
        } else {
            echo "✅ Session ID is valid: " . $latest['session_id'] . "\n";
        }
        
        // Check if booking was saved successfully
        if ($latest['booking_state'] === 'BOOKED') {
            echo "✅ Booking state is correct: " . $latest['booking_state'] . "\n";
        } else {
            $sessionIssues[] = "⚠️ Booking state is incorrect: " . $latest['booking_state'];
        }
        
        if (empty($sessionIssues)) {
            echo "✅ Session token fix working correctly - booking saved successfully\n";
        } else {
            echo "❌ Session token issues detected:\n";
            foreach ($sessionIssues as $issue) {
                echo "  " . $issue . "\n";
            }
        }
        
        // Show recent bookings with user_id
        echo "\n=== Recent AI Bookings ===\n";
        $query = "SELECT id, user_id, session_id, room_name, topic, meeting_time, meeting_type, created_at FROM ai_bookings_success ORDER BY created_at DESC LIMIT 5";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $recent = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($recent as $index => $booking) {
            echo ($index + 1) . ". ID: " . $booking['id'] . 
                 " | User ID: " . $booking['user_id'] . 
                 " | Time: " . $booking['meeting_time'] . 
                 " | Type: " . $booking['meeting_type'] . 
                 " | Room: " . $booking['room_name'] . 
                 " | Topic: " . $booking['topic'] . "\n";
        }
        
    } else {
        echo "❌ No AI bookings found in database\n";
        echo "💡 Try making a new AI booking to test the session token fix\n";
    }
    
} catch (PDOException $e) {
    echo "❌ Database error: " . $e->getMessage() . "\n";
}

echo "\n=== End Session Token Fix Test ===\n";
?>
