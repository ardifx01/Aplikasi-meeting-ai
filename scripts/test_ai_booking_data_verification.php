<?php
/**
 * Test script untuk memverifikasi data AI booking tersimpan dengan benar
 */

require_once __DIR__ . '/../backend/config/database.php';
require_once __DIR__ . '/../backend/models/AiBookingSuccess.php';

$database = new Database();
$db = $database->getConnection();
$aiBookingSuccess = new AiBookingSuccess($db);

echo "=== AI Booking Data Verification ===\n\n";

// Ambil data terbaru dari ai_bookings_success table
$allBookings = $aiBookingSuccess->getAllSuccessBookings();

if (empty($allBookings)) {
    echo "❌ Tidak ada data booking AI yang ditemukan\n";
    exit;
}

echo "📊 Total AI bookings found: " . count($allBookings) . "\n\n";

// Tampilkan 5 booking terbaru
$recentBookings = array_slice($allBookings, 0, 5);

foreach ($recentBookings as $index => $booking) {
    echo "=== Booking #" . ($index + 1) . " ===\n";
    echo "ID: " . $booking['id'] . "\n";
    echo "User ID: " . $booking['user_id'] . "\n";
    echo "Session ID: " . $booking['session_id'] . "\n";
    echo "Room ID: " . $booking['room_id'] . "\n";
    echo "Room Name: " . $booking['room_name'] . "\n";
    echo "Topic: " . $booking['topic'] . "\n";
    echo "PIC: " . $booking['pic'] . "\n";
    echo "Participants: " . $booking['participants'] . "\n";
    echo "Meeting Date: " . $booking['meeting_date'] . "\n";
    echo "Meeting Time: " . $booking['meeting_time'] . "\n";
    echo "Duration: " . $booking['duration'] . " minutes\n";
    echo "Meeting Type: " . $booking['meeting_type'] . "\n";
    echo "Food Order: " . $booking['food_order'] . "\n";
    echo "Booking State: " . $booking['booking_state'] . "\n";
    echo "Created At: " . $booking['created_at'] . "\n";
    echo "Updated At: " . $booking['updated_at'] . "\n";
    echo "\n";
}

// Verifikasi data integrity
echo "=== Data Integrity Check ===\n";

$issues = [];

foreach ($recentBookings as $booking) {
    // Check required fields
    if (empty($booking['user_id'])) {
        $issues[] = "Booking ID " . $booking['id'] . ": Missing user_id";
    }
    if (empty($booking['session_id'])) {
        $issues[] = "Booking ID " . $booking['id'] . ": Missing session_id";
    }
    if (empty($booking['room_id'])) {
        $issues[] = "Booking ID " . $booking['id'] . ": Missing room_id";
    }
    if (empty($booking['topic'])) {
        $issues[] = "Booking ID " . $booking['id'] . ": Missing topic";
    }
    if (empty($booking['meeting_date'])) {
        $issues[] = "Booking ID " . $booking['id'] . ": Missing meeting_date";
    }
    if (empty($booking['meeting_time'])) {
        $issues[] = "Booking ID " . $booking['id'] . ": Missing meeting_time";
    }
    
    // Check data consistency
    if ($booking['meeting_type'] !== 'internal' && $booking['meeting_type'] !== 'external') {
        $issues[] = "Booking ID " . $booking['id'] . ": Invalid meeting_type: " . $booking['meeting_type'];
    }
    
    if ($booking['food_order'] !== 'ya' && $booking['food_order'] !== 'tidak') {
        $issues[] = "Booking ID " . $booking['id'] . ": Invalid food_order: " . $booking['food_order'];
    }
    
    if ($booking['participants'] < 1) {
        $issues[] = "Booking ID " . $booking['id'] . ": Invalid participants count: " . $booking['participants'];
    }
}

if (empty($issues)) {
    echo "✅ Semua data booking AI valid dan lengkap\n";
} else {
    echo "❌ Ditemukan " . count($issues) . " masalah:\n";
    foreach ($issues as $issue) {
        echo "  - " . $issue . "\n";
    }
}

echo "\n=== End Verification ===\n";
?>
