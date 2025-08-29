<?php
// Test script untuk cancel booking
require_once __DIR__ . '/../config/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    // Ambil booking yang ada untuk di-test cancel
    echo "=== EXISTING BOOKINGS ===\n";
    $stmt = $conn->prepare("SELECT id, topic, meeting_date, meeting_time FROM ai_booking_data ORDER BY created_at DESC LIMIT 5");
    $stmt->execute();
    $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($bookings)) {
        echo "❌ No bookings found to test cancel\n";
        exit(1);
    }
    
    foreach ($bookings as $booking) {
        echo "- ID: {$booking['id']}, Topic: {$booking['topic']}, Date: {$booking['meeting_date']} {$booking['meeting_time']}\n";
    }
    
    // Test cancel booking via API
    $testBookingId = $bookings[0]['id']; // Use first booking
    echo "\n=== TESTING CANCEL BOOKING API ===\n";
    echo "Testing cancel booking ID: $testBookingId\n";
    
    $url = "http://127.0.0.1:8080/backend/api/bookings.php/bookings/$testBookingId";
    
    $options = [
        'http' => [
            'header' => "Content-type: application/json\r\n",
            'method' => 'DELETE'
        ]
    ];
    
    $context = stream_context_create($options);
    $result = file_get_contents($url, false, $context);
    
    if ($result === FALSE) {
        echo "❌ Error: Failed to make DELETE request\n";
        print_r($http_response_header);
    } else {
        echo "✅ Response received:\n";
        echo $result . "\n";
        echo "\nHTTP Headers:\n";
        print_r($http_response_header);
        
        // Verify booking is deleted
        echo "\n=== VERIFICATION ===\n";
        $stmt = $conn->prepare("SELECT COUNT(*) FROM ai_booking_data WHERE id = ?");
        $stmt->execute([$testBookingId]);
        $count = $stmt->fetchColumn();
        
        if ($count == 0) {
            echo "✅ Booking successfully deleted from database\n";
        } else {
            echo "❌ Booking still exists in database\n";
        }
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
