// Script untuk debugging pemesanan form tidak muncul di dashboard
// Copy dan paste ke browser console

console.log('🔍 DEBUGGING PEMESANAN FORM TIDAK MUNCUL DI DASHBOARD');
console.log('='.repeat(60));

// 1. Periksa user_data di localStorage
console.log('\n1️⃣ PERIKSA USER_DATA:');
const userDataStr = localStorage.getItem('user_data');
console.log('user_data string:', userDataStr);

let userId = null;
if (userDataStr) {
    try {
        const userData = JSON.parse(userDataStr);
        console.log('user_data parsed:', userData);
        userId = userData.id;
        console.log('user_id:', userId);
    } catch (e) {
        console.log('❌ Error parsing user_data:', e);
    }
} else {
    console.log('❌ No user_data found in localStorage');
}

// 2. Test API call untuk form bookings
console.log('\n2️⃣ TEST API CALL - FORM BOOKINGS:');
const apiUrl = `http://localhost:8080/backend/api/bookings.php/user?user_id=${userId || 1}`;
console.log('API URL:', apiUrl);

fetch(apiUrl)
    .then(response => {
        console.log('Response status:', response.status);
        return response.text();
    })
    .then(text => {
        console.log('Raw response:', text);
        try {
            const data = JSON.parse(text);
            console.log('Parsed response:', data);
            
            if (data.status === 'success' && data.data) {
                console.log('✅ SUCCESS! Found', data.data.length, 'form bookings');
                data.data.forEach((booking, index) => {
                    console.log(`Form Booking ${index + 1}:`, {
                        id: booking.id,
                        room_name: booking.room_name,
                        meeting_date: booking.meeting_date,
                        meeting_time: booking.meeting_time,
                        topic: booking.topic
                    });
                });
            } else {
                console.log('❌ No data or error:', data);
            }
        } catch (e) {
            console.log('❌ Error parsing JSON:', e);
        }
    })
    .catch(error => {
        console.log('❌ Fetch error:', error);
    });

// 3. Test AI bookings API
console.log('\n3️⃣ TEST API CALL - AI BOOKINGS:');
const aiApiUrl = `http://localhost:8080/backend/api/bookings.php/ai-success?user_id=${userId || 1}`;
console.log('AI API URL:', aiApiUrl);

fetch(aiApiUrl)
    .then(response => response.text())
    .then(text => {
        console.log('AI Raw response:', text);
        try {
            const data = JSON.parse(text);
            console.log('AI Parsed response:', data);
            
            if (data.status === 'success' && data.data) {
                console.log('✅ AI SUCCESS! Found', data.data.length, 'AI bookings');
            } else {
                console.log('❌ AI No data or error:', data);
            }
        } catch (e) {
            console.log('❌ AI Error parsing JSON:', e);
        }
    })
    .catch(error => {
        console.log('❌ AI Fetch error:', error);
    });

// 4. Test date filter logic
console.log('\n4️⃣ TEST DATE FILTER LOGIC:');
const testBooking = {
    date: '2025-09-08',
    time: '13:00:00'
};

const bookingDate = new Date(`${testBooking.date}T${testBooking.time}`);
const now = new Date();

console.log('Test booking date:', bookingDate.toLocaleString());
console.log('Current date:', now.toLocaleString());
console.log('Is booking in future:', bookingDate > now);

if (bookingDate > now) {
    console.log('✅ Booking should appear in dashboard');
} else {
    console.log('❌ Booking will NOT appear in dashboard (date is in past)');
}

console.log('\n🏁 DEBUGGING COMPLETE');
console.log('='.repeat(60));
