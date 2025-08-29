<?php
require_once __DIR__ . '/../config/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    echo "=== CHECKING USERS TABLE ===\n";
    
    // Check if users table exists
    $stmt = $conn->prepare("SHOW TABLES LIKE 'users'");
    $stmt->execute();
    $tableExists = $stmt->fetch();
    
    if (!$tableExists) {
        echo "❌ Table 'users' does not exist!\n";
        exit(1);
    }
    
    echo "✅ Table 'users' exists\n\n";
    
    // Get all users
    $stmt = $conn->prepare("SELECT id, username, email, created_at FROM users ORDER BY id");
    $stmt->execute();
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($users)) {
        echo "❌ No users found in the table!\n";
        echo "You need to create a user first.\n\n";
        
        // Create a test user
        echo "Creating a test user...\n";
        $stmt = $conn->prepare("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)");
        $stmt->execute(['testuser', 'test@example.com', password_hash('password123', PASSWORD_DEFAULT)]);
        
        $newUserId = $conn->lastInsertId();
        echo "✅ Created user with ID: $newUserId\n";
        
        // Get users again
        $stmt = $conn->prepare("SELECT id, username, email, created_at FROM users ORDER BY id");
        $stmt->execute();
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    echo "Available users:\n";
    foreach ($users as $user) {
        echo "- ID: {$user['id']}, Username: {$user['username']}, Email: {$user['email']}\n";
    }
    
    echo "\n=== RECOMMENDATION ===\n";
    if (!empty($users)) {
        $firstUser = $users[0];
        echo "Use user_id: {$firstUser['id']} in your Postman request\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
