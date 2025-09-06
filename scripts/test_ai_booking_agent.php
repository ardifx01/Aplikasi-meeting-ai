<?php
require_once 'backend/config/database.php';
require_once 'backend/models/AiBookingAgent.php';

echo "=== TEST AI BOOKING AGENT API ===\n\n";

// Simulate user input data from the screenshot
$userInputData = [
    'user_id' => 1,
    'session_id' => 'test_session_' . time(),
    'room_id' => 3, // Kalamanthana Meeting Room
    'room_name' => 'Kalamanthana Meeting Room',
    'topic' => 'rapaat',
    'pic' => 'ril',
    'participants' => 14,
    'meeting_date' => '2025-09-05', // Friday, 5 September 2025
    'meeting_time' => '15:00:00', // User input: 15:00
    'duration' => 60,
    'meeting_type' => 'external', // User input: eksternal
    'food_order' => 'berat' // User input: berat
];

echo "📝 User Input Data (from screenshot):\n";
print_r($userInputData);

// Test direct database insert
try {
    $db = new PDO("mysql:host=localhost;dbname=spacio_meeting_db", "root", "");
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "\n🔗 Database connected successfully\n";
    
    $aiBookingAgent = new AiBookingAgent($db);
    echo "📦 AiBookingAgent model loaded\n";
    
    $result = $aiBookingAgent->createAgentBooking($userInputData);
    
    if ($result) {
        echo "\n✅ SUCCESS: Data berhasil disimpan dengan ID: $result\n\n";
        
        // Retrieve the data to verify
        $stmt = $db->prepare("SELECT * FROM ai_booking_agent WHERE id = ?");
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
            echo "Time Display: " . ($retrievedData['time_display'] === '15:00' ? "✅" : "❌") . " Expected: 15:00, Got: {$retrievedData['time_display']}\n";
            echo "Meeting Type: " . ($retrievedData['meeting_type'] === $userInputData['meeting_type'] ? "✅" : "❌") . " Expected: {$userInputData['meeting_type']}, Got: {$retrievedData['meeting_type']}\n";
            echo "Meeting Type Display: " . ($retrievedData['meeting_type_display'] === 'External' ? "✅" : "❌") . " Expected: External, Got: {$retrievedData['meeting_type_display']}\n";
            echo "Food Order: " . ($retrievedData['food_order'] === 'ya' ? "✅" : "❌") . " Expected: ya (converted from berat), Got: {$retrievedData['food_order']}\n";
            echo "Food Order Display: " . ($retrievedData['food_order_display'] === 'Makanan Berat' ? "✅" : "❌") . " Expected: Makanan Berat, Got: {$retrievedData['food_order_display']}\n";
            
            echo "\n🎯 KEY VERIFICATION:\n";
            echo "Time Display: " . ($retrievedData['time_display'] === '15:00' ? "✅ CORRECT" : "❌ WRONG - Should be 15:00, not 09:00") . "\n";
            echo "Meeting Type Display: " . ($retrievedData['meeting_type_display'] === 'External' ? "✅ CORRECT" : "❌ WRONG - Should be External, not Internal") . "\n";
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





