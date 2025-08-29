<?php
require_once __DIR__ . '/../backend/config/database.php';

echo "MySQL Database Tables:\n";
echo "=====================\n";

try {
    $database = new Database();
    $conn = $database->getConnection();
    
    if ($conn) {
        $stmt = $conn->query("SHOW TABLES");
        $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        foreach ($tables as $index => $table) {
            echo ($index + 1) . ". " . $table;
            
            // Get record count
            try {
                $countStmt = $conn->query("SELECT COUNT(*) as count FROM `$table`");
                $count = $countStmt->fetch()['count'];
                echo " ($count records)";
            } catch (Exception $e) {
                echo " (error counting)";
            }
            echo "\n";
        }
        
        echo "\nTotal tables: " . count($tables) . "\n";
        
    } else {
        echo "Failed to connect to MySQL\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>

