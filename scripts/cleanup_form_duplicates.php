<?php
/**
 * Script untuk membersihkan data form yang duplikat
 */

require_once __DIR__ . '/../config/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    echo "=== PEMBERSIHAN DATA FORM DUPLIKAT ===\n\n";
    
    // Backup data sebelum dihapus
    echo "📋 MEMBUAT BACKUP DATA...\n";
    $backupDir = __DIR__ . '/backup_form_' . date('Y-m-d_H-i-s');
    if (!is_dir($backupDir)) {
        mkdir($backupDir, 0755, true);
    }
    
    // Backup ai_booking_data
    $stmt = $conn->prepare("SELECT * FROM ai_booking_data WHERE session_id LIKE 'form_%'");
    $stmt->execute();
    $formData = $stmt->fetchAll(PDO::FETCH_ASSOC);
    file_put_contents($backupDir . '/ai_booking_data_form_backup.json', json_encode($formData, JSON_PRETTY_PRINT));
    
    // Backup ai_bookings_success
    $stmt = $conn->prepare("SELECT * FROM ai_bookings_success WHERE session_id LIKE 'form_%'");
    $stmt->execute();
    $formSuccessData = $stmt->fetchAll(PDO::FETCH_ASSOC);
    file_put_contents($backupDir . '/ai_bookings_success_form_backup.json', json_encode($formSuccessData, JSON_PRETTY_PRINT));
    
    echo "✅ Backup disimpan di: $backupDir\n\n";
    
    // 1. Hapus data form yang salah tempat di ai_bookings_success
    echo "🗑️ MENGHAPUS DATA FORM YANG SALAH TEMPAT (ai_bookings_success):\n";
    $stmt = $conn->prepare("DELETE FROM ai_bookings_success WHERE session_id LIKE 'form_%'");
    $stmt->execute();
    $deletedForm = $stmt->rowCount();
    echo "✅ Dihapus $deletedForm data form dari ai_bookings_success\n";
    
    // 2. Hapus data ganda di ai_booking_data berdasarkan session_id
    echo "\n🗑️ MENGHAPUS DATA GANDA DI ai_booking_data:\n";
    $stmt = $conn->prepare("
        DELETE f1 FROM ai_booking_data f1
        INNER JOIN ai_booking_data f2
        WHERE f1.id > f2.id 
        AND f1.session_id = f2.session_id
        AND f1.session_id LIKE 'form_%'
    ");
    $stmt->execute();
    $deletedDuplicateForm = $stmt->rowCount();
    echo "✅ Dihapus $deletedDuplicateForm data ganda dari ai_booking_data\n";
    
    // 3. Hapus data ganda berdasarkan topic, date, dan time (jika ada)
    echo "\n🗑️ MENGHAPUS DATA GANDA BERDASARKAN TOPIC/DATE/TIME:\n";
    $stmt = $conn->prepare("
        DELETE f1 FROM ai_booking_data f1
        INNER JOIN ai_booking_data f2
        WHERE f1.id > f2.id 
        AND f1.topic = f2.topic
        AND f1.meeting_date = f2.meeting_date
        AND f1.meeting_time = f2.meeting_time
        AND f1.session_id LIKE 'form_%'
        AND f2.session_id LIKE 'form_%'
    ");
    $stmt->execute();
    $deletedDuplicateTopic = $stmt->rowCount();
    echo "✅ Dihapus $deletedDuplicateTopic data ganda berdasarkan topic/date/time dari ai_booking_data\n";
    
    // 4. Verifikasi hasil pembersihan
    echo "\n📊 VERIFIKASI HASIL PEMBERSIHAN:\n";
    echo "=" . str_repeat("=", 50) . "\n";
    
    // Cek jumlah data setelah pembersihan
    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM ai_booking_data WHERE session_id LIKE 'form_%'");
    $stmt->execute();
    $formCount = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    echo "ai_booking_data (Form): $formCount records\n";
    
    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM ai_bookings_success WHERE session_id LIKE 'form_%'");
    $stmt->execute();
    $formSuccessCount = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    echo "ai_bookings_success (Form): $formSuccessCount records\n";
    
    // 5. Tampilkan data terbaru
    echo "\n📝 DATA FORM TERBARU SETELAH PEMBERSIHAN:\n";
    echo "=" . str_repeat("=", 50) . "\n";
    
    echo "ai_booking_data (Form Bookings):\n";
    $stmt = $conn->prepare("SELECT id, session_id, topic, meeting_date, meeting_time, participants, created_at FROM ai_booking_data WHERE session_id LIKE 'form_%' ORDER BY created_at DESC");
    $stmt->execute();
    $formData = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($formData)) {
        echo "  Tidak ada data form\n";
    } else {
        foreach ($formData as $row) {
            echo sprintf(
                "  ID: %-3s | Session: %-20s | Topic: %-15s | Date: %-10s | Time: %-8s | Part: %-3s | Created: %s\n",
                $row['id'],
                $row['session_id'],
                substr($row['topic'], 0, 15),
                $row['meeting_date'],
                $row['meeting_time'],
                $row['participants'],
                $row['created_at']
            );
        }
    }
    
    echo "\nai_bookings_success (Form Bookings):\n";
    $stmt = $conn->prepare("SELECT id, session_id, room_name, topic, meeting_date, meeting_time, participants, created_at FROM ai_bookings_success WHERE session_id LIKE 'form_%' ORDER BY created_at DESC");
    $stmt->execute();
    $formSuccessData = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($formSuccessData)) {
        echo "  Tidak ada data form (✅ Sudah bersih)\n";
    } else {
        foreach ($formSuccessData as $row) {
            echo sprintf(
                "  ID: %-3s | Session: %-20s | Room: %-15s | Topic: %-15s | Date: %-10s | Time: %-8s | Part: %-3s | Created: %s\n",
                $row['id'],
                $row['session_id'],
                substr($row['room_name'], 0, 15),
                substr($row['topic'], 0, 15),
                $row['meeting_date'],
                $row['meeting_time'],
                $row['participants'],
                $row['created_at']
            );
        }
    }
    
    // 6. Cek apakah masih ada data yang sama di kedua tabel
    echo "\n🔍 VERIFIKASI DATA YANG SAMA DI KEDUA TABEL:\n";
    echo "=" . str_repeat("=", 50) . "\n";
    
    $stmt = $conn->prepare("
        SELECT COUNT(*) as count
        FROM ai_booking_data f
        INNER JOIN ai_bookings_success a ON f.session_id = a.session_id
        WHERE f.session_id LIKE 'form_%'
    ");
    $stmt->execute();
    $sameDataCount = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    if ($sameDataCount == 0) {
        echo "✅ Tidak ada data yang sama di kedua tabel\n";
    } else {
        echo "❌ Masih ada $sameDataCount data yang sama di kedua tabel\n";
    }
    
    echo "\n✅ PEMBERSIHAN DATA FORM SELESAI!\n";
    echo "Data form sekarang hanya tersimpan di ai_booking_data:\n";
    echo "- Form bookings hanya di ai_booking_data\n";
    echo "- Tidak ada data form di ai_bookings_success\n";
    echo "- Tidak ada data ganda\n";
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}
?>
