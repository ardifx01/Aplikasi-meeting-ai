<?php
/**
 * Meeting Room Model
 * Handles all database operations for meeting rooms
 */

class MeetingRoom {
    private $conn;
    private $table_name = "meeting_rooms";

    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Get all meeting rooms
     */
    public function getAllRooms() {
        try {
            $query = "SELECT * FROM " . $this->table_name . " WHERE is_active = true ORDER BY name";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();

            return $stmt->fetchAll();
        } catch (PDOException $e) {
            error_log("Error getting all rooms: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Get room by ID
     */
    public function getRoomById($id) {
        try {
            $query = "SELECT * FROM " . $this->table_name . " WHERE id = :id AND is_active = true";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id", $id);
            $stmt->execute();

            return $stmt->fetch();
        } catch (PDOException $e) {
            error_log("Error getting room by ID: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get room by name
     */
    public function getRoomByName($name) {
        try {
            $query = "SELECT * FROM " . $this->table_name . " WHERE name = :name AND is_active = true";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":name", $name);
            $stmt->execute();

            return $stmt->fetch();
        } catch (PDOException $e) {
            error_log("Error getting room by name: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get rooms by capacity
     */
    public function getRoomsByCapacity($minCapacity, $maxCapacity = null) {
        try {
            if ($maxCapacity) {
                $query = "SELECT * FROM " . $this->table_name . " 
                         WHERE capacity >= :min_capacity AND capacity <= :max_capacity AND is_active = true 
                         ORDER BY capacity, name";
                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(":min_capacity", $minCapacity);
                $stmt->bindParam(":max_capacity", $maxCapacity);
            } else {
                $query = "SELECT * FROM " . $this->table_name . " 
                         WHERE capacity >= :min_capacity AND is_active = true 
                         ORDER BY capacity, name";
                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(":min_capacity", $minCapacity);
            }

            $stmt->execute();
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            error_log("Error getting rooms by capacity: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Get rooms by floor
     */
    public function getRoomsByFloor($floor) {
        try {
            $query = "SELECT * FROM " . $this->table_name . " 
                     WHERE floor = :floor AND is_active = true 
                     ORDER BY name";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":floor", $floor);
            $stmt->execute();

            return $stmt->fetchAll();
        } catch (PDOException $e) {
            error_log("Error getting rooms by floor: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Get rooms by facilities
     */
    public function getRoomsByFacilities($facilities) {
        try {
            if (is_array($facilities)) {
                $facilities = json_encode($facilities);
            }

            $query = "SELECT * FROM " . $this->table_name . " 
                     WHERE JSON_CONTAINS(facilities, :facilities) AND is_active = true 
                     ORDER BY name";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":facilities", $facilities);
            $stmt->execute();

            return $stmt->fetchAll();
        } catch (PDOException $e) {
            error_log("Error getting rooms by facilities: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Create new meeting room
     */
    public function createRoom($data) {
        try {
            $query = "INSERT INTO " . $this->table_name . "
                    (name, floor, capacity, address, facilities, image_url)
                    VALUES (:name, :floor, :capacity, :address, :facilities, :image_url)";

            $stmt = $this->conn->prepare($query);

            // Bind parameters
            $stmt->bindParam(":name", $data['name']);
            $stmt->bindParam(":floor", $data['floor']);
            $stmt->bindParam(":capacity", $data['capacity']);
            $stmt->bindParam(":address", $data['address']);
            $stmt->bindParam(":facilities", $data['facilities']);
            $stmt->bindParam(":image_url", $data['image_url'] ?? null);

            if ($stmt->execute()) {
                $roomId = $this->conn->lastInsertId();
                return $this->getRoomById($roomId);
            }
            return false;
        } catch (PDOException $e) {
            error_log("Error creating room: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Update meeting room
     */
    public function updateRoom($data) {
        try {
            $query = "UPDATE " . $this->table_name . "
                    SET name = :name, floor = :floor, capacity = :capacity,
                        address = :address, facilities = :facilities, 
                        image_url = :image_url, updated_at = CURRENT_TIMESTAMP
                    WHERE id = :id";

            $stmt = $this->conn->prepare($query);

            // Bind parameters
            $stmt->bindParam(":id", $data['id']);
            $stmt->bindParam(":name", $data['name']);
            $stmt->bindParam(":floor", $data['floor']);
            $stmt->bindParam(":capacity", $data['capacity']);
            $stmt->bindParam(":address", $data['address']);
            $stmt->bindParam(":facilities", $data['facilities']);
            $stmt->bindParam(":image_url", $data['image_url'] ?? null);

            if ($stmt->execute()) {
                return $this->getRoomById($data['id']);
            }
            return false;
        } catch (PDOException $e) {
            error_log("Error updating room: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Delete meeting room (soft delete)
     */
    public function deleteRoom($id) {
        try {
            $query = "UPDATE " . $this->table_name . " 
                     SET is_active = false, updated_at = CURRENT_TIMESTAMP 
                     WHERE id = :id";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id", $id);

            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error deleting room: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get room availability for a specific date
     */
    public function getRoomAvailability($roomId, $date) {
        try {
            $query = "SELECT ra.time_slot, ra.is_available, b.topic, b.start_time, b.end_time
                     FROM room_availability ra
                     LEFT JOIN bookings b ON ra.booking_id = b.id
                     WHERE ra.room_id = :room_id AND ra.date = :date
                     ORDER BY ra.time_slot";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":room_id", $roomId);
            $stmt->bindParam(":date", $date);
            $stmt->execute();

            return $stmt->fetchAll();
        } catch (PDOException $e) {
            error_log("Error getting room availability: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Get room statistics
     */
    public function getRoomStatistics($roomId = null) {
        try {
            if ($roomId) {
                $query = "SELECT 
                            r.name,
                            COUNT(b.id) as total_bookings,
                            COUNT(CASE WHEN b.status_id = 1 THEN 1 END) as pending_bookings,
                            COUNT(CASE WHEN b.status_id = 2 THEN 1 END) as confirmed_bookings,
                            COUNT(CASE WHEN b.status_id = 3 THEN 1 END) as cancelled_bookings,
                            COUNT(CASE WHEN b.status_id = 4 THEN 1 END) as completed_bookings,
                            AVG(b.participants) as avg_participants
                         FROM meeting_rooms r
                         LEFT JOIN bookings b ON r.id = b.room_id
                         WHERE r.id = :room_id AND r.is_active = true
                         GROUP BY r.id, r.name";
                
                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(":room_id", $roomId);
            } else {
                $query = "SELECT 
                            r.name,
                            COUNT(b.id) as total_bookings,
                            COUNT(CASE WHEN b.status_id = 1 THEN 1 END) as pending_bookings,
                            COUNT(CASE WHEN b.status_id = 2 THEN 1 END) as confirmed_bookings,
                            COUNT(CASE WHEN b.status_id = 3 THEN 1 END) as cancelled_bookings,
                            COUNT(CASE WHEN b.status_id = 4 THEN 1 END) as completed_bookings,
                            AVG(b.participants) as avg_participants
                         FROM meeting_rooms r
                         LEFT JOIN bookings b ON r.id = b.room_id
                         WHERE r.is_active = true
                         GROUP BY r.id, r.name
                         ORDER BY total_bookings DESC";
                
                $stmt = $this->conn->prepare($query);
            }

            $stmt->execute();
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            error_log("Error getting room statistics: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Search rooms by criteria
     */
    public function searchRooms($criteria) {
        try {
            $whereConditions = ["is_active = true"];
            $params = [];

            if (!empty($criteria['name'])) {
                $whereConditions[] = "name LIKE :name";
                $params[':name'] = '%' . $criteria['name'] . '%';
            }

            if (!empty($criteria['floor'])) {
                $whereConditions[] = "floor = :floor";
                $params[':floor'] = $criteria['floor'];
            }

            if (!empty($criteria['min_capacity'])) {
                $whereConditions[] = "capacity >= :min_capacity";
                $params[':min_capacity'] = $criteria['min_capacity'];
            }

            if (!empty($criteria['max_capacity'])) {
                $whereConditions[] = "capacity <= :max_capacity";
                $params[':max_capacity'] = $criteria['max_capacity'];
            }

            if (!empty($criteria['facilities'])) {
                $whereConditions[] = "JSON_CONTAINS(facilities, :facilities)";
                $params[':facilities'] = json_encode($criteria['facilities']);
            }

            $whereClause = implode(' AND ', $whereConditions);
            $query = "SELECT * FROM " . $this->table_name . " WHERE " . $whereClause . " ORDER BY name";

            $stmt = $this->conn->prepare($query);
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            $stmt->execute();

            return $stmt->fetchAll();
        } catch (PDOException $e) {
            error_log("Error searching rooms: " . $e->getMessage());
            return [];
        }
    }
}
?>
