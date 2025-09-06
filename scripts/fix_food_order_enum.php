<?php
/**
 * Script untuk memperbaiki struktur database agar mendukung nilai food_order ringan dan berat
 */

require_once __DIR__ . '/../config/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    echo "=== PERBAIKAN STRUKTUR DATABASE FOOD_ORDER ===\n\n";
    
    // 1. Perbaiki tabel ai_bookings_success
    echo "🔧 MEMPERBAIKI TABEL ai_bookings_success:\n";
    echo "=" . str_repeat("=", 50) . "\n";
    
    // Ubah food_order dari ENUM ke VARCHAR untuk mendukung ringan/berat
    $alterQuery = "ALTER TABLE ai_bookings_success MODIFY COLUMN food_order VARCHAR(100) DEFAULT 'tidak'";
    $stmt = $conn->prepare($alterQuery);
    $stmt->execute();
    echo "✅ Kolom food_order di ai_bookings_success berhasil diubah ke VARCHAR(100)\n";
    
    // 2. Perbaiki tabel ai_booking_data
    echo "\n🔧 MEMPERBAIKI TABEL ai_booking_data:\n";
    echo "=" . str_repeat("=", 50) . "\n";
    
    // Ubah food_order dari ENUM ke VARCHAR untuk mendukung ringan/berat
    $alterQuery2 = "ALTER TABLE ai_booking_data MODIFY COLUMN food_order VARCHAR(100) DEFAULT 'tidak'";
    $stmt2 = $conn->prepare($alterQuery2);
    $stmt2->execute();
    echo "✅ Kolom food_order di ai_booking_data berhasil diubah ke VARCHAR(100)\n";
    
    // 3. Verifikasi struktur tabel
    echo "\n📋 VERIFIKASI STRUKTUR TABEL:\n";
    echo "=" . str_repeat("=", 50) . "\n";
    
    echo "ai_bookings_success:\n";
    $stmt = $conn->prepare("DESCRIBE ai_bookings_success");
    $stmt->execute();
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($columns as $column) {
        if ($column['Field'] === 'food_order') {
            echo "- {$column['Field']}: {$column['Type']} " . 
                 ($column['Null'] === 'NO' ? 'NOT NULL' : 'NULL') . 
                 ($column['Default'] ? " DEFAULT '{$column['Default']}'" : "") . "\n";
        }
    }
    
    echo "\nai_booking_data:\n";
    $stmt = $conn->prepare("DESCRIBE ai_booking_data");
    $stmt->execute();
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($columns as $column) {
        if ($column['Field'] === 'food_order') {
            echo "- {$column['Field']}: {$column['Type']} " . 
                 ($column['Null'] === 'NO' ? 'NOT NULL' : 'NULL') . 
                 ($column['Default'] ? " DEFAULT '{$column['Default']}'" : "") . "\n";
        }
    }
    
    // 4. Test insert dengan nilai ringan dan berat
    echo "\n🧪 TEST INSERT DENGAN NILAI RINGAN DAN BERAT:\n";
    echo "=" . str_repeat("=", 50) . "\n";
    
    // Test insert ke ai_bookings_success
    $testData = [
        'user_id' => 1,
        'session_id' => 'test_food_' . time(),
        'room_id' => 1,
        'room_name' => 'Test Room',
        'topic' => 'Test Topic',
        'pic' => 'Test PIC',
        'participants' => 5,
        'meeting_date' => '2025-09-10',
        'meeting_time' => '10:00:00',
        'duration' => 60,
        'meeting_type' => 'internal',
        'food_order' => 'ringan'
    ];
    
    require_once __DIR__ . '/../backend/models/AiBookingSuccess.php';
    $aiBookingSuccess = new AiBookingSuccess($conn);
    $result = $aiBookingSuccess->createSuccessBooking($testData);
    
    if ($result) {
        echo "✅ Test insert dengan food_order='ringan' berhasil (ID: $result)\n";
        
        // Hapus data test
        $deleteQuery = "DELETE FROM ai_bookings_success WHERE session_id = :session_id";
        $stmt = $conn->prepare($deleteQuery);
        $stmt->bindParam(':session_id', $testData['session_id']);
        $stmt->execute();
        echo "✅ Data test berhasil dihapus\n";
    } else {
        echo "❌ Test insert gagal\n";
    }
    
    echo "\n🎉 PERBAIKAN STRUKTUR DATABASE SELESAI!\n";
    echo "Sekarang database mendukung nilai food_order: 'tidak', 'ya', 'ringan', 'berat'\n";
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}
?>
