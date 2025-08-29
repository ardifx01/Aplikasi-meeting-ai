<?php
// Bootstrap MongoDB for AI Agent
// Run: php scripts/mongo_bootstrap.php

require_once __DIR__ . '/../vendor/autoload.php';

use MongoDB\Client;

$uri = getenv('MONGO_URI') ?: 'mongodb://localhost:27017';
$dbName = getenv('MONGO_DB') ?: 'spacio_ai';

$client = new Client($uri);
$db = $client->selectDatabase($dbName);

// Collections
$aiBookings = $db->selectCollection('ai_bookings');
$aiConversations = $db->selectCollection('ai_conversations');

// Indexes for ai_bookings
$aiBookings->createIndex(['user_id' => 1, 'meeting_date' => 1, 'meeting_time' => 1]);
$aiBookings->createIndex(['room_id' => 1, 'meeting_date' => 1, 'meeting_time' => 1]);
$aiBookings->createIndex(['created_at' => -1]);

// Indexes for ai_conversations
$aiConversations->createIndex(['user_id' => 1, 'session_id' => 1, 'created_at' => -1]);

echo "MongoDB bootstrap completed for database '{$dbName}'.\n";



