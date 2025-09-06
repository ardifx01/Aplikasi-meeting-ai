<?php
/**
 * Script untuk membuat tabel users jika belum ada
 */

require_once __DIR__ . '/../backend/config/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    echo "=== MEMBUAT TABEL USERS ===\n\n";
    
    // SQL untuk membuat tabel users
    $sql = "CREATE TABLE IF NOT EXISTS users (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        username VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NULL,
        first_name VARCHAR(100) NULL,
        last_name VARCHAR(100) NULL,
        phone VARCHAR(50) NULL,
        bio TEXT NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        login_count INT UNSIGNED NOT NULL DEFAULT 0,
        last_login DATETIME NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uniq_username (username),
        UNIQUE KEY uniq_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    
    echo "✅ Tabel users berhasil dibuat!\n\n";
    
    // Cek struktur tabel
    echo "📋 STRUKTUR TABEL USERS:\n";
    echo "=" . str_repeat("=", 50) . "\n";
    $stmt = $conn->prepare("DESCRIBE users");
    $stmt->execute();
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($columns as $column) {
        echo "  {$column['Field']}: {$column['Type']}";
        if ($column['Key'] === 'PRI') echo " [PRI]";
        if ($column['Null'] === 'NO') echo " (NOT NULL)";
        if ($column['Null'] === 'YES') echo " (NULL)";
        echo "\n";
    }
    
    // Cek apakah ada user sample
    $stmt = $conn->prepare("SELECT COUNT(*) as count FROM users");
    $stmt->execute();
    $result = $stmt->fetch();
    
    echo "\n📊 Total users: " . $result['count'] . "\n";
    
    if ($result['count'] == 0) {
        echo "\n🔧 Membuat user sample...\n";
        
        // Buat user sample
        $sampleUser = [
            'username' => 'admin',
            'email' => 'admin@spacio.com',
            'password' => password_hash('admin123', PASSWORD_DEFAULT),
            'full_name' => 'Administrator Spacio',
            'first_name' => 'Admin',
            'last_name' => 'Spacio'
        ];
        
        $stmt = $conn->prepare("
            INSERT INTO users (username, email, password, full_name, first_name, last_name) 
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $sampleUser['username'],
            $sampleUser['email'],
            $sampleUser['password'],
            $sampleUser['full_name'],
            $sampleUser['first_name'],
            $sampleUser['last_name']
        ]);
        
        echo "✅ User sample berhasil dibuat!\n";
        echo "   Username: admin\n";
        echo "   Email: admin@spacio.com\n";
        echo "   Password: admin123\n";
    }
    
    echo "\n=== SELESAI ===\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>

