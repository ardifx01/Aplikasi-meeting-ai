<?php
require_once __DIR__ . '/../config/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    $stmt = $conn->prepare('SELECT COUNT(*) FROM ai_booking_data');
    $stmt->execute();
    
    echo 'Total bookings remaining: ' . $stmt->fetchColumn() . PHP_EOL;
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
