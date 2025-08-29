# 🤖 AI Assistant Spacio - Dokumentasi Lengkap

## 📋 **Overview**
AI Assistant Spacio adalah sistem chatbot cerdas yang membantu user memesan ruang rapat dengan cara yang natural dan user-friendly. Sistem ini mendukung input manual (typing) dan quick button untuk kemudahan penggunaan.

## 🚀 **Fitur Utama**

### 1. **Quick Button System**
- **Pesan Ruangan** - Memulai proses booking
- **Ruang Besar/Kecil** - Pilihan berdasarkan kapasitas
- **Meeting Internal/Eksternal** - Jenis meeting
- **Dengan Makanan** - Opsi catering
- **Reservasi Saya** - Cek booking yang ada
- **Bantuan** - Panduan lengkap

### 2. **Natural Language Processing**
- Input manual dalam bahasa Indonesia
- Parsing otomatis untuk tanggal, waktu, jumlah peserta
- Intent recognition yang cerdas
- Fallback handling yang graceful

### 3. **Conversation Flow**
- State machine yang terstruktur
- Context awareness
- Quick actions yang relevan di setiap tahap
- Error handling yang user-friendly

## 🏗️ **Arsitektur Sistem**

### **File Structure**
```
services/
├── aiConfig.ts          # Konfigurasi AI dan response templates
├── aiService.ts         # Service AI dengan intent recognition
└── geminiService.ts     # State machine untuk conversation flow

pages/
└── AiAssistantPage.tsx  # UI component untuk chat interface
```

### **Core Components**

#### 1. **AI Configuration (`aiConfig.ts`)**
```typescript
export const AI_CONFIG = {
  personality: { name: "Spacio AI Assistant", tone: "friendly" },
  responses: { greeting: [...], roomSelection: [...], ... },
  patterns: { roomSelection: [...], datePatterns: [...], ... },
  fallbacks: { unknownInput: [...], invalidInput: [...] }
};
```

#### 2. **AI Service (`aiService.ts`)**
```typescript
export class SpacioAI {
  async processInput(message: string, state: BookingState, data: Partial<Booking>)
  private analyzeInput(message: string, state: BookingState)
  private generateResponse(analysis: any, state: BookingState, data: Partial<Booking>)
}
```

#### 3. **Gemini Service (`geminiService.ts`)**
```typescript
export const processBookingConversation = async (
  message: string,
  state: BookingState,
  data: Partial<Booking>
) => Promise<{...}>
```

## 🔄 **Conversation Flow**

### **State Machine**
1. **IDLE** → User memulai booking
2. **ASKING_ROOM** → Pilih ruangan
3. **ASKING_TOPIC** → Masukkan topik meeting
4. **ASKING_PIC** → Tentukan PIC
5. **ASKING_PARTICIPANTS** → Jumlah peserta
6. **ASKING_DATE** → Tanggal meeting
7. **ASKING_TIME** → Waktu meeting
8. **ASKING_MEETING_TYPE** → Jenis meeting
9. **ASKING_FOOD_TYPE** → Opsi makanan
10. **CONFIRMING** → Konfirmasi final
11. **BOOKED** → Booking berhasil

### **Quick Actions Flow**
```
User Input → Intent Recognition → Entity Extraction → Response Generation → Quick Actions
```

## 💬 **Contoh Percakapan**

### **Via Quick Button**
```
User: [Klik "Pesan Ruangan"]
AI: "Baik, mari kita mulai pemesanan ruangan! 🎯
     Silakan pilih ruangan yang Anda inginkan dari daftar di bawah ini:"
     [Quick Actions: Samudrantha, Cedaya, Celebes, dll.]

User: [Klik "Samudrantha Meeting Room (15 orang)"]
AI: "Bagus! Ruangan yang dipilih: **Samudrantha Meeting Room** 🏢
     Kapasitas: 15 orang
     Fasilitas: Projector, Whiteboard, Audio System
     Sekarang, apa topik atau nama rapatnya? 📝"
```

### **Via Typing Manual**
```
User: "Saya mau booking ruangan Balidwipa untuk meeting client besok pagi"
AI: "Bagus! Ruangan yang dipilih: **Balidwipa Meeting Room** 🏢
     Tanggal: Besok
     Waktu: 09:00
     Sekarang, apa topik meetingnya?"
```

## 🎯 **Intent Recognition**

### **Supported Intents**
- `room_selection` - Pemilihan ruangan
- `date_selection` - Pemilihan tanggal
- `time_selection` - Pemilihan waktu
- `participant_selection` - Jumlah peserta
- `cancel` - Pembatalan booking
- `help` - Permintaan bantuan
- `go_to_form` - Lanjut ke formulir

