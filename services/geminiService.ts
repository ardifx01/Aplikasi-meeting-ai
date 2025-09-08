import { Booking, BookingState } from '../types';
import { getLastSuggestions } from './aiDatabaseService';
import { MEETING_ROOMS } from '../constants';

const findSuitableRoom = (participants: number) => {
  return MEETING_ROOMS.find(room => room.capacity >= participants);
};

// Helper: display value or placeholder to avoid "undefined"
const displayValue = (value: unknown, placeholder: string = 'belum diisi') => {
  if (value === 0) return '0';
  if (value === false) return 'false';
  if (value === true) return 'true';
  return (value !== undefined && value !== null && String(value).trim() !== '')
    ? String(value)
    : placeholder;
};

// Helper: build confirmation summary safely
const buildConfirmationSummary = (data: Partial<Booking>) => {
  // Format meeting type untuk display
  const formatMeetingType = (type: string) => {
    if (type === 'internal') return 'Internal';
    if (type === 'external') return 'Eksternal';
    return type;
  };

  // Format food order untuk display
  const formatFoodOrder = (food: string) => {
    if (food === 'tidak') return 'Tidak pesan makanan';
    if (food === 'ringan') return 'Makanan Ringan';
    if (food === 'berat') return 'Makanan Berat';
    if (food === 'ya') return 'Makanan Berat'; // Fallback untuk 'ya'
    return food;
  };

  // Format waktu untuk display
  const formatTimeRange = (startTime: string, endTime?: string) => {
    if (endTime) {
      return `${displayValue(startTime, '09:00')} - ${displayValue(endTime)}`;
    }
    return displayValue(startTime, '09:00');
  };

  return `Sempurna! Mari saya konfirmasi detail pemesanan Anda:\n\n`
    + `🏢 **Ruangan:** ${displayValue(data.roomName)}\n`
    + `📋 **Topik:** ${displayValue(data.topic)}\n`
    + `👤 **PIC:** ${displayValue(data.pic)}\n`
    + `👥 **Peserta:** ${displayValue(data.participants)} orang\n`
    + `📅 **Tanggal:** ${displayValue(data.date)}\n`
    + `⏰ **Waktu:** ${formatTimeRange(data.time, data.endTime)}\n`
    + `🤝 **Jenis:** ${formatMeetingType(displayValue(data.meetingType, 'Internal'))}\n`
    + `🍽️ **Makanan:** ${formatFoodOrder(displayValue(data.foodOrder))}\n\n`
    + `Apakah semua informasi sudah benar?`;
};

