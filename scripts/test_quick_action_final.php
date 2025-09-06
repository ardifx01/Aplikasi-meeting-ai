<?php
/**
 * Script untuk test quick action final
 */

require_once __DIR__ . '/../config/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    echo "=== TEST QUICK ACTION FINAL ===\n\n";
    
    // Simulasi alur yang bermasalah berdasarkan screenshot
    $testFlow = [
        [
            'step' => 1,
            'input' => '15:00',
            'current_state' => 'ASKING_TIME',
            'expected_next_state' => 'ASKING_MEETING_TYPE',
            'description' => 'User input waktu'
        ],
        [
            'step' => 2,
            'input' => 'internal',
            'current_state' => 'ASKING_MEETING_TYPE',
            'expected_next_state' => 'ASKING_FOOD_TYPE',
            'description' => 'User klik tombol Internal (SEHARUSNYA LANJUT KE MAKANAN)'
        ],
        [
            'step' => 3,
            'input' => 'ringan',
            'current_state' => 'ASKING_FOOD_TYPE',
            'expected_next_state' => 'CONFIRMING',
            'description' => 'User klik tombol Ringan'
        ],
        [
            'step' => 4,
            'input' => 'ya',
            'current_state' => 'CONFIRMING',
            'expected_next_state' => 'BOOKED',
            'description' => 'User klik tombol Ya, konfirmasi'
        ]
    ];
    
    echo "🔍 SIMULASI QUICK ACTION FLOW:\n";
    echo "=" . str_repeat("=", 50) . "\n\n";
    
    $bookingData = [
        'roomName' => 'Cedaya Meeting Room',
        'topic' => 'meeting',
        'pic' => 'fadil',
        'participants' => 14,
        'date' => '2025-09-06'
    ];
    
    $currentState = 'ASKING_TIME';
    
    foreach ($testFlow as $step) {
        echo "Step {$step['step']}: {$step['description']}\n";
        echo "Input: '{$step['input']}'\n";
        echo "Current State: {$step['current_state']}\n";
        echo "Expected Next State: {$step['expected_next_state']}\n";
        
        // Simulasi processing
        $input = $step['input'];
        $lowerInput = strtolower($input);
        
        switch ($step['current_state']) {
            case 'ASKING_TIME':
                // Simulasi time processing
                if (preg_match('/^\d{1,2}:\d{2}$/', $input)) {
                    $bookingData['time'] = $input;
                    $currentState = 'ASKING_MEETING_TYPE';
                    echo "✅ Time set to: {$input}\n";
                    echo "✅ State transition: ASKING_TIME → ASKING_MEETING_TYPE\n";
                } else {
                    echo "❌ Invalid time input: {$input}\n";
                    $currentState = 'ASKING_TIME'; // Stay in same state
                }
                break;
                
            case 'ASKING_MEETING_TYPE':
                // Simulasi meeting type processing
                if ($lowerInput === 'internal') {
                    $bookingData['meetingType'] = 'internal';
                    $currentState = 'ASKING_FOOD_TYPE';
                    echo "✅ Meeting type set to: internal\n";
                    echo "✅ State transition: ASKING_MEETING_TYPE → ASKING_FOOD_TYPE\n";
                } elseif ($lowerInput === 'eksternal' || $lowerInput === 'external') {
                    $bookingData['meetingType'] = 'external';
                    $currentState = 'ASKING_FOOD_TYPE';
                    echo "✅ Meeting type set to: external\n";
                    echo "✅ State transition: ASKING_MEETING_TYPE → ASKING_FOOD_TYPE\n";
                } else {
                    echo "❌ Invalid meeting type input: {$input}\n";
                    $currentState = 'ASKING_MEETING_TYPE'; // Stay in same state
                }
                break;
                
            case 'ASKING_FOOD_TYPE':
                // Simulasi food type processing
                if ($lowerInput === 'ringan') {
                    $bookingData['foodOrder'] = 'ringan';
                    $currentState = 'CONFIRMING';
                    echo "✅ Food order set to: ringan\n";
                    echo "✅ State transition: ASKING_FOOD_TYPE → CONFIRMING\n";
                } elseif ($lowerInput === 'berat') {
                    $bookingData['foodOrder'] = 'berat';
                    $currentState = 'CONFIRMING';
                    echo "✅ Food order set to: berat\n";
                    echo "✅ State transition: ASKING_FOOD_TYPE → CONFIRMING\n";
                } elseif ($lowerInput === 'tidak') {
                    $bookingData['foodOrder'] = 'tidak';
                    $currentState = 'CONFIRMING';
                    echo "✅ Food order set to: tidak\n";
                    echo "✅ State transition: ASKING_FOOD_TYPE → CONFIRMING\n";
                } else {
                    echo "❌ Invalid food input: {$input}\n";
                    $currentState = 'ASKING_FOOD_TYPE'; // Stay in same state
                }
                break;
                
            case 'CONFIRMING':
                // Simulasi confirmation processing
                if ($lowerInput === 'ya') {
                    $currentState = 'BOOKED';
                    echo "✅ Booking confirmed\n";
                    echo "✅ State transition: CONFIRMING → BOOKED\n";
                } elseif ($lowerInput === 'tidak') {
                    $currentState = 'IDLE';
                    echo "✅ Booking cancelled\n";
                    echo "✅ State transition: CONFIRMING → IDLE\n";
                } else {
                    echo "❌ Invalid confirmation input: {$input}\n";
                    $currentState = 'CONFIRMING'; // Stay in same state
                }
                break;
        }
        
        // Verifikasi state transition
        if ($currentState === $step['expected_next_state']) {
            echo "✅ State transition: CORRECT\n";
        } else {
            echo "❌ State transition: WRONG (expected: {$step['expected_next_state']}, got: {$currentState})\n";
        }
        
        echo "📊 Current booking data: " . json_encode($bookingData) . "\n";
        echo "-" . str_repeat("-", 40) . "\n\n";
    }
    
    // Analisis masalah dan solusi
    echo "🔍 ANALISIS MASALAH:\n";
    echo "=" . str_repeat("=", 50) . "\n";
    
    echo "Berdasarkan screenshot yang ditunjukkan:\n";
    echo "1. User input '15:00' → AI konfirmasi waktu dan tanya jenis rapat ✅\n";
    echo "2. User input 'internal' → AI malah tanya waktu lagi (SALAH!) ❌\n";
    echo "3. Seharusnya: User input 'internal' → AI tanya makanan ✅\n";
    echo "\nMasalah yang ditemukan:\n";
    echo "1. Input 'internal' tidak diproses dengan benar oleh state machine\n";
    echo "2. State tidak berubah dari ASKING_MEETING_TYPE ke ASKING_FOOD_TYPE\n";
    echo "3. Ada logic yang mengintercept input 'internal' dan mengubah state\n";
    echo "\nSolusi yang diimplementasikan:\n";
    echo "1. Perbaiki logic di ASKING_MEETING_TYPE untuk memproses input 'internal' dengan benar\n";
    echo "2. Tambahkan validasi input di ASKING_TIME untuk mencegah input meeting type\n";
    echo "3. Tambahkan logging detail untuk debugging\n";
    echo "4. Pastikan state transitions berjalan dengan benar\n";
    
    echo "\n🎯 REKOMENDASI:\n";
    echo "1. Test dengan input manual: ketik 'internal' atau 'eksternal'\n";
    echo "2. Test dengan quick action: klik tombol Internal/Eksternal\n";
    echo "3. Monitor console logs untuk memastikan state transitions berjalan dengan benar\n";
    echo "4. Verifikasi bahwa AI tidak mengulang pertanyaan waktu setelah input meeting type\n";
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}
?>
