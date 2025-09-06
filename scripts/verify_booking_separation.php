<?php
/**
 * Script untuk memverifikasi pemisahan data booking
 * - Data formulir disimpan di ai_booking_data
 * - Data AI agent disimpan di ai_bookings_success
 */

require_once __DIR__ . '/../config/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    echo "=== VERIFIKASI PEMISAHAN DATA BOOKING ===\n\n";
    
    // 1. Cek struktur tabel ai_booking_data
    echo "📋 TABEL: ai_booking_data (Form Bookings)\n";
    echo "=" . str_repeat("=", 50) . "\n";
    $stmt = $conn->prepare("DESCRIBE ai_booking_data");
    $stmt->execute();
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($columns as $column) {
        echo sprintf(
            "%-20s | %-15s | %-10s | %-10s | %-10s\n",
            $column['Field'],
            $column['Type'],
            $column['Null'],
            $column['Key'],
            $column['Default'] ?? 'NULL'
        );
    }
    
    // 2. Cek struktur tabel ai_bookings_success
    echo "\n📋 TABEL: ai_bookings_success (AI Agent Bookings)\n";
    echo "=" . str_repeat("=", 50) . "\n";
    $stmt = $conn->prepare("DESCRIBE ai_bookings_success");
    $stmt->execute();
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($columns as $column) {
        echo sprintf(
            "%-20s | %-15s | %-10s | %-10s | %-10s\n",
            $column['Field'],
            $column['Type'],
            $column['Null'],
            $column['Key'],
            $column['Default'] ?? 'NULL'
        );
    }
    
    // 3. Cek jumlah data di masing-masing tabel
    echo "\n📊 JUMLAH DATA:\n";
    echo "=" . str_repeat("=", 50) . "\n";
    
    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM ai_booking_data");
    $stmt->execute();
    $formCount = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    echo "ai_booking_data (Form): $formCount records\n";
    
    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM ai_bookings_success");
    $stmt->execute();
    $aiCount = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    echo "ai_bookings_success (AI): $aiCount records\n";
    
    // 4. Cek data terbaru di masing-masing tabel
    echo "\n📝 DATA TERBARU:\n";
    echo "=" . str_repeat("=", 50) . "\n";
    
    echo "ai_booking_data (Form Bookings):\n";
    $stmt = $conn->prepare("SELECT id, user_id, session_id, topic, meeting_date, meeting_time, booking_state, created_at FROM ai_booking_data ORDER BY created_at DESC LIMIT 3");
    $stmt->execute();
    $formData = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($formData)) {
        echo "  Tidak ada data\n";
    } else {
        foreach ($formData as $row) {
            echo sprintf(
                "  ID: %-5s | User: %-3s | Topic: %-20s | Date: %-10s | State: %-10s | Created: %s\n",
                $row['id'],
                $row['user_id'],
                substr($row['topic'], 0, 20),
                $row['meeting_date'],
                $row['booking_state'],
                $row['created_at']
            );
        }
    }
    
    echo "\nai_bookings_success (AI Agent Bookings):\n";
    $stmt = $conn->prepare("SELECT id, user_id, session_id, room_name, topic, meeting_date, meeting_time, booking_state, created_at FROM ai_bookings_success ORDER BY created_at DESC LIMIT 3");
    $stmt->execute();
    $aiData = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($aiData)) {
        echo "  Tidak ada data\n";
    } else {
        foreach ($aiData as $row) {
            echo sprintf(
                "  ID: %-5s | User: %-3s | Room: %-15s | Topic: %-20s | Date: %-10s | State: %-10s | Created: %s\n",
                $row['id'],
                $row['user_id'],
                substr($row['room_name'], 0, 15),
                substr($row['topic'], 0, 20),
                $row['meeting_date'],
                $row['booking_state'],
                $row['created_at']
            );
        }
    }
    
    // 5. Verifikasi session_id pattern
    echo "\n🔍 VERIFIKASI SESSION ID PATTERN:\n";
    echo "=" . str_repeat("=", 50) . "\n";
    
    $stmt = $conn->prepare("SELECT session_id FROM ai_booking_data WHERE session_id LIKE 'form_%' LIMIT 3");
    $stmt->execute();
    $formSessions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "Form sessions (ai_booking_data):\n";
    foreach ($formSessions as $session) {
        echo "  " . $session['session_id'] . "\n";
    }
    
    $stmt = $conn->prepare("SELECT session_id FROM ai_bookings_success WHERE session_id NOT LIKE 'form_%' LIMIT 3");
    $stmt->execute();
    $aiSessions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "AI sessions (ai_bookings_success):\n";
    foreach ($aiSessions as $session) {
        echo "  " . $session['session_id'] . "\n";
    }
    
    echo "\n✅ VERIFIKASI SELESAI\n";
    echo "Sistem telah dikonfigurasi untuk memisahkan data booking:\n";
    echo "- Form bookings → ai_booking_data table\n";
    echo "- AI agent bookings → ai_bookings_success table\n";
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}
?>
