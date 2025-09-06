<?php
/**
 * Test endpoint untuk debug delete functionality
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';
require_once '../models/AiBookingSuccess.php';

$database = new Database();
$db = $database->getConnection();
$aiBookingSuccess = new AiBookingSuccess($db);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'DELETE') {
    // Get ID from URL
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $pathParts = explode('/', trim($path, '/'));
    $id = end($pathParts);
    
    if (is_numeric($id)) {
        try {
            // Log sebelum delete
            error_log("Attempting to delete AI booking with ID: $id");
            
            // Cek data sebelum delete
            $stmt = $db->prepare("SELECT id, session_id, room_name FROM ai_bookings_success WHERE id = ?");
            $stmt->execute([$id]);
            $beforeData = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($beforeData) {
                error_log("Found data before delete: " . json_encode($beforeData));
                
                // Lakukan delete
                $result = $aiBookingSuccess->deleteBooking($id);
                
                // Cek data setelah delete
                $stmt = $db->prepare("SELECT id FROM ai_bookings_success WHERE id = ?");
                $stmt->execute([$id]);
                $afterData = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($result && !$afterData) {
                    echo json_encode([
                        'status' => 'success',
                        'message' => 'AI booking deleted successfully',
                        'debug' => [
                            'id' => $id,
                            'before_data' => $beforeData,
                            'after_data' => $afterData
                        ]
                    ]);
                } else {
                    http_response_code(500);
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'Failed to delete AI booking',
                        'debug' => [
                            'id' => $id,
                            'result' => $result,
                            'after_data' => $afterData
                        ]
                    ]);
                }
            } else {
                http_response_code(404);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'AI booking not found',
                    'debug' => ['id' => $id]
                ]);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Internal server error',
                'debug' => $e->getMessage()
            ]);
        }
    } else {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'Invalid ID'
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Method not allowed'
    ]);
}
?>
