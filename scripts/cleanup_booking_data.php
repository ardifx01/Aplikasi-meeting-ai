<?php
/**
 * Script untuk membersihkan data booking yang salah tempat dan ganda
 */

require_once __DIR__ . '/../config/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    echo "=== PEMBERSIHAN DATA BOOKING ===\n\n";
    
    // Backup data sebelum dihapus
    echo "📋 MEMBUAT BACKUP DATA...\n";
    $backupDir = __DIR__ . '/backup_' . date('Y-m-d_H-i-s');
    if (!is_dir($backupDir)) {
        mkdir($backupDir, 0755, true);
    }
    
    // Backup ai_booking_data
    $stmt = $conn->prepare("SELECT * FROM ai_booking_data");
    $stmt->execute();
    $formData = $stmt->fetchAll(PDO::FETCH_ASSOC);
    file_put_contents($backupDir . '/ai_booking_data_backup.json', json_encode($formData, JSON_PRETTY_PRINT));
    
    // Backup ai_bookings_success
    $stmt = $conn->prepare("SELECT * FROM ai_bookings_success");
    $stmt->execute();
    $aiData = $stmt->fetchAll(PDO::FETCH_ASSOC);
    file_put_contents($backupDir . '/ai_bookings_success_backup.json', json_encode($aiData, JSON_PRETTY_PRINT));
    
    echo "✅ Backup disimpan di: $backupDir\n\n";
    
    // 1. Hapus data form yang salah tempat di ai_bookings_success
    echo "🗑️ MENGHAPUS DATA FORM YANG SALAH TEMPAT (ai_bookings_success):\n";
    $stmt = $conn->prepare("DELETE FROM ai_bookings_success WHERE session_id LIKE 'form_%'");
    $stmt->execute();
    $deletedForm = $stmt->rowCount();
    echo "✅ Dihapus $deletedForm data form dari ai_bookings_success\n";
    
    // 2. Hapus data AI yang salah tempat di ai_booking_data
    echo "\n🗑️ MENGHAPUS DATA AI YANG SALAH TEMPAT (ai_booking_data):\n";
    $stmt = $conn->prepare("DELETE FROM ai_booking_data WHERE session_id LIKE 'ai_%'");
    $stmt->execute();
    $deletedAI = $stmt->rowCount();
    echo "✅ Dihapus $deletedAI data AI dari ai_booking_data\n";
    
    // 3. Hapus data ganda di ai_booking_data (jika ada)
    echo "\n🗑️ MENGHAPUS DATA GANDA DI ai_booking_data:\n";
    $stmt = $conn->prepare("
        DELETE f1 FROM ai_booking_data f1
        INNER JOIN ai_booking_data f2
        WHERE f1.id > f2.id 
        AND f1.session_id = f2.session_id
    ");
    $stmt->execute();
    $deletedDuplicateForm = $stmt->rowCount();
    echo "✅ Dihapus $deletedDuplicateForm data ganda dari ai_booking_data\n";
    
    // 4. Hapus data ganda di ai_bookings_success (jika ada)
    echo "\n🗑️ MENGHAPUS DATA GANDA DI ai_bookings_success:\n";
    $stmt = $conn->prepare("
        DELETE a1 FROM ai_bookings_success a1
        INNER JOIN ai_bookings_success a2
        WHERE a1.id > a2.id 
        AND a1.session_id = a2.session_id
    ");
    $stmt->execute();
    $deletedDuplicateAI = $stmt->rowCount();
    echo "✅ Dihapus $deletedDuplicateAI data ganda dari ai_bookings_success\n";
    
    // 5. Verifikasi hasil pembersihan
    echo "\n📊 VERIFIKASI HASIL PEMBERSIHAN:\n";
    echo "=" . str_repeat("=", 50) . "\n";
    
    // Cek jumlah data setelah pembersihan
    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM ai_booking_data");
    $stmt->execute();
    $formCount = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    echo "ai_booking_data (Form): $formCount records\n";
    
    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM ai_bookings_success");
    $stmt->execute();
    $aiCount = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    echo "ai_bookings_success (AI): $aiCount records\n";
    
    // Cek data yang salah tempat setelah pembersihan
    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM ai_bookings_success WHERE session_id LIKE 'form_%'");
    $stmt->execute();
    $wrongFormCount = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    echo "Data form di ai_bookings_success: $wrongFormCount records\n";
    
    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM ai_booking_data WHERE session_id LIKE 'ai_%'");
    $stmt->execute();
    $wrongAICount = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    echo "Data AI di ai_booking_data: $wrongAICount records\n";
    
    // 6. Tampilkan data terbaru
    echo "\n📝 DATA TERBARU SETELAH PEMBERSIHAN:\n";
    echo "=" . str_repeat("=", 50) . "\n";
    
    echo "ai_booking_data (Form Bookings):\n";
    $stmt = $conn->prepare("SELECT id, session_id, topic, meeting_date, meeting_time, created_at FROM ai_booking_data ORDER BY created_at DESC LIMIT 3");
    $stmt->execute();
    $formData = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($formData)) {
        echo "  Tidak ada data\n";
    } else {
        foreach ($formData as $row) {
            echo sprintf(
                "  ID: %-3s | Session: %-20s | Topic: %-15s | Date: %-10s | Time: %-8s | Created: %s\n",
                $row['id'],
                $row['session_id'],
                substr($row['topic'], 0, 15),
                $row['meeting_date'],
                $row['meeting_time'],
                $row['created_at']
            );
        }
    }
    
    echo "\nai_bookings_success (AI Agent Bookings):\n";
    $stmt = $conn->prepare("SELECT id, session_id, room_name, topic, meeting_date, meeting_time, created_at FROM ai_bookings_success ORDER BY created_at DESC LIMIT 3");
    $stmt->execute();
    $aiData = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($aiData)) {
        echo "  Tidak ada data\n";
    } else {
        foreach ($aiData as $row) {
            echo sprintf(
                "  ID: %-3s | Session: %-20s | Room: %-15s | Topic: %-15s | Date: %-10s | Time: %-8s | Created: %s\n",
                $row['id'],
                $row['session_id'],
                substr($row['room_name'], 0, 15),
                substr($row['topic'], 0, 15),
                $row['meeting_date'],
                $row['meeting_time'],
                $row['created_at']
            );
        }
    }
    
    echo "\n✅ PEMBERSIHAN SELESAI!\n";
    echo "Data sekarang sudah terpisah dengan benar:\n";
    echo "- Form bookings hanya di ai_booking_data\n";
    echo "- AI agent bookings hanya di ai_bookings_success\n";
    echo "- Tidak ada data ganda atau salah tempat\n";
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}
?>
