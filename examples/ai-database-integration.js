/**
 * Contoh Implementasi Integrasi AI dengan Database
 * 
 * File ini menunjukkan cara menggunakan aiDatabaseService.ts untuk
 * mengintegrasikan AI assistant dengan database.
 */

// Import fungsi-fungsi yang diperlukan
import { processBookingConversation } from '../services/geminiService';
import { 
  saveConversation, 
  getConversationHistory, 
  saveBookingData, 
  getBookingData 
} from '../services/aiDatabaseService';

// Contoh data pengguna (dalam aplikasi nyata, ini akan didapatkan dari sistem autentikasi)
const userId = 1;
const sessionId = 'session-' + Date.now();

/**
 * Contoh fungsi untuk menangani pesan dari pengguna
 * @param {string} userMessage - Pesan dari pengguna
 * @param {string} currentState - Status pemesanan saat ini
 * @param {object} bookingData - Data pemesanan saat ini
 * @returns {Promise<object>} - Hasil pemrosesan pesan
 */
async function handleUserMessage(userMessage, currentState, bookingData) {
  try {
    // Proses pesan dengan AI assistant
    const result = await processBookingConversation(
      userMessage,
      currentState,
      bookingData,
      userId,
      sessionId
    );

    // Data sudah otomatis disimpan ke database oleh processBookingConversation
    // jika userId dan sessionId disediakan

    return result;
  } catch (error) {
    console.error('Error processing message:', error);
    throw error;
  }
}

/**
 * Contoh fungsi untuk mendapatkan riwayat percakapan
 * @param {number} userId - ID pengguna
 * @param {string} sessionId - ID sesi
 * @returns {Promise<array>} - Riwayat percakapan
 */
async function getUserConversationHistory(userId, sessionId) {
  try {
    const history = await getConversationHistory(userId, sessionId);
    return history;
  } catch (error) {
    console.error('Error getting conversation history:', error);
    throw error;
  }
}

/**
 * Contoh fungsi untuk mendapatkan data pemesanan
 * @param {number} userId - ID pengguna
 * @param {string} sessionId - ID sesi
 * @returns {Promise<object>} - Data pemesanan
 */
async function getUserBookingData(userId, sessionId) {
  try {
    const booking = await getBookingData(userId, sessionId);
    return booking;
  } catch (error) {
    console.error('Error getting booking data:', error);
    throw error;
  }
}

/**
 * Contoh fungsi untuk menyimpan data pemesanan secara manual
 * (Biasanya tidak diperlukan karena processBookingConversation sudah melakukannya)
 * @param {number} userId - ID pengguna
 * @param {string} sessionId - ID sesi
 * @param {string} bookingState - Status pemesanan
 * @param {object} bookingData - Data pemesanan
 * @returns {Promise<boolean>} - Status keberhasilan
 */
async function saveUserBookingData(userId, sessionId, bookingState, bookingData) {
  try {
    const success = await saveBookingData(userId, sessionId, bookingState, bookingData);
    return success;
  } catch (error) {
    console.error('Error saving booking data:', error);
    throw error;
  }
}

/**
 * Contoh penggunaan dalam aplikasi
 */
async function exampleUsage() {
  // Status dan data pemesanan awal
  let currentState = 'INITIAL';
  let bookingData = {};

  // Simulasi percakapan dengan AI assistant
  console.log('=== Simulasi Percakapan dengan AI Assistant ===');

  // Pesan pertama dari pengguna
  const message1 = 'Saya ingin memesan ruang rapat';
  console.log(`User: ${message1}`);
  
  const result1 = await handleUserMessage(message1, currentState, bookingData);
  console.log(`AI: ${result1.response}`);
  
  // Update status dan data pemesanan
  currentState = result1.state;
  bookingData = result1.booking;

  // Pesan kedua dari pengguna
  const message2 = 'Untuk rapat tim marketing';
  console.log(`User: ${message2}`);
  
  const result2 = await handleUserMessage(message2, currentState, bookingData);
  console.log(`AI: ${result2.response}`);
  
  // Update status dan data pemesanan
  currentState = result2.state;
  bookingData = result2.booking;

  // Mendapatkan riwayat percakapan
  console.log('\n=== Riwayat Percakapan ===');
  const history = await getUserConversationHistory(userId, sessionId);
  history.forEach((item, index) => {
    console.log(`${index + 1}. User: ${item.message}`);
    console.log(`   AI: ${item.response}`);
    console.log(`   State: ${item.booking_state}`);
    console.log('---');
  });

  // Mendapatkan data pemesanan
  console.log('\n=== Data Pemesanan ===');
  const booking = await getUserBookingData(userId, sessionId);
  console.log(booking);
}

// Jalankan contoh penggunaan
// exampleUsage().catch(console.error);

// Export fungsi-fungsi untuk digunakan di tempat lain
export {
  handleUserMessage,
  getUserConversationHistory,
  getUserBookingData,
  saveUserBookingData
};