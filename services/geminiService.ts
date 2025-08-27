import { Booking, BookingState } from '../types';
import { MEETING_ROOMS } from '../constants';

const findSuitableRoom = (participants: number) => {
  return MEETING_ROOMS.find(room => room.capacity >= participants);
};

// Helper function to parse date input
const parseDateInput = (input: string): string => {
  const lowerInput = input.toLowerCase();
  const today = new Date();
  
  if (lowerInput.includes('hari ini') || lowerInput.includes('sekarang')) {
    return today.toLocaleDateString('id-ID', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  } else if (lowerInput.includes('besok')) {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return tomorrow.toLocaleDateString('id-ID', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  } else if (lowerInput.includes('lusa')) {
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(today.getDate() + 2);
    return dayAfterTomorrow.toLocaleDateString('id-ID', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  } else if (lowerInput.includes('minggu depan')) {
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    return nextWeek.toLocaleDateString('id-ID', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
  
  return input;
};

// Helper function to parse time input
const parseTimeInput = (input: string): string => {
  const lowerInput = input.toLowerCase();
  
  // Handle time ranges like "09:00 - 10:00"
  if (lowerInput.includes('-') || lowerInput.includes('sampai')) {
    const timeMatch = lowerInput.match(/(\d{1,2}):?(\d{2})?/);
    if (timeMatch) {
      return timeMatch[0];
    }
  }
  
  // Handle specific times
  const timeKeywords = ['09:00', '10:00', '13:00', '14:00', '15:00', '16:00'];
  for (const time of timeKeywords) {
    if (lowerInput.includes(time)) {
      return time;
    }
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
  await new Promise(resolve => setTimeout(resolve, 600)); // Simulate AI thinking
  const lowerCaseMessage = message.toLowerCase().trim();
  
  let responseText = "";
  let newState = state;
  let updatedBookingData = { ...data };
  let finalBooking: Booking | undefined = undefined;
  let quickActions: { label: string, actionValue: string }[] | undefined = undefined;

  // Global "start over" check for "batal" or "stop"
  if (lowerCaseMessage.includes('batal') || lowerCaseMessage.includes('stop')) {
    newState = BookingState.IDLE;
    responseText = "Baik, pemesanan dibatalkan. Ada lagi yang bisa saya bantu?";
    updatedBookingData = {};
    quickActions = [
      { label: "Pesan Ruangan Baru", actionValue: "start_booking" },
      { label: "Bantuan", actionValue: "Bantuan" }
    ];
  return { responseText, newState, updatedBookingData, finalBooking, quickActions };
  }
  
  switch (state) {
    case BookingState.IDLE:
      if (lowerCaseMessage.includes('pesan ruangan') || lowerCaseMessage === 'start_booking') {
        newState = BookingState.ASKING_ROOM;
        responseText = "Baik, mari kita mulai pemesanan ruangan. Silakan pilih ruangan yang Anda inginkan:";
        quickActions = MEETING_ROOMS.map(room => ({
          label: `${room.name} (${room.capacity} orang)`,
          actionValue: room.name
        }));
      } else if (lowerCaseMessage.includes("reservasi")) {
        responseText = "Fitur pengecekan reservasi sedang dalam pengembangan. Saat ini saya dapat membantu Anda memesan ruangan baru.";
        quickActions = [
          { label: "Pesan Ruangan Baru", actionValue: "start_booking" },
          { label: "Bantuan", actionValue: "Bantuan" }
        ];
      } else if (lowerCaseMessage.includes("bantuan")) {
        responseText = "Saya dapat membantu Anda memesan ruangan. Berikut adalah fitur yang tersedia:";
        quickActions = [
          { label: "Pesan Ruangan", actionValue: "start_booking" },
          { label: "Ruang Besar (10+ orang)", actionValue: "Saya butuh ruangan untuk 10 orang atau lebih" },
          { label: "Ruang Kecil (2-5 orang)", actionValue: "Saya butuh ruangan untuk 2-5 orang" },
          { label: "Meeting Internal", actionValue: "Saya mau booking ruangan untuk meeting internal" },
          { label: "Meeting Eksternal", actionValue: "Saya mau booking ruangan untuk meeting eksternal" }
        ];
      } else {
        // If we don't understand, guide user to start booking
        responseText = "Baik, mari kita mulai pemesanan ruangan. Silakan pilih ruangan yang Anda inginkan:";
        newState = BookingState.ASKING_ROOM;
        quickActions = MEETING_ROOMS.map(room => ({
          label: `${room.name} (${room.capacity} orang)`,
          actionValue: room.name
        }));
      }
      break;

    case BookingState.ASKING_ROOM:
      // Universal room matching logic that works for ALL room names
      const selectedRoom = MEETING_ROOMS.find(room => {
        const roomNameLower = room.name.toLowerCase();
        const messageLower = lowerCaseMessage;
        
        // Debug logging
        console.log(`Checking room: "${room.name}" against message: "${message}"`);
        console.log(`Room name lower: "${roomNameLower}", Message lower: "${messageLower}"`);
        
        // 1. Exact match (case insensitive)
        if (messageLower === roomNameLower) {
          console.log(`Exact match found: ${room.name}`);
          return true;
        }
        
        // 2. Contains match - message contains room name or room name contains message
        if (messageLower.includes(roomNameLower) || roomNameLower.includes(messageLower)) {
          console.log(`Contains match found: ${room.name}`);
          return true;
        }
        
        // 3. First word match - check if message contains first word of room name
        const roomWords = roomNameLower.split(' ');
        const firstWord = roomWords[0];
        if (firstWord.length > 2 && messageLower.includes(firstWord)) {
          console.log(`First word match found: ${room.name} (first word: ${firstWord})`);
          return true;
        }
        
        // 4. Any word match - check if message contains any word from room name
        if (roomWords.some(word => word.length > 2 && messageLower.includes(word))) {
          console.log(`Any word match found: ${room.name}`);
          return true;
        }
        
        // 5. Partial word match - check if any word from room name is contained in message
        if (roomWords.some(word => word.length > 2 && messageLower.includes(word))) {
          console.log(`Partial word match found: ${room.name}`);
          return true;
        }
        
        // 6. Specific room name matches (more flexible)
        if (messageLower.includes('samudrantha') && roomNameLower.includes('samudrantha')) {
          console.log(`Samudrantha match found: ${room.name}`);
          return true;
        }
        if (messageLower.includes('cedaya') && roomNameLower.includes('cedaya')) {
          console.log(`Cedaya match found: ${room.name}`);
          return true;
        }
        if (messageLower.includes('celebes') && roomNameLower.includes('celebes')) {
          console.log(`Celebes match found: ${room.name}`);
          return true;
        }
        if (messageLower.includes('kalamanthana') && roomNameLower.includes('kalamanthana')) {
          console.log(`Kalamanthana match found: ${room.name}`);
          return true;
        }
        if (messageLower.includes('nusanipa') && roomNameLower.includes('nusanipa')) {
          console.log(`Nusanipa match found: ${room.name}`);
          return true;
        }
        if (messageLower.includes('balidwipa') && roomNameLower.includes('balidwipa')) {
          console.log(`Balidwipa match found: ${room.name}`);
          return true;
        }
        if (messageLower.includes('swarnadwipa') && roomNameLower.includes('swarnadwipa')) {
          console.log(`Swarnadwipa match found: ${room.name}`);
          return true;
        }
        if (messageLower.includes('jawadwipa') && roomNameLower.includes('jawadwipa')) {
          console.log(`Jawadwipa match found: ${room.name}`);
          return true;
        }
        
        // 7. Additional flexible matching for common variations
        if (messageLower.includes('meeting') && roomNameLower.includes('meeting')) {
          console.log(`Meeting keyword match found: ${room.name}`);
          return true;
        }
        if (messageLower.includes('room') && roomNameLower.includes('room')) {
          console.log(`Room keyword match found: ${room.name}`);
          return true;
        }
        if (messageLower.includes('auditorium') && roomNameLower.includes('auditorium')) {
          console.log(`Auditorium keyword match found: ${room.name}`);
          return true;
        }
        
        // 8. Number matching for auditoriums
        if (messageLower.includes('1') && roomNameLower.includes('1')) {
          console.log(`Number 1 match found: ${room.name}`);
          return true;
        }
        if (messageLower.includes('2') && roomNameLower.includes('2')) {
          console.log(`Number 2 match found: ${room.name}`);
          return true;
        }
        
        return false;
      });
      
      console.log(`Selected room result:`, selectedRoom);
      
      if (selectedRoom) {
        updatedBookingData.roomName = selectedRoom.name;
        newState = BookingState.ASKING_TOPIC;
        responseText = `Baik, ruangan yang dipilih: **${selectedRoom.name}** (kapasitas ${selectedRoom.capacity} orang). Sekarang apa topik atau nama rapatnya?`;
        quickActions = [
          { label: "Rapat Tim", actionValue: "Rapat Tim" },
          { label: "Presentasi", actionValue: "Presentasi" },
          { label: "Meeting Client", actionValue: "Meeting Client" },
          { label: "Brainstorming", actionValue: "Brainstorming" },
          { label: "Training", actionValue: "Training" },
          { label: "Lainnya", actionValue: "Lainnya" }
        ];
        console.log(`Room selected successfully: ${selectedRoom.name}, moving to ASKING_TOPIC state`);
      } else {
        responseText = "Silakan pilih ruangan dari daftar yang tersedia:";
        quickActions = MEETING_ROOMS.map(room => ({
          label: `${room.name} (${room.capacity} orang)`,
          actionValue: room.name
        }));
        console.log(`No room match found, staying in ASKING_ROOM state`);
      }
      break;

    case BookingState.ASKING_TOPIC:
      updatedBookingData.topic = message;
      newState = BookingState.ASKING_PIC;
      responseText = `Baik, topik rapatnya "${message}". Siapa PIC (Person in Charge) untuk rapat ini?`;
      quickActions = [
        { label: "Saya sendiri", actionValue: "Saya sendiri" },
        { label: "Manager", actionValue: "Manager" },
        { label: "Team Lead", actionValue: "Team Lead" }
      ];
      break;

    case BookingState.ASKING_PIC:
      updatedBookingData.pic = message;
      newState = BookingState.ASKING_PARTICIPANTS;
      responseText = `Baik, PIC-nya adalah "${message}". Berapa jumlah peserta yang akan hadir?`;
        quickActions = [
        { label: "2-5 orang", actionValue: "2-5" },
        { label: "6-10 orang", actionValue: "6-10" },
        { label: "10+ orang", actionValue: "10+" }
      ];
      break;

    case BookingState.ASKING_PARTICIPANTS:
      // Parse the participant input properly
      const participants = parseParticipantInput(message);
      if (participants === null || participants < 1) {
        responseText = "Mohon masukkan jumlah peserta yang valid (minimal 1 orang).";
        quickActions = [
          { label: "2 orang", actionValue: "2" },
          { label: "5 orang", actionValue: "5" },
          { label: "8 orang", actionValue: "8" },
          { label: "10 orang", actionValue: "10" },
          { label: "15 orang", actionValue: "15" }
        ];
      } else {
        updatedBookingData.participants = participants;
        
        // Check if the selected room can accommodate the participants
        if (updatedBookingData.roomName) {
          const selectedRoom = MEETING_ROOMS.find(room => room.name === updatedBookingData.roomName);
          if (selectedRoom && participants > selectedRoom.capacity) {
            responseText = `Maaf, ruangan **${selectedRoom.name}** hanya bisa menampung maksimal ${selectedRoom.capacity} orang. Apakah Anda ingin memilih ruangan lain atau mengurangi jumlah peserta?`;
            quickActions = [
              { label: "Pilih Ruangan Lain", actionValue: "pilih ruangan lain" },
              { label: "Kurangi Peserta", actionValue: "kurangi peserta" },
              { label: "Batal", actionValue: "batal" }
            ];
          } else {
            newState = BookingState.ASKING_DATE;
            responseText = `Baik, jumlah peserta ${participants} orang. Kapan rapat akan diadakan?`;
          quickActions = [
              { label: "Hari Ini", actionValue: "hari ini" },
              { label: "Besok", actionValue: "besok" },
              { label: "Lusa", actionValue: "lusa" },
              { label: "Minggu Depan", actionValue: "minggu depan" }
            ];
          }
        } else {
          newState = BookingState.ASKING_DATE;
          responseText = `Baik, jumlah peserta ${participants} orang. Kapan rapat akan diadakan?`;
          quickActions = [
            { label: "Hari Ini", actionValue: "hari ini" },
            { label: "Besok", actionValue: "besok" },
            { label: "Lusa", actionValue: "lusa" },
            { label: "Minggu Depan", actionValue: "minggu depan" }
          ];
        }
      }
      break;

    case BookingState.ASKING_DATE:
      // Parse the date input properly
      const parsedDate = parseDateInput(message);
      updatedBookingData.date = parsedDate;
      newState = BookingState.ASKING_TIME;
      responseText = `Baik, tanggal rapatnya "${parsedDate}". Jam berapa rapat akan dimulai?`;
      quickActions = [
        { label: "09:00", actionValue: "09:00" },
        { label: "10:00", actionValue: "10:00" },
        { label: "13:00", actionValue: "13:00" },
        { label: "14:00", actionValue: "14:00" },
        { label: "15:00", actionValue: "15:00" }
      ];
      break;

    case BookingState.ASKING_TIME:
      // Parse the time input properly
      const parsedTime = parseTimeInput(message);
      updatedBookingData.time = parsedTime;
      newState = BookingState.ASKING_MEETING_TYPE;
      responseText = `Baik, jam rapatnya "${parsedTime}". Apa jenis rapatnya?`;
      quickActions = [
        { label: "Internal", actionValue: "internal" },
        { label: "Eksternal", actionValue: "eksternal" }
      ];
      break;

    case BookingState.ASKING_MEETING_TYPE:
      if (lowerCaseMessage.includes('internal') || lowerCaseMessage.includes('eksternal')) {
        updatedBookingData.meetingType = lowerCaseMessage.includes('internal') ? 'internal' : 'external';
        newState = BookingState.ASKING_FOOD_TYPE;
        responseText = `Baik, jenis rapat ${updatedBookingData.meetingType}. Apakah perlu memesan makanan?`;
        quickActions = [
          { label: "Tidak pesan makanan", actionValue: "tidak" },
          { label: "Makanan Ringan", actionValue: "ringan" },
          { label: "Makanan Berat", actionValue: "berat" }
        ];
      } else {
        responseText = "Mohon pilih jenis rapat yang valid.";
        quickActions = [
          { label: "Internal", actionValue: "internal" },
          { label: "Eksternal", actionValue: "eksternal" }
        ];
      }
      break;

    case BookingState.ASKING_FOOD_TYPE:
      if (lowerCaseMessage.includes('tidak') || lowerCaseMessage.includes('ringan') || lowerCaseMessage.includes('berat')) {
        if (lowerCaseMessage.includes('tidak')) {
          updatedBookingData.foodOrder = 'tidak';
        } else if (lowerCaseMessage.includes('ringan')) {
          updatedBookingData.foodOrder = 'ringan';
        } else {
          updatedBookingData.foodOrder = 'berat';
        }
        
        newState = BookingState.CONFIRMING;
        responseText = `Baik, jenis makanan: ${updatedBookingData.foodOrder === 'tidak' ? 'Tidak pesan makanan' : updatedBookingData.foodOrder === 'ringan' ? 'Makanan Ringan' : 'Makanan Berat'}. \n\nBerikut rincian lengkap pemesanan:\n- **Ruangan**: ${updatedBookingData.roomName}\n- **Topik**: ${updatedBookingData.topic}\n- **PIC**: ${updatedBookingData.pic}\n- **Tanggal**: ${updatedBookingData.date}\n- **Waktu**: ${updatedBookingData.time}\n- **Peserta**: ${updatedBookingData.participants} orang\n- **Jenis Rapat**: ${updatedBookingData.meetingType}\n- **Jenis Makanan**: ${updatedBookingData.foodOrder === 'tidak' ? 'Tidak pesan makanan' : updatedBookingData.foodOrder === 'ringan' ? 'Makanan Ringan' : 'Makanan Berat'}\n\nApakah detailnya sudah benar dan ingin saya pesan sekarang?`;
        quickActions = [
          { label: "Ya, Konfirmasi", actionValue: 'ya' }, 
          { label: "Ubah Detail", actionValue: "ubah detail" },
          { label: "Batal", actionValue: "batal" }
        ];
      } else {
        responseText = "Mohon pilih jenis makanan yang valid.";
        quickActions = [
          { label: "Tidak pesan makanan", actionValue: "tidak" },
          { label: "Makanan Ringan", actionValue: "ringan" },
          { label: "Makanan Berat", actionValue: "berat" }
        ];
      }
      break;

    case BookingState.CONFIRMING:
      if (['ya', 'iya', 'konfirmasi', 'betul', 'benar', 'ok'].some(word => lowerCaseMessage.includes(word))) {
        newState = BookingState.BOOKED;
        responseText = `Reservasi berhasil! Ruangan **${updatedBookingData.roomName}** sudah dipesan untuk Anda. Sampai jumpa!`;
        finalBooking = {
          id: Date.now(),
          roomName: updatedBookingData.roomName!,
          topic: updatedBookingData.topic!,
          date: updatedBookingData.date!,
          time: updatedBookingData.time!,
          participants: updatedBookingData.participants!,
          pic: updatedBookingData.pic!,
          meetingType: updatedBookingData.meetingType!,
          foodOrder: updatedBookingData.foodOrder!,
        };
        updatedBookingData = {};
        quickActions = [
          { label: "Pesan Ruangan Baru", actionValue: "start_booking" },
          { label: "Lihat Reservasi", actionValue: "Cek reservasi saya" },
          { label: "Bantuan", actionValue: "Bantuan" }
        ];
      } else if (lowerCaseMessage.includes('ubah detail') || lowerCaseMessage.includes('ubah')) {
        responseText = "Baik, bagian mana yang ingin diubah?";
        quickActions = [
          { label: "Ubah Ruangan", actionValue: "ubah ruangan" },
          { label: "Ubah Topik", actionValue: "ubah topik" },
          { label: "Ubah PIC", actionValue: "ubah pic" },
          { label: "Ubah Peserta", actionValue: "ubah peserta" },
          { label: "Ubah Tanggal", actionValue: "ubah tanggal" },
          { label: "Ubah Waktu", actionValue: "ubah waktu" },
          { label: "Ubah Jenis Rapat", actionValue: "ubah jenis rapat" },
          { label: "Ubah Makanan", actionValue: "ubah makanan" }
        ];
      } else {
        responseText = "Mohon konfirmasi apakah Anda ingin memesan ruangan ini atau membatalkannya?";
        quickActions = [
          { label: "Ya, Konfirmasi", actionValue: "ya" },
          { label: "Tidak, Batal", actionValue: "batal" },
          { label: "Ubah Detail", actionValue: "ubah detail" }
        ];
      }
      break;
      
    case BookingState.BOOKED:
        newState = BookingState.IDLE;
        responseText = "Halo, ada lagi yang bisa saya bantu?";
        quickActions = [
          { label: "Pesan Ruangan Baru", actionValue: "start_booking" },
          { label: "Lihat Reservasi", actionValue: "Cek reservasi saya" },
          { label: "Bantuan", actionValue: "Bantuan" }
        ];
        break;
  }

  return { responseText, newState, updatedBookingData, finalBooking, quickActions };
};
