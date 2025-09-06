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

  return `Sempurna! Mari saya konfirmasi detail pemesanan Anda:\n\n`
    + `🏢 **Ruangan:** ${displayValue(data.roomName)}\n`
    + `📋 **Topik:** ${displayValue(data.topic)}\n`
    + `👤 **PIC:** ${displayValue(data.pic)}\n`
    + `👥 **Peserta:** ${displayValue(data.participants)} orang\n`
    + `📅 **Tanggal:** ${displayValue(data.date)}\n`
    + `⏰ **Waktu:** ${displayValue(data.time, '09:00')}\n`
    + `🤝 **Jenis:** ${formatMeetingType(displayValue(data.meetingType, 'Internal'))}\n`
    + `🍽️ **Makanan:** ${formatFoodOrder(displayValue(data.foodOrder))}\n\n`
    + `Apakah semua informasi sudah benar?`;
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
      
      // Check if user is directly selecting a room
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
      } else if (lowerCaseMessage.includes('pesan ruangan') || lowerCaseMessage === 'start_booking' || lowerCaseMessage.includes('booking')) {
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
        responseText = "Saya dapat membantu Anda memesan ruangan dengan mudah! Berikut adalah fitur yang tersedia:\n\n🏢 **Pemesanan Ruangan** - Pilih ruangan sesuai kebutuhan\n👥 **Kapasitas** - Sesuaikan dengan jumlah peserta\n📅 **Jadwal** - Pilih tanggal dan waktu yang tepat\n🍽️ **Catering** - Pilih jenis makanan jika diperlukan\n\nSilakan ketik pesan Anda.";
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
        responseText = "Maaf, saya tidak mengerti maksud Anda. Mari kita mulai pemesanan ruangan! Silakan pilih ruangan yang Anda inginkan:";
        newState = BookingState.ASKING_ROOM;
        quickActions = MEETING_ROOMS.map(room => ({
          label: `${room.name} (${room.capacity} orang)`,
          actionValue: room.name
        }));
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

    default:
      responseText = "Maaf, terjadi kesalahan sistem. Mari mulai ulang pemesanan.";
      newState = BookingState.IDLE;
      updatedBookingData = {};
      quickActions = undefined;
      break;
  }

  return { responseText, newState, updatedBookingData, finalBooking, quickActions };
};
