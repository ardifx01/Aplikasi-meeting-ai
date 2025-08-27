/**
 * API Configuration for Spacio Meeting Room Booker
 * Updated to use the correct backend endpoints
 */

// Base API URL - now pointing to our PHP backend
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://yourdomain.com/api' 
    : '/api';

// API Endpoints
export const API_ENDPOINTS = {
    // Authentication
    AUTH: {
        LOGIN: `${API_BASE_URL}/auth/login.php`,
        REGISTER: `${API_BASE_URL}/auth/login.php`,
        LOGOUT: `${API_BASE_URL}/auth/session.php`,
    },
    
    // Meeting Rooms
    ROOMS: {
        GET_ALL: `${API_BASE_URL}/bookings/rooms`,
        GET_BY_ID: (id: number) => `${API_BASE_URL}/bookings/rooms/${id}`,
        GET_AVAILABLE: (startTime: string, endTime: string) => 
            `${API_BASE_URL}/bookings/availability?start_time=${startTime}&end_time=${endTime}`,
        SEARCH: (searchTerm: string, capacityMin?: number, capacityMax?: number, roomType?: string) => {
            let url = `${API_BASE_URL}/bookings/rooms?search=${encodeURIComponent(searchTerm)}`;
            if (capacityMin !== undefined) url += `&capacity_min=${capacityMin}`;
            if (capacityMax !== undefined) url += `&capacity_max=${capacityMax}`;
            if (roomType) url += `&room_type=${roomType}`;
            return url;
        },
        CREATE: `${API_BASE_URL}/bookings/rooms`,
        UPDATE: `${API_BASE_URL}/bookings/rooms`,
        DELETE: `${API_BASE_URL}/bookings/rooms`,
    },
    
    // Reservations/Bookings
    RESERVATIONS: {
        GET_BY_ID: (id: number) => `${API_BASE_URL}/bookings/${id}`,
        GET_USER_RESERVATIONS: (userId: number) => 
            `${API_BASE_URL}/bookings/user?user_id=${userId}`,
        GET_ROOM_RESERVATIONS: (roomId: number, date?: string) => {
            let url = `${API_BASE_URL}/bookings?room_id=${roomId}`;
            if (date) url += `&date=${date}`;
            return url;
        },
        GET_UPCOMING: (userId?: number, limit: number = 10) => {
            let url = `${API_BASE_URL}/bookings?limit=${limit}`;
            if (userId) url += `&user_id=${userId}`;
            return url;
        },
        GET_STATS: (userId?: number) => {
            let url = `${API_BASE_URL}/bookings/stats`;
            if (userId) url += `&user_id=${userId}`;
            return url;
        },
        CREATE: `${API_BASE_URL}/bookings`,
        UPDATE: `${API_BASE_URL}/bookings`,
        CANCEL: `${API_BASE_URL}/bookings`,
    },

    // AI Bookings
    AI_BOOKINGS: {
        CREATE: `${API_BASE_URL}/bookings/ai-booking`,
        GET_CONVERSATIONS: `${API_BASE_URL}/bookings/conversations`,
        SAVE_CONVERSATION: `${API_BASE_URL}/bookings/conversations`,
    }
};

// API Helper Functions
export class ApiService {
    private static async makeRequest(url: string, options: RequestInit = {}) {
        const defaultOptions: RequestInit = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, defaultOptions);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }
            
            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Authentication methods
    static async login(email: string, password: string) {
        return this.makeRequest(API_ENDPOINTS.AUTH.LOGIN, {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    static async register(username: string, email: string, password: string, fullName: string) {
        return this.makeRequest(API_ENDPOINTS.AUTH.REGISTER, {
            method: 'POST',
            body: JSON.stringify({ username, email, password, full_name: fullName })
        });
    }

    static async logout(sessionToken: string) {
        return this.makeRequest(API_ENDPOINTS.AUTH.LOGOUT, {
            method: 'POST',
            body: JSON.stringify({ 
                action: 'logout', 
                session_token: sessionToken 
            })
        });
    }

    // Meeting Rooms methods
    static async getAllRooms() {
        return this.makeRequest(API_ENDPOINTS.ROOMS.GET_ALL);
    }

    static async getRoomById(id: number) {
        return this.makeRequest(API_ENDPOINTS.ROOMS.GET_BY_ID(id));
    }

    static async getAvailableRooms(startTime: string, endTime: string) {
        return this.makeRequest(API_ENDPOINTS.ROOMS.GET_AVAILABLE(startTime, endTime));
    }

    static async searchRooms(searchTerm: string, capacityMin?: number, capacityMax?: number, roomType?: string) {
        return this.makeRequest(API_ENDPOINTS.ROOMS.SEARCH(searchTerm, capacityMin, capacityMax, roomType));
    }

    // Reservations/Bookings methods
    static async getAllBookings() {
        return this.makeRequest(API_ENDPOINTS.RESERVATIONS.GET_UPCOMING());
    }

    static async getBookingById(id: number) {
        return this.makeRequest(API_ENDPOINTS.RESERVATIONS.GET_BY_ID(id));
    }

    static async getUserBookings(userId: number) {
        return this.makeRequest(API_ENDPOINTS.RESERVATIONS.GET_USER_RESERVATIONS(userId));
    }

    static async createBooking(bookingData: any) {
        return this.makeRequest(API_ENDPOINTS.RESERVATIONS.CREATE, {
            method: 'POST',
            body: JSON.stringify(bookingData)
        });
    }

    static async createAIBooking(bookingData: any) {
        return this.makeRequest(API_ENDPOINTS.AI_BOOKINGS.CREATE, {
            method: 'POST',
            body: JSON.stringify(bookingData)
        });
    }

    static async updateBooking(id: number, bookingData: any) {
        return this.makeRequest(API_ENDPOINTS.RESERVATIONS.UPDATE, {
            method: 'PUT',
            body: JSON.stringify({ id, ...bookingData })
        });
    }

    static async cancelBooking(id: number) {
        return this.makeRequest(API_ENDPOINTS.RESERVATIONS.CANCEL, {
            method: 'DELETE',
            body: JSON.stringify({ id })
        });
    }

    // AI Conversations
    static async getConversations(userId?: number, sessionId?: string) {
        let url = API_ENDPOINTS.AI_BOOKINGS.GET_CONVERSATIONS;
        if (userId) url += `?user_id=${userId}`;
        if (sessionId) url += userId ? `&session_id=${sessionId}` : `?session_id=${sessionId}`;
        return this.makeRequest(url);
    }

    static async saveConversation(conversationData: any) {
        return this.makeRequest(API_ENDPOINTS.AI_BOOKINGS.SAVE_CONVERSATION, {
            method: 'POST',
            body: JSON.stringify(conversationData)
        });
    }
}
