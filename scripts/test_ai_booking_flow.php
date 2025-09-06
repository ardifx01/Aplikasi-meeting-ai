<?php
/**
 * Script untuk test alur AI booking yang benar
 */

require_once __DIR__ . '/../backend/config/database.php';

$database = new Database();
$db = $database->getConnection();

echo "=== AI Booking Flow Test ===\n\n";

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
        
        // Check flow completion
        $flowIssues = [];
        
        // Check if time is not default and reasonable
        if ($latest['meeting_time'] === '09:00:00') {
            $flowIssues[] = "⚠️ Using default time 09:00:00 - might indicate incomplete flow";
        }
        
        // Check if meeting type is not default
        if ($latest['meeting_type'] === 'internal') {
            $flowIssues[] = "⚠️ Using default meeting type 'internal' - might indicate incomplete flow";
        }
        
        // Check if all required fields are filled
        if (empty($latest['topic']) || $latest['topic'] === 'Rapat') {
            $flowIssues[] = "⚠️ Topic is empty or default - might indicate incomplete flow";
        }
        
        if (empty($latest['pic']) || $latest['pic'] === '-') {
            $flowIssues[] = "⚠️ PIC is empty or default - might indicate incomplete flow";
        }
        
        if (empty($latest['food_order']) || $latest['food_order'] === 'tidak') {
            $flowIssues[] = "⚠️ Food order is empty or default - might indicate incomplete flow";
        }
        
        if (empty($flowIssues)) {
            echo "✅ Flow looks complete - all data appears to be user input\n";
        } else {
            echo "❌ Flow issues detected:\n";
            foreach ($flowIssues as $issue) {
                echo "  " . $issue . "\n";
            }
        }
        
        // Show flow analysis
        echo "\n=== Flow Analysis ===\n";
        echo "Expected Flow: IDLE → ASKING_ROOM → ASKING_TOPIC → ASKING_PIC → ASKING_PARTICIPANTS → ASKING_DATE → ASKING_TIME → ASKING_MEETING_TYPE → ASKING_FOOD_TYPE → CONFIRMING → BOOKED\n";
        
        $timeHour = intval(substr($latest['meeting_time'], 0, 2));
        if ($timeHour >= 16) {
            echo "✅ Time indicates afternoon/evening booking (16:00+) - likely user input 'jam 4 sore'\n";
        } else {
            echo "⚠️ Time is early (before 16:00) - might be default or morning booking\n";
        }
        
        if ($latest['meeting_type'] === 'external') {
            echo "✅ Meeting type is 'external' - user likely selected this option\n";
        } else {
            echo "⚠️ Meeting type is 'internal' - might be default or user choice\n";
        }
        
    } else {
        echo "❌ No AI bookings found in database\n";
        echo "💡 Try making a new AI booking to test the flow\n";
    }
    
} catch (PDOException $e) {
    echo "❌ Database error: " . $e->getMessage() . "\n";
}

echo "\n=== End Flow Test ===\n";
?>
