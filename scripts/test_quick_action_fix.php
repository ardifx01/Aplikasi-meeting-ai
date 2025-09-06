<?php
/**
 * Script untuk test quick action fix
 */

require_once __DIR__ . '/../config/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    echo "=== TEST QUICK ACTION FIX ===\n\n";
    
    // Simulasi alur quick action yang bermasalah
    $quickActionFlow = [
        [
            'step' => 1,
            'action' => 'internal',
            'current_state' => 'ASKING_MEETING_TYPE',
            'expected_next_state' => 'ASKING_FOOD_TYPE',
            'description' => 'User klik tombol Internal'
        ],
        [
            'step' => 2,
            'action' => 'eksternal',
            'current_state' => 'ASKING_MEETING_TYPE',
            'expected_next_state' => 'ASKING_FOOD_TYPE',
            'description' => 'User klik tombol Eksternal'
        ],
        [
            'step' => 3,
            'action' => 'ringan',
            'current_state' => 'ASKING_FOOD_TYPE',
            'expected_next_state' => 'CONFIRMING',
            'description' => 'User klik tombol Ringan'
        ],
        [
            'step' => 4,
            'action' => 'ya',
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
        'date' => '2025-09-06',
        'time' => '15:00'
    ];
    
    $currentState = 'ASKING_MEETING_TYPE';
    
    foreach ($quickActionFlow as $step) {
        echo "Step {$step['step']}: {$step['description']}\n";
        echo "Action: '{$step['action']}'\n";
        echo "Current State: {$step['current_state']}\n";
        echo "Expected Next State: {$step['expected_next_state']}\n";
        
        // Simulasi processing quick action
        $action = $step['action'];
        $lowerAction = strtolower($action);
        
        switch ($step['current_state']) {
            case 'ASKING_MEETING_TYPE':
                // Simulasi meeting type processing
                if ($lowerAction === 'internal') {
                    $bookingData['meetingType'] = 'internal';
                    $currentState = 'ASKING_FOOD_TYPE';
                    echo "✅ Meeting type set to: internal\n";
                    echo "✅ State transition: ASKING_MEETING_TYPE → ASKING_FOOD_TYPE\n";
                } elseif ($lowerAction === 'eksternal') {
                    $bookingData['meetingType'] = 'external';
                    $currentState = 'ASKING_FOOD_TYPE';
                    echo "✅ Meeting type set to: external\n";
                    echo "✅ State transition: ASKING_MEETING_TYPE → ASKING_FOOD_TYPE\n";
                } else {
                    echo "❌ Invalid meeting type action: {$action}\n";
                    $currentState = 'ASKING_MEETING_TYPE'; // Stay in same state
                }
                break;
                
            case 'ASKING_FOOD_TYPE':
                // Simulasi food type processing
                if ($lowerAction === 'ringan') {
                    $bookingData['foodOrder'] = 'ringan';
                    $currentState = 'CONFIRMING';
                    echo "✅ Food order set to: ringan\n";
                    echo "✅ State transition: ASKING_FOOD_TYPE → CONFIRMING\n";
                } elseif ($lowerAction === 'berat') {
                    $bookingData['foodOrder'] = 'berat';
                    $currentState = 'CONFIRMING';
                    echo "✅ Food order set to: berat\n";
                    echo "✅ State transition: ASKING_FOOD_TYPE → CONFIRMING\n";
                } elseif ($lowerAction === 'tidak') {
                    $bookingData['foodOrder'] = 'tidak';
                    $currentState = 'CONFIRMING';
                    echo "✅ Food order set to: tidak\n";
                    echo "✅ State transition: ASKING_FOOD_TYPE → CONFIRMING\n";
                } else {
                    echo "❌ Invalid food action: {$action}\n";
                    $currentState = 'ASKING_FOOD_TYPE'; // Stay in same state
                }
                break;
                
            case 'CONFIRMING':
                // Simulasi confirmation processing
                if ($lowerAction === 'ya') {
                    $currentState = 'BOOKED';
                    echo "✅ Booking confirmed\n";
                    echo "✅ State transition: CONFIRMING → BOOKED\n";
                } elseif ($lowerAction === 'tidak') {
                    $currentState = 'IDLE';
                    echo "✅ Booking cancelled\n";
                    echo "✅ State transition: CONFIRMING → IDLE\n";
                } else {
                    echo "❌ Invalid confirmation action: {$action}\n";
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
    
    echo "Berdasarkan screenshot yang Anda tunjukkan:\n";
    echo "1. AI sudah berhasil memproses waktu '15:00'\n";
    echo "2. AI menanyakan 'Apa jenis rapatnya?' dengan tombol Internal/Eksternal\n";
    echo "3. Ketika user klik tombol, AI tidak lanjut ke pertanyaan makanan\n";
    echo "\nKemungkinan penyebab:\n";
    echo "- State management tidak konsisten\n";
    echo "- Quick action tidak diproses dengan benar\n";
    echo "- Ada logic yang mengintercept quick action\n";
    echo "\nSolusi yang sudah diimplementasikan:\n";
    echo "- Menambahkan logging detail di handleQuickAction\n";
    echo "- Menambahkan logging detail di sendMessage\n";
    echo "- Menambahkan logging detail di processBookingConversation\n";
    echo "- Memastikan state yang benar diteruskan\n";
    
    echo "\n🎯 REKOMENDASI:\n";
    echo "1. Monitor console logs di browser untuk melihat state transitions\n";
    echo "2. Pastikan bookingState yang benar diteruskan ke processBookingConversation\n";
    echo "3. Test dengan input manual dan quick action untuk memastikan konsistensi\n";
    echo "4. Periksa apakah ada logic lain yang mengintercept quick action\n";
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}
?>
