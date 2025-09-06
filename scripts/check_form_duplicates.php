<?php
/**
 * Script untuk memeriksa data form yang duplikat
 */

require_once __DIR__ . '/../config/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    echo "=== PEMERIKSAAN DATA FORM DUPLIKAT ===\n\n";
    
    // Cek data form di ai_booking_data
    echo "📋 DATA FORM DI ai_booking_data:\n";
    echo "=" . str_repeat("=", 60) . "\n";
    $stmt = $conn->prepare("SELECT id, session_id, topic, meeting_date, meeting_time, participants, created_at FROM ai_booking_data WHERE session_id LIKE 'form_%' ORDER BY created_at DESC");
    $stmt->execute();
    $formData = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($formData)) {
        echo "Tidak ada data form di ai_booking_data\n";
    } else {
        foreach ($formData as $row) {
            echo sprintf(
                "ID: %-3s | Session: %-20s | Topic: %-15s | Date: %-10s | Time: %-8s | Participants: %-3s | Created: %s\n",
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
    
    // Cek data form di ai_bookings_success
    echo "\n📋 DATA FORM DI ai_bookings_success:\n";
    echo "=" . str_repeat("=", 60) . "\n";
    $stmt = $conn->prepare("SELECT id, session_id, room_name, topic, meeting_date, meeting_time, participants, created_at FROM ai_bookings_success WHERE session_id LIKE 'form_%' ORDER BY created_at DESC");
    $stmt->execute();
    $formSuccessData = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($formSuccessData)) {
        echo "Tidak ada data form di ai_bookings_success\n";
    } else {
        foreach ($formSuccessData as $row) {
            echo sprintf(
                "ID: %-3s | Session: %-20s | Room: %-20s | Topic: %-15s | Date: %-10s | Time: %-8s | Participants: %-3s | Created: %s\n",
                $row['id'],
                $row['session_id'],
                substr($row['room_name'], 0, 20),
                substr($row['topic'], 0, 15),
                $row['meeting_date'],
                $row['meeting_time'],
                $row['participants'],
                $row['created_at']
            );
        }
    }
    
    // Cek data yang sama di kedua tabel
    echo "\n🔍 DATA YANG SAMA DI KEDUA TABEL:\n";
    echo "=" . str_repeat("=", 60) . "\n";
    $stmt = $conn->prepare("
        SELECT 
            f.session_id,
            f.topic,
            f.meeting_date,
            f.meeting_time,
            f.participants as form_participants,
            a.participants as ai_participants,
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
                "Session: %-20s | Topic: %-15s | Date: %-10s | Time: %-8s | Form Part: %-3s | AI Part: %-3s | Form: %s | AI: %s\n",
                $row['session_id'],
                substr($row['topic'], 0, 15),
                $row['meeting_date'],
                $row['meeting_time'],
                $row['form_participants'],
                $row['ai_participants'],
                $row['form_created'],
                $row['ai_created']
            );
        }
    }
    
    // Cek data berdasarkan topic dan date untuk mencari duplikasi
    echo "\n🔍 DATA BERDASARKAN TOPIC DAN DATE:\n";
    echo "=" . str_repeat("=", 60) . "\n";
    
    // Cek di ai_booking_data
    $stmt = $conn->prepare("
        SELECT topic, meeting_date, meeting_time, COUNT(*) as count 
        FROM ai_booking_data 
        WHERE session_id LIKE 'form_%'
        GROUP BY topic, meeting_date, meeting_time 
        HAVING COUNT(*) > 1
        ORDER BY meeting_date DESC, meeting_time DESC
    ");
    $stmt->execute();
    $duplicateForm = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($duplicateForm)) {
        echo "✅ Tidak ada data ganda di ai_booking_data berdasarkan topic/date/time\n";
    } else {
        echo "❌ Data ganda di ai_booking_data:\n";
        foreach ($duplicateForm as $row) {
            echo sprintf(
                "Topic: %-15s | Date: %-10s | Time: %-8s | Count: %s\n",
                substr($row['topic'], 0, 15),
                $row['meeting_date'],
                $row['meeting_time'],
                $row['count']
            );
        }
    }
    
    // Cek di ai_bookings_success
    $stmt = $conn->prepare("
        SELECT topic, meeting_date, meeting_time, COUNT(*) as count 
        FROM ai_bookings_success 
        WHERE session_id LIKE 'form_%'
        GROUP BY topic, meeting_date, meeting_time 
        HAVING COUNT(*) > 1
        ORDER BY meeting_date DESC, meeting_time DESC
    ");
    $stmt->execute();
    $duplicateSuccess = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($duplicateSuccess)) {
        echo "✅ Tidak ada data ganda di ai_bookings_success berdasarkan topic/date/time\n";
    } else {
        echo "❌ Data ganda di ai_bookings_success:\n";
        foreach ($duplicateSuccess as $row) {
            echo sprintf(
                "Topic: %-15s | Date: %-10s | Time: %-8s | Count: %s\n",
                substr($row['topic'], 0, 15),
                $row['meeting_date'],
                $row['meeting_time'],
                $row['count']
            );
        }
    }
    
    echo "\n🔧 REKOMENDASI:\n";
    echo "=" . str_repeat("=", 60) . "\n";
    
    if (!empty($sameData)) {
        echo "1. Hapus data form dari ai_bookings_success (karena seharusnya hanya di ai_booking_data)\n";
    }
    
    if (!empty($duplicateForm)) {
        echo "2. Hapus data ganda di ai_booking_data\n";
    }
    
    if (!empty($duplicateSuccess)) {
        echo "3. Hapus data ganda di ai_bookings_success\n";
    }
    
    if (empty($sameData) && empty($duplicateForm) && empty($duplicateSuccess)) {
        echo "✅ Data sudah bersih!\n";
    } else {
        echo "\n💡 Jalankan: php scripts/cleanup_form_duplicates.php\n";
    }
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}
?>
