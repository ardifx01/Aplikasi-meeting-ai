/**
 * API Configuration for Spacio Meeting Room Booker
 * Updated to use the correct backend endpoints
 */

// Base API URL: use explicit backend host during npm dev; use same-origin in production
export const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? `${(typeof window !== 'undefined' ? window.location.origin : '')}/backend/api`
    : 'http://127.0.0.1:8080/backend/api';

// Separate base for Auth endpoints (lives under /api, not /backend/api)
export const AUTH_API_BASE_URL = process.env.NODE_ENV === 'production'
    ? `${(typeof window !== 'undefined' ? window.location.origin : '')}/api`
    : 'http://127.0.0.1:8080/api';

// API Endpoints
export const API_ENDPOINTS = {
    // Authentication
    AUTH: {
        LOGIN: `${AUTH_API_BASE_URL}/auth/login.php`,
        REGISTER: `${AUTH_API_BASE_URL}/auth/login.php`,
        LOGOUT: `${AUTH_API_BASE_URL}/auth/session.php`,
        GET_USER_BY_SESSION_TOKEN: `${AUTH_API_BASE_URL}/auth/session.php`,
    },
    
    // Meeting Rooms
    ROOMS: {
        GET_ALL: `${API_BASE_URL}/bookings.php/rooms`,
        GET_BY_ID: (id: number) => `${API_BASE_URL}/bookings.php/rooms/${id}`,
        GET_AVAILABLE: (startTime: string, endTime: string) => 
            `${API_BASE_URL}/bookings.php/availability?start_time=${startTime}&end_time=${endTime}`,
        GET_AVAILABILITY: (roomId: number, date: string, startTime: string, endTime: string) =>
            `${API_BASE_URL}/bookings.php/availability?room_id=${roomId}&date=${encodeURIComponent(date)}&start_time=${startTime}&end_time=${endTime}`,
        SEARCH: (searchTerm: string, capacityMin?: number, capacityMax?: number, roomType?: string) => {
            let url = `${API_BASE_URL}/bookings/rooms?search=${encodeURIComponent(searchTerm)}`;
            if (capacityMin !== undefined) url += `&capacity_min=${capacityMin}`;
            if (capacityMax !== undefined) url += `&capacity_max=${capacityMax}`;
            if (roomType) url += `&room_type=${roomType}`;
            return url;
        },
        CREATE: `${API_BASE_URL}/bookings.php/rooms`,
        UPDATE: `${API_BASE_URL}/bookings.php/rooms`,
        DELETE: `${API_BASE_URL}/bookings.php/rooms`,
    },
    
    // Reservations/Bookings
    RESERVATIONS: {
        GET_BY_ID: (id: number) => `${API_BASE_URL}/bookings.php/${id}`,
        GET_USER_RESERVATIONS: (userId: number) => 
            `${API_BASE_URL}/bookings.php/user?user_id=${userId}`,
        GET_ROOM_RESERVATIONS: (roomId: number, date?: string) => {
            let url = `${API_BASE_URL}/bookings.php?room_id=${roomId}`;
            if (date) url += `&date=${date}`;
            return url;
        },
        GET_UPCOMING: (userId?: number, limit: number = 10) => {
            let url = `${API_BASE_URL}/bookings.php?limit=${limit}`;
            if (userId) url += `&user_id=${userId}`;
            return url;
        },
        GET_STATS: (userId?: number) => {
            let url = `${API_BASE_URL}/bookings.php/stats`;
            if (userId) url += `&user_id=${userId}`;
            return url;
        },
        CREATE: `${API_BASE_URL}/bookings.php/bookings`,
        UPDATE: `${API_BASE_URL}/bookings.php/bookings`,
        // Backend expects /bookings.php/{id} for DELETE
        CANCEL: (id: number) => `${API_BASE_URL}/bookings.php/${id}`,
    },

    // AI Bookings
    AI_BOOKINGS: {
        CREATE: `${API_BASE_URL}/bookings.php/ai-booking`,
        GET_CONVERSATIONS: `${API_BASE_URL}/bookings.php/conversations`,
        SAVE_CONVERSATION: `${API_BASE_URL}/bookings.php/conversations`,
    },
    
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

            // Some PHP environments may emit warnings before JSON (e.g., extension already loaded)
            // Parse defensively: try JSON first, then fallback to text->sanitize->JSON
            let data: any;
            try {
                data = await response.json();
            } catch {
                const raw = await response.text();
                const firstBrace = raw.indexOf('{');
                const firstBracket = raw.indexOf('[');
                const idx = (firstBrace === -1) ? firstBracket : (firstBracket === -1 ? firstBrace : Math.min(firstBrace, firstBracket));
                if (idx >= 0) {
                    const sliced = raw.slice(idx).trim();
                    try {
                        data = JSON.parse(sliced);
                    } catch (e2) {
                        console.error('Failed to parse JSON after sanitizing:', { raw: raw.slice(0, 200) + '...' });
                        throw e2;
                    }
                } else {
                    console.error('Response is not JSON and has no JSON start:', { raw: raw.slice(0, 200) + '...' });
                    throw new Error('Invalid JSON response');
                }
            }

            if (!response.ok) {
                throw new Error(data?.message || `HTTP error! status: ${response.status}`);
            }
            
            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Authentication method and save session_token to localStorage
    static async login(email: string, password: string) {
        const response = await this.makeRequest(API_ENDPOINTS.AUTH.LOGIN, {
            method: 'POST',
            body: JSON.stringify({ action: 'login', email, password })
        });
        const sessionToken = response?.data?.session?.session_token || response?.session_token;
        if (sessionToken) {
            localStorage.setItem('session_token', sessionToken);
        }
        return response;
    }

    // get user_id from session_token
    static async getUserBySessionToken(sessionToken: string) {
        if (!sessionToken) {
            return null;
        }
        const response = await this.makeRequest(API_ENDPOINTS.AUTH.GET_USER_BY_SESSION_TOKEN, {
            method: 'POST',
            body: JSON.stringify({ action: 'validate', session_token: sessionToken })
        });
        const data = response?.data || response;
        const userId = data?.user_id ?? data?.id ?? data?.user?.id ?? null;
        return userId;
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

    static async getRoomIdByName(name: string) {
        const rooms = await this.getAllRooms();
        const room = rooms.find((room: any) => room.room_name === name);
        return room.room_id;
    }

    static async getAvailableRooms(startTime: string, endTime: string) {
        return this.makeRequest(API_ENDPOINTS.ROOMS.GET_AVAILABLE(startTime, endTime));
    }

    static async getAvailability(roomId: number, date: string, startTime: string, endTime: string) {
        return this.makeRequest(API_ENDPOINTS.ROOMS.GET_AVAILABILITY(roomId, date, startTime, endTime));
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
        return this.makeRequest(API_ENDPOINTS.RESERVATIONS.CANCEL(id), {
            method: 'DELETE'
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