### **Entity Extraction**
- **Room**: Nama ruangan, kapasitas, fasilitas
- **Date**: Relative dates (hari ini, besok, lusa)
- **Time**: Natural language (pagi, siang, sore, malam)
- **Participants**: Angka, natural language (beberapa, tim)

## 🔧 **Konfigurasi & Customization**

### **Response Templates**
```typescript
responses: {
  greeting: [
    "Halo! 👋 Saya adalah asisten AI Spacio...",
    "Selamat datang! 😊 Saya adalah AI Assistant...",
    "Hai! 👋 Ada yang bisa saya bantu..."
  ]
}
```

### **Pattern Matching**
```typescript
patterns: {
  roomSelection: [
    /(?:saya|aku|mau|ingin|butuh|perlu)\s+(?:ruangan|room|meeting)\s+(?:untuk|dengan|dengan\s+kapasitas)\s+(\d+)\s+orang/,
    /(?:samudrantha|cedaya|celebes|kalamanthana|nusanipa|balidwipa|swarnadwipa|jawadwipa)/
  ]
}
```

## 🚨 **Error Handling**

### **Fallback Responses**
- Input tidak dikenali → "Maaf, saya tidak mengerti. Bisa dijelaskan lebih detail?"
- Input tidak valid → "Mohon masukkan input yang valid."
- Room tidak ditemukan → "Maaf, saya tidak menemukan ruangan yang sesuai."

### **Graceful Degradation**
- Jika AI service error → Fallback ke simple response
- Jika pattern matching gagal → Default ke state machine
- Jika quick action tidak tersedia → Generate default actions

## 📱 **UI/UX Features**

### **Chat Interface**
- Message bubbles dengan styling yang berbeda untuk user dan AI
- Quick action buttons yang responsive
- Loading state dengan placeholder text
- Auto-scroll ke message terbaru

### **Input Handling**
- Support untuk Enter key (Shift+Enter untuk new line)
- Placeholder text yang informatif
- Disabled state saat loading
- Auto-focus pada input field

## 🔄 **Integration Points**

### **With Booking Form**
- Transfer data AI ke formulir via `onAiBookingData`
- Navigation otomatis ke halaman booking
- Pre-filled form fields

### **With Navigation System**
- Integration dengan React Router
- State management via props
- Page transitions yang smooth

## 🧪 **Testing & Debugging**

### **Console Logging**
```typescript
console.log('AI Service Error:', error);
console.log('Room matching result:', selectedRoom);
console.log('Intent analysis:', analysis);
```

### **Error Boundaries**
- Try-catch pada AI service calls
- Fallback responses untuk error cases
- User-friendly error messages

## 🚀 **Performance Optimizations**

### **Response Time**
- Simulated AI thinking time: 800ms
- Async processing untuk non-blocking UI
- Efficient pattern matching dengan RegExp

### **Memory Management**
- Conversation history limit: 10 messages
- Context timeout: 5 minutes
- Automatic cleanup pada session end

## 🔮 **Future Enhancements**

### **Planned Features**
- Multi-language support (EN, ID, CN)
- Voice input/output
- Advanced NLP dengan machine learning
- Integration dengan calendar systems
- Analytics dan reporting

### **Technical Improvements**
- WebSocket untuk real-time chat
- Caching untuk frequent responses
- A/B testing untuk response optimization
- Performance monitoring

## 📚 **Usage Examples**

### **Basic Room Booking**
```typescript
// Start booking
sendMessage('Pesan Ruangan');

// Select room
handleQuickAction('Samudrantha Meeting Room');

// Set topic
sendMessage('Rapat Tim Weekly');

// Set participants
sendMessage('8 orang');

// Set date
sendMessage('besok');

// Set time
sendMessage('09:00');

// Confirm
sendMessage('ya, konfirmasi');
```

### **Advanced Input**
```typescript
// Natural language input
sendMessage('Saya butuh ruangan untuk 12 orang meeting client hari ini siang');

// Mixed input
sendMessage('Balidwipa untuk training tim besok pagi, 10 peserta');
```

## 🤝 **Contributing**

### **Code Standards**
- TypeScript dengan strict mode
- ESLint configuration
- Prettier formatting
- Conventional commits

### **Testing Strategy**
- Unit tests untuk services
- Integration tests untuk conversation flow
- E2E tests untuk UI components
- Performance testing untuk response times

---

## 📞 **Support & Contact**

Untuk pertanyaan atau bantuan teknis terkait AI Assistant Spacio, silakan hubungi tim development atau buat issue di repository.

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Maintainer**: Spacio Development Team
