import { AI_CONFIG, getRandomResponse, formatResponse, addEmojis } from './aiConfig';
import { Booking, BookingState } from '../types';
import { MEETING_ROOMS } from '../constants';

// Enhanced AI Service for Spacio
export class SpacioAI {
  private context: Map<string, any> = new Map();
  private conversationHistory: Array<{ role: 'user' | 'ai', content: string, timestamp: Date }> = [];

  constructor() {
    this.initializeContext();
  }

  private initializeContext() {
    this.context.set('sessionStart', new Date());
    this.context.set('userPreferences', {});
    this.context.set('conversationFlow', []);
  }

  // Process natural language input
  public async processInput(
    message: string,
    state: BookingState,
    data: Partial<Booking>
  ): Promise<{
    responseText: string;
    newState: BookingState;
    updatedBookingData: Partial<Booking>;
    finalBooking?: Booking;
    quickActions?: { label: string; actionValue: string }[];
    confidence: number;
  }> {
    // Add to conversation history
    this.addToHistory('user', message);
    
    // Analyze input
    const analysis = this.analyzeInput(message, state);
    
    // Generate response
    const response = await this.generateResponse(analysis, state, data);
    
    // Add AI response to history
    this.addToHistory('ai', response.responseText);
    
    // Update context
    this.updateContext(analysis, response);
    
    return {
      ...response,
      confidence: analysis.confidence
    };
  }

  // Analyze user input
  private analyzeInput(message: string, state: BookingState) {
    const lowerMessage = message.toLowerCase();
    let confidence = 0.5; // Base confidence
    let intent = 'unknown';
    let entities: Record<string, any> = {};

    // Intent recognition
    if (this.matchesPattern(lowerMessage, AI_CONFIG.patterns.roomSelection)) {
      intent = 'room_selection';
      confidence = 0.9;
      entities.room = this.extractRoomInfo(message);
    } else if (this.matchesPattern(lowerMessage, AI_CONFIG.patterns.datePatterns)) {
      intent = 'date_selection';
      confidence = 0.8;
      entities.date = this.extractDateInfo(message);
    } else if (this.matchesPattern(lowerMessage, AI_CONFIG.patterns.timePatterns)) {
      intent = 'time_selection';
      confidence = 0.8;
      entities.time = this.extractTimeInfo(message);
    } else if (this.matchesPattern(lowerMessage, AI_CONFIG.patterns.participantPatterns)) {
      intent = 'participant_selection';
      confidence = 0.8;
      entities.participants = this.extractParticipantInfo(message);
    } else if (lowerMessage.includes('batal') || lowerMessage.includes('stop')) {
      intent = 'cancel';
      confidence = 0.9;
    } else if (lowerMessage.includes('bantuan') || lowerMessage.includes('help')) {
      intent = 'help';
      confidence = 0.9;
    } else if (lowerMessage.includes('formulir') || lowerMessage.includes('form')) {
      intent = 'go_to_form';
      confidence = 0.8;
    }

    return {
      intent,
      entities,
      confidence,
      originalMessage: message,
      state
    };
  }

  // Check if message matches any pattern
  private matchesPattern(message: string, patterns: RegExp[]): boolean {
    return patterns.some(pattern => pattern.test(message));
  }

  // Extract room information
  private extractRoomInfo(message: string) {
    const lowerMessage = message.toLowerCase();
    
    // Find room by name
    const room = MEETING_ROOMS.find(r => 
      lowerMessage.includes(r.name.toLowerCase()) ||
      r.name.toLowerCase().includes(lowerMessage)
    );

    if (room) {
      return {
        name: room.name,
        capacity: room.capacity,
        facilities: room.facilities
      };
    }

    // Extract capacity requirement
    const capacityMatch = message.match(/(\d+)\s*orang/);
    if (capacityMatch) {
      const requiredCapacity = parseInt(capacityMatch[1]);
      const suitableRoom = MEETING_ROOMS.find(r => r.capacity >= requiredCapacity);
      return suitableRoom ? {
        name: suitableRoom.name,
        capacity: suitableRoom.capacity,
        facilities: suitableRoom.facilities
      } : null;
    }

    return null;
  }

