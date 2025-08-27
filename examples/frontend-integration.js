/**
 * Contoh Integrasi Frontend dengan Backend API
 * 
 * File ini menunjukkan cara menggunakan API yang telah dibuat untuk
 * mengintegrasikan frontend dengan backend database.
 */

// Contoh data pengguna (dalam aplikasi nyata, ini akan didapatkan dari sistem autentikasi)
const userId = 1;
const sessionId = 'session-' + Date.now();

/**
 * Fungsi untuk menyimpan percakapan ke database
 * @param {number} userId - ID pengguna
 * @param {string} sessionId - ID sesi
 * @param {string} message - Pesan dari pengguna
 * @param {string} response - Respons dari AI
 * @param {string} bookingState - Status pemesanan
 * @param {object} bookingData - Data pemesanan
 * @returns {Promise<object>} - Hasil dari API
 */
async function saveConversationToAPI(userId, sessionId, message, response, bookingState, bookingData) {
  try {
    const response = await fetch('/api/ai/conversation.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        session_id: sessionId,
        message: message,
        response: response,
        booking_state: bookingState,
        booking_data: bookingData
      }),
    });

    return await response.json();
  } catch (error) {
    console.error('Error saving conversation:', error);
    throw error;
  }
}

/**
 * Fungsi untuk mendapatkan riwayat percakapan dari database
 * @param {number} userId - ID pengguna
 * @param {string} sessionId - ID sesi
 * @returns {Promise<array>} - Riwayat percakapan
 */
async function getConversationHistoryFromAPI(userId, sessionId) {
  try {
    const response = await fetch(`/api/ai/conversation.php?user_id=${userId}&session_id=${sessionId}`);
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error getting conversation history:', error);
    throw error;
  }
}

/**
 * Fungsi untuk menyimpan data pemesanan ke database
 * @param {number} userId - ID pengguna
 * @param {string} sessionId - ID sesi
 * @param {object} bookingData - Data pemesanan
 * @returns {Promise<object>} - Hasil dari API
 */
async function saveBookingDataToAPI(userId, sessionId, bookingData) {
  try {
    const response = await fetch('/api/ai/booking.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        session_id: sessionId,
        ...bookingData
      }),
    });

    return await response.json();
  } catch (error) {
    console.error('Error saving booking data:', error);
    throw error;
  }
}

/**
 * Fungsi untuk mendapatkan data pemesanan dari database
 * @param {number} userId - ID pengguna
 * @param {string} sessionId - ID sesi (opsional)
 * @returns {Promise<array>} - Data pemesanan
 */
async function getBookingDataFromAPI(userId, sessionId = null) {
  try {
    let url = `/api/ai/booking.php?user_id=${userId}`;
    if (sessionId) {
      url += `&session_id=${sessionId}`;
    }
    
    const response = await fetch(url);
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error getting booking data:', error);
    throw error;
  }
}

/**
 * Contoh penggunaan dalam aplikasi frontend
 */
async function exampleFrontendUsage() {
  // Simulasi percakapan dengan AI assistant
  console.log('=== Simulasi Percakapan dengan AI Assistant ===');

  // Pesan pertama dari pengguna
  const userMessage = 'Saya ingin memesan ruang rapat';
  console.log(`User: ${userMessage}`);
  
  // Simulasi respons dari AI (dalam aplikasi nyata, ini akan didapatkan dari geminiService)
  const aiResponse = 'Baik, untuk topik apa rapat Anda?';
  console.log(`AI: ${aiResponse}`);
  
  // Simpan percakapan ke database
  await saveConversationToAPI(
    userId,
    sessionId,
    userMessage,
    aiResponse,
    'ASKING_TOPIC',
    { topic: '' }
  );

  // Pesan kedua dari pengguna
  const userMessage2 = 'Untuk rapat tim marketing';
  console.log(`User: ${userMessage2}`);
  
  // Simulasi respons dari AI
  const aiResponse2 = 'Kapan rapat akan dilaksanakan?';
  console.log(`AI: ${aiResponse2}`);
  
  // Simpan percakapan ke database
  await saveConversationToAPI(
    userId,
    sessionId,
    userMessage2,
    aiResponse2,
    'ASKING_DATE',
    { topic: 'Rapat Tim Marketing' }
  );

  // Simpan data pemesanan ke database
  await saveBookingDataToAPI(
    userId,
    sessionId,
    {
      topic: 'Rapat Tim Marketing',
      booking_state: 'ASKING_DATE'
    }
  );

  // Mendapatkan riwayat percakapan
  console.log('\n=== Riwayat Percakapan ===');
  const history = await getConversationHistoryFromAPI(userId, sessionId);
  history.forEach((item, index) => {
    console.log(`${index + 1}. User: ${item.message}`);
    console.log(`   AI: ${item.response}`);
    console.log(`   State: ${item.booking_state}`);
    console.log('---');
  });

  // Mendapatkan data pemesanan
  console.log('\n=== Data Pemesanan ===');
  const booking = await getBookingDataFromAPI(userId, sessionId);
  console.log(booking);
}

// Export fungsi-fungsi untuk digunakan di tempat lain
export {
  saveConversationToAPI,
  getConversationHistoryFromAPI,
  saveBookingDataToAPI,
  getBookingDataFromAPI
};