<?php
/**
 * Script untuk membersihkan cache booking dan memastikan data bersih
 */

require_once __DIR__ . '/../config/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    echo "=== PEMBERSIHAN CACHE BOOKING ===\n\n";
    
    // 1. Cek status data saat ini
    echo "📊 STATUS DATA SAAT INI:\n";
    echo "=" . str_repeat("=", 50) . "\n";
    
    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM ai_booking_data");
    $stmt->execute();
    $formCount = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    echo "ai_booking_data (Form): $formCount records\n";
    
    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM ai_bookings_success");
    $stmt->execute();
    $aiCount = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    echo "ai_bookings_success (AI): $aiCount records\n";
    
    // 2. Cek data yang salah tempat
    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM ai_bookings_success WHERE session_id LIKE 'form_%'");
    $stmt->execute();
    $wrongFormCount = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    echo "Data form di ai_bookings_success: $wrongFormCount records\n";
    
    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM ai_booking_data WHERE session_id LIKE 'ai_%'");
    $stmt->execute();
    $wrongAICount = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    echo "Data AI di ai_booking_data: $wrongAICount records\n";
    
    // 3. Cek data ganda
    $stmt = $conn->prepare("SELECT session_id, COUNT(*) as count FROM ai_booking_data GROUP BY session_id HAVING COUNT(*) > 1");
    $stmt->execute();
    $duplicateForm = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "Data ganda di ai_booking_data: " . count($duplicateForm) . " session(s)\n";
    
    $stmt = $conn->prepare("SELECT session_id, COUNT(*) as count FROM ai_bookings_success GROUP BY session_id HAVING COUNT(*) > 1");
    $stmt->execute();
    $duplicateAI = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "Data ganda di ai_bookings_success: " . count($duplicateAI) . " session(s)\n";
    
    // 4. Rekomendasi
    echo "\n🔧 REKOMENDASI:\n";
    echo "=" . str_repeat("=", 50) . "\n";
    
    if ($wrongFormCount > 0 || $wrongAICount > 0 || !empty($duplicateForm) || !empty($duplicateAI)) {
        echo "❌ Masih ada masalah yang perlu diperbaiki:\n";
        
        if ($wrongFormCount > 0) {
            echo "- Jalankan: php scripts/cleanup_booking_data.php\n";
        }
        
        if (!empty($duplicateForm) || !empty($duplicateAI)) {
            echo "- Jalankan: php scripts/cleanup_booking_data.php\n";
        }
    } else {
        echo "✅ Data sudah bersih!\n";
    }
    
    echo "\n💡 UNTUK FRONTEND - MEMBERSIHKAN CACHE:\n";
    echo "=" . str_repeat("=", 50) . "\n";
    echo "Untuk membersihkan cache di browser:\n";
    echo "1. Buka Developer Tools (F12)\n";
    echo "2. Buka tab Application/Storage\n";
    echo "3. Pilih Local Storage\n";
    echo "4. Hapus key berikut jika ada:\n";
    echo "   - last_booking_session_id\n";
    echo "   - last_ai_booking_session_id\n";
    echo "   - last_form_booking_key\n";
    echo "   - last_ai_booking_key\n";
    echo "   - booking_saved_* (semua key yang dimulai dengan booking_saved_)\n";
    echo "   - ai_booking_saved_* (semua key yang dimulai dengan ai_booking_saved_)\n";
    echo "   - session_token (jika perlu)\n";
    echo "\nAtau jalankan di console browser:\n";
    echo "// Hapus semua cache booking\n";
    echo "Object.keys(localStorage).forEach(key => {\n";
    echo "  if (key.includes('booking') || key.includes('saved')) {\n";
    echo "    localStorage.removeItem(key);\n";
    echo "    console.log('Removed:', key);\n";
    echo "  }\n";
    echo "});\n";
    echo "\n// Atau hapus satu per satu:\n";
    echo "localStorage.removeItem('last_booking_session_id');\n";
    echo "localStorage.removeItem('last_ai_booking_session_id');\n";
    echo "localStorage.removeItem('last_form_booking_key');\n";
    echo "localStorage.removeItem('last_ai_booking_key');\n";
    
    echo "\n📋 INSTRUKSI LENGKAP:\n";
    echo "=" . str_repeat("=", 50) . "\n";
    echo "1. Jalankan script ini untuk cek status data\n";
    echo "2. Jika ada masalah, jalankan cleanup script\n";
    echo "3. Bersihkan localStorage di browser dengan kode di atas\n";
    echo "4. Test booking baru untuk memastikan tidak ada duplikasi\n";
    echo "5. Pastikan form booking hanya tersimpan di ai_booking_data\n";
    echo "6. Pastikan AI booking hanya tersimpan di ai_bookings_success\n";
    
    echo "\n✅ PEMBERSIHAN CACHE SELESAI!\n";
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}
?>
