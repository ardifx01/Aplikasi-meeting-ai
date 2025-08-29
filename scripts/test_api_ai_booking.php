<?php
// Test POST to api/ai/booking.php

$base = 'http://localhost/aplikasi-meeting-ai/api/ai/booking.php';

$payload = [
    'user_id' => 1,
    'session_id' => 'apitestAB_' . time(),
    'room_id' => 1,
    'topic' => 'Tes via API ai/booking.php (CLI)',
    'meeting_date' => date('Y-m-d', strtotime('+2 days')),
    'meeting_time' => '11:15',
    'duration' => 45,
    'participants' => 2,
    'meeting_type' => 'internal',
    'food_order' => 'tidak',
    'booking_state' => 'BOOKED'
];

$ch = curl_init($base);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));

$response = curl_exec($ch);
if ($response === false) {
    echo json_encode(['success' => false, 'error' => curl_error($ch)]);
    exit(1);
}

$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo $response, "\n";
echo "HTTP: $code\n";
