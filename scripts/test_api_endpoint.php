<?php
echo "=== TEST API ENDPOINT AI BOOKING AGENT ===\n\n";

// Test data
$testData = [
    'user_id' => 1,
    'session_id' => 'api_test_' . time(),
    'room_id' => 3,
    'room_name' => 'Kalamanthana Meeting Room',
    'topic' => 'rapaat',
    'pic' => 'ril',
    'participants' => 14,
    'meeting_date' => '2025-09-05',
    'meeting_time' => '15:00:00',
    'duration' => 60,
    'meeting_type' => 'external',
    'food_order' => 'berat'
];

echo "📝 Test Data:\n";
print_r($testData);

// Test API endpoint
$url = 'http://127.0.0.1:8080/api/ai/agent-booking.php';
echo "\n🔗 Testing API endpoint: $url\n";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($testData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

echo "\n📤 Sending POST request...\n";

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);

curl_close($ch);

echo "📥 HTTP Response Code: $httpCode\n";

if ($error) {
    echo "❌ cURL Error: $error\n";
} else {
    echo "📥 Response Body:\n";
    echo $response . "\n";
    
    $responseData = json_decode($response, true);
    if ($responseData) {
        echo "\n🔍 Parsed Response:\n";
        print_r($responseData);
        
        if (isset($responseData['success']) && $responseData['success']) {
            echo "\n✅ API Endpoint berfungsi dengan baik!\n";
        } else {
            echo "\n❌ API Endpoint gagal: " . ($responseData['error'] ?? 'Unknown error') . "\n";
        }
    } else {
        echo "\n❌ Failed to parse JSON response\n";
    }
}

echo "\n=== END TEST ===\n";
?>





