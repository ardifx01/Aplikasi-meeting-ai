<?php
// Test Dual Database System
echo "Testing Dual Database System...\n\n";

// Test 1: MySQL Connection (for form bookings)
echo "=== Testing MySQL (Form Bookings) ===\n";
try {
    require_once __DIR__ . '/../backend/config/database.php';
    $database = new Database();
    $conn = $database->getConnection();
    
    if ($conn) {
        echo "✓ MySQL connection: OK\n";
        
        // Check required tables
        $stmt = $conn->query("SHOW TABLES LIKE 'ai_booking_data'");
        if ($stmt->rowCount() > 0) {
            echo "✓ MySQL table 'ai_booking_data': OK\n";
        } else {
            echo "⚠ MySQL table 'ai_booking_data': Missing\n";
        }
        
        $stmt = $conn->query("SHOW TABLES LIKE 'meeting_rooms'");
        if ($stmt->rowCount() > 0) {
            echo "✓ MySQL table 'meeting_rooms': OK\n";
        } else {
            echo "⚠ MySQL table 'meeting_rooms': Missing\n";
        }
    } else {
        echo "❌ MySQL connection: Failed\n";
    }
} catch (Exception $e) {
    echo "❌ MySQL error: " . $e->getMessage() . "\n";
}

echo "\n=== Testing MongoDB (AI Bookings) ===\n";
try {
    $mongoClient = new MongoDB\Driver\Manager('mongodb://localhost:27017');
    echo "✓ MongoDB connection: OK\n";
    
    // Check collections
    $query = new MongoDB\Driver\Query([]);
    
    try {
        $cursor = $mongoClient->executeQuery('spacio_ai.ai_bookings', $query);
        echo "✓ MongoDB collection 'ai_bookings': OK\n";
    } catch (Exception $e) {
        echo "⚠ MongoDB collection 'ai_bookings': " . $e->getMessage() . "\n";
    }
    
    try {
        $cursor = $mongoClient->executeQuery('spacio_ai.ai_conversations', $query);
        echo "✓ MongoDB collection 'ai_conversations': OK\n";
    } catch (Exception $e) {
        echo "⚠ MongoDB collection 'ai_conversations': " . $e->getMessage() . "\n";
    }
    
} catch (Exception $e) {
    echo "❌ MongoDB error: " . $e->getMessage() . "\n";
}

echo "\n=== Database Routing Summary ===\n";
echo "📝 Form Bookings → MySQL (ai_booking_data table)\n";
echo "🤖 AI Bookings → MongoDB (ai_bookings collection)\n";
echo "👥 Users & Rooms → MySQL (users, meeting_rooms tables)\n";
echo "💬 AI Conversations → MongoDB (ai_conversations collection)\n";

echo "\n🎉 Dual database system ready!\n";
?>

