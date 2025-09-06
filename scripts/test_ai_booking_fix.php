<?php
/**
 * Test script untuk memverifikasi perbaikan AI booking
 */

require_once __DIR__ . '/../backend/config/database.php';
require_once __DIR__ . '/../backend/models/AiBookingSuccess.php';

$database = new Database();
$db = $database->getConnection();
$aiBookingSuccess = new AiBookingSuccess($db);

echo "=== AI Booking Fix Verification ===\n\n";

// Ambil data terbaru dari ai_bookings_success table
$allBookings = $aiBookingSuccess->getAllSuccessBookings();

if (empty($allBookings)) {
    echo "❌ Tidak ada data booking AI yang ditemukan\n";
    exit;
}

echo "📊 Total AI bookings found: " . count($allBookings) . "\n\n";

// Tampilkan 3 booking terbaru dengan fokus pada waktu dan jenis meeting
$recentBookings = array_slice($allBookings, 0, 3);

foreach ($recentBookings as $index => $booking) {
    echo "=== Booking #" . ($index + 1) . " (Latest) ===\n";
    echo "ID: " . $booking['id'] . "\n";
    echo "Session ID: " . $booking['session_id'] . "\n";
    echo "Room Name: " . $booking['room_name'] . "\n";
    echo "Topic: " . $booking['topic'] . "\n";
    echo "PIC: " . $booking['pic'] . "\n";
    echo "Participants: " . $booking['participants'] . "\n";
    echo "Meeting Date: " . $booking['meeting_date'] . "\n";
    echo "Meeting Time: " . $booking['meeting_time'] . " ⏰\n";
    echo "Duration: " . $booking['duration'] . " minutes\n";
    echo "Meeting Type: " . $booking['meeting_type'] . " 🤝\n";
    echo "Food Order: " . $booking['food_order'] . "\n";
    echo "Booking State: " . $booking['booking_state'] . "\n";
    echo "Created At: " . $booking['created_at'] . "\n";
    echo "\n";
}

// Verifikasi perbaikan
echo "=== Fix Verification ===\n";

$issues = [];
$successCount = 0;

foreach ($recentBookings as $booking) {
    $hasIssue = false;
    
    // Check if time is not default 09:00
    if ($booking['meeting_time'] === '09:00:00') {
        $issues[] = "Booking ID " . $booking['id'] . ": Using default time 09:00:00";
        $hasIssue = true;
    }
    
    // Check if meeting type is not default internal
    if ($booking['meeting_type'] === 'internal') {
        $issues[] = "Booking ID " . $booking['id'] . ": Using default meeting type 'internal'";
        $hasIssue = true;
    }
    
    // Check if data is complete
    if (empty($booking['topic']) || empty($booking['meeting_date'])) {
        $issues[] = "Booking ID " . $booking['id'] . ": Missing required data";
        $hasIssue = true;
    }
    
    if (!$hasIssue) {
        $successCount++;
    }
}

if ($successCount > 0) {
    echo "✅ " . $successCount . " booking(s) menggunakan data yang diinput user (bukan default)\n";
} else {
    echo "❌ Semua booking masih menggunakan data default\n";
}

if (empty($issues)) {
    echo "✅ Semua data booking AI valid dan menggunakan input user\n";
} else {
    echo "❌ Ditemukan " . count($issues) . " masalah:\n";
    foreach ($issues as $issue) {
        echo "  - " . $issue . "\n";
    }
}

echo "\n=== End Fix Verification ===\n";
?>
