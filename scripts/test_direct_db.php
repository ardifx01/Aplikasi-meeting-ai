<?php
require_once 'backend/config/database.php';
require_once 'backend/models/AiBookingSuccess.php';

echo "=== TEST DIRECT DATABASE INSERT ===\n\n";

// Simulate user input data
$userInputData = [
    'user_id' => 1,
    'session_id' => 'direct_test_' . time(),
    'room_id' => 2, // Nusantara Conference Room
    'room_name' => 'Nusantara Conference Room',
    'topic' => 'Rapat Tim Marketing',
    'pic' => 'Budi Santoso',
    'participants' => 15,
    'meeting_date' => '2025-09-08',
    'meeting_time' => '14:30:00', // User input: 14:30
    'duration' => 60,
    'meeting_type' => 'internal', // User input: internal
    'food_order' => 'ringan' // User input: makanan ringan
];

echo "📝 User Input Data:\n";
print_r($userInputData);

// Test direct database insert
try {
    $db = new PDO("mysql:host=localhost;dbname=spacio_meeting_db", "root", "");
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "\n🔗 Database connected successfully\n";
    
    $aiBookingSuccess = new AiBookingSuccess($db);
    echo "📦 AiBookingSuccess model loaded\n";
    
    $result = $aiBookingSuccess->createSuccessBooking($userInputData);
    
    if ($result) {
        echo "\n✅ SUCCESS: Data berhasil disimpan dengan ID: $result\n\n";
        
        // Retrieve the data to verify
        $stmt = $db->prepare("SELECT * FROM ai_bookings_success WHERE id = ?");
        $stmt->execute([$result]);
        $retrievedData = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($retrievedData) {
            echo "📋 Retrieved Data:\n";
            print_r($retrievedData);
            
            // Verify data matches user input
            echo "\n🔍 Data Verification:\n";
            echo "Room Name: " . ($retrievedData['room_name'] === $userInputData['room_name'] ? "✅" : "❌") . " Expected: {$userInputData['room_name']}, Got: {$retrievedData['room_name']}\n";
            echo "Topic: " . ($retrievedData['topic'] === $userInputData['topic'] ? "✅" : "❌") . " Expected: {$userInputData['topic']}, Got: {$retrievedData['topic']}\n";
            echo "PIC: " . ($retrievedData['pic'] === $userInputData['pic'] ? "✅" : "❌") . " Expected: {$userInputData['pic']}, Got: {$retrievedData['pic']}\n";
            echo "Participants: " . ($retrievedData['participants'] == $userInputData['participants'] ? "✅" : "❌") . " Expected: {$userInputData['participants']}, Got: {$retrievedData['participants']}\n";
            echo "Meeting Date: " . ($retrievedData['meeting_date'] === $userInputData['meeting_date'] ? "✅" : "❌") . " Expected: {$userInputData['meeting_date']}, Got: {$retrievedData['meeting_date']}\n";
            echo "Meeting Time: " . ($retrievedData['meeting_time'] === $userInputData['meeting_time'] ? "✅" : "❌") . " Expected: {$userInputData['meeting_time']}, Got: {$retrievedData['meeting_time']}\n";
            echo "Time Display: " . ($retrievedData['time_display'] === '14:30' ? "✅" : "❌") . " Expected: 14:30, Got: {$retrievedData['time_display']}\n";
            echo "Meeting Type: " . ($retrievedData['meeting_type'] === $userInputData['meeting_type'] ? "✅" : "❌") . " Expected: {$userInputData['meeting_type']}, Got: {$retrievedData['meeting_type']}\n";
            echo "Meeting Type Display: " . ($retrievedData['meeting_type_display'] === 'Internal' ? "✅" : "❌") . " Expected: Internal, Got: {$retrievedData['meeting_type_display']}\n";
            echo "Food Order: " . ($retrievedData['food_order'] === $userInputData['food_order'] ? "✅" : "❌") . " Expected: {$userInputData['food_order']}, Got: {$retrievedData['food_order']}\n";
            echo "Food Order Display: " . ($retrievedData['food_order_display'] === 'Makanan Ringan' ? "✅" : "❌") . " Expected: Makanan Ringan, Got: {$retrievedData['food_order_display']}\n";
        }
    } else {
        echo "\n❌ FAILED: Gagal menyimpan data ke database\n";
    }
    
} catch (PDOException $e) {
    echo "\n❌ Database Error: " . $e->getMessage() . "\n";
    echo "Error Code: " . $e->getCode() . "\n";
} catch (Exception $e) {
    echo "\n❌ General Error: " . $e->getMessage() . "\n";
    echo "Error Code: " . $e->getCode() . "\n";
}

echo "\n=== END TEST ===\n";
?>
