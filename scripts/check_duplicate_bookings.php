<?php
/**
 * Script untuk memeriksa data ganda dan data yang salah tempat
 */

require_once __DIR__ . '/../config/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    echo "=== PEMERIKSAAN DATA GANDA DAN SALAH TEMPAT ===\n\n";
    
    // 1. Cek data form yang tersimpan di ai_bookings_success (salah tempat)
    echo "🔍 DATA FORM YANG SALAH TEMPAT (ai_bookings_success):\n";
    echo "=" . str_repeat("=", 60) . "\n";
    $stmt = $conn->prepare("SELECT id, session_id, room_name, topic, meeting_date, meeting_time, created_at FROM ai_bookings_success WHERE session_id LIKE 'form_%'");
    $stmt->execute();
    $wrongFormData = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($wrongFormData)) {
        echo "✅ Tidak ada data form yang salah tempat\n";
    } else {
        foreach ($wrongFormData as $row) {
            echo sprintf(
                "❌ ID: %-3s | Session: %-20s | Room: %-20s | Topic: %-15s | Date: %-10s | Time: %-8s | Created: %s\n",
                $row['id'],
                $row['session_id'],
                substr($row['room_name'], 0, 20),
                substr($row['topic'], 0, 15),
                $row['meeting_date'],
                $row['meeting_time'],
                $row['created_at']
            );
        }
    }
    
    // 2. Cek data AI yang tersimpan di ai_booking_data (salah tempat)
    echo "\n🔍 DATA AI YANG SALAH TEMPAT (ai_booking_data):\n";
    echo "=" . str_repeat("=", 60) . "\n";
    $stmt = $conn->prepare("SELECT id, session_id, topic, meeting_date, meeting_time, created_at FROM ai_booking_data WHERE session_id LIKE 'ai_%'");
    $stmt->execute();
    $wrongAIData = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($wrongAIData)) {
        echo "✅ Tidak ada data AI yang salah tempat\n";
    } else {
        foreach ($wrongAIData as $row) {
            echo sprintf(
                "❌ ID: %-3s | Session: %-20s | Topic: %-20s | Date: %-10s | Time: %-8s | Created: %s\n",
                $row['id'],
                $row['session_id'],
                substr($row['topic'], 0, 20),
                $row['meeting_date'],
                $row['meeting_time'],
                $row['created_at']
            );
        }
    }
    
    // 3. Cek data ganda berdasarkan session_id
    echo "\n🔍 DATA GANDA BERDASARKAN SESSION_ID:\n";
    echo "=" . str_repeat("=", 60) . "\n";
    
    // Cek di ai_booking_data
    $stmt = $conn->prepare("SELECT session_id, COUNT(*) as count FROM ai_booking_data GROUP BY session_id HAVING COUNT(*) > 1");
    $stmt->execute();
    $duplicateForm = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($duplicateForm)) {
        echo "✅ Tidak ada data ganda di ai_booking_data\n";
    } else {
        echo "❌ Data ganda di ai_booking_data:\n";
        foreach ($duplicateForm as $row) {
            echo "  Session: {$row['session_id']} - Count: {$row['count']}\n";
        }
    }
    
    // Cek di ai_bookings_success
    $stmt = $conn->prepare("SELECT session_id, COUNT(*) as count FROM ai_bookings_success GROUP BY session_id HAVING COUNT(*) > 1");
    $stmt->execute();
    $duplicateAI = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($duplicateAI)) {
        echo "✅ Tidak ada data ganda di ai_bookings_success\n";
    } else {
        echo "❌ Data ganda di ai_bookings_success:\n";
        foreach ($duplicateAI as $row) {
            echo "  Session: {$row['session_id']} - Count: {$row['count']}\n";
        }
    }
    
    // 4. Cek data yang sama di kedua tabel
    echo "\n🔍 DATA YANG SAMA DI KEDUA TABEL:\n";
    echo "=" . str_repeat("=", 60) . "\n";
    
    $stmt = $conn->prepare("
        SELECT 
            f.session_id,
            f.topic,
            f.meeting_date,
            f.meeting_time,
            f.created_at as form_created,
            a.created_at as ai_created
        FROM ai_booking_data f
        INNER JOIN ai_bookings_success a ON f.session_id = a.session_id
        ORDER BY f.created_at DESC
    ");
    $stmt->execute();
    $sameData = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($sameData)) {
        echo "✅ Tidak ada data yang sama di kedua tabel\n";
    } else {
        echo "❌ Data yang sama di kedua tabel:\n";
        foreach ($sameData as $row) {
            echo sprintf(
                "  Session: %-20s | Topic: %-15s | Date: %-10s | Time: %-8s | Form: %s | AI: %s\n",
                $row['session_id'],
                substr($row['topic'], 0, 15),
                $row['meeting_date'],
                $row['meeting_time'],
                $row['form_created'],
                $row['ai_created']
            );
        }
    }
    
    // 5. Rekomendasi perbaikan
    echo "\n🔧 REKOMENDASI PERBAIKAN:\n";
    echo "=" . str_repeat("=", 60) . "\n";
    
    if (!empty($wrongFormData) || !empty($wrongAIData) || !empty($duplicateForm) || !empty($duplicateAI) || !empty($sameData)) {
        echo "❌ Ditemukan masalah yang perlu diperbaiki:\n";
        
        if (!empty($wrongFormData)) {
            echo "1. Hapus data form yang salah tempat di ai_bookings_success\n";
        }
        
        if (!empty($wrongAIData)) {
            echo "2. Hapus data AI yang salah tempat di ai_booking_data\n";
        }
        
        if (!empty($duplicateForm)) {
            echo "3. Hapus data ganda di ai_booking_data\n";
        }
        
        if (!empty($duplicateAI)) {
            echo "4. Hapus data ganda di ai_bookings_success\n";
        }
        
        if (!empty($sameData)) {
            echo "5. Pilih salah satu tabel untuk data yang sama\n";
        }
        
        echo "\n💡 Jalankan script cleanup untuk memperbaiki:\n";
        echo "php scripts/cleanup_booking_data.php\n";
    } else {
        echo "✅ Data sudah bersih dan terpisah dengan benar!\n";
    }
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}
?>
