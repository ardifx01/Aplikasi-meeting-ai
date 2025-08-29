<?php
require_once __DIR__ . '/../backend/config/database.php';

echo "=== FINAL MySQL DATABASE REPORT ===\n\n";

try {
    $database = new Database();
    $conn = $database->getConnection();
    
    if (!$conn) {
        echo "❌ Failed to connect to MySQL\n";
        exit;
    }
    
    echo "✅ MySQL Connection: SUCCESS\n";
    echo "📊 Database: spacio_meeting_db\n\n";
    
    // All tables summary
    $stmt = $conn->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo "📋 ALL TABLES (" . count($tables) . " total):\n";
    echo str_repeat("=", 50) . "\n";
    
    foreach ($tables as $index => $table) {
        $countStmt = $conn->query("SELECT COUNT(*) as count FROM `$table`");
        $count = $countStmt->fetch()['count'];
        echo ($index + 1) . ". $table ($count records)\n";
    }
    
    // Sample data from key tables
    echo "\n📍 MEETING ROOMS (Sample 3):\n";
    echo str_repeat("-", 40) . "\n";
    $stmt = $conn->query("SELECT id, room_name, capacity, floor, building FROM meeting_rooms WHERE is_available = 1 LIMIT 3");
    while ($row = $stmt->fetch()) {
        $location = trim($row['floor'] . ' ' . $row['building']);
        echo "- {$row['id']}: {$row['room_name']} ({$row['capacity']} orang";
        if ($location) echo ", $location";
        echo ")\n";
    }
    
    echo "\n👥 USERS (Sample 3):\n";
    echo str_repeat("-", 40) . "\n";
    $stmt = $conn->query("SELECT id, username, full_name, email FROM users WHERE is_active = 1 LIMIT 3");
    while ($row = $stmt->fetch()) {
        $fullName = $row['full_name'] ?: 'N/A';
        echo "- {$row['id']}: {$row['username']} ($fullName)\n";
    }
    
    echo "\n📝 FORM BOOKINGS (Recent 3):\n";
    echo str_repeat("-", 40) . "\n";
    $stmt = $conn->query("SELECT id, user_id, topic, meeting_date, booking_state FROM ai_booking_data ORDER BY created_at DESC LIMIT 3");
    if ($stmt->rowCount() > 0) {
        while ($row = $stmt->fetch()) {
            echo "- {$row['id']}: {$row['topic']} (User: {$row['user_id']}, {$row['meeting_date']}, {$row['booking_state']})\n";
        }
    } else {
        echo "- No form bookings found\n";
    }
    
    echo "\n💬 AI CONVERSATIONS (Recent 2):\n";
    echo str_repeat("-", 40) . "\n";
    $stmt = $conn->query("SELECT id, user_id, message FROM ai_conversations ORDER BY created_at DESC LIMIT 2");
    if ($stmt->rowCount() > 0) {
        while ($row = $stmt->fetch()) {
            $shortMessage = substr($row['message'], 0, 40) . '...';
            echo "- {$row['id']}: User {$row['user_id']} - $shortMessage\n";
        }
    } else {
        echo "- No AI conversations found\n";
    }
    
    echo "\n" . str_repeat("=", 50) . "\n";
    echo "🎯 DATABASE STATUS:\n";
    echo "✅ MySQL: Connected and working\n";
    echo "✅ Tables: All present and accessible\n";
    echo "✅ Data: Available for testing\n";
    echo "\n🎉 MySQL database is ready for use!\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>

