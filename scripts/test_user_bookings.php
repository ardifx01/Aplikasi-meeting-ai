<?php
// Test API getUserBookings untuk memastikan room_name muncul
$url = 'http://127.0.0.1:8080/backend/api/bookings.php/user?user_id=1';

$options = [
    'http' => [
        'header' => "Content-type: application/json\r\n",
        'method' => 'GET'
    ]
];

$context = stream_context_create($options);
$result = file_get_contents($url, false, $context);

if ($result === FALSE) {
    echo "❌ Error: Failed to make request\n";
    print_r($http_response_header);
} else {
    echo "✅ Raw response body (first 400 chars):\n";
    echo substr($result, 0, 400) . "\n\n";
    $data = json_decode($result, true);
    echo "✅ Decoded JSON:\n";
    echo json_encode($data, JSON_PRETTY_PRINT) . "\n";
    
    echo "\nHTTP Headers:\n";
    print_r($http_response_header);
    
    // Check if room_name is present
    if (isset($data['data']) && is_array($data['data'])) {
        echo "\n=== CHECKING ROOM_NAME FIELD ===\n";
        foreach ($data['data'] as $booking) {
            echo "Booking ID {$booking['id']}: ";
            if (isset($booking['room_name'])) {
                echo "✅ room_name = '{$booking['room_name']}'\n";
            } else {
                echo "❌ room_name field missing\n";
                echo "Available fields: " . implode(', ', array_keys($booking)) . "\n";
            }
        }
    }
}
