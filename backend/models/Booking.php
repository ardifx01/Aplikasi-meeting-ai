<?php
/**
 * Booking Model
 * Handles all database operations for bookings
 * Adapted for spacio_meeting_db database structure
 */

class Booking {
    private $conn;
    private $table_name = "ai_booking_data";

    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Create a new AI booking
     */
    public function createAIBooking($data) {
        try {
            $query = "INSERT INTO " . $this->table_name . "
                    (user_id, session_id, room_id, topic, meeting_date, meeting_time, 
                     duration, participants, meeting_type, food_order, booking_state)
                    VALUES (:user_id, :session_id, :room_id, :topic, :meeting_date, :meeting_time,
                            :duration, :participants, :meeting_type, :food_order, :booking_state)";

            $stmt = $this->conn->prepare($query);

            // Bind parameters
            $stmt->bindParam(":user_id", $data['user_id']);
            $stmt->bindParam(":session_id", $data['session_id']);
            $stmt->bindParam(":room_id", $data['room_id']);
            $stmt->bindParam(":topic", $data['topic']);
            $stmt->bindParam(":meeting_date", $data['meeting_date']);
            $stmt->bindParam(":meeting_time", $data['meeting_time']);
            $stmt->bindParam(":duration", $data['duration']);
            $stmt->bindParam(":participants", $data['participants']);
            $stmt->bindParam(":meeting_type", $data['meeting_type']);
            $stmt->bindParam(":food_order", $data['food_order']);
            $stmt->bindParam(":booking_state", $data['booking_state'] ?? 'BOOKED');

            if ($stmt->execute()) {
                $bookingId = $this->conn->lastInsertId();
                return $this->getBookingById($bookingId);
            }
            return false;
        } catch (PDOException $e) {
            error_log("Error creating AI booking: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Create a new form-based booking
     */
    public function createBooking($data) {
        try {
            $query = "INSERT INTO " . $this->table_name . "
                    (user_id, session_id, room_id, topic, meeting_date, meeting_time, 
                     duration, participants, meeting_type, food_order, booking_state)
                    VALUES (:user_id, :session_id, :room_id, :topic, :meeting_date, :meeting_time,
                            :duration, :participants, :meeting_type, :food_order, :booking_state)";

            $stmt = $this->conn->prepare($query);

            // Generate session ID for form-based booking
            $sessionId = 'form_' . time();

            // Bind parameters
            $stmt->bindParam(":user_id", $data['user_id']);
            $stmt->bindParam(":session_id", $sessionId);
            $stmt->bindParam(":room_id", $data['room_id']);
            $stmt->bindParam(":topic", $data['topic']);
            $stmt->bindParam(":meeting_date", $data['meeting_date']);
            $stmt->bindParam(":meeting_time", $data['meeting_time']);
            $stmt->bindParam(":duration", $data['duration']);
            $stmt->bindParam(":participants", $data['participants']);
            $stmt->bindParam(":meeting_type", $data['meeting_type']);
            $stmt->bindParam(":food_order", $data['food_order']);
            $stmt->bindParam(":booking_state", $data['booking_state'] ?? 'BOOKED');

            if ($stmt->execute()) {
                $bookingId = $this->conn->lastInsertId();
                return $this->getBookingById($bookingId);
            }
            return false;
        } catch (PDOException $e) {
            error_log("Error creating form booking: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get all bookings
     */
    public function getAllBookings() {
        try {
            $query = "SELECT b.*, u.full_name as user_name, u.email as user_email,
                             r.name as room_name, r.capacity as room_capacity
                      FROM " . $this->table_name . " b
                      LEFT JOIN users u ON b.user_id = u.id
                      LEFT JOIN meeting_rooms r ON b.room_id = r.id
                      ORDER BY b.created_at DESC";

            $stmt = $this->conn->prepare($query);
            $stmt->execute();

            return $stmt->fetchAll();
        } catch (PDOException $e) {
            error_log("Error getting all bookings: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Get booking by ID
     */
    public function getBookingById($id) {
        try {
            $query = "SELECT b.*, u.full_name as user_name, u.email as user_email,
                             r.name as room_name, r.capacity as room_capacity
                      FROM " . $this->table_name . " b
                      LEFT JOIN users u ON b.user_id = u.id
                      LEFT JOIN meeting_rooms r ON b.room_id = r.id
                      WHERE b.id = :id";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id", $id);
            $stmt->execute();

            return $stmt->fetch();
        } catch (PDOException $e) {
            error_log("Error getting booking by ID: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get bookings by user ID
     */
    public function getBookingsByUserId($userId) {
        try {
            $query = "SELECT b.*, r.name as room_name, r.capacity as room_capacity
                      FROM " . $this->table_name . " b
                      LEFT JOIN meeting_rooms r ON b.room_id = r.id
                      WHERE b.user_id = :user_id
                      ORDER BY b.created_at DESC";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":user_id", $userId);
            $stmt->execute();

            return $stmt->fetchAll();
        } catch (PDOException $e) {
            error_log("Error getting bookings by user ID: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Update booking
     */
    public function updateBooking($data) {
        try {
            $query = "UPDATE " . $this->table_name . "
                    SET room_id = :room_id, topic = :topic, meeting_date = :meeting_date,
                        meeting_time = :meeting_time, duration = :duration, participants = :participants,
                        meeting_type = :meeting_type, food_order = :food_order, 
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = :id";

            $stmt = $this->conn->prepare($query);

            // Bind parameters
            $stmt->bindParam(":id", $data['id']);
            $stmt->bindParam(":room_id", $data['room_id']);
            $stmt->bindParam(":topic", $data['topic']);
            $stmt->bindParam(":meeting_date", $data['meeting_date']);
            $stmt->bindParam(":meeting_time", $data['meeting_time']);
            $stmt->bindParam(":duration", $data['duration']);
            $stmt->bindParam(":participants", $data['participants']);
            $stmt->bindParam(":meeting_type", $data['meeting_type']);
            $stmt->bindParam(":food_order", $data['food_order']);

            if ($stmt->execute()) {
                return $this->getBookingById($data['id']);
            }
            return false;
        } catch (PDOException $e) {
            error_log("Error updating booking: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Delete booking
     */
    public function deleteBooking($id) {
        try {
            $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id", $id);

            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error deleting booking: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Check room availability
     */
    public function checkRoomAvailability($roomId, $date, $startTime, $duration) {
        try {
            // Calculate end time based on duration
            $startDateTime = strtotime($startTime);
            $endDateTime = strtotime("+{$duration} minutes", $startDateTime);
            $endTime = date('H:i:s', $endDateTime);

            $query = "SELECT COUNT(*) as conflicting_bookings
                      FROM " . $this->table_name . "
                      WHERE room_id = :room_id 
                      AND meeting_date = :date
                      AND booking_state != 'CANCELLED'
                      AND (
                          (meeting_time <= :start_time AND DATE_ADD(meeting_time, INTERVAL duration MINUTE) > :start_time) OR
                          (meeting_time < :end_time AND DATE_ADD(meeting_time, INTERVAL duration MINUTE) >= :end_time) OR
                          (meeting_time >= :start_time AND meeting_time <= :end_time)
                      )";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":room_id", $roomId);
            $stmt->bindParam(":date", $date);
            $stmt->bindParam(":start_time", $startTime);
            $stmt->bindParam(":end_time", $endTime);
            $stmt->execute();

            $result = $stmt->fetch();
            $conflictingBookings = $result['conflicting_bookings'];

            return [
                'available' => $conflictingBookings == 0,
                'conflicting_bookings' => $conflictingBookings,
                'room_id' => $roomId,
                'date' => $date,
                'start_time' => $startTime,
                'end_time' => $endTime,
                'duration' => $duration
            ];
        } catch (PDOException $e) {
            error_log("Error checking room availability: " . $e->getMessage());
            return ['available' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Save AI conversation
     */
    public function saveAIConversation($userId, $sessionId, $data) {
        try {
            $query = "INSERT INTO ai_conversations 
                     (user_id, session_id, message, ai_response, booking_state, booking_data)
                     VALUES (:user_id, :session_id, :message, :ai_response, :booking_state, :booking_data)";

            $stmt = $this->conn->prepare($query);
            
            $message = "AI Agent created booking: " . json_encode($data);
            $aiResponse = "Booking created successfully";
            $bookingState = "BOOKED";
            $bookingData = json_encode($data);

            $stmt->bindParam(":user_id", $userId);
            $stmt->bindParam(":session_id", $sessionId);
            $stmt->bindParam(":message", $message);
            $stmt->bindParam(":ai_response", $aiResponse);
            $stmt->bindParam(":booking_state", $bookingState);
            $stmt->bindParam(":booking_data", $bookingData);

            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error saving AI conversation: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get AI conversation history
     */
    public function getAIConversations($userId = null, $sessionId = null) {
        try {
            $query = "SELECT * FROM ai_conversations";
            $params = [];

            if ($userId) {
                $query .= " WHERE user_id = :user_id";
                $params[':user_id'] = $userId;
                
                if ($sessionId) {
                    $query .= " AND session_id = :session_id";
                    $params[':session_id'] = $sessionId;
                }
            }

            $query .= " ORDER BY created_at DESC";

            $stmt = $this->conn->prepare($query);
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            $stmt->execute();

            return $stmt->fetchAll();
        } catch (PDOException $e) {
            error_log("Error getting AI conversations: " . $e->getMessage());
            return [];
        }
    }
}
?>
