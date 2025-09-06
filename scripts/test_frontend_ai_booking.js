/**
 * Test script untuk memverifikasi frontend AI booking
 */

console.log('=== TEST FRONTEND AI BOOKING ===');

// Simulasi data yang akan dikirim dari frontend
const testData = {
    user_id: 1,
    session_id: 'ai_frontend_js_test_' + Date.now(),
    room_id: 1,
    topic: 'Test Rapat dari Frontend JS',
    meeting_date: new Date().toISOString().slice(0, 10),
    meeting_time: '16:00:00',
    duration: 60,
    participants: 4,
    meeting_type: 'internal',
    food_order: 'tidak',
    pic: 'Test User JS'
};

console.log('📊 Data test yang akan dikirim:', testData);

// Test API endpoint
const API_BASE_URL = 'http://localhost:8080/backend/api';

async function testAIBooking() {
    try {
        console.log('🌐 Mengirim request ke AI booking endpoint...');
        
        const response = await fetch(`${API_BASE_URL}/bookings.php/ai-booking`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });

        console.log('📥 Response status:', response.status);
        console.log('📥 Response headers:', response.headers);

        const responseData = await response.json();
        console.log('📥 Response data:', responseData);

        if (response.ok && responseData.status === 'success') {
            console.log('✅ AI Booking berhasil dibuat!');
            console.log('📋 Booking ID:', responseData.data?.id);
            console.log('📋 Success Booking ID:', responseData.success_booking_id);
        } else {
            console.log('❌ AI Booking gagal:', responseData.message);
        }

    } catch (error) {
        console.error('❌ Error saat mengirim request:', error);
        console.error('❌ Error details:', error.message);
    }
}

// Test saveBookingData function (simulasi dari aiDatabaseService)
async function testSaveBookingData() {
    try {
        console.log('\n🔄 Testing saveBookingData function...');
        
        // Simulasi data yang dikirim dari frontend
        const bookingData = {
            roomName: 'Samudrantha Meeting Room',
            topic: 'Test Rapat dari Frontend',
            date: new Date().toISOString().slice(0, 10),
            time: '17:00',
            participants: 5,
            meetingType: 'internal',
            foodOrder: 'tidak',
            pic: 'Test User'
        };

        console.log('📊 Booking data:', bookingData);

        // Simulasi saveBookingData call
        const userId = 1;
        const sessionId = 'ai_test_' + Date.now();
        const bookingState = 'BOOKED';

        console.log('📊 Parameters:', { userId, sessionId, bookingState });

        // Call backend directly
        const backendData = {
            user_id: userId,
            session_id: sessionId,
            room_id: 1, // Will be set based on room name
            topic: bookingData.topic,
            meeting_date: bookingData.date,
            meeting_time: bookingData.time + ':00',
            duration: 60,
            participants: bookingData.participants,
            meeting_type: bookingData.meetingType,
            food_order: bookingData.foodOrder,
            pic: bookingData.pic
        };

        console.log('📊 Backend data:', backendData);

        const response = await fetch(`${API_BASE_URL}/bookings.php/ai-booking`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(backendData)
        });

        const responseData = await response.json();
        console.log('📥 Response:', responseData);

        if (response.ok && responseData.status === 'success') {
            console.log('✅ saveBookingData berhasil!');
        } else {
            console.log('❌ saveBookingData gagal:', responseData.message);
        }

    } catch (error) {
        console.error('❌ Error dalam saveBookingData:', error);
    }
}

// Run tests
testAIBooking().then(() => {
    testSaveBookingData();
});

console.log('=== SELESAI ===');



