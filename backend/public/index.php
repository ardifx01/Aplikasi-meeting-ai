<?php
/**
 * Backend Index File
 * Test file untuk memverifikasi backend bisa diakses
 */

echo "<h1>🚀 Backend API Berhasil Diakses!</h1>";
echo "<p>Backend untuk Meeting Room Booking System sudah siap.</p>";
echo "<hr>";
echo "<h2>📁 Struktur Folder:</h2>";
echo "<ul>";
echo "<li>✅ <code>config/</code> - Database configuration</li>";
echo "<li>✅ <code>models/</code> - Database models</li>";
echo "<li>✅ <code>api/</code> - API endpoints</li>";
echo "<li>✅ <code>public/</code> - Public accessible files</li>";
echo "</ul>";
echo "<hr>";
echo "<h2>🔗 Test Links:</h2>";
echo "<ul>";
echo "<li><a href='test_connection.php'>🧪 Test Database Connection</a></li>";
echo "<li><a href='../api/bookings.php'>📡 API Endpoint (akan error karena tidak ada method)</a></li>";
echo "</ul>";
echo "<hr>";
echo "<p><strong>Status:</strong> <span style='color: green;'>✅ Backend Ready</span></p>";
echo "<p><strong>Next Step:</strong> Test dengan Postman menggunakan endpoint <code>/api/bookings</code></p>";
?>
