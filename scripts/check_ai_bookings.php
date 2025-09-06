<?php
/**
 * Script untuk mengecek AI bookings di database
 */

require_once 'backend/config/database.php';

$database = new Database();
$db = $database->getConnection();

echo "=== CEK AI BOOKINGS DI DATABASE ===\n\n";

// Cek tabel ai_bookings_success
echo "📊 Data dari tabel ai_bookings_success:\n";
try {
    $stmt = $db->prepare("SELECT id, user_id, session_id, room_name, topic, meeting_date, meeting_time, created_at FROM ai_bookings_success ORDER BY created_at DESC LIMIT 10");
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($results) > 0) {
        echo "ID\tUser ID\tSession ID\tRoom Name\tTopic\tMeeting Date\tMeeting Time\tCreated At\n";
        echo "---\t-------\t----------\t---------\t-----\t------------\t-------------\t----------\n";
        foreach ($results as $row) {
            echo "{$row['id']}\t{$row['user_id']}\t{$row['session_id']}\t{$row['room_name']}\t{$row['topic']}\t{$row['meeting_date']}\t{$row['meeting_time']}\t{$row['created_at']}\n";
        }
    } else {
        echo "❌ Tidak ada data AI bookings di database\n";
    }
} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

echo "\n";

// Cek tabel bookings (form-based)
echo "📊 Data dari tabel bookings (form-based):\n";
try {
    $stmt = $db->prepare("SELECT id, user_id, room_name, topic, meeting_date, meeting_time, created_at FROM bookings ORDER BY created_at DESC LIMIT 10");
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($results) > 0) {
        echo "ID\tUser ID\tRoom Name\tTopic\tMeeting Date\tMeeting Time\tCreated At\n";
        echo "---\t-------\t---------\t-----\t------------\t-------------\t----------\n";
        foreach ($results as $row) {
            echo "{$row['id']}\t{$row['user_id']}\t{$row['room_name']}\t{$row['topic']}\t{$row['meeting_date']}\t{$row['meeting_time']}\t{$row['created_at']}\n";
        }
    } else {
        echo "❌ Tidak ada data form bookings di database\n";
    }
} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

$database->closeConnection();
echo "\n=== SELESAI ===\n";
?>

