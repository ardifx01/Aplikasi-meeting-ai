<?php
/**
 * Test script untuk memverifikasi penyimpanan data booking AI
 */

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "=== TEST PENYIMPANAN DATA BOOKING AI ===\n\n";

try {
    echo "🔍 Mencoba load database config...\n";
    require_once __DIR__ . '/../backend/config/database.php';
    echo "✅ Database config loaded\n";
    
    echo "🔍 Mencoba load AiBookingSuccess model...\n";
    require_once __DIR__ . '/../backend/models/AiBookingSuccess.php';
    echo "✅ AiBookingSuccess model loaded\n";
    
    $database = new Database();
    $db = $database->getConnection();
    echo "✅ Database connection established\n";
    
    $aiBookingSuccess = new AiBookingSuccess($db);
    echo "✅ AiBookingSuccess instance created\n";
    
    // Data test
    $testData = [
        'user_id' => 1,
        'session_id' => 'ai_test_' . time(),
        'room_id' => 1,
        'room_name' => 'Ruang Meeting A',
        'topic' => 'Test Rapat AI',
        'pic' => 'John Doe',
        'participants' => 5,
        'meeting_date' => date('Y-m-d'),
        'meeting_time' => '14:00:00',
        'duration' => 60,
        'meeting_type' => 'internal',
        'food_order' => 'tidak'
    ];
    
    echo "📊 Data yang akan disimpan:\n";
    print_r($testData);
    echo "\n";
    
    // Coba simpan data
    echo "🔄 Mencoba menyimpan data...\n";
    $result = $aiBookingSuccess->createSuccessBooking($testData);
    
    if ($result) {
        echo "✅ Berhasil menyimpan data booking AI!\n";
        echo "📋 ID booking: " . $result . "\n";
        
        // Verifikasi data tersimpan
        echo "🔍 Memverifikasi data tersimpan...\n";
        $savedData = $aiBookingSuccess->getSuccessBookingBySessionId($testData['session_id']);
        if ($savedData) {
            echo "✅ Data berhasil diverifikasi tersimpan:\n";
            print_r($savedData);
        } else {
            echo "❌ Data tidak ditemukan setelah penyimpanan\n";
        }
    } else {
        echo "❌ Gagal menyimpan data booking AI\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
} catch (Error $e) {
    echo "❌ Fatal Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}

echo "\n=== SELESAI ===\n";
?>