// PERBAIKAN: Parse one-shot booking from user input
const parseOneShotBooking = (message: string): Partial<Booking> | null => {
  const lowerMessage = message.toLowerCase();
  
  console.log(`🔍 Parsing one-shot booking from message: "${message}"`);
  
  // Check if this looks like a one-shot booking
  const hasBookingKeywords = (
    lowerMessage.includes('pesan ruangan') ||
    lowerMessage.includes('booking request') ||
    lowerMessage.includes('ruangan:') ||
    lowerMessage.includes('tanggal:') ||
    lowerMessage.includes('waktu:') ||
    lowerMessage.includes('topik:') ||
    lowerMessage.includes('peserta:') ||
    lowerMessage.includes('pic:') ||
    lowerMessage.includes('tipe meeting:') ||
    lowerMessage.includes('pesanan makanan:') ||
    lowerMessage.includes('tolong proses pemesanan') ||
    lowerMessage.includes('process this booking')
  );
  
  if (!hasBookingKeywords) {
    console.log(`❌ No booking keywords found in message`);
    return null;
  }
  
  console.log(`✅ Booking keywords detected, parsing data...`);
  const bookingData: Partial<Booking> = {};
  
  // Extract room name
  const roomMatch = MEETING_ROOMS.find(room => {
    const roomNameLower = room.name.toLowerCase();
    return lowerMessage.includes(roomNameLower);
  });
  
  if (roomMatch) {
    bookingData.roomName = roomMatch.name;
    bookingData.roomId = roomMatch.id;
  }
  
  // Extract topic - more precise patterns to avoid capturing other fields
  const topicPatterns = [
    // Specific pattern for "Topik: Rapat Tim Marketing Q1 Peserta:" format
    /Topik:\s*([^P]+?)\s+Peserta:/i,
    // Other patterns with lookahead
    /(?:topik|topic)[:\s]+([^\n\r-]+?)(?=\s*(?:peserta|participants|pic|tanggal|waktu|tipe|pesanan|$))/i,
    /- Topik: ([^\n\r-]+?)(?=\s*(?:peserta|participants|pic|tanggal|waktu|tipe|pesanan|$))/i,
    /Topik: ([^\n\r-]+?)(?=\s*(?:peserta|participants|pic|tanggal|waktu|tipe|pesanan|$))/i,
    // Fallback patterns for simpler formats
    /(?:topik|topic)[:\s]+([^\n\r]+?)(?=\n|$)/i,
    /- Topik: ([^\n\r]+?)(?=\n|$)/i,
    /Topik: ([^\n\r]+?)(?=\n|$)/i
  ];
  for (const pattern of topicPatterns) {
    const match = message.match(pattern);
    if (match) {
      bookingData.topic = match[1].trim();
      console.log(`✅ Topic parsed: "${bookingData.topic}"`);
      break;
    }
  }
  
  // Extract PIC - more precise patterns to avoid capturing other fields
  const picPatterns = [
    // Specific pattern for "PIC: Ahmad Rizki Tipe Meeting:" format
    /PIC:\s*([^T]+?)\s+Tipe Meeting:/i,
    // Other patterns with lookahead
    /(?:pic|person in charge)[:\s]+([^\n\r-]+?)(?=\s*(?:peserta|participants|tanggal|waktu|tipe|pesanan|$))/i,
    /- PIC: ([^\n\r-]+?)(?=\s*(?:peserta|participants|tanggal|waktu|tipe|pesanan|$))/i,
    /PIC: ([^\n\r-]+?)(?=\s*(?:peserta|participants|tanggal|waktu|tipe|pesanan|$))/i,
    // Fallback patterns for simpler formats
    /(?:pic|person in charge)[:\s]+([^\n\r]+?)(?=\n|$)/i,
    /- PIC: ([^\n\r]+?)(?=\n|$)/i,
    /PIC: ([^\n\r]+?)(?=\n|$)/i
  ];
  for (const pattern of picPatterns) {
    const match = message.match(pattern);
    if (match) {
      bookingData.pic = match[1].trim();
      console.log(`✅ PIC parsed: "${bookingData.pic}"`);
      break;
    }
  }
  
  // Extract participants - more precise patterns
  const participantsPatterns = [
    /(?:peserta|participants)[:\s]+(\d+)(?=\s*(?:orang|pic|tanggal|waktu|tipe|pesanan|$))/i,
    /- Peserta: (\d+)(?=\s*(?:orang|pic|tanggal|waktu|tipe|pesanan|$))/i,
    /Peserta: (\d+)(?=\s*(?:orang|pic|tanggal|waktu|tipe|pesanan|$))/i,
    /(\d+)\s*orang(?=\s*(?:pic|tanggal|waktu|tipe|pesanan|$))/i
  ];
  for (const pattern of participantsPatterns) {
    const match = message.match(pattern);
    if (match) {
      bookingData.participants = parseInt(match[1]);
      console.log(`✅ Participants parsed: ${bookingData.participants}`);
      break;
    }
  }
  
  // Extract date - more precise patterns
  const datePatterns = [
    /(?:tanggal|date)[:\s]+([^\n\r-]+?)(?=\s*(?:waktu|time|peserta|pic|tipe|pesanan|$))/i,
    /- Tanggal: ([^\n\r-]+?)(?=\s*(?:waktu|time|peserta|pic|tipe|pesanan|$))/i,
    /Tanggal: ([^\n\r-]+?)(?=\s*(?:waktu|time|peserta|pic|tipe|pesanan|$))/i
  ];
  for (const pattern of datePatterns) {
    const match = message.match(pattern);
    if (match) {
      const dateStr = match[1].trim();
      bookingData.date = parseDateInput(dateStr);
      console.log(`✅ Date parsed: "${bookingData.date}"`);
      break;
    }
  }
  
  // Extract time - more flexible patterns
  const timePatterns = [
    // Specific pattern for "Waktu: 10:00 Durasi:" format
    /Waktu:\s*(\d{1,2}:\d{2})\s+Durasi:/i,
    // Other patterns with lookahead
    /(?:waktu|time)[:\s]+(\d{1,2}:\d{2})(?=\s*(?:durasi|peserta|pic|tanggal|tipe|pesanan|$))/i,
    /- Waktu: (\d{1,2}:\d{2})(?=\s*(?:durasi|peserta|pic|tanggal|tipe|pesanan|$))/i,
    /Waktu: (\d{1,2}:\d{2})(?=\s*(?:durasi|peserta|pic|tanggal|tipe|pesanan|$))/i,
    /jam (\d{1,2}:\d{2})(?=\s*(?:durasi|peserta|pic|tanggal|tipe|pesanan|$))/i,
    // Fallback patterns without strict lookahead
    /(?:waktu|time)[:\s]+(\d{1,2}:\d{2})/i,
    /- Waktu: (\d{1,2}:\d{2})/i,
    /Waktu: (\d{1,2}:\d{2})/i,
    /jam (\d{1,2}:\d{2})/i
  ];
  for (const pattern of timePatterns) {
    const match = message.match(pattern);
    if (match) {
      bookingData.time = match[1];
      console.log(`✅ Time parsed: "${bookingData.time}"`);
      break;
    }
  }
  
  // Extract end time - parsing "dari jam berapa sampai jam berapa"
  const endTimePatterns = [
    // Pattern untuk "Waktu: 10:00 - 11:30" atau "Waktu: 10:00 sampai 11:30"
    /Waktu:\s*(\d{1,2}:\d{2})\s*(?:-|sampai|until)\s*(\d{1,2}:\d{2})/i,
    // Pattern untuk "Jam: 10:00 - 11:30" atau "Jam: 10:00 sampai 11:30"
    /Jam:\s*(\d{1,2}:\d{2})\s*(?:-|sampai|until)\s*(\d{1,2}:\d{2})/i,
    // Pattern untuk "Dari: 10:00 Sampai: 11:30"
    /Dari:\s*(\d{1,2}:\d{2})\s*Sampai:\s*(\d{1,2}:\d{2})/i,
    // Pattern untuk "Mulai: 10:00 Selesai: 11:30"
    /Mulai:\s*(\d{1,2}:\d{2})\s*Selesai:\s*(\d{1,2}:\d{2})/i,
    // Pattern untuk "Start: 10:00 End: 11:30"
    /Start:\s*(\d{1,2}:\d{2})\s*End:\s*(\d{1,2}:\d{2})/i
  ];
  
  for (const pattern of endTimePatterns) {
    const match = message.match(pattern);
    if (match) {
      bookingData.time = match[1]; // Waktu mulai
      bookingData.endTime = match[2]; // Waktu selesai
      console.log(`✅ Time range parsed: "${bookingData.time}" - "${bookingData.endTime}"`);
      break;
    }
  }
  
  // Jika tidak ada pattern waktu range yang match, coba parsing durasi sebagai fallback
  if (!bookingData.endTime) {
    const durationPatterns = [
      // Specific pattern for "Durasi: 90 menit Topik:" format
      /Durasi:\s*(\d+)\s+menit\s+Topik:/i,
      // Other patterns with lookahead
      /(?:durasi|duration)[:\s]+(\d+)(?=\s*(?:menit|minute|peserta|pic|tanggal|tipe|pesanan|$))/i,
      /- Durasi: (\d+)(?=\s*(?:menit|minute|peserta|pic|tanggal|tipe|pesanan|$))/i,
      /Durasi: (\d+)(?=\s*(?:menit|minute|peserta|pic|tanggal|tipe|pesanan|$))/i,
      // Fallback patterns without strict lookahead
      /(?:durasi|duration)[:\s]+(\d+)/i,
      /- Durasi: (\d+)/i,
      /Durasi: (\d+)/i
    ];
    
    for (const pattern of durationPatterns) {
      const match = message.match(pattern);
      if (match) {
        // Calculate end time from duration (default 1 hour if no duration specified)
        const durationMinutes = parseInt(match[1]);
        const startTime = bookingData.time || '10:00';
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const startTotalMinutes = startHour * 60 + startMinute;
        const endTotalMinutes = startTotalMinutes + durationMinutes;
        const endHour = Math.floor(endTotalMinutes / 60);
        const endMinute = endTotalMinutes % 60;
        bookingData.endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
        console.log(`✅ Duration parsed: ${durationMinutes} minutes, calculated end time: "${bookingData.endTime}"`);
        break;
      }
    }
  }
  
  // Extract meeting type - more flexible patterns
  const meetingTypePatterns = [
    /(?:tipe meeting|meeting type)[:\s]+(internal|external|eksternal)(?=\s*(?:pesanan|makanan|$))/i,
    /- Tipe Meeting: (internal|external|eksternal)(?=\s*(?:pesanan|makanan|$))/i,
    /Tipe Meeting: (internal|external|eksternal)(?=\s*(?:pesanan|makanan|$))/i,
    // Fallback patterns without strict lookahead
    /(?:tipe meeting|meeting type)[:\s]+(internal|external|eksternal)/i,
    /- Tipe Meeting: (internal|external|eksternal)/i,
    /Tipe Meeting: (internal|external|eksternal)/i
  ];
  for (const pattern of meetingTypePatterns) {
    const match = message.match(pattern);
    if (match) {
      const type = match[1].toLowerCase();
      bookingData.meetingType = (type === 'eksternal' ? 'external' : type) as 'internal' | 'external';
      console.log(`✅ Meeting type parsed: "${bookingData.meetingType}"`);
      break;
    }
  }
  
  // Extract food order - more flexible patterns
  const foodPatterns = [
    /(?:pesanan makanan|food order)[:\s]+(tidak|ringan|berat)(?=\s*$)/i,
    /- Pesanan Makanan: (tidak|ringan|berat)(?=\s*$)/i,
    /Pesanan Makanan: (tidak|ringan|berat)(?=\s*$)/i,
    // Fallback patterns without strict lookahead
    /(?:pesanan makanan|food order)[:\s]+(tidak|ringan|berat)/i,
    /- Pesanan Makanan: (tidak|ringan|berat)/i,
    /Pesanan Makanan: (tidak|ringan|berat)/i
  ];
  for (const pattern of foodPatterns) {
    const match = message.match(pattern);
    if (match) {
      bookingData.foodOrder = match[1].toLowerCase() as 'berat' | 'ringan' | 'tidak';
      console.log(`✅ Food order parsed: "${bookingData.foodOrder}"`);
      break;
    }
  }
  
  // Check if we extracted enough data to consider this a one-shot booking
  const extractedFields = Object.keys(bookingData).length;
  console.log(`📊 Extracted ${extractedFields} fields:`, bookingData);
  
  if (extractedFields >= 3) { // At least 3 fields extracted
    // Add default values for missing fields
    if (!bookingData.meetingType) {
      bookingData.meetingType = 'internal'; // Default to internal
      console.log(`🔧 Added default meeting type: internal`);
    }
    if (!bookingData.foodOrder) {
      bookingData.foodOrder = 'tidak'; // Default to no food
      console.log(`🔧 Added default food order: tidak`);
    }
    console.log(`✅ One-shot booking data ready:`, bookingData);
    return bookingData;
  }
  
  console.log(`❌ Insufficient data extracted (${extractedFields} fields), returning null`);
  return null;
};

