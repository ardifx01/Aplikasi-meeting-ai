<?php
/**
 * MongoDB Configuration
 * For AI Agent bookings and conversations
 */

class MongoDatabase {
    private $client;
    private $db;

    public function __construct(
        $uri = 'mongodb://localhost:27017',
        $dbName = 'spacio_ai'
    ) {
        // Requires ext-mongodb and composer package mongodb/mongodb
        $this->client = new MongoDB\Client($uri);
        $this->db = $this->client->selectDatabase($dbName);
    }

    public function getDb() {
        return $this->db;
    }
}
?>



