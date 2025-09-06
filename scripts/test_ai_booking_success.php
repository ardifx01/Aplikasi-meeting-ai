<?php
/**
 * Test script untuk endpoint ai-booking-success
 */

require_once 'backend/config/database.php';
require_once 'backend/models/AiBookingSuccess.php';

echo "=== TEST AI BOOKING SUCCESS ENDPOINT ===\n\n";

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $aiBookingSuccess = new AiBookingSuccess($db);
    
    // Test data
    $testData = [
        'user_id' => 1,
        'session_id' => 'test_' . time(),
        'room_id' => 1,
        'room_name' => 'Test Room',
        'topic' => 'Test Booking',
        'pic' => 'Test PIC',
        'participants' => 5,
        'meeting_date' => '2025-09-06',
        'meeting_time' => '10:00:00',
        'duration' => 60,
        'meeting_type' => 'internal',
        'food_order' => 'tidak'
    ];
    
    echo "📝 Test Data:\n";
    print_r($testData);
    echo "\n";
    
    // Test insert
    $result = $aiBookingSuccess->createSuccessBooking($testData);
    
    if ($result) {
        echo "✅ SUCCESS: Data berhasil disimpan dengan ID: $result\n\n";
        
        // Test get by session_id
        $retrieved = $aiBookingSuccess->getSuccessBookingBySessionId($testData['session_id']);
        if ($retrieved) {
            echo "📋 Retrieved Data:\n";
            print_r($retrieved);
        } else {
            echo "❌ Failed to retrieve data\n";
        }
    } else {
        echo "❌ FAILED: Gagal menyimpan data\n";
    }
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}

echo "\n=== END TEST ===\n";
?>
