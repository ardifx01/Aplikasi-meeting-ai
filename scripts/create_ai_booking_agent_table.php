<?php
require_once 'backend/config/database.php';

echo "=== MIGRASI TABEL AI BOOKING ===\n\n";

try {
    $db = new PDO("mysql:host=localhost;dbname=spacio_meeting_db", "root", "");
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "🔗 Database connected successfully\n";
    
    // 1. Hapus tabel lama jika ada
    echo "\n🗑️ Menghapus tabel ai_bookings_success lama...\n";
    $db->exec("DROP TABLE IF EXISTS ai_bookings_success");
    echo "✅ Tabel ai_bookings_success berhasil dihapus\n";
    
    // 2. Hapus tabel ai_booking_agent yang ada jika ada
    echo "\n🗑️ Menghapus tabel ai_booking_agent yang ada...\n";
    $db->exec("DROP TABLE IF EXISTS ai_booking_agent");
    echo "✅ Tabel ai_booking_agent lama berhasil dihapus\n";
    
    // 3. Buat tabel baru ai_booking_agent
    echo "\n🏗️ Membuat tabel ai_booking_agent baru...\n";
    
    $createTableQuery = "
    CREATE TABLE ai_booking_agent (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ai_booking_id INT DEFAULT 0,
        user_id INT NOT NULL,
        session_id VARCHAR(255) NOT NULL,
        room_id INT NOT NULL,
        room_name VARCHAR(255) NOT NULL,
        topic VARCHAR(500) NOT NULL,
        pic VARCHAR(255) DEFAULT '-',
        participants INT NOT NULL,
        meeting_date DATE NOT NULL,
        meeting_time TIME NOT NULL,
        time_display VARCHAR(10) NOT NULL,
        duration INT DEFAULT 60,
        meeting_type ENUM('internal', 'external') DEFAULT 'internal',
        meeting_type_display VARCHAR(50) NOT NULL,
        food_order ENUM('ya', 'tidak') DEFAULT 'tidak',
        food_order_display VARCHAR(100) NOT NULL,
        booking_status ENUM('confirmed', 'cancelled', 'completed') DEFAULT 'confirmed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_session_id (session_id),
        INDEX idx_meeting_date (meeting_date),
        INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ";
    
    $db->exec($createTableQuery);
    echo "✅ Tabel ai_booking_agent berhasil dibuat\n";
    
    // 3. Verifikasi struktur tabel
    echo "\n📋 Verifikasi struktur tabel ai_booking_agent:\n";
    $stmt = $db->query("DESCRIBE ai_booking_agent");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($columns as $column) {
        echo "- {$column['Field']}: {$column['Type']} " . 
             ($column['Null'] === 'NO' ? 'NOT NULL' : 'NULL') . 
             ($column['Default'] ? " DEFAULT {$column['Default']}" : "") . "\n";
    }
    
    echo "\n🎉 MIGRASI BERHASIL!\n";
    echo "Tabel ai_booking_agent siap digunakan untuk menyimpan data pemesanan AI agent.\n";
    
} catch (PDOException $e) {
    echo "\n❌ Database Error: " . $e->getMessage() . "\n";
    echo "Error Code: " . $e->getCode() . "\n";
} catch (Exception $e) {
    echo "\n❌ General Error: " . $e->getMessage() . "\n";
    echo "Error Code: " . $e->getCode() . "\n";
}

echo "\n=== END MIGRATION ===\n";
?>
