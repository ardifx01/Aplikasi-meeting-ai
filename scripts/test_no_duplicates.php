<?php
/**
 * Test script untuk memastikan tidak ada duplikasi reservasi
 */

echo "=== TEST TIDAK ADA DUPLIKASI ===\n\n";

// Test dengan user yang sudah ada data
$testData = [
    'action' => 'login',
    'email' => 'padil@gmail.com',
    'password' => 'password123'
];

echo "📝 Test data:\n";
foreach ($testData as $key => $value) {
    echo "  $key: $value\n";
}
echo "\n";

// Make API request untuk login
$url = 'http://127.0.0.1:8080/api/auth/login.php';
$data = json_encode($testData);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

echo "🔐 Testing login...\n";
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "📥 Response HTTP Code: $httpCode\n";
echo "📥 Response Body: $response\n";

$responseData = json_decode($response, true);
if ($responseData && $responseData['success']) {
    $userId = $responseData['data']['user']['id'];
    echo "✅ Login berhasil!\n";
    echo "👤 User ID: $userId\n\n";
    
    // Test mendapatkan AI bookings user
    echo "🔍 Testing mendapatkan AI bookings user...\n";
    
    $aiBookingsUrl = "http://127.0.0.1:8080/backend/api/bookings.php/ai-success?user_id=$userId";
    $aiBookingsCh = curl_init();
    curl_setopt($aiBookingsCh, CURLOPT_URL, $aiBookingsUrl);
    curl_setopt($aiBookingsCh, CURLOPT_RETURNTRANSFER, true);
    
    $aiBookingsResponse = curl_exec($aiBookingsCh);
    $aiBookingsHttpCode = curl_getinfo($aiBookingsCh, CURLINFO_HTTP_CODE);
    curl_close($aiBookingsCh);
    
    echo "📥 AI Bookings Response HTTP Code: $aiBookingsHttpCode\n";
    echo "📥 AI Bookings Response Body: $aiBookingsResponse\n";
    
    $aiBookingsData = json_decode($aiBookingsResponse, true);
    if ($aiBookingsData && isset($aiBookingsData['data'])) {
        $aiBookings = $aiBookingsData['data'];
        $aiBookingCount = count($aiBookings);
        echo "📊 Jumlah AI reservasi: $aiBookingCount\n";
        
        if ($aiBookingCount > 0) {
            echo "\n📅 Daftar AI reservasi:\n";
            $seenTopics = [];
            $duplicates = [];
            
            foreach ($aiBookings as $index => $booking) {
                $topicKey = $booking['topic'] . '|' . $booking['room_name'] . '|' . $booking['meeting_date'] . '|' . $booking['meeting_time'];
                
                if (in_array($topicKey, $seenTopics)) {
                    $duplicates[] = $booking;
                    echo "  ❌ DUPLICATE: " . ($index + 1) . ". ID: {$booking['id']} - {$booking['topic']} - {$booking['room_name']} - {$booking['meeting_date']} {$booking['meeting_time']}\n";
                } else {
                    $seenTopics[] = $topicKey;
                    echo "  ✅ UNIQUE: " . ($index + 1) . ". ID: {$booking['id']} - {$booking['topic']} - {$booking['room_name']} - {$booking['meeting_date']} {$booking['meeting_time']}\n";
                }
            }
            
            if (count($duplicates) > 0) {
                echo "\n❌ FAILED! Ditemukan " . count($duplicates) . " duplikasi dalam AI bookings\n";
            } else {
                echo "\n✅ SUCCESS! Tidak ada duplikasi dalam AI bookings\n";
            }
        } else {
            echo "ℹ️ User tidak memiliki AI reservasi\n";
        }
    } else {
        echo "❌ FAILED! Tidak bisa mendapatkan data AI reservasi\n";
    }
    
    // Test mendapatkan form bookings user
    echo "\n🔍 Testing mendapatkan form bookings user...\n";
    
    $formBookingsUrl = "http://127.0.0.1:8080/backend/api/bookings.php/user?user_id=$userId";
    $formBookingsCh = curl_init();
    curl_setopt($formBookingsCh, CURLOPT_URL, $formBookingsUrl);
    curl_setopt($formBookingsCh, CURLOPT_RETURNTRANSFER, true);
    
    $formBookingsResponse = curl_exec($formBookingsCh);
    $formBookingsHttpCode = curl_getinfo($formBookingsCh, CURLINFO_HTTP_CODE);
    curl_close($formBookingsCh);
    
    echo "📥 Form Bookings Response HTTP Code: $formBookingsHttpCode\n";
    echo "📥 Form Bookings Response Body: $formBookingsResponse\n";
    
    $formBookingsData = json_decode($formBookingsResponse, true);
    if ($formBookingsData && isset($formBookingsData['data'])) {
        $formBookings = $formBookingsData['data'];
        $formBookingCount = count($formBookings);
        echo "📊 Jumlah form reservasi: $formBookingCount\n";
        
        if ($formBookingCount > 0) {
            echo "\n📅 Daftar form reservasi:\n";
            $seenTopics = [];
            $duplicates = [];
            
            foreach ($formBookings as $index => $booking) {
                $topicKey = $booking['topic'] . '|' . $booking['room_name'] . '|' . $booking['meeting_date'] . '|' . $booking['meeting_time'];
                
                if (in_array($topicKey, $seenTopics)) {
                    $duplicates[] = $booking;
                    echo "  ❌ DUPLICATE: " . ($index + 1) . ". ID: {$booking['id']} - {$booking['topic']} - {$booking['room_name']} - {$booking['meeting_date']} {$booking['meeting_time']}\n";
                } else {
                    $seenTopics[] = $topicKey;
                    echo "  ✅ UNIQUE: " . ($index + 1) . ". ID: {$booking['id']} - {$booking['topic']} - {$booking['room_name']} - {$booking['meeting_date']} {$booking['meeting_time']}\n";
                }
            }
            
            if (count($duplicates) > 0) {
                echo "\n❌ FAILED! Ditemukan " . count($duplicates) . " duplikasi dalam form bookings\n";
            } else {
                echo "\n✅ SUCCESS! Tidak ada duplikasi dalam form bookings\n";
            }
        } else {
            echo "ℹ️ User tidak memiliki form reservasi\n";
        }
    } else {
        echo "❌ FAILED! Tidak bisa mendapatkan data form reservasi\n";
    }
    
} else {
    echo "❌ Login gagal: " . ($responseData['message'] ?? 'Unknown error') . "\n";
}

echo "\n=== TEST SELESAI ===\n";
?>

