<?php
/**
 * Bookings API Endpoint
 * Handles both AI Agent and Form-based bookings
 * Adapted for spacio_meeting_db database structure
 */

header('Content-Type: application/json');
// CORS: allow only localhost:5173 and aplikasi-meeting-ai.test
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (!empty($origin)) {
    header('Access-Control-Allow-Origin: ' . $origin);
} else {
    // Fallback when accessed directly (CLI or same-origin)
    header('Access-Control-Allow-Origin: *');
}
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';
require_once '../models/Booking.php';
require_once '../models/MeetingRoom.php';
require_once '../models/User.php';

$database = new Database();
$db = $database->getConnection();

$booking = new Booking($db);
$meetingRoom = new MeetingRoom($db);
$user = new User($db);
// IMPORTANT: Lazy-load MongoDB model only for Mongo-specific endpoints
function getAiBookingMongoInstance() {
    if (!extension_loaded('mongodb')) {
        return null;
    }
    require_once __DIR__ . '/../models/AiBookingMongo.php';
    try {
        return new AiBookingMongo();
    } catch (Throwable $e) {
        error_log('Failed to init AiBookingMongo: ' . $e->getMessage());
        return null;
    }
}

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));

// Get the endpoint (last part of URL)
$endpoint = end($pathParts);
// Get previous segment if needed (e.g., ai-booking-mongo/{id})
$prevSegment = (count($pathParts) >= 2) ? $pathParts[count($pathParts) - 2] : '';

