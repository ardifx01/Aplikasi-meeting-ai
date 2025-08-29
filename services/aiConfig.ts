// AI Configuration for Spacio Assistant
export const AI_CONFIG = {
  // Personality settings
  personality: {
    name: "Spacio AI Assistant",
    tone: "friendly",
    language: "id-ID",
    emojis: true,
    formal: false
  },

  // Response templates
  responses: {
    greeting: [
      "Halo! 👋 Saya adalah asisten AI Spacio yang siap membantu Anda memesan ruang rapat dengan mudah! 🎯",
      "Selamat datang! 😊 Saya adalah AI Assistant Spacio yang akan membantu Anda booking ruangan.",
      "Hai! 👋 Ada yang bisa saya bantu terkait pemesanan ruang rapat?"
    ],
    
    roomSelection: [
      "Baik, mari kita mulai pemesanan ruangan! 🎯\n\nSilakan pilih ruangan yang Anda inginkan dari daftar di bawah ini:",
      "Bagus! Sekarang pilih ruangan yang sesuai dengan kebutuhan Anda:",
      "Mari pilih ruangan untuk meeting Anda:"
    ],
    
    confirmation: [
      "Bagus! Detail yang Anda pilih:",
      "Baik, saya catat:",
      "Sempurna! Berikut detailnya:"
    ],
    
    error: [
      "Maaf, saya tidak mengerti. Bisa dijelaskan lebih detail?",
      "Mohon maaf, mohon berikan informasi yang lebih jelas.",
      "Saya tidak yakin dengan maksud Anda. Bisa diulang?"
    ],
    
    success: [
      "🎉 Reservasi berhasil!",
      "✅ Booking ruangan berhasil!",
      "🎊 Selamat! Ruangan sudah dipesan untuk Anda!"
    ]
  },

  // Quick action patterns
  quickActions: {
    roomTypes: [
      { label: "Ruang Besar (10+ orang)", actionValue: "Saya butuh ruangan untuk 10 orang atau lebih" },
      { label: "Ruang Kecil (2-5 orang)", actionValue: "Saya butuh ruangan untuk 2-5 orang" },
      { label: "Auditorium", actionValue: "Saya butuh auditorium" },
      { label: "Meeting Room", actionValue: "Saya butuh meeting room" }
    ],
    
    meetingTypes: [
      { label: "Internal", actionValue: "internal" },
      { label: "Eksternal", actionValue: "eksternal" },
      { label: "Client Meeting", actionValue: "client meeting" },
      { label: "Team Meeting", actionValue: "team meeting" }
    ],
    
    foodOptions: [
      { label: "Tidak pesan makanan", actionValue: "tidak" },
      { label: "Makanan Ringan", actionValue: "ringan" },
      { label: "Makanan Berat", actionValue: "berat" },
      { label: "Snack & Minuman", actionValue: "snack" }
    ]
  },

  // Natural language patterns
  patterns: {
    // Room selection patterns
    roomSelection: [
      /(?:saya|aku|mau|ingin|butuh|perlu)\s+(?:ruangan|room|meeting)\s+(?:untuk|dengan|dengan\s+kapasitas)\s+(\d+)\s+orang/,
      /(?:ruangan|room)\s+(?:besar|kecil|medium)/,
      /(?:auditorium|meeting\s+room|conference\s+room)/,
      /(?:samudrantha|cedaya|celebes|kalamanthana|nusanipa|balidwipa|swarnadwipa|jawadwipa)/
    ],
    
    // Date patterns
    datePatterns: [
      /(?:hari\s+ini|sekarang|today)/,
      /(?:besok|tomorrow)/,
      /(?:lusa|day\s+after\s+tomorrow)/,
      /(?:minggu\s+depan|next\s+week)/,
      /(?:senin|selasa|rabu|kamis|jumat|sabtu|minggu)/,
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/
    ],
    
    // Time patterns
    timePatterns: [
      /(\d{1,2}):(\d{2})/,
      /(?:pagi|morning)/,
      /(?:siang|noon|lunch)/,
      /(?:sore|afternoon)/,
      /(?:malam|evening)/,
      /(\d{1,2})\s*jam/
    ],
    
    // Participant patterns
    participantPatterns: [
      /(\d+)\s*orang/,
      /(\d+)\s*people/,
      /(?:beberapa|few)/,
      /(?:sedikit|small)/,
      /(?:banyak|many)/,
      /(?:tim|team)/
    ]
  },

  // Fallback responses
  fallbacks: {
    unknownInput: [
      "Maaf, saya tidak mengerti maksud Anda. Bisa dijelaskan lebih detail?",
      "Mohon maaf, mohon berikan informasi yang lebih jelas.",
      "Saya tidak yakin dengan maksud Anda. Bisa diulang?"
    ],
    
    invalidInput: [
      "Mohon masukkan input yang valid.",
      "Input yang Anda masukkan tidak sesuai. Coba lagi.",
      "Mohon periksa kembali input Anda."
    ]
  },

  // Context management
  context: {
    maxHistory: 10,
    timeout: 300000, // 5 minutes
    clearOnNewSession: true
  }
};

// Helper functions for AI responses
export const getRandomResponse = (responses: string[]): string => {
  return responses[Math.floor(Math.random() * responses.length)];
};

export const formatResponse = (template: string, data: Record<string, any>): string => {
  let response = template;
  Object.keys(data).forEach(key => {
    response = response.replace(new RegExp(`\\{${key}\\}`, 'g'), data[key]);
  });
  return response;
};

export const addEmojis = (text: string): string => {
  const emojiMap: Record<string, string> = {
    'ruangan': '🏢',
    'meeting': '🤝',
    'tanggal': '📅',
    'waktu': '⏰',
    'peserta': '👥',
    'makanan': '🍽️',
    'berhasil': '✅',
    'error': '❌',
    'bantuan': '💡',
    'konfirmasi': '✅'
  };

  Object.keys(emojiMap).forEach(key => {
    if (text.toLowerCase().includes(key)) {
      text = text.replace(new RegExp(key, 'gi'), `${emojiMap[key]} ${key}`);
    }
  });

  return text;
};