// ===============================
// PERBAIKAN: parseDateInput
// ===============================
const parseDateInput = (input: string): string => {
  const now = new Date();
  const lowerInput = input.toLowerCase();

  if (lowerInput.includes("hari ini")) return now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  if (lowerInput.includes("besok")) {
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    return tomorrow.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
  if (lowerInput.includes("lusa")) {
    const dayAfter = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2);
    return dayAfter.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
  if (lowerInput.includes("minggu depan")) {
    const nextWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);
    return nextWeek.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  // handle senin depan, rabu depan, dll
  const hariMap: { [key: string]: number } = {
    "minggu": 0, "senin": 1, "selasa": 2, "rabu": 3,
    "kamis": 4, "jumat": 5, "sabtu": 6
  };

  for (const hari in hariMap) {
    if (lowerInput.includes(hari)) {
      let target = hariMap[hari];
      let current = now.getDay();
      let diff = target - current;
      if (diff <= 0 || lowerInput.includes("depan")) {
        diff += 7;
      }
      const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff);
      return targetDate.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
  }

  // Format tanggal spesifik (contoh: 25 Agustus / 25/08/2025)
  const monthMap: { [key: string]: number } = {
    "januari": 0, "februari": 1, "maret": 2, "april": 3, "mei": 4, "juni": 5,
    "juli": 6, "agustus": 7, "september": 8, "oktober": 9, "november": 10, "desember": 11
  };
  
  const regex = /(\d{1,2})[\/\-\s](\d{1,2}|\w+)([\/\-\s](\d{2,4}))?/;
  const match = lowerInput.match(regex);
  if (match) {
    let day = parseInt(match[1]);
    let month = isNaN(parseInt(match[2]))
      ? monthMap[match[2]]
      : parseInt(match[2]) - 1;
    let year = match[4] ? parseInt(match[4]) : now.getFullYear();
    const targetDate = new Date(year, month, day);
    return targetDate.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  return input;
};

// ===============================
// PERBAIKAN: parseTimeInput
// ===============================
const parseTimeInput = (input: string): string => {
  const lowerInput = input.toLowerCase();

  // format HH:MM atau HH.MM
  let match = lowerInput.match(/(\d{1,2})[:.](\d{2})/);
  if (match) {
    let h = parseInt(match[1]);
    let m = match[2];
    if (h >= 0 && h <= 23) return `${h.toString().padStart(2, "0")}:${m}`;
  }

  // format "jam 9", "pukul 14"
  match = lowerInput.match(/(?:jam|pukul)\s?(\d{1,2})(?:\.(\d{2}))?/);
  if (match) {
    let h = parseInt(match[1]);
    let m = match[2] || "00";

    // cek AM/PM
    if (lowerInput.includes("siang") || lowerInput.includes("sore") || lowerInput.includes("malam")) {
      if (h < 12) h += 12;
    }
    return `${h.toString().padStart(2, "0")}:${m}`;
  }

  // format "9 pagi", "2 siang"
  match = lowerInput.match(/(\d{1,2})\s?(pagi|siang|sore|malam)/);
  if (match) {
    let h = parseInt(match[1]);
    if (match[2] === "siang" || match[2] === "sore" || match[2] === "malam") {
      if (h < 12) h += 12;
    }
    return `${h.toString().padStart(2, "0")}:00`;
  }

  return input;
};

// Helper function to parse participant input
const parseParticipantInput = (input: string): number | null => {
  const lowerInput = input.toLowerCase();
  
  // Handle range inputs like "2-5 orang"
  if (lowerInput.includes('-')) {
    const rangeMatch = lowerInput.match(/(\d+)-(\d+)/);
    if (rangeMatch) {
      return parseInt(rangeMatch[2]);
    }
  }
  
  // Handle "10+ orang" format
  if (lowerInput.includes('+')) {
    const plusMatch = lowerInput.match(/(\d+)\+/);
    if (plusMatch) {
      return parseInt(plusMatch[1]) + 2;
    }
  }
  
  // Handle direct numbers
  const numberMatch = lowerInput.match(/(\d+)/);
  if (numberMatch) {
    return parseInt(numberMatch[1]);
  }
  
  return null;
};

// Quick actions helper for food selection
const getFoodQuickActions = () => ([
  { label: "Tidak perlu", actionValue: "tidak" },
  { label: "Makanan Ringan", actionValue: "ringan" },
  { label: "Makanan Berat", actionValue: "berat" }
]);

// Main function to process the conversational input and update state
export const processBookingConversation = async (
  message: string,
  state: BookingState,
  data: Partial<Booking>
): Promise<{
  responseText: string;
  newState: BookingState;
  updatedBookingData: Partial<Booking>;
  finalBooking?: Booking;
  quickActions?: { label: string, actionValue: string }[];
}> => {
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate AI thinking
  const lowerCaseMessage = message.toLowerCase().trim();
  
  let responseText = "";
  let newState = state;
  let updatedBookingData = { ...data };
  let finalBooking: Booking | undefined = undefined;
  let quickActions: { label: string, actionValue: string }[] | undefined = undefined;

  // Global "start over" check for "batal" or "stop"
  if (lowerCaseMessage.includes('batal') || lowerCaseMessage.includes('stop') || lowerCaseMessage.includes('mulai ulang')) {
    console.log(`🔍 Global intercept: cancel/stop detected`);
    newState = BookingState.IDLE;
    responseText = "Baik, pemesanan dibatalkan. Ada lagi yang bisa saya bantu?";
    updatedBookingData = {};
    quickActions = undefined;
    return { responseText, newState, updatedBookingData, finalBooking, quickActions };
  }

  // Global intercept: user explicitly wants to change time
  if (
    lowerCaseMessage.includes('ubah waktu') ||
    lowerCaseMessage.includes('ganti waktu') ||
    lowerCaseMessage.includes('ubah jam') ||
    lowerCaseMessage.includes('ganti jam')
  ) {
    console.log(`🔍 Global intercept: change time detected`);
    newState = BookingState.ASKING_TIME;
    // clear previous time to force re-ask
    if (updatedBookingData.time) delete (updatedBookingData as any).time;
    responseText = "Baik, ingin ubah ke jam berapa? Tulis dalam format HH:MM atau rentang seperti 14:00 - 15:00.";
    quickActions = [
      { label: '09:00', actionValue: '09:00' },
      { label: '10:00', actionValue: '10:00' },
      { label: '13:00', actionValue: '13:00' },
      { label: '15:00', actionValue: '15:00' },
    ];
    return { responseText, newState, updatedBookingData, finalBooking, quickActions };
  }

  // Global intercept: quick confirm from any state when all data is ready
  const isBookingComplete = !!(updatedBookingData.roomName && updatedBookingData.topic && updatedBookingData.pic &&
    updatedBookingData.participants && updatedBookingData.date && updatedBookingData.time &&
    updatedBookingData.meetingType && updatedBookingData.foodOrder);
  
  console.log(`🔍 Global intercept check: isBookingComplete=${isBookingComplete}, state=${state}`);
  console.log(`🔍 Booking data:`, updatedBookingData);
  console.log(`🔍 Input message: "${message}"`);
  console.log(`🔍 Lower case message: "${lowerCaseMessage}"`);
  
  // Pastikan tidak ada intercept yang salah untuk input makanan
  if (state === BookingState.ASKING_FOOD_TYPE) {
    console.log(`🔍 In ASKING_FOOD_TYPE state, skipping global intercepts`);
    // Skip global intercepts when in ASKING_FOOD_TYPE state
    // Lanjut ke switch statement untuk memproses input makanan
  }
  
  // Pastikan tidak ada intercept yang salah untuk meeting type
  if (state === BookingState.ASKING_MEETING_TYPE) {
    console.log(`🔍 In ASKING_MEETING_TYPE state, skipping global intercepts`);
    // Skip global intercepts when in ASKING_MEETING_TYPE state
    // Lanjut ke switch statement untuk memproses input meeting type
  }
  
  // Pastikan tidak ada intercept yang salah untuk input waktu
  if (state === BookingState.ASKING_TIME) {
    console.log(`🔍 In ASKING_TIME state, skipping global intercepts`);
    // Skip global intercepts when in ASKING_TIME state
    // Lanjut ke switch statement untuk memproses input waktu
  }
  
  // Hanya jalankan quick confirm jika user benar-benar ingin konfirmasi
  // Dan hanya jika state sudah CONFIRMING dan user mengetik konfirmasi
  if (isBookingComplete && state === BookingState.CONFIRMING && 
      (/(^|\b)(ya|benar|konfirm|konfirmasi)(\b|$)/i.test(lowerCaseMessage))) {
        finalBooking = {
          id: Date.now(),
          roomName: updatedBookingData.roomName!,
          roomId: updatedBookingData.roomId!,
          topic: updatedBookingData.topic!,
          pic: updatedBookingData.pic!,
          participants: updatedBookingData.participants!,
          date: updatedBookingData.date!,
          time: updatedBookingData.time!,
          endTime: updatedBookingData.endTime,
          meetingType: updatedBookingData.meetingType!,
          foodOrder: updatedBookingData.foodOrder!
        };
    responseText = "🎉 Pemesanan berhasil dikonfirmasi! Terima kasih telah menggunakan layanan Spacio.";
    quickActions = undefined;
    return { responseText, newState, updatedBookingData, finalBooking, quickActions };
  }
  // Hanya jalankan cancel jika user benar-benar ingin membatalkan
  // Dan hanya jika state sudah CONFIRMING atau user mengetik "batal" secara eksplisit
  if (state === BookingState.CONFIRMING && (/(^|\b)(tidak|batal)(\b|$)/i.test(lowerCaseMessage))) {
    newState = BookingState.IDLE;
    responseText = "Baik, pemesanan dibatalkan. Ada lagi yang bisa saya bantu?";
    updatedBookingData = {};
    quickActions = undefined;
    return { responseText, newState, updatedBookingData, finalBooking, quickActions };
  }
  
  switch (state) {
    case BookingState.IDLE:
      console.log(`📍 Processing IDLE state with message: "${message}"`);
      
      // PERBAIKAN: Check for one-shot booking pattern first
      const oneShotBooking = parseOneShotBooking(message);
      if (oneShotBooking) {
        console.log(`🚀 One-shot booking detected:`, oneShotBooking);
        updatedBookingData = { ...updatedBookingData, ...oneShotBooking };
        
        // Check if all required data is present
        const isComplete = !!(updatedBookingData.roomName && updatedBookingData.topic && updatedBookingData.pic &&
          updatedBookingData.participants && updatedBookingData.date && updatedBookingData.time &&
          updatedBookingData.meetingType && updatedBookingData.foodOrder);
        
        if (isComplete) {
          // All data complete, go directly to confirmation
          newState = BookingState.CONFIRMING;
          responseText = buildConfirmationSummary(updatedBookingData);
          quickActions = [
            { label: 'Ya, Konfirmasi', actionValue: 'ya' },
            { label: 'Tidak, Batal', actionValue: 'tidak' }
          ];
        } else {
          // Some data missing, ask for missing information
          const missingFields = [];
          if (!updatedBookingData.roomName) missingFields.push('ruangan');
          if (!updatedBookingData.topic) missingFields.push('topik');
          if (!updatedBookingData.pic) missingFields.push('PIC');
          if (!updatedBookingData.participants) missingFields.push('jumlah peserta');
          if (!updatedBookingData.date) missingFields.push('tanggal');
          if (!updatedBookingData.time) missingFields.push('waktu');
          if (!updatedBookingData.meetingType) missingFields.push('tipe meeting');
          if (!updatedBookingData.foodOrder) missingFields.push('pesanan makanan');
          
          responseText = `Terima kasih! Saya sudah menangkap sebagian informasi pemesanan Anda. Namun masih ada beberapa detail yang perlu dilengkapi:\n\n❌ **Yang masih kurang:** ${missingFields.join(', ')}\n\nSilakan lengkapi informasi yang kurang tersebut.`;
          newState = BookingState.ASKING_ROOM; // Start from room selection
          quickActions = undefined;
        }
        return { responseText, newState, updatedBookingData, finalBooking, quickActions };
      }
      
      // PERBAIKAN: Prioritaskan one-shot booking terlebih dahulu
      if (lowerCaseMessage === 'one_shot_booking' || lowerCaseMessage.includes('one shot')) {
        // PERBAIKAN: One-shot booking quick button dengan form interaktif
        newState = BookingState.ONE_SHOT_FORM;
        responseText = "🚀 **One-Shot Booking** - Pemesanan Cepat!\n\n" +
          "Silakan isi form di bawah ini dengan detail pemesanan Anda:\n\n" +
          "**📋 FORM PEMESANAN RUANGAN**\n" +
          "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
          "🏢 **Ruangan:** [Ketik nama ruangan]\n" +
          "📅 **Tanggal:** [Contoh: 20 Januari 2025]\n" +
          "⏰ **Waktu:** [Contoh: 10:00 - 11:30 atau 10:00 sampai 11:30]\n" +
          "📝 **Topik:** [Contoh: Rapat Tim Marketing]\n" +
          "👥 **Peserta:** [Contoh: 6 orang]\n" +
          "👤 **PIC:** [Contoh: Ahmad Rizki]\n" +
          "🤝 **Tipe Meeting:** [INTERNAL/EXTERNAL]\n" +
          "🍽️ **Pesanan Makanan:** [TIDAK/RINGAN/BERAT]\n" +
          "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
          "**💡 Cara mengisi:**\n" +
          "Ketik semua informasi di atas dalam satu pesan, contoh:\n\n" +
          "```\n" +
          "Ruangan: Komodo Meeting Room\n" +
          "Tanggal: 20 Januari 2025\n" +
          "Waktu: 10:00 - 11:30\n" +
          "Topik: Rapat Tim Marketing Q1\n" +
          "Peserta: 6 orang\n" +
          "PIC: Ahmad Rizki\n" +
          "Tipe Meeting: INTERNAL\n" +
          "Pesanan Makanan: RINGAN\n" +
          "```\n\n" +
          "**Atau dengan format lain:**\n" +
          "```\n" +
          "Ruangan: Komodo Meeting Room\n" +
          "Tanggal: 20 Januari 2025\n" +
          "Dari: 10:00 Sampai: 11:30\n" +
          "Topik: Rapat Tim Marketing Q1\n" +
          "Peserta: 6 orang\n" +
          "PIC: Ahmad Rizki\n" +
          "Tipe Meeting: INTERNAL\n" +
          "Pesanan Makanan: RINGAN\n" +
          "```\n\n" +
          "Silakan isi form di atas!";
        quickActions = [
          { label: '❌ Batal', actionValue: 'batal' }
        ];
      } else if (lowerCaseMessage.includes('pesan ruangan') || lowerCaseMessage === 'start_booking' || (lowerCaseMessage.includes('booking') && !lowerCaseMessage.includes('one_shot'))) {
        newState = BookingState.ASKING_ROOM;
        responseText = "Baik, mari kita mulai pemesanan ruangan! 🎯\n\nSilakan pilih ruangan yang Anda inginkan dari daftar di bawah ini:";
        quickActions = MEETING_ROOMS.map(room => ({
          label: `${room.name} (${room.capacity} orang)`,
          actionValue: room.name
        }));
      } else if (lowerCaseMessage.includes("reservasi") || lowerCaseMessage.includes("cek reservasi")) {
        responseText = "Fitur pengecekan reservasi sedang dalam pengembangan. Saat ini saya dapat membantu Anda memesan ruangan baru.";
        quickActions = undefined;
      } else if (lowerCaseMessage.includes("bantuan") || lowerCaseMessage.includes("help")) {
        responseText = "Saya dapat membantu Anda memesan ruangan dengan mudah! Berikut adalah fitur yang tersedia:\n\n🏢 **Pemesanan Ruangan** - Pilih ruangan sesuai kebutuhan\n👥 **Kapasitas** - Sesuaikan dengan jumlah peserta\n📅 **Jadwal** - Pilih tanggal dan waktu yang tepat\n🍽️ **Catering** - Pilih jenis makanan jika diperlukan\n🚀 **One-Shot Booking** - Pemesanan cepat dalam satu langkah\n\nSilakan ketik pesan Anda atau gunakan tombol di bawah ini.";
        quickActions = [
          { label: '🚀 One-Shot Booking', actionValue: 'one_shot_booking' },
          { label: '🏢 Pesan Ruangan', actionValue: 'pesan ruangan' },
          { label: '❓ Bantuan', actionValue: 'bantuan' }
        ];
      }
      // Check if user is directly selecting a room
      else {
        const roomMatch = MEETING_ROOMS.find(room => {
          const roomNameLower = room.name.toLowerCase();
          return lowerCaseMessage.includes(roomNameLower) || roomNameLower.includes(lowerCaseMessage);
        });
        
        if (roomMatch) {
          console.log(`✅ Room selected: ${roomMatch.name}`);
          updatedBookingData.roomName = roomMatch.name;
          newState = BookingState.ASKING_TOPIC;
          responseText = `Bagus! Ruangan yang dipilih: **${roomMatch.name}** 🏢\n\nKapasitas: ${roomMatch.capacity} orang\nFasilitas: ${roomMatch.facilities.join(', ')}\n\nSekarang, apa topik atau nama rapatnya? 📝`;
          quickActions = undefined;
        }
        // TAMBAHAN: Check if user is selecting topic when in IDLE state (for quick actions)
        else if (lowerCaseMessage === "rapat tim" || lowerCaseMessage === "presentasi" || 
               lowerCaseMessage === "meeting client" || lowerCaseMessage === "brainstorming" || 
               lowerCaseMessage === "training" || lowerCaseMessage === "diskusi proyek") {
          console.log(`📝 Topic selected in IDLE state: ${message}`);
          // If user selects topic but no room selected yet, ask for room first
          if (!updatedBookingData.roomName) {
            responseText = "Baik! Tapi sebelum itu, silakan pilih ruangan terlebih dahulu:";
            newState = BookingState.ASKING_ROOM;
            quickActions = MEETING_ROOMS.map(room => ({
              label: `${room.name} (${room.capacity} orang)`,
              actionValue: room.name
            }));
          } else {
            // If room already selected, proceed with topic
            let topicName = message;
            if (lowerCaseMessage === "rapat tim") topicName = "Rapat Tim";
            else if (lowerCaseMessage === "presentasi") topicName = "Presentasi";
            else if (lowerCaseMessage === "meeting client") topicName = "Meeting Client";
            else if (lowerCaseMessage === "brainstorming") topicName = "Brainstorming";
            else if (lowerCaseMessage === "training") topicName = "Training";
            else if (lowerCaseMessage === "diskusi proyek") topicName = "Diskusi Proyek";
            
            updatedBookingData.topic = topicName;
            newState = BookingState.ASKING_PIC;
            responseText = `Baik, topiknya "${topicName}". Siapa PIC (Person in Charge) untuk rapat ini? 👤`;
            quickActions = undefined;
          }
        } else {
          console.log(`❓ Unknown command, guiding to room selection`);
          // If we don't understand, guide user to start booking
          responseText = "Maaf, saya tidak mengerti maksud Anda. Mari kita mulai pemesanan ruangan! Silakan pilih opsi di bawah ini:";
          newState = BookingState.ASKING_ROOM;
          quickActions = [
            { label: '🚀 One-Shot Booking', actionValue: 'one_shot_booking' },
            { label: '🏢 Pilih Ruangan', actionValue: 'pesan ruangan' },
            { label: '❓ Bantuan', actionValue: 'bantuan' }
          ];
        }
      }
      break;

    case BookingState.ASKING_ROOM:
      // Enhanced room matching logic with better fallback handling
      
      // Find the best matching room by scoring each one
      let bestMatch = null;
      let bestScore = 0;
      
      MEETING_ROOMS.forEach(room => {
        const roomNameLower = room.name.toLowerCase();
        const messageLower = lowerCaseMessage;
        let score = 0;
        
        // 1. Exact match (case insensitive) - Highest priority (score: 100)
        if (messageLower === roomNameLower) {
          score = 100;
        }
        // 2. Contains match - message contains room name (score: 90)
        else if (messageLower.includes(roomNameLower)) {
          score = 90;
        }
        // 3. Room name contains message (score: 80)
        else if (roomNameLower.includes(messageLower)) {
          score = 80;
        }
        // 4. Specific room name keyword match (score: 70)
        else {
          const roomKeywords = ['samudrantha', 'cedaya', 'celebes', 'kalamanthana', 'nusanipa', 'balidwipa', 'swarnadwipa', 'jawadwipa'];
          const matchedKeyword = roomKeywords.find(keyword => messageLower.includes(keyword));
          
          if (matchedKeyword && roomNameLower.includes(matchedKeyword)) {
            score = 70;
          }
          // 5. Partial keyword match (score: 60)
          else if (matchedKeyword) {
            const partialMatch = roomKeywords.find(keyword => 
              messageLower.includes(keyword.substring(0, 4)) || 
              messageLower.includes(keyword.substring(keyword.length - 4)) ||
              messageLower.includes(keyword.substring(0, Math.floor(keyword.length / 2)))
            );
            
            if (partialMatch && roomNameLower.includes(partialMatch)) {
              score = 60;
            }
            // 6. Generic word match (score: 30)
            else if (messageLower.includes('meeting') && roomNameLower.includes('meeting')) {
              score = 30;
            }
            else if (messageLower.includes('room') && roomNameLower.includes('room')) {
              score = 25;
            }
            else if (messageLower.includes('auditorium') && roomNameLower.includes('auditorium')) {
              score = 20;
            }
            // 7. Number match for auditoriums (score: 15)
            else if (messageLower.includes('1') && roomNameLower.includes('1')) {
              score = 15;
            }
            else if (messageLower.includes('2') && roomNameLower.includes('2')) {
              score = 15;
            }
          }
        }
        
        // Update best match if this room has a higher score
        if (score > bestScore) {
          bestScore = score;
          bestMatch = room;
        }
      });
      
      // Only proceed if we have a good enough match (score >= 60)
      if (bestMatch && bestScore >= 60) {
        updatedBookingData.roomName = bestMatch.name;
        newState = BookingState.ASKING_TOPIC;
        responseText = `Bagus! Ruangan yang dipilih: **${bestMatch.name}** 🏢\n\nKapasitas: ${bestMatch.capacity} orang\nFasilitas: ${bestMatch.facilities.join(', ')}\n\nSekarang, apa topik atau nama rapatnya? 📝`;
        quickActions = undefined;
      } else {
        responseText = "Maaf, saya tidak menemukan ruangan yang sesuai. Silakan pilih ruangan dari daftar yang tersedia:";
        quickActions = MEETING_ROOMS.map(room => ({
          label: `${room.name} (${room.capacity} orang)`,
          actionValue: room.name
        }));
      }
      break;

    // ===============================
    // PERBAIKAN: ASKING_TOPIC
    // ===============================
    case BookingState.ASKING_TOPIC:
      {
        console.log(`📝 ASKING_TOPIC: Processing message "${message}" in state ${state}`);
        const lowerMsg = message.toLowerCase();
        let matchedTopic = null;

        // Prioritas langsung (keyword spesifik)
        if (lowerMsg.includes("rapat tim") || lowerMsg === "rapat tim") {
          matchedTopic = "Rapat Tim";
        } else if (lowerMsg.includes("meeting client") || lowerMsg === "meeting client") {
          matchedTopic = "Meeting Client";
        } else if (lowerMsg.includes("presentasi") || lowerMsg === "presentasi") {
          matchedTopic = "Presentasi";
        } else if (lowerMsg.includes("brainstorming") || lowerMsg === "brainstorming") {
          matchedTopic = "Brainstorming";
        } else if (lowerMsg.includes("diskusi proyek") || lowerMsg === "diskusi proyek") {
          matchedTopic = "Diskusi Proyek";
        } else if (lowerMsg.includes("training") || lowerMsg === "training") {
          matchedTopic = "Training";
        } else if (lowerMsg.includes("client") || lowerMsg.includes("klien") || lowerMsg.includes("customer")) {
          matchedTopic = "Meeting Client";
        } else if (lowerMsg.includes("internal") || lowerMsg.includes("team") || lowerMsg.includes("tim")) {
          matchedTopic = "Rapat Tim";
        } else if (lowerMsg.includes("proyek") || lowerMsg.includes("project")) {
          matchedTopic = "Diskusi Proyek";
        } else if (lowerMsg.includes("brainstorm") || lowerMsg.includes("ide")) {
          matchedTopic = "Brainstorming";
        }

        console.log(`📝 ASKING_TOPIC: matchedTopic = "${matchedTopic}", message.length = ${message.length}`);

        // validasi minimal
        const finalTopic = matchedTopic ?? message.trim();
        if (finalTopic.length < 2) {
          responseText = "Mohon masukkan topik rapat yang lebih spesifik (minimal 2 karakter).";
          quickActions = undefined;
        } else {
          updatedBookingData.topic = finalTopic;
          newState = BookingState.ASKING_PIC;
          responseText = `Baik, topiknya "${finalTopic}". Siapa PIC (Person in Charge) untuk rapat ini? 👤`;
          quickActions = undefined;
        }
      }
      break;

    case BookingState.ASKING_PIC:
      if (message.trim().length < 2) {
        responseText = "Mohon masukkan nama PIC yang valid (minimal 2 karakter).";
        quickActions = undefined;
      } else {
        updatedBookingData.pic = message;
        newState = BookingState.ASKING_PARTICIPANTS;
        responseText = `Baik! PIC-nya adalah **"${message}"** 👤\n\nBerapa jumlah peserta yang akan hadir? 👥`;
        quickActions = undefined;
      }
      break;

    case BookingState.ASKING_PARTICIPANTS:
      // Parse the participant input properly
      const participants = parseParticipantInput(message);
      if (participants === null || participants < 1) {
        responseText = "Mohon masukkan jumlah peserta yang valid (minimal 1 orang).";
        quickActions = undefined;
      } else {
        updatedBookingData.participants = participants;
        
        // Check if the selected room can accommodate the participants
        if (updatedBookingData.roomName) {
          const selectedRoom = MEETING_ROOMS.find(room => room.name === updatedBookingData.roomName);
          if (selectedRoom && participants > selectedRoom.capacity) {
            responseText = `⚠️ **Peringatan Kapasitas**\n\nRuangan **${selectedRoom.name}** hanya bisa menampung maksimal ${selectedRoom.capacity} orang.\n\nJumlah peserta Anda: ${participants} orang\n\nApakah Anda ingin memilih ruangan lain atau mengurangi jumlah peserta?`;
            quickActions = undefined;
          } else {
            newState = BookingState.ASKING_DATE;
            responseText = `Bagus! Jumlah peserta: **${participants} orang** 👥\n\nKapan rapat akan diadakan? 📅`;
            quickActions = undefined;
          }
        } else {
          newState = BookingState.ASKING_DATE;
          responseText = `Bagus! Jumlah peserta: **${participants} orang** 👥\n\nKapan rapat akan diadakan? 📅`;
          quickActions = undefined;
        }
      }
      break;

    case BookingState.ASKING_DATE:
      // Parse the date input properly
      const parsedDate = parseDateInput(message);
      if (parsedDate === message && !lowerCaseMessage.includes('hari ini') && !lowerCaseMessage.includes('besok') && !lowerCaseMessage.includes('lusa') && !lowerCaseMessage.includes('minggu depan')) {
        responseText = "Mohon pilih tanggal yang valid atau gunakan opsi yang tersedia.";
        quickActions = undefined;
      } else {
        updatedBookingData.date = parsedDate;
        newState = BookingState.ASKING_TIME;
        responseText = `Bagus! Tanggal rapat: **"${parsedDate}"** 📅\n\nJam berapa rapat akan dimulai? ⏰`;
        quickActions = undefined;
      }
      break;

    case BookingState.ASKING_TIME:
      console.log(`🔍 Time parsing: input="${message}", lowerCase="${lowerCaseMessage}"`);
      console.log(`🔍 Current state: ASKING_TIME`);
      console.log(`🔍 Current booking data:`, updatedBookingData);
      
      // Cek apakah input adalah meeting type (yang seharusnya tidak terjadi di state ini)
      if (lowerCaseMessage === 'internal' || lowerCaseMessage === 'eksternal' || lowerCaseMessage === 'external') {
        console.log(`❌ Meeting type input detected in ASKING_TIME state: ${message}`);
        console.log(`❌ This should not happen! User should be providing time, not meeting type.`);
        responseText = "Mohon pilih waktu yang valid. Format yang didukung misalnya: 09:00, 10.30, jam 9, pukul 14, 2 siang.";
        quickActions = [
          { label: '09:00', actionValue: '09:00' },
          { label: '10:00', actionValue: '10:00' },
          { label: '13:00', actionValue: '13:00' },
          { label: '15:00', actionValue: '15:00' },
        ];
        break;
      }
      
      // Parse and validate time: allow start between 09:00 and 17:00
      const parsedTime = parseTimeInput(message);
      console.log(`🔍 Parsed time: "${parsedTime}"`);
      
      const timeMatch = parsedTime.match(/^(\d{1,2}):([0-5]\d)$/);
      if (!timeMatch) {
        console.log(`❌ Invalid time input: ${message}`);
        responseText = "Mohon pilih waktu yang valid. Format yang didukung misalnya: 09:00, 10.30, jam 9, pukul 14, 2 siang.";
        quickActions = [
          { label: '09:00', actionValue: '09:00' },
          { label: '10:00', actionValue: '10:00' },
          { label: '13:00', actionValue: '13:00' },
          { label: '15:00', actionValue: '15:00' },
        ];
      } else {
        const hour = parseInt(timeMatch[1]);
        if (hour < 9 || hour > 17) {
          console.log(`❌ Time out of range: ${hour}:${timeMatch[2]}`);
          responseText = "Jam rapat hanya dapat dimulai antara 09:00 hingga 17:00.";
          quickActions = [
            { label: '09:00', actionValue: '09:00' },
            { label: '10:00', actionValue: '10:00' },
            { label: '13:00', actionValue: '13:00' },
            { label: '15:00', actionValue: '15:00' },
          ];
        } else {
          updatedBookingData.time = parsedTime;
          console.log(`✅ Time set to: ${parsedTime}`);
          console.log('🔄 Transitioning to ASKING_MEETING_TYPE state');
          newState = BookingState.ASKING_MEETING_TYPE;
          responseText = `Bagus! Waktu rapat: **"${parsedTime}"** ⏰\n\nApa jenis rapatnya? 🤝`;
          quickActions = [
            { label: "Internal", actionValue: "internal" },
            { label: "Eksternal", actionValue: "eksternal" }
          ];
        }
      }
      break;


    // ===============================
    // PERBAIKAN: ASKING_MEETING_TYPE
    // ===============================
    case BookingState.ASKING_MEETING_TYPE:
      {
        const lowerCaseMessage = message.toLowerCase();
        console.log(`🔍 Meeting type parsing: input="${message}", lowerCase="${lowerCaseMessage}"`);
        console.log(`🔍 Current state: ASKING_MEETING_TYPE`);
        console.log(`🔍 Current booking data:`, updatedBookingData);
        
        // Cek apakah input adalah waktu (yang seharusnya tidak terjadi di state ini)
        if (lowerCaseMessage.match(/^\d{1,2}:\d{2}$/) || lowerCaseMessage.match(/^\d{1,2}\.\d{2}$/)) {
          console.log(`❌ Time input detected in ASKING_MEETING_TYPE state: ${message}`);
          console.log(`❌ This should not happen! User should be providing meeting type, not time.`);
          responseText = "Apakah rapat ini internal atau eksternal?";
          quickActions = [
            { label: "Internal", actionValue: "internal" },
            { label: "Eksternal", actionValue: "eksternal" }
          ];
          break;
        }
        
        // Cek apakah input adalah meeting type yang valid
        if (lowerCaseMessage === 'internal' || lowerCaseMessage.match(/^internal$/)) {
          updatedBookingData.meetingType = "internal";
          console.log(`✅ Meeting type set to: internal`);
          newState = BookingState.ASKING_FOOD_TYPE;
          responseText = `Baik, jenis rapatnya internal. Apakah perlu memesan makanan? 🍽️`;
          quickActions = getFoodQuickActions();
        } else if (lowerCaseMessage === 'eksternal' || lowerCaseMessage === 'external' || lowerCaseMessage.match(/^eksternal$|^external$/)) {
          updatedBookingData.meetingType = "external";
          console.log(`✅ Meeting type set to: external`);
          newState = BookingState.ASKING_FOOD_TYPE;
          responseText = `Baik, jenis rapatnya eksternal. Apakah perlu memesan makanan? 🍽️`;
          quickActions = getFoodQuickActions();
        } else if (lowerCaseMessage.match(/client|klien|customer/)) {
          updatedBookingData.meetingType = "external";
          console.log(`✅ Meeting type set to: external (from client/klien/customer)`);
          newState = BookingState.ASKING_FOOD_TYPE;
          responseText = `Baik, jenis rapatnya eksternal. Apakah perlu memesan makanan? 🍽️`;
          quickActions = getFoodQuickActions();
        } else if (lowerCaseMessage.match(/tim|team|in-house/)) {
          updatedBookingData.meetingType = "internal";
          console.log(`✅ Meeting type set to: internal (from tim/team/in-house)`);
          newState = BookingState.ASKING_FOOD_TYPE;
          responseText = `Baik, jenis rapatnya internal. Apakah perlu memesan makanan? 🍽️`;
          quickActions = getFoodQuickActions();
        } else {
          console.log(`❌ Invalid meeting type input: ${message}`);
          responseText = "Apakah rapat ini internal atau eksternal?";
          quickActions = [
            { label: "Internal", actionValue: "internal" },
            { label: "Eksternal", actionValue: "eksternal" }
          ];
        }
      }
      break;

    case BookingState.ASKING_FOOD_TYPE:
      console.log(`🔍 Food type parsing: input="${message}", lowerCase="${lowerCaseMessage}"`);
      console.log(`🔍 Current state: ASKING_FOOD_TYPE`);
      console.log(`🔍 Current booking data:`, updatedBookingData);
      
      // Pastikan kita benar-benar di state ASKING_FOOD_TYPE
      if (state !== BookingState.ASKING_FOOD_TYPE) {
        console.log(`❌ Wrong state! Expected: ASKING_FOOD_TYPE, Got: ${state}`);
        responseText = "Mohon pilih jenis makanan yang valid: tidak, ringan, atau berat.";
        quickActions = getFoodQuickActions();
        break;
      }
      
      // Cek apakah input adalah makanan yang valid
      if (lowerCaseMessage.includes('tidak')) {
        updatedBookingData.foodOrder = 'tidak';
        console.log(`✅ Food order set to: tidak`);
      } else if (lowerCaseMessage.includes('ringan')) {
        updatedBookingData.foodOrder = 'ringan';
        console.log(`✅ Food order set to: ringan`);
      } else if (lowerCaseMessage.includes('berat')) {
        updatedBookingData.foodOrder = 'berat';
        console.log(`✅ Food order set to: berat`);
      } else {
        console.log(`❌ Invalid food input: ${message}`);
        responseText = "Mohon pilih jenis makanan yang valid: tidak, ringan, atau berat.";
        quickActions = getFoodQuickActions();
        break;
      }
      
      // Hanya set PIC jika benar-benar kosong
      if (!updatedBookingData.pic) {
        updatedBookingData.pic = '-';
      }
      
      console.log('🔍 Final booking data before confirmation:', updatedBookingData);
      console.log('🔄 Transitioning to CONFIRMING state');
      
      newState = BookingState.CONFIRMING;
      responseText = buildConfirmationSummary(updatedBookingData);
      quickActions = [
        { label: "Ya, konfirmasi", actionValue: "ya" },
        { label: "Tidak, batal", actionValue: "tidak" }
      ];
      break;

    case BookingState.CONFIRMING:
      console.log(`🔍 Confirming state: input="${message}", lowerCase="${lowerCaseMessage}"`);
      console.log(`🔍 Current booking data:`, updatedBookingData);
      
      if (lowerCaseMessage.includes('ya') || lowerCaseMessage.includes('benar') || lowerCaseMessage.includes('konfirm')) {
        // Create final booking object using updatedBookingData
        finalBooking = {
          id: Date.now(),
          roomName: updatedBookingData.roomName!,
          roomId: updatedBookingData.roomId!,
          topic: updatedBookingData.topic!,
          pic: updatedBookingData.pic || '-',
          participants: updatedBookingData.participants!,
          date: updatedBookingData.date!,
          time: updatedBookingData.time!,
          endTime: updatedBookingData.endTime,
          meetingType: updatedBookingData.meetingType!,
          foodOrder: updatedBookingData.foodOrder || 'tidak'
        };
        
        console.log('✅ Creating final booking with data:', finalBooking);
        responseText = "🎉 Pemesanan berhasil dikonfirmasi! Terima kasih telah menggunakan layanan Spacio.";
        quickActions = undefined;
      } else if (lowerCaseMessage.includes('tidak') || lowerCaseMessage.includes('batal')) {
        newState = BookingState.IDLE;
        responseText = "Baik, pemesanan dibatalkan. Ada lagi yang bisa saya bantu?";
        updatedBookingData = {};
        quickActions = undefined;
      } else {
        // Jika user mengetik sesuatu yang tidak jelas, tampilkan konfirmasi lagi
        responseText = buildConfirmationSummary(updatedBookingData);
        quickActions = [
          { label: "Ya, konfirmasi", actionValue: "ya" },
          { label: "Tidak, batal", actionValue: "tidak" }
        ];
      }
      break;

    case BookingState.ONE_SHOT_FORM:
      console.log(`📍 Processing ONE_SHOT_FORM state with message: "${message}"`);
      
      // Parse one-shot booking from user input
      const oneShotData = parseOneShotBooking(message);
      if (oneShotData) {
        console.log(`🚀 One-shot booking data parsed:`, oneShotData);
        updatedBookingData = { ...updatedBookingData, ...oneShotData };
        
        // Check if all required data is present
        const isComplete = !!(updatedBookingData.roomName && updatedBookingData.topic && updatedBookingData.pic &&
          updatedBookingData.participants && updatedBookingData.date && updatedBookingData.time &&
          updatedBookingData.meetingType && updatedBookingData.foodOrder);
        
        if (isComplete) {
          // All data complete, go directly to confirmation
          newState = BookingState.CONFIRMING;
          responseText = buildConfirmationSummary(updatedBookingData);
          quickActions = [
            { label: 'Ya, Konfirmasi', actionValue: 'ya' },
            { label: 'Tidak, Batal', actionValue: 'tidak' }
          ];
        } else {
          // Some data missing, ask for missing information
          const missingFields = [];
          if (!updatedBookingData.roomName) missingFields.push('ruangan');
          if (!updatedBookingData.topic) missingFields.push('topik');
          if (!updatedBookingData.pic) missingFields.push('PIC');
          if (!updatedBookingData.participants) missingFields.push('jumlah peserta');
          if (!updatedBookingData.date) missingFields.push('tanggal');
          if (!updatedBookingData.time) missingFields.push('waktu');
          if (!updatedBookingData.meetingType) missingFields.push('tipe meeting');
          if (!updatedBookingData.foodOrder) missingFields.push('pesanan makanan');
          
          responseText = `❌ **Data yang masih kurang:** ${missingFields.join(', ')}\n\n` +
            `**📋 FORM PEMESANAN RUANGAN**\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
            `🏢 **Ruangan:** ${updatedBookingData.roomName || '[Belum diisi]'}\n` +
            `📅 **Tanggal:** ${updatedBookingData.date || '[Belum diisi]'}\n` +
            `⏰ **Waktu:** ${updatedBookingData.time ? (updatedBookingData.endTime ? `${updatedBookingData.time} - ${updatedBookingData.endTime}` : updatedBookingData.time) : '[Belum diisi]'}\n` +
            `📝 **Topik:** ${updatedBookingData.topic || '[Belum diisi]'}\n` +
            `👥 **Peserta:** ${updatedBookingData.participants || '[Belum diisi]'} orang\n` +
            `👤 **PIC:** ${updatedBookingData.pic || '[Belum diisi]'}\n` +
            `🤝 **Tipe Meeting:** ${updatedBookingData.meetingType || '[Belum diisi]'}\n` +
            `🍽️ **Pesanan Makanan:** ${updatedBookingData.foodOrder || '[Belum diisi]'}\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
            `Silakan lengkapi field yang masih kosong dengan format:\n` +
            `\`\`\`\n` +
            `Ruangan: [Nama Ruangan]\n` +
            `Tanggal: [Tanggal]\n` +
            `Waktu: [Jam Mulai] - [Jam Selesai]\n` +
            `Topik: [Topik Meeting]\n` +
            `Peserta: [Jumlah] orang\n` +
            `PIC: [Nama PIC]\n` +
            `Tipe Meeting: [INTERNAL/EXTERNAL]\n` +
            `Pesanan Makanan: [TIDAK/RINGAN/BERAT]\n` +
            `\`\`\``;
          
          quickActions = [
            { label: 'Batal', actionValue: 'batal' }
          ];
        }
      } else {
        // Input tidak sesuai format, berikan instruksi lagi
        responseText = `❌ **Format tidak sesuai!**\n\n` +
          `**📋 FORM PEMESANAN RUANGAN**\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `🏢 **Ruangan:** [Belum diisi]\n` +
          `📅 **Tanggal:** [Belum diisi]\n` +
          `⏰ **Waktu:** [Belum diisi]\n` +
          `📝 **Topik:** [Belum diisi]\n` +
          `👥 **Peserta:** [Belum diisi] orang\n` +
          `👤 **PIC:** [Belum diisi]\n` +
          `🤝 **Tipe Meeting:** [Belum diisi]\n` +
          `🍽️ **Pesanan Makanan:** [Belum diisi]\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
          `**💡 Format yang benar:**\n` +
          `\`\`\`\n` +
          `Ruangan: Komodo Meeting Room\n` +
          `Tanggal: 20 Januari 2025\n` +
          `Waktu: 10:00 - 11:30\n` +
          `Topik: Rapat Tim Marketing Q1\n` +
          `Peserta: 6 orang\n` +
          `PIC: Ahmad Rizki\n` +
          `Tipe Meeting: INTERNAL\n` +
          `Pesanan Makanan: RINGAN\n` +
          `\`\`\`\n\n` +
          `**Atau format lain:**\n` +
          `\`\`\`\n` +
          `Ruangan: Komodo Meeting Room\n` +
          `Tanggal: 20 Januari 2025\n` +
          `Dari: 10:00 Sampai: 11:30\n` +
          `Topik: Rapat Tim Marketing Q1\n` +
          `Peserta: 6 orang\n` +
          `PIC: Ahmad Rizki\n` +
          `Tipe Meeting: INTERNAL\n` +
          `Pesanan Makanan: RINGAN\n` +
          `\`\`\`\n\n` +
          `Silakan ketik ulang dengan format yang benar!`;
        
        quickActions = [
          { label: 'Batal', actionValue: 'batal' }
        ];
      }
      break;

    default:
      responseText = "Maaf, terjadi kesalahan sistem. Mari mulai ulang pemesanan.";
      newState = BookingState.IDLE;
      updatedBookingData = {};
      quickActions = undefined;
      break;
  }

  return { responseText, newState, updatedBookingData, finalBooking, quickActions };
};
