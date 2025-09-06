<?php
/**
 * Script untuk menampilkan detail booking AI terbaru
 */

require_once __DIR__ . '/../backend/config/database.php';
require_once __DIR__ . '/../backend/models/AiBookingSuccess.php';

$database = new Database();
$db = $database->getConnection();
$aiBookingSuccess = new AiBookingSuccess($db);

echo "=== Latest AI Bookings Detail ===\n\n";

// Ambil data terbaru dari ai_bookings_success table
$allBookings = $aiBookingSuccess->getAllSuccessBookings();

if (empty($allBookings)) {
    echo "❌ Tidak ada data booking AI yang ditemukan\n";
    exit;
}

echo "📊 Total AI bookings found: " . count($allBookings) . "\n\n";

// Tampilkan 3 booking terbaru
$recentBookings = array_slice($allBookings, 0, 3);

foreach ($recentBookings as $index => $booking) {
    echo "=== Booking #" . ($index + 1) . " (Latest) ===\n";
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

echo "=== End Detail ===\n";
?>
