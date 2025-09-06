<?php
/**
 * Test script untuk API login
 */

echo "=== TEST API LOGIN ===\n\n";

// Test data - menggunakan user yang baru dibuat
$testData = [
    'action' => 'login',
    'email' => 'test1756986473@example.com', // Email dari user yang baru dibuat
    'password' => 'password123'
];

echo "📝 Test data:\n";
foreach ($testData as $key => $value) {
    echo "  $key: $value\n";
}
echo "\n";

// Make API request
$url = 'http://127.0.0.1:8080/api/auth/login.php';
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

echo "🌐 Making request to: $url\n";
echo "📤 Sending data: " . $data . "\n\n";

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);

curl_close($ch);

echo "📥 Response HTTP Code: $httpCode\n";
echo "📥 Response Body: $response\n";

if ($error) {
    echo "❌ cURL Error: $error\n";
} else {
    $responseData = json_decode($response, true);
    if ($responseData) {
        if ($responseData['success']) {
            echo "✅ Login successful!\n";
            echo "👤 User ID: " . $responseData['data']['user']['id'] . "\n";
            echo "👤 Username: " . $responseData['data']['user']['username'] . "\n";
            echo "📧 Email: " . $responseData['data']['user']['email'] . "\n";
            echo "👤 Full Name: " . $responseData['data']['user']['full_name'] . "\n";
        } else {
            echo "❌ Login failed: " . $responseData['message'] . "\n";
        }
    } else {
        echo "❌ Invalid JSON response\n";
    }
}

echo "\n=== TEST SELESAI ===\n";
?>

