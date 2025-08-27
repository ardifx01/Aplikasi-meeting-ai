<?php
// Quick DB connectivity test using existing config
require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json');

$result = testDatabaseConnection();
echo json_encode($result, JSON_PRETTY_PRINT);
?>


