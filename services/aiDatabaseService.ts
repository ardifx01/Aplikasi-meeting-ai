/**
 * AI Database Service
 * Handles integration between AI assistant and database
 * Updated to use the new backend API endpoints
 */

import { Booking, BookingState } from '../types';
import BackendService from '../src/services/backendService';

interface ConversationData {
  user_id: number;
  session_id: string;
  message: string;
  response: string;
  booking_state: string;
  booking_data?: Partial<Booking>;
}

interface BookingData {
  user_id: number;
  session_id: string;
  room_name?: string;
  topic?: string;
  meeting_date?: string;
  meeting_time?: string;
  participants?: number;
  meeting_type?: string;
  food_order?: string;
  duration?: number;
  booking_state: string;
}

/**
 * Save conversation to database using new backend API
 */
export const saveConversation = async (
  userId: number,
  sessionId: string,
  message: string,
  responseText: string,
  bookingState: BookingState,
  bookingData?: Partial<Booking>
): Promise<boolean> => {
  try {
    console.log('Saving conversation using new backend API:', {
      userId,
      sessionId,
      message,
      responseText,
      bookingState,
      bookingData
    });

    const result = await BackendService.saveConversation({
      user_id: userId,
      session_id: sessionId,
      message,
      ai_response: responseText,
      booking_state: String(bookingState), // Convert enum to string
      booking_data: JSON.stringify(bookingData || {})
    });

    console.log('Conversation saved successfully:', result);
    return true;
  } catch (error) {
    console.error('Error saving conversation:', error);
    return false;
  }
};

/**
 * Get conversation history from new backend API
 */
export const getConversationHistory = async (
  userId: number,
  sessionId: string
): Promise<any[]> => {
  try {
    console.log('Getting conversation history from new backend API:', { userId, sessionId });
    const result = await BackendService.getConversations(userId, sessionId);
    console.log('Conversation history fetched successfully:', result);
    return result.data || [];
  } catch (error) {
    console.error('Error getting conversation history:', error);
    return [];
  }
};

/**
 * Save booking data using new backend API
 */
export const saveBookingData = async (
  userId: number,
  sessionId: string,
  bookingState: BookingState,
  bookingData: Partial<Booking>
): Promise<boolean> => {
  try {
    console.log('Saving booking data using new backend API:', {
      userId,
      sessionId,
      bookingState,
      bookingData
    });

    // Convert booking data format to match backend API
    const backendBookingData = {
      user_id: userId,
      session_id: sessionId,
      room_id: 0, // Will be set based on room name
      topic: bookingData.topic || '',
      meeting_date: bookingData.date || '',
      meeting_time: bookingData.time ? extractStartTime(bookingData.time) : '',
      duration: calculateDuration(bookingData.time),
      participants: bookingData.participants || 0,
      meeting_type: bookingData.meetingType || 'internal',
      food_order: bookingData.foodOrder || 'tidak',
      booking_state: String(bookingState) // Convert enum to string
    };

    // If we have room name, try to get room ID
    if (bookingData.roomName) {
      try {
        const rooms = await BackendService.getAllRooms();
        const room = rooms.data?.find((r: any) => 
          r.name.toLowerCase().includes(bookingData.roomName?.toLowerCase() || '')
        );
        if (room) {
          backendBookingData.room_id = room.id;
        }
      } catch (error) {
        console.warn('Could not find room ID for:', bookingData.roomName);
      }
    }

    // Create AI booking in backend
    const result = await BackendService.createAIBooking(backendBookingData);
    console.log('Booking data saved successfully:', result);
    return true;
  } catch (error) {
    console.error('Error saving booking data:', error);
    return false;
  }
};

/**
 * Get booking data from new backend API
 */
export const getBookingData = async (
  userId: number,
  sessionId?: string
): Promise<any> => {
  try {
    console.log('Getting booking data from new backend API:', { userId, sessionId });
    const result = await BackendService.getUserBookings(userId);
    console.log('Booking data fetched successfully:', result);
    return result.data || [];
  } catch (error) {
    console.error('Error getting booking data:', error);
    return [];
  }
};

/**
 * Helper function to extract start time from time range
 */
function extractStartTime(timeRange: string): string {
  const timeMatch = timeRange.match(/^(\d{2}:\d{2})/);
  return timeMatch ? timeMatch[1] : timeRange;
}

/**
 * Helper function to calculate duration from time range
 */
function calculateDuration(timeRange?: string): number {
  if (!timeRange) return 60;

  const times = timeRange.split(' - ');
  if (times.length === 2) {
    const startTime = times[0];
    const endTime = times[1];
    
    // Calculate duration in minutes
    const startParts = startTime.split(':').map(Number);
    const endParts = endTime.split(':').map(Number);
    
    if (startParts.length === 2 && endParts.length === 2) {
      const startMinutes = startParts[0] * 60 + startParts[1];
      const endMinutes = endParts[0] * 60 + endParts[1];
      const durationMinutes = endMinutes - startMinutes;
      
      // Only return if duration is positive
      if (durationMinutes > 0) {
        return durationMinutes;
      }
    }
  }
  
  return 60; // Default duration
}

/**
 * Test backend connection
 */
export const testBackendConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing backend connection...');
    const result = await BackendService.testConnection();
    console.log('Backend connection test result:', result);
    return result.success;
  } catch (error) {
    console.error('Backend connection test failed:', error);
    return false;
  }
};