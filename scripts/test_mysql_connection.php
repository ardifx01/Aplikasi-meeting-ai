<?php
// Test MySQL Connection
require_once __DIR__ . '/../backend/config/database.php';

echo "Testing MySQL connection...\n";

try {
    $database = new Database();
    $conn = $database->getConnection();
    
    if ($conn) {
        echo "✓ MySQL connection established\n";
        
        // Test query
        $stmt = $conn->query("SHOW TABLES");
        $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        echo "✓ Available tables:\n";
        foreach ($tables as $table) {
            echo "  - $table\n";
        }
        
        // Test specific tables
        $requiredTables = ['meeting_rooms', 'ai_booking_data', 'users'];
        foreach ($requiredTables as $table) {
            if (in_array($table, $tables)) {
                echo "✓ Table '$table' exists\n";
            } else {
                echo "⚠ Table '$table' missing\n";
            }
        }
        
        echo "\n🎉 MySQL connection test PASSED!\n";
        
    } else {
        echo "❌ Failed to establish MySQL connection\n";
    }
    
} catch (Exception $e) {
    echo "❌ MySQL connection test FAILED!\n";
    echo "Error: " . $e->getMessage() . "\n";
    echo "\nTroubleshooting:\n";
    echo "1. Make sure MySQL service is running in Laragon\n";
    echo "2. Check database name: spacio_meeting_db\n";
    echo "3. Verify username/password: root/(empty)\n";
}
?>

