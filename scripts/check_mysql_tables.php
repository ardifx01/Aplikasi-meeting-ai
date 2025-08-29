<?php
// Check MySQL Database Tables and Structure
require_once __DIR__ . '/../backend/config/database.php';

echo "=== CHECKING MySQL DATABASE ===\n\n";

try {
    $database = new Database();
    $conn = $database->getConnection();
    
    if (!$conn) {
        echo "❌ Failed to connect to MySQL database\n";
        exit;
    }
    
    echo "✅ MySQL Connection: SUCCESS\n";
    echo "📊 Database: spacio_meeting_db\n\n";
    
    // Get all tables
    $stmt = $conn->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo "📋 AVAILABLE TABLES (" . count($tables) . " total):\n";
    echo str_repeat("=", 50) . "\n";
    
    foreach ($tables as $index => $table) {
        echo ($index + 1) . ". " . $table . "\n";
    }
    
    echo "\n" . str_repeat("=", 50) . "\n";
    
    // Check each table structure and row count
    echo "📊 TABLE DETAILS:\n";
    echo str_repeat("=", 50) . "\n";
    
    foreach ($tables as $table) {
        echo "\n🔸 TABLE: $table\n";
        
        // Get row count
        try {
            $countStmt = $conn->query("SELECT COUNT(*) as count FROM `$table`");
            $count = $countStmt->fetch()['count'];
            echo "   📊 Records: $count\n";
        } catch (Exception $e) {
            echo "   ⚠️ Could not count records: " . $e->getMessage() . "\n";
        }
        
        // Get table structure
        try {
            $structStmt = $conn->query("DESCRIBE `$table`");
            $columns = $structStmt->fetchAll();
            echo "   📋 Columns (" . count($columns) . "):\n";
            
            foreach ($columns as $column) {
                $key = $column['Key'] ? " [{$column['Key']}]" : "";
                $null = $column['Null'] === 'YES' ? " (NULL)" : " (NOT NULL)";
                echo "      - {$column['Field']}: {$column['Type']}$key$null\n";
            }
        } catch (Exception $e) {
            echo "   ⚠️ Could not get structure: " . $e->getMessage() . "\n";
        }
    }
    
    // Check specific important tables
    echo "\n" . str_repeat("=", 50) . "\n";
    echo "🎯 IMPORTANT TABLES CHECK:\n";
    echo str_repeat("=", 50) . "\n";
    
    $importantTables = [
        'users' => 'User accounts',
        'meeting_rooms' => 'Available rooms',
        'ai_booking_data' => 'Form bookings',
        'ai_conversations' => 'AI chat logs',
        'reservations' => 'General reservations'
    ];
    
    foreach ($importantTables as $table => $description) {
        if (in_array($table, $tables)) {
            $countStmt = $conn->query("SELECT COUNT(*) as count FROM `$table`");
            $count = $countStmt->fetch()['count'];
            echo "✅ $table ($description): $count records\n";
        } else {
            echo "❌ $table ($description): NOT FOUND\n";
        }
    }
    
    echo "\n🎉 MySQL Database check completed!\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "\n🔧 Troubleshooting:\n";
    echo "1. Check if MySQL service is running in Laragon\n";
    echo "2. Verify database name: spacio_meeting_db\n";
    echo "3. Check credentials: root/(empty password)\n";
}
?>

