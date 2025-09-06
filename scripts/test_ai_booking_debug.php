<?php
/**
 * Script untuk debug AI booking dan memverifikasi data yang tersimpan
 */

require_once __DIR__ . '/../backend/config/database.php';

$database = new Database();
$db = $database->getConnection();

echo "=== AI Booking Debug ===\n\n";

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
        
        // Check for default values
        $issues = [];
        if ($latest['meeting_time'] === '09:00:00') {
            $issues[] = "⚠️ Using default time 09:00:00";
        }
        if ($latest['meeting_type'] === 'internal') {
            $issues[] = "⚠️ Using default meeting type 'internal'";
        }
        if (empty($latest['topic'])) {
            $issues[] = "⚠️ Missing topic";
        }
        
        if (empty($issues)) {
            echo "✅ Data looks good - no default values detected\n";
        } else {
            echo "❌ Issues detected:\n";
            foreach ($issues as $issue) {
                echo "  " . $issue . "\n";
            }
        }
        
        // Show all recent bookings
        echo "\n=== Recent AI Bookings ===\n";
        $query = "SELECT id, session_id, room_name, topic, meeting_time, meeting_type, created_at FROM ai_bookings_success ORDER BY created_at DESC LIMIT 5";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $recent = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($recent as $index => $booking) {
            echo ($index + 1) . ". ID: " . $booking['id'] . 
                 " | Time: " . $booking['meeting_time'] . 
                 " | Type: " . $booking['meeting_type'] . 
                 " | Room: " . $booking['room_name'] . 
                 " | Topic: " . $booking['topic'] . "\n";
        }
        
    } else {
        echo "❌ No AI bookings found in database\n";
    }
    
} catch (PDOException $e) {
    echo "❌ Database error: " . $e->getMessage() . "\n";
}

echo "\n=== End Debug ===\n";
?>
