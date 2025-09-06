<?php
/**
 * Test script final untuk memastikan AI booking delete bekerja dengan baik
 */

echo "=== TEST AI BOOKING DELETE FINAL ===\n\n";

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
            foreach ($aiBookings as $index => $booking) {
                echo "  " . ($index + 1) . ". ID: {$booking['id']} - {$booking['topic']} - {$booking['room_name']} - {$booking['meeting_date']} {$booking['meeting_time']}\n";
            }
            
            // Test delete AI booking pertama
            $firstBooking = $aiBookings[0];
            $bookingId = $firstBooking['id'];
            
            echo "\n🗑️ Testing delete AI booking dengan ID: $bookingId\n";
            
            $deleteUrl = "http://127.0.0.1:8080/backend/api/bookings.php/ai-cancel?id=$bookingId";
            $deleteCh = curl_init();
            curl_setopt($deleteCh, CURLOPT_URL, $deleteUrl);
            curl_setopt($deleteCh, CURLOPT_CUSTOMREQUEST, 'DELETE');
            curl_setopt($deleteCh, CURLOPT_RETURNTRANSFER, true);
            
            $deleteResponse = curl_exec($deleteCh);
            $deleteHttpCode = curl_getinfo($deleteCh, CURLINFO_HTTP_CODE);
            curl_close($deleteCh);
            
            echo "📥 Delete Response HTTP Code: $deleteHttpCode\n";
            echo "📥 Delete Response Body: $deleteResponse\n";
            
            $deleteData = json_decode($deleteResponse, true);
            if ($deleteData && $deleteData['status'] === 'success') {
                echo "✅ SUCCESS! AI booking berhasil dihapus\n";
                
                // Verifikasi bahwa booking sudah dihapus
                echo "\n🔍 Verifikasi bahwa booking sudah dihapus...\n";
                
                $verifyCh = curl_init();
                curl_setopt($verifyCh, CURLOPT_URL, $aiBookingsUrl);
                curl_setopt($verifyCh, CURLOPT_RETURNTRANSFER, true);
                
                $verifyResponse = curl_exec($verifyCh);
                $verifyHttpCode = curl_getinfo($verifyCh, CURLINFO_HTTP_CODE);
                curl_close($verifyCh);
                
                $verifyData = json_decode($verifyResponse, true);
                if ($verifyData && isset($verifyData['data'])) {
                    $newAiBookings = $verifyData['data'];
                    $newAiBookingCount = count($newAiBookings);
                    echo "📊 Jumlah AI reservasi setelah delete: $newAiBookingCount\n";
                    
                    if ($newAiBookingCount < $aiBookingCount) {
                        echo "✅ SUCCESS! Jumlah reservasi berkurang, delete berhasil\n";
                        echo "🎉 SEMUA TEST BERHASIL! AI booking delete berfungsi dengan baik\n";
                    } else {
                        echo "❌ FAILED! Jumlah reservasi tidak berkurang\n";
                    }
                } else {
                    echo "❌ FAILED! Tidak bisa verifikasi hasil delete\n";
                }
                
            } else {
                echo "❌ FAILED! Gagal menghapus AI booking\n";
                if ($deleteData) {
                    echo "Error message: " . ($deleteData['message'] ?? 'Unknown error') . "\n";
                }
            }
        } else {
            echo "ℹ️ User tidak memiliki AI reservasi\n";
            echo "✅ TEST BERHASIL! Tidak ada AI reservasi untuk dihapus\n";
        }
    } else {
        echo "❌ FAILED! Tidak bisa mendapatkan data AI reservasi\n";
    }
    
} else {
    echo "❌ Login gagal: " . ($responseData['message'] ?? 'Unknown error') . "\n";
}

echo "\n=== TEST SELESAI ===\n";
?>

