<?php
require_once __DIR__ . '/../backend/config/database.php';

echo "=== SAMPLE DATA FROM IMPORTANT TABLES ===\n\n";

try {
    $database = new Database();
    $conn = $database->getConnection();
    
    if (!$conn) {
        echo "Failed to connect to MySQL\n";
        exit;
    }
    
    // Check meeting rooms
    echo "📍 MEETING ROOMS (Sample 5):\n";
    echo str_repeat("-", 40) . "\n";
    $stmt = $conn->query("SELECT id, name, capacity, location FROM meeting_rooms LIMIT 5");
    while ($row = $stmt->fetch()) {
        echo "- {$row['id']}: {$row['name']} ({$row['capacity']} orang, {$row['location']})\n";
    }
    
    // Check users
    echo "\n👥 USERS (Sample 3):\n";
    echo str_repeat("-", 40) . "\n";
    $stmt = $conn->query("SELECT id, username, full_name, email FROM users LIMIT 3");
    while ($row = $stmt->fetch()) {
        $fullName = $row['full_name'] ?: 'N/A';
        echo "- {$row['id']}: {$row['username']} ({$fullName}) - {$row['email']}\n";
    }
    
    // Check recent form bookings
    echo "\n📝 FORM BOOKINGS (Recent 3):\n";
    echo str_repeat("-", 40) . "\n";
    $stmt = $conn->query("SELECT id, user_id, topic, meeting_date, created_at FROM ai_booking_data ORDER BY created_at DESC LIMIT 3");
    if ($stmt->rowCount() > 0) {
        while ($row = $stmt->fetch()) {
            echo "- {$row['id']}: {$row['topic']} (User: {$row['user_id']}, Date: {$row['meeting_date']})\n";
        }
    } else {
        echo "- No form bookings found\n";
    }
    
    // Check AI conversations
    echo "\n💬 AI CONVERSATIONS (Recent 3):\n";
    echo str_repeat("-", 40) . "\n";
    $stmt = $conn->query("SELECT id, user_id, message, created_at FROM ai_conversations ORDER BY created_at DESC LIMIT 3");
    if ($stmt->rowCount() > 0) {
        while ($row = $stmt->fetch()) {
            $shortMessage = substr($row['message'], 0, 50) . '...';
            echo "- {$row['id']}: User {$row['user_id']} - {$shortMessage}\n";
        }
    } else {
        echo "- No AI conversations found\n";
    }
    
    echo "\n✅ MySQL database is working properly!\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>

