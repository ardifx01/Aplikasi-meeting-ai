<?php
require_once __DIR__ . '/../backend/config/database.php';

echo "=== CHECKING TABLE STRUCTURES ===\n\n";

try {
    $database = new Database();
    $conn = $database->getConnection();
    
    if (!$conn) {
        echo "Failed to connect to MySQL\n";
        exit;
    }
    
    $tables = ['meeting_rooms', 'ai_booking_data', 'users'];
    
    foreach ($tables as $table) {
        echo "📋 TABLE: $table\n";
        echo str_repeat("-", 50) . "\n";
        
        $stmt = $conn->query("DESCRIBE `$table`");
        while ($row = $stmt->fetch()) {
            $key = $row['Key'] ? " [{$row['Key']}]" : "";
            $null = $row['Null'] === 'YES' ? " (NULL)" : " (NOT NULL)";
            echo "  {$row['Field']}: {$row['Type']}$key$null\n";
        }
        echo "\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>