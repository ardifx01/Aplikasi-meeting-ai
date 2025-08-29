<?php
$url = 'http://127.0.0.1:8080/backend/api/bookings.php/bookings';

$data = [
    'user_id' => 1,
    'room_id' => 3,
    'topic' => 'Test PHP Script',
    'meeting_date' => '2025-08-29',
    'meeting_time' => '17:00:00',
    'duration' => 60,
    'participants' => 5,
    'meeting_type' => 'internal',
    'food_order' => 'tidak',
    'booking_state' => 'BOOKED'
];

$options = [
    'http' => [
        'header' => "Content-type: application/json\r\n",
        'method' => 'POST',
        'content' => json_encode($data)
    ]
];

$context = stream_context_create($options);
$result = file_get_contents($url, false, $context);

if ($result === FALSE) {
    echo "❌ Error: Failed to make request\n";
    print_r($http_response_header);
} else {
    echo "✅ Response received:\n";
    echo $result . "\n";
    echo "\nHTTP Headers:\n";
    print_r($http_response_header);
}
