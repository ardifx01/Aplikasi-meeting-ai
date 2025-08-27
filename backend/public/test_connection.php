<?php
/**
 * Test Database Connection
 * File ini untuk testing koneksi database
 * Ditempatkan di folder public agar bisa diakses via browser
 */

// Include database config
require_once '../config/database.php';

// Set content type to HTML for better display
header('Content-Type: text/html; charset=utf-8');

echo "<!DOCTYPE html>";
echo "<html lang='id'>";
echo "<head>";
echo "<meta charset='UTF-8'>";
echo "<meta name='viewport' content='width=device-width, initial-scale=1.0'>";
echo "<title>Database Connection Test</title>";
echo "<style>";
echo "body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }";
echo ".container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }";
echo ".success { color: #28a745; font-weight: bold; }";
echo ".error { color: #dc3545; font-weight: bold; }";
echo ".info { color: #17a2b8; }";
echo ".warning { color: #ffc107; }";
echo "table { width: 100%; border-collapse: collapse; margin: 20px 0; }";
echo "th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }";
echo "th { background-color: #f8f9fa; }";
echo ".btn { display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 5px; }";
echo ".btn:hover { background: #0056b3; }";
echo "</style>";
echo "</head>";
echo "<body>";
echo "<div class='container'>";
echo "<h1>🧪 Database Connection Test</h1>";
echo "<p class='info'>Testing koneksi ke database <strong>spacio_meeting_db</strong></p>";
echo "<hr>";

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if ($db) {
        echo "<h2 class='success'>✅ Database connection successful!</h2>";
        echo "<p class='info'>Database: <strong>spacio_meeting_db</strong></p>";
        
        echo "<h3>📊 Database Statistics:</h3>";
        echo "<table>";
        echo "<tr><th>Table</th><th>Count</th><th>Status</th></tr>";
        
        // Test users table
        try {
            $stmt = $db->query("SELECT COUNT(*) as total_users FROM users");
            $result = $stmt->fetch();
            $userCount = $result['total_users'];
            echo "<tr><td>Users</td><td>{$userCount}</td><td class='success'>✅ OK</td></tr>";
        } catch (Exception $e) {
            echo "<tr><td>Users</td><td>Error</td><td class='error'>❌ {$e->getMessage()}</td></tr>";
        }
        
        // Test meeting_rooms table
        try {
            $stmt = $db->query("SELECT COUNT(*) as total_rooms FROM meeting_rooms");
            $result = $stmt->fetch();
            $roomCount = $result['total_rooms'];
            echo "<tr><td>Meeting Rooms</td><td>{$roomCount}</td><td class='success'>✅ OK</td></tr>";
        } catch (Exception $e) {
            echo "<tr><td>Meeting Rooms</td><td>Error</td><td class='error'>❌ {$e->getMessage()}</td></tr>";
        }
        
        // Test ai_booking_data table
        try {
            $stmt = $db->query("SELECT COUNT(*) as total_ai_bookings FROM ai_booking_data");
            $result = $stmt->fetch();
            $aiBookingCount = $result['total_ai_bookings'];
            echo "<tr><td>AI Bookings</td><td>{$aiBookingCount}</td><td class='success'>✅ OK</td></tr>";
        } catch (Exception $e) {
            echo "<tr><td>AI Bookings</td><td>Error</td><td class='error'>❌ {$e->getMessage()}</td></tr>";
        }
        
        // Test reservations table
        try {
            $stmt = $db->query("SELECT COUNT(*) as total_reservations FROM reservations");
            $result = $stmt->fetch();
            $reservationCount = $result['total_reservations'];
            echo "<tr><td>Reservations</td><td>{$reservationCount}</td><td class='success'>✅ OK</td></tr>";
        } catch (Exception $e) {
            echo "<tr><td>Reservations</td><td>Error</td><td class='error'>❌ {$e->getMessage()}</td></tr>";
        }
        
        // Test ai_conversations table
        try {
            $stmt = $db->query("SELECT COUNT(*) as total_conversations FROM ai_conversations");
            $result = $stmt->fetch();
            $conversationCount = $result['total_conversations'];
            echo "<tr><td>AI Conversations</td><td>{$conversationCount}</td><td class='success'>✅ OK</td></tr>";
        } catch (Exception $e) {
            echo "<tr><td>AI Conversations</td><td>Error</td><td class='error'>❌ {$e->getMessage()}</td></tr>";
        }
        
        echo "</table>";
        
        echo "<h3 class='success'>🎉 Database setup completed successfully!</h3>";
        echo "<p class='info'>Database structure is ready for API testing.</p>";
        
        // Show sample data
        echo "<h3>📋 Sample Data Preview:</h3>";
        
        // Show sample users
        try {
            $stmt = $db->query("SELECT id, username, full_name, email FROM users LIMIT 3");
            $users = $stmt->fetchAll();
            if ($users) {
                echo "<h4>👥 Users:</h4>";
                echo "<table>";
                echo "<tr><th>ID</th><th>Username</th><th>Full Name</th><th>Email</th></tr>";
                foreach ($users as $user) {
                    echo "<tr><td>{$user['id']}</td><td>{$user['username']}</td><td>{$user['full_name']}</td><td>{$user['email']}</td></tr>";
                }
                echo "</table>";
            }
        } catch (Exception $e) {
            echo "<p class='error'>Error fetching users: {$e->getMessage()}</p>";
        }
        
        // Show sample rooms
        try {
            $stmt = $db->query("SELECT id, name, floor, capacity FROM meeting_rooms LIMIT 3");
            $rooms = $stmt->fetchAll();
            if ($rooms) {
                echo "<h4>🏢 Meeting Rooms:</h4>";
                echo "<table>";
                echo "<tr><th>ID</th><th>Name</th><th>Floor</th><th>Capacity</th></tr>";
                foreach ($rooms as $room) {
                    echo "<tr><td>{$room['id']}</td><td>{$room['name']}</td><td>{$room['floor']}</td><td>{$room['capacity']}</td></tr>";
                }
                echo "</table>";
            }
        } catch (Exception $e) {
            echo "<p class='error'>Error fetching rooms: {$e->getMessage()}</p>";
        }
        
    } else {
        echo "<h2 class='error'>❌ Database connection failed!</h2>";
        echo "<p class='error'>Unable to establish database connection.</p>";
    }
} catch (Exception $e) {
    echo "<h2 class='error'>❌ Error: {$e->getMessage()}</h2>";
    echo "<p class='error'>Database connection failed with error.</p>";
}

echo "<hr>";
echo "<h3>🔗 Next Steps:</h3>";
echo "<p>1. <strong>Test API Endpoints:</strong> Gunakan Postman untuk test endpoint <code>/api/bookings</code></p>";
echo "<p>2. <strong>Import Postman Collection:</strong> File <code>Meeting_Room_Booking_API.postman_collection.json</code></p>";
echo "<p>3. <strong>Test Booking Creation:</strong> Coba buat booking baru via API</p>";

echo "<div style='margin-top: 20px;'>";
echo "<a href='index.php' class='btn'>🏠 Back to Index</a>";
echo "<a href='../api/bookings.php' class='btn'>📡 Test API Direct</a>";
echo "</div>";

echo "</div>";
echo "</body>";
echo "</html>";
?>
