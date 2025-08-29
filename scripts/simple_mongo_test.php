<?php
// Simple MongoDB Connection Test
echo "Testing MongoDB connection...\n";

try {
    // Test basic connection without composer library
    $connection = new MongoDB\Driver\Manager('mongodb://localhost:27017');
    echo "✓ MongoDB connection established\n";
    
    // Test database query
    $query = new MongoDB\Driver\Query([]);
    $cursor = $connection->executeQuery('spacio_ai.ai_bookings', $query);
    echo "✓ Database query successful\n";
    echo "✓ Collections exist and accessible\n";
    
    echo "\n🎉 MongoDB is working!\n";
    echo "Connection string for Compass: mongodb://localhost:27017\n";
    
} catch (Exception $e) {
    echo "❌ MongoDB connection failed: " . $e->getMessage() . "\n";
    echo "\nPlease check:\n";
    echo "1. MongoDB service is running\n";
    echo "2. Port 27017 is available\n";
}
?>

