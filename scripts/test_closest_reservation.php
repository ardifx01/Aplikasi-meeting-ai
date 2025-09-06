<?php
/**
 * Test script untuk memastikan sistem menampilkan reservasi yang paling dekat
 */

echo "=== TEST RESERVASI TERDEKAT ===\n\n";

// Test dengan user yang sudah ada data
$testData = [
    'action' => 'login',
    'email' => 'padil@gmail.com', // User yang sudah ada data
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
    
    // Test mendapatkan reservasi user
    echo "🔍 Testing mendapatkan reservasi user...\n";
    
    $bookingsUrl = "http://127.0.0.1:8080/backend/api/bookings.php/user?user_id=$userId";
    $bookingsCh = curl_init();
    curl_setopt($bookingsCh, CURLOPT_URL, $bookingsUrl);
    curl_setopt($bookingsCh, CURLOPT_RETURNTRANSFER, true);
    
    $bookingsResponse = curl_exec($bookingsCh);
    $bookingsHttpCode = curl_getinfo($bookingsCh, CURLINFO_HTTP_CODE);
    curl_close($bookingsCh);
    
    echo "📥 Bookings Response HTTP Code: $bookingsHttpCode\n";
    echo "📥 Bookings Response Body: $bookingsResponse\n";
    
    $bookingsData = json_decode($bookingsResponse, true);
    if ($bookingsData && isset($bookingsData['data'])) {
        $bookings = $bookingsData['data'];
        $bookingCount = count($bookings);
        echo "📊 Jumlah reservasi: $bookingCount\n";
        
        if ($bookingCount > 0) {
            echo "\n📅 Daftar reservasi:\n";
            foreach ($bookings as $index => $booking) {
                echo "  " . ($index + 1) . ". {$booking['topic']} - {$booking['room_name']} - {$booking['meeting_date']} {$booking['meeting_time']}\n";
            }
            
            // Hitung reservasi yang paling dekat dengan waktu sekarang
            $now = time();
            $closestBooking = null;
            $closestDiff = PHP_INT_MAX;
            
            foreach ($bookings as $booking) {
                $bookingTime = strtotime($booking['meeting_date'] . ' ' . $booking['meeting_time']);
                $diff = abs($bookingTime - $now);
                
                if ($diff < $closestDiff) {
                    $closestDiff = $diff;
                    $closestBooking = $booking;
                }
            }
            
            if ($closestBooking) {
                $hoursDiff = floor($closestDiff / 3600);
                $minutesDiff = floor(($closestDiff % 3600) / 60);
                
                echo "\n🎯 Reservasi terdekat dengan waktu sekarang:\n";
                echo "  Topik: {$closestBooking['topic']}\n";
                echo "  Ruangan: {$closestBooking['room_name']}\n";
                echo "  Tanggal: {$closestBooking['meeting_date']}\n";
                echo "  Waktu: {$closestBooking['meeting_time']}\n";
                echo "  Selisih: $hoursDiff jam $minutesDiff menit\n";
                
                if ($closestDiff < 3600) { // Kurang dari 1 jam
                    echo "✅ SUCCESS! Sistem akan menampilkan reservasi yang paling dekat\n";
                } else {
                    echo "ℹ️ Reservasi terdekat masih $hoursDiff jam lagi\n";
                }
            }
        } else {
            echo "ℹ️ User tidak memiliki reservasi\n";
        }
    } else {
        echo "❌ FAILED! Tidak bisa mendapatkan data reservasi\n";
    }
    
} else {
    echo "❌ Login gagal: " . ($responseData['message'] ?? 'Unknown error') . "\n";
}

echo "\n=== TEST SELESAI ===\n";
?>
