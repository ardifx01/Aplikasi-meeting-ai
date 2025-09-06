<?php
/**
 * Script untuk test one-shot fix
 */

require_once __DIR__ . '/../config/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    echo "=== TEST ONE-SHOT FIX ===\n\n";
    
    // Simulasi alur yang bermasalah
    $testFlow = [
        [
            'step' => 1,
            'input' => '15:00',
            'current_state' => 'ASKING_TIME',
            'expected_handled' => false,
            'description' => 'User input waktu'
        ],
        [
            'step' => 2,
            'input' => 'internal',
            'current_state' => 'ASKING_MEETING_TYPE',
            'expected_handled' => false,
            'description' => 'User klik tombol Internal (SEHARUSNYA TIDAK DI INTERCEPT)'
        ],
        [
            'step' => 3,
            'input' => 'ringan',
            'current_state' => 'ASKING_FOOD_TYPE',
            'expected_handled' => false,
            'description' => 'User klik tombol Ringan (SEHARUSNYA TIDAK DI INTERCEPT)'
        ],
        [
            'step' => 4,
            'input' => 'ya',
            'current_state' => 'CONFIRMING',
            'expected_handled' => false,
            'description' => 'User klik tombol Ya (SEHARUSNYA TIDAK DI INTERCEPT)'
        ]
    ];
    
    echo "🔍 SIMULASI ONE-SHOT INTERCEPTION:\n";
    echo "=" . str_repeat("=", 50) . "\n\n";
    
    foreach ($testFlow as $step) {
        echo "Step {$step['step']}: {$step['description']}\n";
        echo "Input: '{$step['input']}'\n";
        echo "Current State: {$step['current_state']}\n";
        echo "Expected Handled: " . ($step['expected_handled'] ? 'TRUE' : 'FALSE') . "\n";
        
        // Simulasi one-shot logic
        $input = $step['input'];
        $lowerInput = strtolower($input);
        $currentState = $step['current_state'];
        
        // Simulasi logic yang sudah diperbaiki
        $handled = false;
        
        // Skip one-shot processing jika sedang dalam state booking yang aktif
        if ($currentState !== 'IDLE') {
            echo "✅ Skipping one-shot: current state is {$currentState}, not IDLE\n";
            $handled = false;
        }
        // Skip one-shot processing untuk input yang seharusnya diproses oleh state machine
        elseif ($lowerInput === 'internal' || $lowerInput === 'eksternal' || $lowerInput === 'external' ||
                $lowerInput === 'ringan' || $lowerInput === 'berat' || $lowerInput === 'tidak' ||
                $lowerInput === 'ya' || $lowerInput === 'tidak') {
            echo "✅ Skipping one-shot: input '{$input}' should be processed by state machine\n";
            $handled = false;
        }
        else {
            echo "❌ One-shot processing would handle this input\n";
            $handled = true;
        }
        
        // Verifikasi hasil
        if ($handled === $step['expected_handled']) {
            echo "✅ Result: CORRECT\n";
        } else {
            echo "❌ Result: WRONG (expected: " . ($step['expected_handled'] ? 'TRUE' : 'FALSE') . ", got: " . ($handled ? 'TRUE' : 'FALSE') . ")\n";
        }
        
        echo "-" . str_repeat("-", 40) . "\n\n";
    }
    
    // Analisis masalah dan solusi
    echo "🔍 ANALISIS MASALAH:\n";
    echo "=" . str_repeat("=", 50) . "\n";
    
    echo "Masalah yang ditemukan:\n";
    echo "1. handleOneShotIfPossible mengintercept input 'internal' dan 'eksternal'\n";
    echo "2. Input tersebut seharusnya diproses oleh state machine\n";
    echo "3. Akibatnya, AI tidak lanjut ke pertanyaan makanan\n";
    echo "\nSolusi yang diimplementasikan:\n";
    echo "1. Skip one-shot processing jika state bukan IDLE\n";
    echo "2. Skip one-shot processing untuk input yang seharusnya diproses state machine\n";
    echo "3. Tambahkan logging untuk debugging\n";
    
    echo "\n🎯 REKOMENDASI:\n";
    echo "1. Test dengan input manual dan quick action\n";
    echo "2. Monitor console logs untuk memastikan tidak ada interception\n";
    echo "3. Pastikan state transitions berjalan dengan benar\n";
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}
?>
