<?php
require_once __DIR__ . '/../config/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    echo "=== TABEL PENYIMPANAN DATA PEMESANAN ===\n\n";
    
    // 1. Struktur tabel ai_booking_data
    echo "📋 STRUKTUR TABEL: ai_booking_data\n";
    echo "=" . str_repeat("=", 50) . "\n";
    $stmt = $conn->query('DESCRIBE ai_booking_data');
    while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $nullable = $row['Null'] === 'YES' ? '(nullable)' : '(required)';
        $default = $row['Default'] ? " [default: {$row['Default']}]" : '';
        echo sprintf("%-20s %-15s %s%s\n", $row['Field'], $row['Type'], $nullable, $default);
    }
    
    // 2. Jumlah data yang tersimpan
    echo "\n📊 STATISTIK DATA\n";
    echo "=" . str_repeat("=", 50) . "\n";
    $stmt = $conn->prepare('SELECT COUNT(*) as total FROM ai_booking_data');
    $stmt->execute();
    $total = $stmt->fetchColumn();
    echo "Total pemesanan tersimpan: $total\n";
    
    // 3. Contoh data terbaru
    echo "\n📝 CONTOH DATA TERBARU (5 terakhir)\n";
    echo "=" . str_repeat("=", 50) . "\n";
    $stmt = $conn->prepare("
        SELECT 
            id, 
            user_id, 
            room_id, 
            topic, 
            meeting_date, 
            meeting_time, 
            duration, 
            participants, 
            meeting_type, 
            food_order, 
            booking_state,
            created_at
        FROM ai_booking_data 
        ORDER BY created_at DESC 
        LIMIT 5
    ");
    $stmt->execute();
    $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($bookings)) {
        echo "Tidak ada data pemesanan.\n";
    } else {
        foreach ($bookings as $booking) {
            echo "ID: {$booking['id']}\n";
            echo "  User ID: {$booking['user_id']}\n";
            echo "  Room ID: {$booking['room_id']}\n";
            echo "  Topic: {$booking['topic']}\n";
            echo "  Date & Time: {$booking['meeting_date']} {$booking['meeting_time']}\n";
            echo "  Duration: {$booking['duration']} minutes\n";
            echo "  Participants: {$booking['participants']} people\n";
            echo "  Type: {$booking['meeting_type']}\n";
            echo "  Food: {$booking['food_order']}\n";
            echo "  Status: {$booking['booking_state']}\n";
            echo "  Created: {$booking['created_at']}\n";
            echo "  " . str_repeat("-", 40) . "\n";
        }
    }
    
    // 4. Relasi dengan tabel lain
    echo "\n🔗 RELASI DENGAN TABEL LAIN\n";
    echo "=" . str_repeat("=", 50) . "\n";
    echo "- user_id → users.id (data pengguna)\n";
    echo "- room_id → meeting_rooms.id (data ruangan)\n";
    echo "- session_id → ai_conversations.session_id (riwayat chat AI)\n";
    
    // 5. Contoh query dengan JOIN
    echo "\n👥 CONTOH DATA LENGKAP DENGAN JOIN\n";
    echo "=" . str_repeat("=", 50) . "\n";
    $stmt = $conn->prepare("
        SELECT 
            b.id,
            b.topic,
            b.meeting_date,
            b.meeting_time,
            b.participants,
            u.username as user_name,
            r.room_name,
            r.capacity as room_capacity
        FROM ai_booking_data b
        LEFT JOIN users u ON b.user_id = u.id
        LEFT JOIN meeting_rooms r ON b.room_id = r.id
        ORDER BY b.created_at DESC
        LIMIT 3
    ");
    $stmt->execute();
    $joinedData = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($joinedData as $data) {
        echo "Booking #{$data['id']}: {$data['topic']}\n";
        echo "  User: {$data['user_name']}\n";
        echo "  Room: {$data['room_name']} (capacity: {$data['room_capacity']})\n";
        echo "  Schedule: {$data['meeting_date']} {$data['meeting_time']}\n";
        echo "  Participants: {$data['participants']}\n";
        echo "  " . str_repeat("-", 30) . "\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
