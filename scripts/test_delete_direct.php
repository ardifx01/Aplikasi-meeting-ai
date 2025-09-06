<?php
/**
 * Script untuk test delete langsung ke database
 */

require_once __DIR__ . '/../backend/config/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    echo "=== TEST DELETE LANGSUNG KE DATABASE ===\n\n";
    
    // Cek data sebelum delete
    echo "📋 DATA SEBELUM DELETE:\n";
    $stmt = $conn->prepare("SELECT id, session_id, room_name, topic FROM ai_bookings_success WHERE id = 43");
    $stmt->execute();
    $beforeData = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($beforeData) {
        echo "✅ Data ditemukan: ID {$beforeData['id']}, Session: {$beforeData['session_id']}, Room: {$beforeData['room_name']}\n\n";
        
        // Lakukan delete
        echo "🗑️ MELAKUKAN DELETE...\n";
        $deleteStmt = $conn->prepare("DELETE FROM ai_bookings_success WHERE id = 43");
        $result = $deleteStmt->execute();
        $rowCount = $deleteStmt->rowCount();
        
        echo "Delete result: " . ($result ? 'SUCCESS' : 'FAILED') . "\n";
        echo "Rows affected: $rowCount\n\n";
        
        // Cek data setelah delete
        echo "📋 DATA SETELAH DELETE:\n";
        $stmt = $conn->prepare("SELECT id, session_id, room_name, topic FROM ai_bookings_success WHERE id = 43");
        $stmt->execute();
        $afterData = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($afterData) {
            echo "❌ Data masih ada: ID {$afterData['id']}, Session: {$afterData['session_id']}, Room: {$afterData['room_name']}\n";
        } else {
            echo "✅ Data berhasil dihapus!\n";
        }
        
    } else {
        echo "❌ Data dengan ID 43 tidak ditemukan\n";
    }
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}
?>
