<?php
/**
 * Test script untuk memverifikasi koneksi frontend-backend AI booking
 */

echo "=== TEST KONEKSI FRONTEND-BACKEND AI BOOKING ===\n\n";

// Test data yang akan dikirim dari frontend
$testData = [
    'user_id' => 1,
    'session_id' => 'ai_frontend_test_' . time(),
    'room_id' => 1,
    'topic' => 'Test Rapat dari Frontend',
    'meeting_date' => date('Y-m-d'),
    'meeting_time' => '16:00:00',
    'duration' => 60,
    'participants' => 3,
    'meeting_type' => 'internal',
    'food_order' => 'tidak',
    'pic' => 'Test User'
];

echo "📊 Data test yang akan dikirim:\n";
print_r($testData);
echo "\n";

// Simulasi request dari frontend ke backend
$url = 'http://localhost:8080/backend/api/bookings.php/ai-booking';
$data = json_encode($testData);

echo "🌐 Mengirim request ke: " . $url . "\n";
echo "📤 Data yang dikirim: " . $data . "\n\n";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Content-Length: ' . strlen($data)
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "📥 Response HTTP Code: " . $httpCode . "\n";

if ($error) {
    echo "❌ cURL Error: " . $error . "\n";
} else {
    echo "✅ Response dari backend:\n";
    echo $response . "\n";
    
    // Parse response
    $responseData = json_decode($response, true);
    if ($responseData) {
        if (isset($responseData['status']) && $responseData['status'] === 'success') {
            echo "✅ Booking berhasil dibuat!\n";
            if (isset($responseData['success_booking_id'])) {
                echo "📋 ID Booking Success: " . $responseData['success_booking_id'] . "\n";
            }
        } else {
            echo "❌ Booking gagal: " . ($responseData['message'] ?? 'Unknown error') . "\n";
        }
    } else {
        echo "❌ Response tidak valid JSON\n";
    }
}

echo "\n=== SELESAI ===\n";
?>
