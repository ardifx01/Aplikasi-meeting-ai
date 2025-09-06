<?php
/**
 * Test script untuk API register
 */

echo "=== TEST API REGISTER ===\n\n";

// Test data
$testData = [
    'action' => 'register',
    'username' => 'testuser' . time(), // Unique username
    'email' => 'test' . time() . '@example.com', // Unique email
    'password' => 'password123',
    'full_name' => 'Test User'
];

echo "📝 Test data:\n";
foreach ($testData as $key => $value) {
    echo "  $key: $value\n";
}
echo "\n";

// Make API request
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
            echo "✅ Registration successful!\n";
            echo "👤 User ID: " . $responseData['user']['id'] . "\n";
            echo "👤 Username: " . $responseData['user']['username'] . "\n";
            echo "📧 Email: " . $responseData['user']['email'] . "\n";
        } else {
            echo "❌ Registration failed: " . $responseData['message'] . "\n";
        }
    } else {
        echo "❌ Invalid JSON response\n";
    }
}

echo "\n=== TEST SELESAI ===\n";
?>

