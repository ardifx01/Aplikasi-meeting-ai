<?php
/**
 * Test script untuk memastikan user baru mendapatkan dashboard kosong
 */

echo "=== TEST USER BARU DASHBOARD KOSONG ===\n\n";

// Test data untuk user baru
$testData = [
    'action' => 'register',
    'username' => 'newuser' . time(), // Unique username
    'email' => 'newuser' . time() . '@example.com', // Unique email
    'password' => 'password123',
    'full_name' => 'New User Test'
];

echo "📝 Test data untuk user baru:\n";
foreach ($testData as $key => $value) {
    echo "  $key: $value\n";
}
echo "\n";

// Make API request untuk register
$url = 'http://127.0.0.1:8080/api/auth/register.php';
$data = json_encode($testData);

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

echo "🌐 Registering new user...\n";
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "📥 Response HTTP Code: $httpCode\n";
echo "📥 Response Body: $response\n";

$responseData = json_decode($response, true);
if ($responseData && $responseData['success']) {
    $userId = $responseData['user']['id'];
    $email = $responseData['user']['email'];
    
    echo "✅ User baru berhasil dibuat dengan ID: $userId\n";
    echo "📧 Email: $email\n\n";
    
    // Test login dengan user baru
    $loginData = [
        'action' => 'login',
        'email' => $email,
        'password' => 'password123'
    ];
    
    echo "🔐 Testing login dengan user baru...\n";
    
    $loginUrl = 'http://127.0.0.1:8080/api/auth/login.php';
    $loginCh = curl_init();
    curl_setopt($loginCh, CURLOPT_URL, $loginUrl);
    curl_setopt($loginCh, CURLOPT_POST, true);
    curl_setopt($loginCh, CURLOPT_POSTFIELDS, json_encode($loginData));
    curl_setopt($loginCh, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json'
    ]);
    curl_setopt($loginCh, CURLOPT_RETURNTRANSFER, true);
    
    $loginResponse = curl_exec($loginCh);
    $loginHttpCode = curl_getinfo($loginCh, CURLINFO_HTTP_CODE);
    curl_close($loginCh);
    
    echo "📥 Login Response HTTP Code: $loginHttpCode\n";
    echo "📥 Login Response Body: $loginResponse\n";
    
    $loginResponseData = json_decode($loginResponse, true);
    if ($loginResponseData && $loginResponseData['success']) {
        echo "✅ Login berhasil!\n";
        echo "👤 User ID: " . $loginResponseData['data']['user']['id'] . "\n";
        echo "👤 Username: " . $loginResponseData['data']['user']['username'] . "\n";
        
        // Test apakah user baru memiliki data reservasi kosong
        echo "\n🔍 Testing apakah user baru memiliki data reservasi kosong...\n";
        
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
            $bookingCount = count($bookingsData['data']);
            echo "📊 Jumlah reservasi untuk user baru: $bookingCount\n";
            
            if ($bookingCount === 0) {
                echo "✅ SUCCESS! User baru memiliki dashboard kosong (0 reservasi)\n";
            } else {
                echo "❌ FAILED! User baru masih memiliki $bookingCount reservasi\n";
            }
        } else {
            echo "❌ FAILED! Tidak bisa mendapatkan data reservasi\n";
        }
        
    } else {
        echo "❌ Login gagal: " . ($loginResponseData['message'] ?? 'Unknown error') . "\n";
    }
    
} else {
    echo "❌ Registrasi gagal: " . ($responseData['message'] ?? 'Unknown error') . "\n";
}

echo "\n=== TEST SELESAI ===\n";
?>

