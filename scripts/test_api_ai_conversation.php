<?php
// Test POST to api/ai/conversation.php

$base = 'http://localhost/aplikasi-meeting-ai/api/ai/conversation.php';

$payload = [
    'user_id' => 1,
    'session_id' => 'apitestCV_' . time(),
    'message' => 'Halo dari CLI',
    'response' => 'Balasan AI dari CLI',
    'booking_state' => 'BOOKED',
    'booking_data' => [
        'roomName' => 'Samudrantha Meeting Room',
        'date' => date('Y-m-d', strtotime('+3 days')),
        'time' => '09:00 - 10:00',
        'participants' => 5,
        'topic' => 'Rapat AI dari CLI',
        'meetingType' => 'internal',
        'foodOrder' => 'tidak'
    ]
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
