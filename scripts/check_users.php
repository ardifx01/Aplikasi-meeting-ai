<?php
/**
 * Script untuk mengecek user yang ada di database
 */

require_once __DIR__ . '/../backend/config/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    echo "=== CEK USER DI DATABASE ===\n\n";
    
    // Get all users
    $stmt = $conn->prepare("SELECT id, username, email, full_name, created_at FROM users ORDER BY id DESC LIMIT 10");
    $stmt->execute();
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "📊 Total users: " . count($users) . "\n\n";
    
    echo "👥 Daftar 10 user terbaru:\n";
    echo "=" . str_repeat("=", 80) . "\n";
    echo sprintf("%-5s %-20s %-30s %-20s %-20s\n", "ID", "Username", "Email", "Full Name", "Created At");
    echo "=" . str_repeat("=", 80) . "\n";
    
    foreach ($users as $user) {
        echo sprintf("%-5s %-20s %-30s %-20s %-20s\n", 
            $user['id'], 
            $user['username'], 
            $user['email'], 
            $user['full_name'],
            $user['created_at']
        );
    }
    
    echo "\n=== SELESAI ===\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