try {
    switch ($method) {
        case 'GET':
            if ($endpoint === 'bookings') {
                // Get all bookings from ai_booking_data table
                $result = $booking->getAllBookings();
                echo json_encode([
                    'status' => 'success',
                    'data' => $result
                ]);
            } elseif (is_numeric($endpoint)) {
                // Get specific booking by ID
                $result = $booking->getBookingById($endpoint);
                if ($result) {
                    echo json_encode([
                        'status' => 'success',
                        'data' => $result
                    ]);
                } else {
                    http_response_code(404);
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'Booking not found'
                    ]);
                }
            } elseif ($endpoint === 'user') {
                // Get bookings by user ID
                $userId = $_GET['user_id'] ?? null;
                if ($userId) {
                    $result = $booking->getBookingsByUserId($userId);
                    echo json_encode([
                        'status' => 'success',
                        'data' => $result
                    ]);
                } else {
                    http_response_code(400);
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'User ID required'
                    ]);
                }
            } elseif ($endpoint === 'rooms') {
                // Get all meeting rooms
                $result = $meetingRoom->getAllRooms();
                echo json_encode([
                    'status' => 'success',
                    'data' => $result
                ]);
            } elseif ($endpoint === 'availability') {
                // Check room availability
                $roomId = $_GET['room_id'] ?? null;
                $date = $_GET['date'] ?? null;
                $startTime = $_GET['start_time'] ?? null;
                $endTime = $_GET['end_time'] ?? null;
                
                if ($roomId && $date && $startTime && $endTime) {
                    $result = $booking->checkRoomAvailability($roomId, $date, $startTime, $endTime);
                    echo json_encode([
                        'status' => 'success',
                        'data' => $result
                    ]);
                } else {
                    http_response_code(400);
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'Room ID, date, start time, and end time required'
                    ]);
                }
            } elseif ($endpoint === 'conversations') {
                // Get AI conversations
                $userId = $_GET['user_id'] ?? null;
                $sessionId = $_GET['session_id'] ?? null;
                
                $result = $booking->getAIConversations($userId, $sessionId);
                echo json_encode([
                    'status' => 'success',
                    'data' => $result
                ]);
            } elseif ($endpoint === 'ai-user') {
                // Get AI bookings from MongoDB by user ID
                $mongo = getAiBookingMongoInstance();
                if ($mongo === null) {
                    http_response_code(503);
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'MongoDB extension not available'
                    ]);
                    break;
                }
                $userId = $_GET['user_id'] ?? null;
                if ($userId) {
                    $result = $mongo->getBookingsByUserId($userId);
                    echo json_encode([
                        'status' => 'success',
                        'data' => $result
                    ]);
                } else {
                    http_response_code(400);
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'User ID required'
                    ]);
                }
            } elseif ($endpoint === 'ai-conversations-mongo') {
                // Get AI conversations from MongoDB
                $mongo = getAiBookingMongoInstance();
                if ($mongo === null) {
                    http_response_code(503);
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'MongoDB extension not available'
                    ]);
                    break;
                }
                $userId = $_GET['user_id'] ?? null;
                $sessionId = $_GET['session_id'] ?? null;
                $result = $mongo->getConversations($userId, $sessionId);
                echo json_encode([
                    'status' => 'success',
                    'data' => $result
                ]);
            } else {
                http_response_code(404);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Endpoint not found'
                ]);
            }
            break;

        case 'POST':
            if ($endpoint === 'bookings') {
                // Create new booking (form-based)
                $data = json_decode(file_get_contents('php://input'), true);
                
                // Validate required fields
                $requiredFields = ['user_id', 'room_id', 'topic', 'meeting_date', 'meeting_time', 'duration', 'participants', 'meeting_type', 'food_order'];
                foreach ($requiredFields as $field) {
                    if (!isset($data[$field]) || empty($data[$field])) {
                        http_response_code(400);
                        echo json_encode([
                            'status' => 'error',
                            'message' => "Field '$field' is required"
                        ]);
                        exit;
                    }
                }

                // Check if room is available
                $isAvailable = $booking->checkRoomAvailability(
                    $data['room_id'], 
                    $data['meeting_date'], 
                    $data['meeting_time'], 
                    $data['duration']
                );

                if (!$isAvailable['available']) {
                    http_response_code(409);
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'Room is not available for the selected time',
                        'data' => $isAvailable
                    ]);
                    exit;
                }

                // Create booking
                $result = $booking->createBooking($data);
                if ($result) {
                    echo json_encode([
                        'status' => 'success',
                        'message' => 'Booking created successfully',
                        'data' => $result
                    ]);
                } else {
                    http_response_code(500);
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'Failed to create booking'
                    ]);
                }
            } elseif ($endpoint === 'ai-booking') {
                // Create booking from AI agent
                $data = json_decode(file_get_contents('php://input'), true);
                
                // Validate AI booking data
                $requiredFields = ['user_id', 'session_id', 'room_id', 'topic', 'meeting_date', 'meeting_time', 'duration', 'participants', 'meeting_type', 'food_order'];
                foreach ($requiredFields as $field) {
                    if (!isset($data[$field]) || empty($data[$field])) {
                        http_response_code(400);
                        echo json_encode([
                            'status' => 'error',
                            'message' => "Field '$field' is required"
                        ]);
                        exit;
                    }
                }

                // Check availability
                $isAvailable = $booking->checkRoomAvailability(
                    $data['room_id'], 
                    $data['meeting_date'], 
                    $data['meeting_time'], 
                    $data['duration']
                );

                if (!$isAvailable['available']) {
                    http_response_code(409);
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'Room is not available for the selected time',
                        'data' => $isAvailable
                    ]);
                    exit;
                }

                // Create AI booking
                $result = $booking->createAIBooking($data);
                if ($result) {
                    // Save AI conversation
                    $booking->saveAIConversation($data['user_id'], $data['session_id'], $data);
                    
                    echo json_encode([
                        'status' => 'success',
                        'message' => 'AI booking created successfully',
                        'data' => $result
                    ]);
                } else {
                    http_response_code(500);
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'Failed to create AI booking'
                    ]);
                }
            } elseif ($endpoint === 'ai-booking-mongo') {
                // Create AI booking in MongoDB
                $data = json_decode(file_get_contents('php://input'), true);
                
                // Validate AI booking data
                $requiredFields = ['user_id', 'session_id', 'room_id', 'topic', 'meeting_date', 'meeting_time', 'duration', 'participants', 'meeting_type', 'food_order'];
                foreach ($requiredFields as $field) {
                    if (!isset($data[$field]) || empty($data[$field])) {
                        http_response_code(400);
                        echo json_encode([
                            'status' => 'error',
                            'message' => "Field '$field' is required"
                        ]);
                        exit;
                    }
                }

                // Create AI booking in MongoDB
                $mongo = getAiBookingMongoInstance();
                if ($mongo === null) {
                    http_response_code(503);
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'MongoDB extension not available'
                    ]);
                    break;
                }
                $result = $mongo->createAIBooking($data);
                if ($result) {
                    // Save AI conversation to MongoDB
                    $mongo->saveConversation(
                        $data['user_id'], 
                        $data['session_id'], 
                        "AI Agent created booking: " . $data['topic'],
                        'Booking created successfully',
                        $data['booking_state'] ?? 'BOOKED',
                        json_encode($data)
                    );
                    
                    echo json_encode([
                        'status' => 'success',
                        'message' => 'AI booking created successfully in MongoDB',
                        'data' => $result
                    ]);
                } else {
                    http_response_code(500);
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'Failed to create AI booking in MongoDB'
                    ]);
                }
            } elseif ($endpoint === 'ai-conversations-mongo') {
                // Save AI conversation to MongoDB
                $data = json_decode(file_get_contents('php://input'), true);
                
                $requiredFields = ['user_id', 'session_id', 'message', 'response', 'booking_state'];
                foreach ($requiredFields as $field) {
                    if (!isset($data[$field])) {
                        http_response_code(400);
                        echo json_encode([
                            'status' => 'error',
                            'message' => "Field '$field' is required"
                        ]);
                        exit;
                    }
                }

                $result = $aiBookingMongo->saveConversation(
                    $data['user_id'],
                    $data['session_id'],
                    $data['message'],
                    $data['response'],
                    $data['booking_state'],
                    $data['booking_data'] ?? ''
                );

                if ($result) {
                    echo json_encode([
                        'status' => 'success',
                        'message' => 'AI conversation saved to MongoDB'
                    ]);
                } else {
                    http_response_code(500);
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'Failed to save AI conversation to MongoDB'
                    ]);
                }
            } else {
                http_response_code(404);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Endpoint not found'
                ]);
            }
            break;

        case 'PUT':
            if (is_numeric($endpoint)) {
                // Update booking
                $data = json_decode(file_get_contents('php://input'), true);
                $data['id'] = $endpoint;
                
                $result = $booking->updateBooking($data);
                if ($result) {
                    echo json_encode([
                        'status' => 'success',
                        'message' => 'Booking updated successfully',
                        'data' => $result
                    ]);
                } else {
                    http_response_code(500);
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'Failed to update booking'
                    ]);
                }
            } else {
                http_response_code(404);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Endpoint not found'
                ]);
            }
            break;

        case 'DELETE':
            if (is_numeric($endpoint)) {
                // Delete booking (MySQL)
                $result = $booking->deleteBooking($endpoint);
                if ($result) {
                    echo json_encode([
                        'status' => 'success',
                        'message' => 'Booking deleted successfully'
                    ]);
                } else {
                    http_response_code(500);
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'Failed to delete booking'
                    ]);
                }
            } elseif ($prevSegment === 'ai-booking-mongo' && preg_match('/^[a-f0-9]{24}$/i', $endpoint)) {
                // Cancel AI booking in MongoDB
                $mongo = getAiBookingMongoInstance();
                if ($mongo === null) {
                    http_response_code(503);
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'MongoDB extension not available'
                    ]);
                    break;
                }
                $ok = $mongo->cancelBooking($endpoint);
                if ($ok) {
                    echo json_encode([
                        'status' => 'success',
                        'message' => 'AI booking cancelled'
                    ]);
                } else {
                    http_response_code(500);
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'Failed to cancel AI booking'
                    ]);
                }
            } else {
                http_response_code(404);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Endpoint not found'
                ]);
            }
            break;

        default:
            http_response_code(405);
            echo json_encode([
                'status' => 'error',
                'message' => 'Method not allowed'
            ]);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Internal server error',
        'debug' => $e->getMessage()
    ]);
}

$database->closeConnection();
?>
