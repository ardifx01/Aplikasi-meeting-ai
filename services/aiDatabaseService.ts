/**
 * AI Database Service
 * Handles integration between AI assistant and database
 * Updated to use the new backend API endpoints
 */

import { Booking, BookingState } from '../types';
import BackendService from '../src/services/backendService';
import { ApiService } from '../src/config/api';

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

// Store last suggestions for UI to consume when booking fails due to unavailability
let lastSuggestions: Array<{ id: number; name: string }> = [];
export const getLastSuggestions = () => lastSuggestions;

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
 * Save booking data from FORM to ai_booking_data table
 */
export const saveFormBookingData = async (
  userId: number,
  sessionId: string,
  bookingState: BookingState,
  bookingData: Partial<Booking>
): Promise<boolean> => {
  try {
    console.log('Saving FORM booking data to ai_booking_data table:', {
      userId,
      sessionId,
      bookingState,
      bookingData
    });

    // Convert booking data format to match backend API
    const normalizedMeetingTime = bookingData.time
      ? extractStartTime(bookingData.time)
      : '09:00:00';

    const backendBookingData = {
      user_id: userId,
      session_id: sessionId,
      room_id: 0, // Will be set based on room name
      topic: bookingData.topic || '',
      meeting_date: bookingData.date || new Date().toISOString().slice(0, 10),
      meeting_time: normalizedMeetingTime,
      duration: calculateDuration(bookingData.time),
      participants: bookingData.participants || 0,
      meeting_type: bookingData.meetingType || 'internal',
      food_order: bookingData.foodOrder || 'tidak',
      pic: bookingData.pic || '-'
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

    console.log('📊 Form booking data prepared:', backendBookingData);

    // Save to ai_booking_data table (form bookings)
    try {
      const result = await ApiService.createFormBooking(backendBookingData);
      console.log('✅ Form booking data saved to ai_booking_data table successfully:', result);
      
      lastSuggestions = [];
      return true;
    } catch (e: any) {
      console.error('Error creating form booking:', e);
      
      // Handle 409 Conflict (room not available)
      if (e.message && e.message.includes('Room is not available')) {
        console.log('🔄 Room not available for form booking, generating suggestions');
        
        // Generate room suggestions for form booking
        lastSuggestions = [];
        try {
          const roomsResp = await BackendService.getAllRooms();
          const rooms = roomsResp.data || [];
          const desiredParticipants = backendBookingData.participants || 1;
          const filtered = rooms
            .filter((r: any) => r.id !== backendBookingData.room_id && (!r.capacity || r.capacity >= desiredParticipants))
            .slice(0, 8);
          for (const r of filtered) {
            try {
              const avail = await BackendService.checkRoomAvailability(
                r.id,
                backendBookingData.meeting_date,
                backendBookingData.meeting_time.substring(0,5),
                backendBookingData.duration
              );
              if (avail?.data?.available !== false) {
                lastSuggestions.push({ id: r.id, name: r.name });
                if (lastSuggestions.length >= 3) break;
              }
            } catch {}
          }
        } catch {}
      }
      return false;
    }
  } catch (error) {
    console.error('Error saving form booking data:', error);
    return false;
  }
};

/**
 * Save booking data from AI AGENT to ai_bookings_success table
 */
export const saveAIBookingData = async (
  userId: number,
  sessionId: string,
  bookingState: BookingState,
  bookingData: Partial<Booking>
): Promise<boolean> => {
  try {
    console.log('Saving AI AGENT booking data to ai_bookings_success table:', {
      userId,
      sessionId,
      bookingState,
      bookingData
    });

    // Convert booking data format to match backend API
    const normalizedMeetingTime = bookingData.time
      ? extractStartTime(bookingData.time)
      : '09:00:00';

    const backendBookingData = {
      user_id: userId,
      session_id: sessionId,
      room_id: 0, // Will be set based on room name
      room_name: bookingData.roomName || '',
      topic: bookingData.topic || '',
      pic: bookingData.pic || '-',
      meeting_date: bookingData.date || new Date().toISOString().slice(0, 10),
      meeting_time: normalizedMeetingTime,
      duration: calculateDuration(bookingData.time),
      participants: bookingData.participants || 0,
      meeting_type: bookingData.meetingType || 'internal',
      food_order: bookingData.foodOrder || 'tidak',
      booking_state: 'BOOKED'
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

    console.log('📊 AI Agent booking data prepared:', backendBookingData);

    // Save directly to ai_bookings_success table (AI agent bookings)
    try {
      const result = await ApiService.saveSuccessfulAIBooking(backendBookingData);
      console.log('✅ AI Agent booking data saved to ai_bookings_success table successfully:', result);
      
      lastSuggestions = [];
      return true;
    } catch (e: any) {
      console.error('Error saving AI agent booking:', e);
      
      // Handle 409 Conflict (room not available)
      if (e.message && e.message.includes('Room is not available')) {
        console.log('🔄 Room not available for AI booking, trying alternative rooms');
        
        // Try to find alternative rooms for AI booking
        lastSuggestions = [];
        try {
          const roomsResp = await BackendService.getAllRooms();
          const rooms = roomsResp.data || [];
          const desiredParticipants = backendBookingData.participants || 1;
          const filtered = rooms
            .filter((r: any) => r.id !== backendBookingData.room_id && (!r.capacity || r.capacity >= desiredParticipants))
            .slice(0, 8);
          for (const r of filtered) {
            try {
              const avail = await BackendService.checkRoomAvailability(
                r.id,
                backendBookingData.meeting_date,
                backendBookingData.meeting_time.substring(0,5),
                backendBookingData.duration
              );
              if (avail?.data?.available !== false) {
                lastSuggestions.push({ id: r.id, name: r.name });
                if (lastSuggestions.length >= 3) break;
              }
            } catch {}
          }
        } catch {}

        // Auto book with first alternative room for AI booking
        if (lastSuggestions.length > 0) {
          try {
            // Create new booking data with alternative room to avoid duplicate
            const alternativeBookingData = { ...backendBookingData };
            alternativeBookingData.room_id = lastSuggestions[0].id;
            alternativeBookingData.room_name = lastSuggestions[0].name;
            
            const result2 = await ApiService.saveSuccessfulAIBooking(alternativeBookingData);
            console.log('✅ AI Booking saved to ai_bookings_success table with alternative room:', result2);
            return true;
          } catch (err2) {
            console.warn('Failed auto-booking with alternative room for AI agent');
          }
        }
      }
      return false;
    }
  } catch (error) {
    console.error('Error saving AI agent booking data:', error);
    return false;
  }
};

/**
 * Save booking data using new backend API (DEPRECATED - use saveFormBookingData or saveAIBookingData instead)
 */
export const saveBookingData = async (
  userId: number,
  sessionId: string,
  bookingState: BookingState,
  bookingData: Partial<Booking>
): Promise<boolean> => {
  console.warn('saveBookingData is deprecated. Use saveFormBookingData or saveAIBookingData instead.');
  // Default to AI booking for backward compatibility
  return saveAIBookingData(userId, sessionId, bookingState, bookingData);
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
  if (!timeRange) return '09:00:00';

  // Accept formats like "09:00 - 10:00" and take the first time
  const rangeMatch = timeRange.match(/^(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
  const singleMatch = timeRange.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);

  if (rangeMatch) {
    const [hh, mm] = rangeMatch[1].split(':').map(Number);
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:00`;
  }

  if (singleMatch) {
    const hh = Number(singleMatch[1]);
    const mm = Number(singleMatch[2]);
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:00`;
  }

  // Fallback default
  return '09:00:00';
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
