<?php
/**
 * Test Database Connection
 * File ini untuk testing koneksi database
 */

require_once 'config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if ($db) {
        echo "✅ Database connection successful!\n";
        echo "Database: spacio_meeting_db\n";
        
        // Test query - check existing tables
        $stmt = $db->query("SELECT COUNT(*) as total_users FROM users");
        $result = $stmt->fetch();
        echo "Total users: " . $result['total_users'] . "\n";
        
        // Test rooms
        $stmt = $db->query("SELECT COUNT(*) as total_rooms FROM meeting_rooms");
        $result = $stmt->fetch();
        echo "Total rooms: " . $result['total_rooms'] . "\n";
        
        // Test AI booking data
        $stmt = $db->query("SELECT COUNT(*) as total_ai_bookings FROM ai_booking_data");
        $result = $stmt->fetch();
        echo "Total AI bookings: " . $result['total_ai_bookings'] . "\n";
        
        // Test reservations
        $stmt = $db->query("SELECT COUNT(*) as total_reservations FROM reservations");
        $result = $stmt->fetch();
        echo "Total reservations: " . $result['total_reservations'] . "\n";
        
        // Test AI conversations
        $stmt = $db->query("SELECT COUNT(*) as total_conversations FROM ai_conversations");
        $result = $stmt->fetch();
        echo "Total AI conversations: " . $result['total_conversations'] . "\n";
        
        echo "\n🎉 Database connection and table verification completed!\n";
        echo "Database structure is ready for API testing.\n";
    } else {
        echo "❌ Database connection failed!\n";
    }
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