  // Extract date information
  private extractDateInfo(message: string) {
    const lowerMessage = message.toLowerCase();
    const today = new Date();

    if (lowerMessage.includes('hari ini') || lowerMessage.includes('sekarang')) {
      return today.toLocaleDateString('id-ID', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } else if (lowerMessage.includes('besok')) {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      return tomorrow.toLocaleDateString('id-ID', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } else if (lowerMessage.includes('lusa')) {
      const dayAfterTomorrow = new Date(today);
      dayAfterTomorrow.setDate(today.getDate() + 2);
      return dayAfterTomorrow.toLocaleDateString('id-ID', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }

    return message;
  }

  // Extract time information
  private extractTimeInfo(message: string) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('pagi')) return '09:00';
    if (lowerMessage.includes('siang')) return '12:00';
    if (lowerMessage.includes('sore')) return '15:00';
    if (lowerMessage.includes('malam')) return '18:00';
    
    const timeMatch = message.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) return message;
    
    return message;
  }

  // Extract participant information
  private extractParticipantInfo(message: string) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('beberapa')) return 3;
    if (lowerMessage.includes('sedikit')) return 5;
    if (lowerMessage.includes('banyak')) return 15;
    if (lowerMessage.includes('tim')) return 8;
    
    const numberMatch = message.match(/(\d+)/);
    if (numberMatch) return parseInt(numberMatch[1]);
    
    return null;
  }

  // Generate AI response
  private async generateResponse(
    analysis: any,
    state: BookingState,
    data: Partial<Booking>
  ): Promise<{
    responseText: string;
    newState: BookingState;
    updatedBookingData: Partial<Booking>;
    finalBooking?: Booking;
    quickActions?: { label: string; actionValue: string }[];
  }> {
    // Simulate AI thinking
    await new Promise(resolve => setTimeout(resolve, 800));

    let responseText = "";
    let newState = state;
    let updatedBookingData = { ...data };
    let finalBooking: Booking | undefined = undefined;
    let quickActions: { label: string; actionValue: string }[] | undefined = undefined;

    // Handle different intents
    switch (analysis.intent) {
      case 'room_selection':
        if (analysis.entities.room) {
          updatedBookingData.roomName = analysis.entities.room.name;
          newState = BookingState.ASKING_TOPIC;
          responseText = `Bagus! Ruangan yang dipilih: **${analysis.entities.room.name}** 🏢\n\nKapasitas: ${analysis.entities.room.capacity} orang\nFasilitas: ${analysis.entities.room.facilities.join(', ')}\n\nSekarang, apa topik atau nama rapatnya? 📝`;
          quickActions = [
            { label: "Rapat Tim", actionValue: "Rapat Tim" },
            { label: "Presentasi", actionValue: "Presentasi" },
            { label: "Meeting Client", actionValue: "Meeting Client" },
            { label: "Brainstorming", actionValue: "Brainstorming" },
            { label: "Training", actionValue: "Training" }
          ];
        } else {
          responseText = "Maaf, saya tidak menemukan ruangan yang sesuai. Silakan pilih ruangan dari daftar yang tersedia:";
          quickActions = MEETING_ROOMS.map(room => ({
            label: `${room.name} (${room.capacity} orang)`,
            actionValue: room.name
          }));
        }
        break;

      case 'date_selection':
        updatedBookingData.date = analysis.entities.date;
        newState = BookingState.ASKING_TIME;
        responseText = `Bagus! Tanggal rapat: **"${analysis.entities.date}"** 📅\n\nJam berapa rapat akan dimulai? ⏰`;
        quickActions = [
          { label: "09:00", actionValue: "09:00" },
          { label: "10:00", actionValue: "10:00" },
          { label: "13:00", actionValue: "13:00" },
          { label: "14:00", actionValue: "14:00" },
          { label: "15:00", actionValue: "15:00" }
        ];
        break;

      case 'time_selection':
        updatedBookingData.time = analysis.entities.time;
        newState = BookingState.ASKING_MEETING_TYPE;
        responseText = `Bagus! Waktu rapat: **"${analysis.entities.time}"** ⏰\n\nApa jenis rapatnya? 🤝`;
        quickActions = [
          { label: "Internal", actionValue: "internal" },
          { label: "Eksternal", actionValue: "eksternal" }
        ];
        break;

      case 'participant_selection':
        updatedBookingData.participants = analysis.entities.participants;
        newState = BookingState.ASKING_DATE;
        responseText = `Bagus! Jumlah peserta: **${analysis.entities.participants} orang** 👥\n\nKapan rapat akan diadakan? 📅`;
        quickActions = [
          { label: "Hari Ini", actionValue: "hari ini" },
          { label: "Besok", actionValue: "besok" },
          { label: "Lusa", actionValue: "lusa" },
          { label: "Minggu Depan", actionValue: "minggu depan" }
        ];
        break;

      case 'cancel':
        newState = BookingState.IDLE;
        responseText = getRandomResponse(AI_CONFIG.responses.success);
        updatedBookingData = {};
        quickActions = [
          { label: "Pesan Ruangan Baru", actionValue: "start_booking" },
          { label: "Bantuan", actionValue: "Bantuan" }
        ];
        break;

      case 'help':
        responseText = getRandomResponse(AI_CONFIG.responses.greeting) + "\n\nSaya dapat membantu Anda memesan ruangan dengan mudah! Berikut adalah fitur yang tersedia:\n\n🏢 **Pemesanan Ruangan** - Pilih ruangan sesuai kebutuhan\n👥 **Kapasitas** - Sesuaikan dengan jumlah peserta\n📅 **Jadwal** - Pilih tanggal dan waktu yang tepat\n🍽️ **Catering** - Pilih jenis makanan jika diperlukan";
        quickActions = [
          { label: "Pesan Ruangan", actionValue: "start_booking" },
          { label: "Ruang Besar (10+ orang)", actionValue: "Saya butuh ruangan untuk 10 orang atau lebih" },
          { label: "Ruang Kecil (2-5 orang)", actionValue: "Saya butuh ruangan untuk 2-5 orang" }
        ];
        break;

      case 'go_to_form':
        responseText = "Baik! Saya akan mengirimkan data ke formulir booking untuk konfirmasi final. Silakan lanjut ke halaman formulir untuk menyelesaikan pemesanan. 📝";
        quickActions = [
          { label: "Lanjut ke Formulir", actionValue: "Lanjut ke Formulir" },
          { label: "Ubah Detail", actionValue: "ubah detail" },
          { label: "Batal", actionValue: "batal" }
        ];
        break;

      default:
        // Fallback to traditional state machine
        return this.fallbackResponse(state, data);
    }

    return {
      responseText: addEmojis(responseText),
      newState,
      updatedBookingData,
      finalBooking,
      quickActions
    };
  }

  // Fallback to traditional response system
  private fallbackResponse(state: BookingState, data: Partial<Booking>) {
    // This would call the original processBookingConversation function
    // For now, return a simple response
    return {
      responseText: getRandomResponse(AI_CONFIG.fallbacks.unknownInput),
      newState: state,
      updatedBookingData: data,
      quickActions: [
        { label: "Pesan Ruangan", actionValue: "start_booking" },
        { label: "Bantuan", actionValue: "Bantuan" }
      ]
    };
  }

  // Add message to conversation history
  private addToHistory(role: 'user' | 'ai', content: string) {
    this.conversationHistory.push({
      role,
      content,
      timestamp: new Date()
    });

    // Keep only recent history
    if (this.conversationHistory.length > AI_CONFIG.context.maxHistory) {
      this.conversationHistory = this.conversationHistory.slice(-AI_CONFIG.context.maxHistory);
    }
  }

  // Update conversation context
  private updateContext(analysis: any, response: any) {
    this.context.set('lastIntent', analysis.intent);
    this.context.set('lastConfidence', analysis.confidence);
    this.context.set('currentState', response.newState);
    this.context.set('lastResponse', response.responseText);
  }

  // Get conversation context
  public getContext() {
    return Object.fromEntries(this.context);
  }

  // Clear conversation context
  public clearContext() {
    this.context.clear();
    this.conversationHistory = [];
    this.initializeContext();
  }

  // Get conversation history
  public getHistory() {
    return this.conversationHistory;
  }
}

// Export singleton instance
export const spacioAI = new SpacioAI();
