<?php
/**
 * Script untuk debug state AI
 */

require_once __DIR__ . '/../config/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    echo "=== DEBUG AI STATE ===\n\n";
    
    // Simulasi alur percakapan yang bermasalah
    $conversationFlow = [
        [
            'step' => 1,
            'user_input' => '14:00',
            'current_state' => 'ASKING_TIME',
            'expected_next_state' => 'ASKING_MEETING_TYPE',
            'description' => 'User input waktu'
        ],
        [
            'step' => 2,
            'user_input' => 'eksternal',
            'current_state' => 'ASKING_MEETING_TYPE',
            'expected_next_state' => 'ASKING_FOOD_TYPE',
            'description' => 'User input jenis rapat'
        ],
        [
            'step' => 3,
            'user_input' => 'ringan',
            'current_state' => 'ASKING_FOOD_TYPE',
            'expected_next_state' => 'CONFIRMING',
            'description' => 'User input makanan (MASALAH DI SINI)'
        ],
        [
            'step' => 4,
            'user_input' => 'ya',
            'current_state' => 'CONFIRMING',
            'expected_next_state' => 'BOOKED',
            'description' => 'User konfirmasi'
        ]
    ];
    
    echo "🔍 SIMULASI ALUR PERCAKAPAN:\n";
    echo "=" . str_repeat("=", 50) . "\n\n";
    
    $bookingData = [];
    $currentState = 'ASKING_TIME';
    
    foreach ($conversationFlow as $step) {
        echo "Step {$step['step']}: {$step['description']}\n";
        echo "Input: '{$step['user_input']}'\n";
        echo "Current State: {$step['current_state']}\n";
        echo "Expected Next State: {$step['expected_next_state']}\n";
        
        // Simulasi processing
        $userInput = $step['user_input'];
        $lowerInput = strtolower($userInput);
        
        switch ($step['current_state']) {
            case 'ASKING_TIME':
                // Simulasi time parsing
                if (preg_match('/^\d{1,2}:\d{2}$/', $userInput)) {
                    $bookingData['time'] = $userInput;
                    $currentState = 'ASKING_MEETING_TYPE';
                    echo "✅ Time set to: {$userInput}\n";
                } else {
                    echo "❌ Invalid time format\n";
                }
                break;
                
            case 'ASKING_MEETING_TYPE':
                // Simulasi meeting type parsing
                if ($lowerInput === 'eksternal' || $lowerInput === 'external') {
                    $bookingData['meetingType'] = 'external';
                    $currentState = 'ASKING_FOOD_TYPE';
                    echo "✅ Meeting type set to: external\n";
                } elseif ($lowerInput === 'internal') {
                    $bookingData['meetingType'] = 'internal';
                    $currentState = 'ASKING_FOOD_TYPE';
                    echo "✅ Meeting type set to: internal\n";
                } else {
                    echo "❌ Invalid meeting type\n";
                }
                break;
                
            case 'ASKING_FOOD_TYPE':
                // Simulasi food type parsing
                if ($lowerInput === 'ringan') {
                    $bookingData['foodOrder'] = 'ringan';
                    $currentState = 'CONFIRMING';
                    echo "✅ Food order set to: ringan\n";
                } elseif ($lowerInput === 'berat') {
                    $bookingData['foodOrder'] = 'berat';
                    $currentState = 'CONFIRMING';
                    echo "✅ Food order set to: berat\n";
                } elseif ($lowerInput === 'tidak') {
                    $bookingData['foodOrder'] = 'tidak';
                    $currentState = 'CONFIRMING';
                    echo "✅ Food order set to: tidak\n";
                } else {
                    echo "❌ Invalid food input: {$userInput}\n";
                    $currentState = 'ASKING_FOOD_TYPE'; // Stay in same state
                }
                break;
                
            case 'CONFIRMING':
                // Simulasi confirmation
                if ($lowerInput === 'ya' || $lowerInput === 'benar' || $lowerInput === 'konfirmasi') {
                    $currentState = 'BOOKED';
                    echo "✅ Booking confirmed\n";
                } elseif ($lowerInput === 'tidak' || $lowerInput === 'batal') {
                    $currentState = 'IDLE';
                    echo "✅ Booking cancelled\n";
                } else {
                    echo "❌ Invalid confirmation input: {$userInput}\n";
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
    
    // Analisis masalah
    echo "🔍 ANALISIS MASALAH:\n";
    echo "=" . str_repeat("=", 50) . "\n";
    
    echo "Berdasarkan screenshot yang Anda tunjukkan:\n";
    echo "1. User input 'ringan' di state ASKING_FOOD_TYPE\n";
    echo "2. AI seharusnya lanjut ke CONFIRMING state\n";
    echo "3. Tapi AI malah mengulang pertanyaan 'Apakah rapat ini internal atau eksternal?'\n";
    echo "\nKemungkinan penyebab:\n";
    echo "- Ada logic yang mengintercept input 'ringan' dan mengubah state\n";
    echo "- State management tidak konsisten\n";
    echo "- Ada global intercept yang salah\n";
    echo "\nSolusi yang sudah diimplementasikan:\n";
    echo "- Menambahkan logging detail untuk debugging\n";
    echo "- Memperbaiki global intercept\n";
    echo "- Menambahkan pengecekan state yang lebih ketat\n";
    
    echo "\n🎯 REKOMENDASI:\n";
    echo "1. Monitor console logs di browser untuk melihat state transitions\n";
    echo "2. Pastikan tidak ada logic lain yang mengintercept input 'ringan'\n";
    echo "3. Test dengan input yang berbeda untuk memastikan konsistensi\n";
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}
?>
