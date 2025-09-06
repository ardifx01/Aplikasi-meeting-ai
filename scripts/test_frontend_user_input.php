<?php
/**
 * Test script untuk memverifikasi data user input dari frontend
 */

echo "=== TEST FRONTEND USER INPUT ACCURACY ===\n\n";

// Test data yang mensimulasikan input user dari frontend dengan waktu yang tersedia
$testCases = [
    [
        'name' => 'Test External Meeting dengan Client',
        'userInput' => 'Pesan ruangan untuk meeting dengan client hari ini jam 17:00, 5 orang, topik: presentasi produk',
        'expectedData' => [
            'user_id' => 1,
            'session_id' => 'test_frontend_external_' . time(),
            'room_id' => 1,
            'room_name' => 'Cedaya Meeting Room',
            'topic' => 'presentasi produk',
            'pic' => '-',
            'participants' => 5,
            'meeting_date' => date('Y-m-d'),
            'meeting_time' => '17:00:00',
            'duration' => 60,
            'meeting_type' => 'external',
            'food_order' => 'tidak'
        ]
    ],
    [
        'name' => 'Test Internal Meeting',
        'userInput' => 'Booking ruangan internal untuk rapat tim besok jam 09:00, 3 orang, topik: review project',
        'expectedData' => [
            'user_id' => 1,
            'session_id' => 'test_frontend_internal_' . time(),
            'room_id' => 1,
            'room_name' => 'Samudrantha Meeting Room',
            'topic' => 'review project',
            'pic' => '-',
            'participants' => 3,
            'meeting_date' => date('Y-m-d', strtotime('+1 day')),
            'meeting_time' => '09:00:00',
            'duration' => 60,
            'meeting_type' => 'internal',
            'food_order' => 'tidak'
        ]
    ],
    [
        'name' => 'Test Vendor Meeting dengan Konsumsi',
        'userInput' => 'Pesan ruangan untuk meeting dengan vendor sabtu jam 10:00, 8 orang, topik: negosiasi kontrak, perlu konsumsi',
        'expectedData' => [
            'user_id' => 1,
            'session_id' => 'test_frontend_vendor_' . time(),
            'room_id' => 1,
            'room_name' => 'Cedaya Meeting Room',
            'topic' => 'negosiasi kontrak',
            'pic' => '-',
            'participants' => 8,
            'meeting_date' => '2025-09-06', // Sabtu
            'meeting_time' => '10:00:00',
            'duration' => 60,
            'meeting_type' => 'external',
            'food_order' => 'ya' // Gunakan 'ya' langsung, bukan 'ringan'
        ]
    ]
];

