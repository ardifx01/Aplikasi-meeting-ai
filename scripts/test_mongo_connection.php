<?php
// Test MongoDB Connection
require_once __DIR__ . '/../vendor/autoload.php';

try {
    echo "Testing MongoDB connection...\n";
    
    // Test connection
    $client = new MongoDB\Client('mongodb://localhost:27017');
    echo "✓ MongoDB client created successfully\n";
    
    // Test database access
    $db = $client->selectDatabase('spacio_ai');
    echo "✓ Database 'spacio_ai' selected\n";
    
    // Test collections
    $collections = $db->listCollections();
    echo "✓ Available collections:\n";
    foreach ($collections as $collection) {
        echo "  - " . $collection->getName() . "\n";
    }
    
    // Test insert and read
    $testCollection = $db->selectCollection('test_connection');
    $insertResult = $testCollection->insertOne([
        'test' => true,
        'timestamp' => new MongoDB\BSON\UTCDateTime(),
        'message' => 'Connection test successful'
    ]);
    echo "✓ Test document inserted with ID: " . $insertResult->getInsertedId() . "\n";
    
    // Read back the document
    $document = $testCollection->findOne(['test' => true]);
    if ($document) {
        echo "✓ Test document retrieved: " . $document['message'] . "\n";
    }
    
    // Clean up test document
    $testCollection->deleteOne(['test' => true]);
    echo "✓ Test document cleaned up\n";
    
    echo "\n🎉 MongoDB connection test PASSED!\n";
    echo "You can now connect via MongoDB Compass using: mongodb://localhost:27017\n";
    
} catch (Exception $e) {
    echo "❌ MongoDB connection test FAILED!\n";
    echo "Error: " . $e->getMessage() . "\n";
    echo "\nTroubleshooting:\n";
    echo "1. Make sure MongoDB service is running\n";
    echo "2. Check if MongoDB is listening on port 27017\n";
    echo "3. Verify PHP mongodb extension is loaded\n";
}
?>

