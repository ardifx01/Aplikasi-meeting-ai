/**
 * Backend Service for AI Agent Integration
 * Handles communication between AI agent and PHP backend
 */

import { ApiService } from '../config/api';

export interface BookingData {
    user_id: number;
    session_id: string;
    room_id: number;
    topic: string;
    meeting_date: string;
    meeting_time: string;
    duration: number;
    participants: number;
    meeting_type: string;
    food_order: string;
    booking_state?: string;
}

export interface ConversationData {
    user_id: number;
    session_id: string;
    message: string;
    ai_response: string;
    booking_state: string;
    booking_data: string;
}

export class BackendService {
    /**
     * Save AI conversation to backend
     */
    static async saveConversation(conversationData: ConversationData) {
        try {
            console.log('Saving conversation to backend:', conversationData);
            const result = await ApiService.saveConversation(conversationData);
            console.log('Conversation saved successfully:', result);
            return result;
        } catch (error) {
            console.error('Error saving conversation:', error);
            throw error;
        }
    }

    /**
     * Create AI booking in backend
     */
    static async createAIBooking(bookingData: BookingData) {
        try {
            console.log('Creating AI booking in backend:', bookingData);
            
            // Ensure booking_state is set
            if (!bookingData.booking_state) {
                bookingData.booking_state = 'BOOKED';
            }

            const result = await ApiService.createAIBooking(bookingData);
            console.log('AI booking created successfully:', result);
            
            // Save conversation after successful booking
            await this.saveConversation({
                user_id: bookingData.user_id,
                session_id: bookingData.session_id,
                message: `AI Agent created booking: ${bookingData.topic}`,
                ai_response: 'Booking created successfully',
                booking_state: bookingData.booking_state,
                booking_data: JSON.stringify(bookingData)
            });

            return result;
        } catch (error) {
            console.error('Error creating AI booking:', error);
            throw error;
        }
    }

    /**
     * Create form-based booking in backend
     */
    static async createFormBooking(bookingData: BookingData) {
        try {
            console.log('Creating form booking in backend:', bookingData);
            
            // Ensure booking_state is set
            if (!bookingData.booking_state) {
                bookingData.booking_state = 'BOOKED';
            }

            const result = await ApiService.createBooking(bookingData);
            console.log('Form booking created successfully:', result);
            return result;
        } catch (error) {
            console.error('Error creating form booking:', error);
            throw error;
        }
    }

    /**
     * Get all bookings from backend
     */
    static async getAllBookings() {
        try {
            console.log('Fetching all bookings from backend');
            const result = await ApiService.getAllBookings();
            console.log('Bookings fetched successfully:', result);
            return result;
        } catch (error) {
            console.error('Error fetching bookings:', error);
            throw error;
        }
    }

    /**
     * Get user bookings from backend
     */
    static async getUserBookings(userId: number) {
        try {
            console.log('Fetching user bookings from backend:', userId);
            const result = await ApiService.getUserBookings(userId);
            console.log('User bookings fetched successfully:', result);
            return result;
        } catch (error) {
            console.error('Error fetching user bookings:', error);
            throw error;
        }
    }

    /**
     * Get all meeting rooms from backend
     */
    static async getAllRooms() {
        try {
            console.log('Fetching all rooms from backend');
            const result = await ApiService.getAllRooms();
            console.log('Rooms fetched successfully:', result);
            return result;
        } catch (error) {
            console.error('Error fetching rooms:', error);
            throw error;
        }
    }

    /**
     * Check room availability
     */
    static async checkRoomAvailability(roomId: number, date: string, startTime: string, duration: number) {
        try {
            console.log('Checking room availability:', { roomId, date, startTime, duration });
            const result = await ApiService.getAvailableRooms(startTime, startTime);
            console.log('Room availability checked successfully:', result);
            return result;
        } catch (error) {
            console.error('Error checking room availability:', error);
            throw error;
        }
    }

    /**
     * Update booking in backend
     */
    static async updateBooking(bookingId: number, bookingData: Partial<BookingData>) {
        try {
            console.log('Updating booking in backend:', { bookingId, bookingData });
            const result = await ApiService.updateBooking(bookingId, bookingData);
            console.log('Booking updated successfully:', result);
            return result;
        } catch (error) {
            console.error('Error updating booking:', error);
            throw error;
        }
    }

    /**
     * Cancel booking in backend
     */
    static async cancelBooking(bookingId: number) {
        try {
            console.log('Cancelling booking in backend:', bookingId);
            const result = await ApiService.cancelBooking(bookingId);
            console.log('Booking cancelled successfully:', result);
            return result;
        } catch (error) {
            console.error('Error cancelling booking:', error);
            throw error;
        }
    }

    /**
     * Get AI conversations from backend
     */
    static async getConversations(userId?: number, sessionId?: string) {
        try {
            console.log('Fetching conversations from backend:', { userId, sessionId });
            const result = await ApiService.getConversations(userId, sessionId);
            console.log('Conversations fetched successfully:', result);
            return result;
        } catch (error) {
            console.error('Error fetching conversations:', error);
            throw error;
        }
    }

    /**
     * Test backend connection
     */
    static async testConnection() {
        try {
            console.log('Testing backend connection');
            const result = await ApiService.getAllRooms();
            console.log('Backend connection test successful:', result);
            return { success: true, data: result };
        } catch (error) {
            console.error('Backend connection test failed:', error);
            return { success: false, error: error.message };
        }
    }
}

export default BackendService;
