<?php
/**
 * Script untuk memeriksa struktur tabel ai_bookings_success
 */

require_once __DIR__ . '/../backend/config/database.php';

$database = new Database();
$db = $database->getConnection();

echo "=== AI Bookings Table Structure Check ===\n\n";

try {
    // Check if table exists
    $query = "SHOW TABLES LIKE 'ai_bookings_success'";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($result) {
        echo "✅ Table ai_bookings_success exists\n\n";
        
        // Show table structure
        $query = "DESCRIBE ai_bookings_success";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo "Table Structure:\n";
        foreach ($columns as $column) {
            echo "- " . $column['Field'] . " (" . $column['Type'] . ") " . $column['Null'] . " " . $column['Key'] . "\n";
        }
        echo "\n";
        
        // Count records
        $query = "SELECT COUNT(*) as total FROM ai_bookings_success";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $count = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo "📊 Total records: " . $count['total'] . "\n\n";
        
        if ($count['total'] > 0) {
            // Show latest records
            $query = "SELECT * FROM ai_bookings_success ORDER BY created_at DESC LIMIT 3";
            $stmt = $db->prepare($query);
            $stmt->execute();
            $records = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo "Latest Records:\n";
            foreach ($records as $index => $record) {
                echo "=== Record #" . ($index + 1) . " ===\n";
                echo "ID: " . $record['id'] . "\n";
                echo "Session ID: " . $record['session_id'] . "\n";
                echo "Room Name: " . $record['room_name'] . "\n";
                echo "Topic: " . $record['topic'] . "\n";
                echo "Meeting Time: " . $record['meeting_time'] . "\n";
                echo "Meeting Type: " . $record['meeting_type'] . "\n";
                echo "Created At: " . $record['created_at'] . "\n";
                echo "\n";
            }
        }
        
    } else {
        echo "❌ Table ai_bookings_success does not exist\n";
    }
    
} catch (PDOException $e) {
    echo "❌ Database error: " . $e->getMessage() . "\n";
}

echo "=== End Check ===\n";
?>
