<?php
/**
 * Script untuk debug quick action
 */

require_once __DIR__ . '/../config/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    echo "=== DEBUG QUICK ACTION ===\n\n";
    
    // Simulasi alur yang bermasalah berdasarkan screenshot
    $debugFlow = [
        [
            'step' => 1,
            'input' => '16:00',
            'current_state' => 'ASKING_TIME',
            'expected_next_state' => 'ASKING_MEETING_TYPE',
            'description' => 'User input waktu'
        ],
        [
            'step' => 2,
            'input' => '16:00',
            'current_state' => 'ASKING_MEETING_TYPE',
            'expected_next_state' => 'ASKING_MEETING_TYPE',
            'description' => 'User input waktu lagi (SEHARUSNYA TIDAK TERJADI)'
        ],
        [
            'step' => 3,
            'input' => 'eksternal',
            'current_state' => 'ASKING_MEETING_TYPE',
            'expected_next_state' => 'ASKING_FOOD_TYPE',
            'description' => 'User input jenis rapat'
        ],
        [
            'step' => 4,
            'input' => '16:00',
            'current_state' => 'ASKING_FOOD_TYPE',
            'expected_next_state' => 'ASKING_FOOD_TYPE',
            'description' => 'User input waktu lagi (SEHARUSNYA TIDAK TERJADI)'
        ]
    ];
    
    echo "🔍 SIMULASI DEBUG FLOW:\n";
    echo "=" . str_repeat("=", 50) . "\n\n";
    
    $bookingData = [
        'roomName' => 'Cedaya Meeting Room',
        'topic' => 'meeting',
        'pic' => 'fadil',
        'participants' => 14,
        'date' => '2025-09-06'
    ];
    
    $currentState = 'ASKING_TIME';
    
    foreach ($debugFlow as $step) {
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
                if (preg_match('/^\d{1,2}:\d{2}$/', $input)) {
                    echo "❌ Time input detected in ASKING_MEETING_TYPE state: {$input}\n";
                    echo "❌ This should not happen! User should be providing meeting type, not time.\n";
                    $currentState = 'ASKING_MEETING_TYPE'; // Stay in same state
                } elseif ($lowerInput === 'internal') {
                    $bookingData['meetingType'] = 'internal';
                    $currentState = 'ASKING_FOOD_TYPE';
                    echo "✅ Meeting type set to: internal\n";
                    echo "✅ State transition: ASKING_MEETING_TYPE → ASKING_FOOD_TYPE\n";
                } elseif ($lowerInput === 'eksternal') {
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
                if (preg_match('/^\d{1,2}:\d{2}$/', $input)) {
                    echo "❌ Time input detected in ASKING_FOOD_TYPE state: {$input}\n";
                    echo "❌ This should not happen! User should be providing food order, not time.\n";
                    $currentState = 'ASKING_FOOD_TYPE'; // Stay in same state
                } elseif ($lowerInput === 'ringan') {
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
    echo "1. User input '16:00' → AI konfirmasi waktu dan tanya jenis rapat\n";
    echo "2. User input '16:00' lagi → AI tanya waktu lagi (SALAH!)\n";
    echo "3. User input 'eksternal' → AI seharusnya tanya makanan\n";
    echo "4. User input '16:00' lagi → AI tanya waktu lagi (SALAH!)\n";
    echo "\nMasalah yang ditemukan:\n";
    echo "1. AI mengulang pertanyaan waktu setelah user sudah memberikan waktu\n";
    echo "2. State management tidak konsisten\n";
    echo "3. Ada logic yang mengintercept input waktu di state yang salah\n";
    echo "\nSolusi yang diimplementasikan:\n";
    echo "1. Tambahkan deteksi input waktu di state ASKING_MEETING_TYPE\n";
    echo "2. Tambahkan deteksi input waktu di state ASKING_FOOD_TYPE\n";
    echo "3. Tambahkan logging detail untuk debugging\n";
    echo "4. Pastikan state transitions berjalan dengan benar\n";
    
    echo "\n🎯 REKOMENDASI:\n";
    echo "1. Monitor console logs di browser untuk melihat state transitions\n";
    echo "2. Pastikan tidak ada logic yang mengintercept input waktu di state yang salah\n";
    echo "3. Test dengan input manual dan quick action\n";
    echo "4. Verifikasi state management berjalan dengan benar\n";
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}
?>