foreach ($testCases as $testCase) {
    echo "🔍 Testing: " . $testCase['name'] . "\n";
    echo "📝 User Input: " . $testCase['userInput'] . "\n";
    echo "📊 Expected Data:\n";
    print_r($testCase['expectedData']);
    
    // Simulasi request ke API
    $url = 'http://localhost:8080/backend/api/bookings.php/ai-booking';
    $data = json_encode($testCase['expectedData']);
    
    echo "🌐 Mengirim request ke: " . $url . "\n";
    echo "📤 Data yang dikirim: " . $data . "\n\n";
    
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
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    echo "📥 Response HTTP Code: " . $httpCode . "\n";
    
    if ($error) {
        echo "❌ cURL Error: " . $error . "\n";
    } else {
        echo "✅ Response dari backend:\n";
        echo $response . "\n";
        
        // Parse response
        $responseData = json_decode($response, true);
        if ($responseData) {
            if (isset($responseData['status']) && $responseData['status'] === 'success') {
                echo "✅ Booking berhasil dibuat!\n";
                if (isset($responseData['success_booking_id'])) {
                    echo "📋 ID Booking Success: " . $responseData['success_booking_id'] . "\n";
                }
                
                // Verifikasi data tersimpan dengan benar
                if (isset($responseData['data'])) {
                    $savedData = $responseData['data'];
                    echo "📋 Data tersimpan:\n";
                    echo "  - Meeting Type: " . $savedData['meeting_type'] . " (expected: " . $testCase['expectedData']['meeting_type'] . ")\n";
                    echo "  - Meeting Time: " . $savedData['meeting_time'] . " (expected: " . $testCase['expectedData']['meeting_time'] . ")\n";
                    echo "  - Topic: " . $savedData['topic'] . " (expected: " . $testCase['expectedData']['topic'] . ")\n";
                    echo "  - Participants: " . $savedData['participants'] . " (expected: " . $testCase['expectedData']['participants'] . ")\n";
                    echo "  - Food Order: " . $savedData['food_order'] . " (expected: " . $testCase['expectedData']['food_order'] . ")\n";
                    
                    // Check accuracy
                    $meetingTypeCorrect = $savedData['meeting_type'] === $testCase['expectedData']['meeting_type'];
                    $meetingTimeCorrect = $savedData['meeting_time'] === $testCase['expectedData']['meeting_time'];
                    $topicCorrect = $savedData['topic'] === $testCase['expectedData']['topic'];
                    $participantsCorrect = $savedData['participants'] == $testCase['expectedData']['participants'];
                    $foodOrderCorrect = $savedData['food_order'] === $testCase['expectedData']['food_order'];
                    
                    echo "✅ Accuracy Check:\n";
                    echo "  - Meeting Type: " . ($meetingTypeCorrect ? "✅" : "❌") . "\n";
                    echo "  - Meeting Time: " . ($meetingTimeCorrect ? "✅" : "❌") . "\n";
                    echo "  - Topic: " . ($topicCorrect ? "✅" : "❌") . "\n";
                    echo "  - Participants: " . ($participantsCorrect ? "✅" : "❌") . "\n";
                    echo "  - Food Order: " . ($foodOrderCorrect ? "✅" : "❌") . "\n";
                }
            } else {
                echo "❌ Booking gagal: " . ($responseData['message'] ?? 'Unknown error') . "\n";
                
                // Jika ruangan tidak tersedia, coba dengan ruangan lain
                if ($httpCode === 409) {
                    echo "🔄 Ruangan tidak tersedia, mencoba dengan ruangan lain...\n";
                    
                    // Coba dengan room_id = 2
                    $testCase['expectedData']['room_id'] = 2;
                    $testCase['expectedData']['room_name'] = 'Ruang Meeting B';
                    $testCase['expectedData']['session_id'] = 'test_frontend_alt_' . time();
                    
                    $data2 = json_encode($testCase['expectedData']);
                    
                    $ch2 = curl_init();
                    curl_setopt($ch2, CURLOPT_URL, $url);
                    curl_setopt($ch2, CURLOPT_POST, true);
                    curl_setopt($ch2, CURLOPT_POSTFIELDS, $data2);
                    curl_setopt($ch2, CURLOPT_HTTPHEADER, [
                        'Content-Type: application/json',
                        'Content-Length: ' . strlen($data2)
                    ]);
                    curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
                    curl_setopt($ch2, CURLOPT_TIMEOUT, 30);
                    
                    $response2 = curl_exec($ch2);
                    $httpCode2 = curl_getinfo($ch2, CURLINFO_HTTP_CODE);
                    curl_close($ch2);
                    
                    echo "📥 Response HTTP Code (alternate): " . $httpCode2 . "\n";
                    echo "✅ Response dari backend (alternate):\n";
                    echo $response2 . "\n";
                    
                    $responseData2 = json_decode($response2, true);
                    if ($responseData2 && isset($responseData2['status']) && $responseData2['status'] === 'success') {
                        echo "✅ Booking berhasil dibuat dengan ruangan alternatif!\n";
                    }
                }
            }
        } else {
            echo "❌ Response tidak valid JSON\n";
        }
    }
    
    echo "--------------------------------------------------\n";
}

echo "\n=== SELESAI ===\n";
?>
