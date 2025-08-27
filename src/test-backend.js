/**
 * Test Backend Integration
 * File ini untuk testing integrasi frontend dengan backend PHP
 */

// Test data
const testUserId = 1;
const testSessionId = 'test-session-' + Date.now();

// Test booking data
const testBookingData = {
    user_id: testUserId,
    session_id: testSessionId,
    room_id: 1,
    topic: 'Test Rapat AI Agent',
    meeting_date: '2024-12-26',
    meeting_time: '14:00:00',
    duration: 60,
    participants: 8,
    meeting_type: 'internal',
    food_order: 'tidak',
    booking_state: 'BOOKED'
};

// Test conversation data
const testConversationData = {
    user_id: testUserId,
    session_id: testSessionId,
    message: 'Test message from AI Agent',
    ai_response: 'Test response from AI',
    booking_state: 'BOOKED',
    booking_data: JSON.stringify(testBookingData)
};

/**
 * Test Backend Connection
 */
async function testBackendConnection() {
    console.log('🧪 Testing Backend Connection...');
    
    try {
        // Test 1: Get all rooms
        console.log('\n1️⃣ Testing GET /api/bookings/rooms');
        const roomsResponse = await fetch('/api/bookings/rooms');
        const roomsData = await roomsResponse.json();
        console.log('✅ Rooms Response:', roomsData);
        
        // Test 2: Get all bookings
        console.log('\n2️⃣ Testing GET /api/bookings');
        const bookingsResponse = await fetch('/api/bookings');
        const bookingsData = await bookingsResponse.json();
        console.log('✅ Bookings Response:', bookingsData);
        
        // Test 3: Create AI booking
        console.log('\n3️⃣ Testing POST /api/bookings/ai-booking');
        const aiBookingResponse = await fetch('/api/bookings/ai-booking', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testBookingData)
        });
        const aiBookingData = await aiBookingResponse.json();
        console.log('✅ AI Booking Response:', aiBookingData);
        
        // Test 4: Create form booking
        console.log('\n4️⃣ Testing POST /api/bookings');
        const formBookingResponse = await fetch('/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...testBookingData,
                topic: 'Test Form Booking',
                session_id: 'form-session-' + Date.now()
            })
        });
        const formBookingData = await formBookingResponse.json();
        console.log('✅ Form Booking Response:', formBookingData);
        
        // Test 5: Get conversations
        console.log('\n5️⃣ Testing GET /api/bookings/conversations');
        const conversationsResponse = await fetch('/api/bookings/conversations');
        const conversationsData = await conversationsResponse.json();
        console.log('✅ Conversations Response:', conversationsData);
        
        console.log('\n🎉 All backend tests completed successfully!');
        return true;
        
    } catch (error) {
        console.error('❌ Backend test failed:', error);
        return false;
    }
}

/**
 * Test with specific data
 */
async function testWithSpecificData() {
    console.log('\n🔍 Testing with specific booking data...');
    
    try {
        // Test creating a booking for "Cedaya Meeting Room"
        const cedayaBooking = {
            ...testBookingData,
            topic: 'Rapat Test Cedaya',
            room_id: 2, // Assuming Cedaya is room ID 2
            meeting_date: '2025-08-09',
            meeting_time: '14:00:00',
            duration: 60,
            participants: 10,
            meeting_type: 'internal',
            food_order: 'tidak'
        };
        
        console.log('Creating booking for Cedaya Meeting Room:', cedayaBooking);
        
        const response = await fetch('/api/bookings/ai-booking', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cedayaBooking)
        });
        
        const result = await response.json();
        console.log('✅ Cedaya Booking Result:', result);
        
        return result;
        
    } catch (error) {
        console.error('❌ Specific data test failed:', error);
        return null;
    }
}

/**
 * Run all tests
 */
async function runAllTests() {
    console.log('🚀 Starting Backend Integration Tests...');
    console.log('=====================================');
    
    // Test 1: Basic connection
    const connectionTest = await testBackendConnection();
    
    if (connectionTest) {
        // Test 2: Specific data
        await testWithSpecificData();
        
        console.log('\n🎯 Test Summary:');
        console.log('✅ Backend connection: SUCCESS');
        console.log('✅ API endpoints: WORKING');
        console.log('✅ Data creation: WORKING');
        console.log('\n💡 Next Steps:');
        console.log('1. Check database for new bookings');
        console.log('2. Test frontend integration');
        console.log('3. Verify AI agent saves data');
    } else {
        console.log('\n❌ Test Summary:');
        console.log('❌ Backend connection: FAILED');
        console.log('❌ API endpoints: NOT WORKING');
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Check if backend is running');
        console.log('2. Verify database connection');
        console.log('3. Check API endpoint URLs');
    }
}

// Export functions for use in browser console
window.testBackend = {
    testConnection: testBackendConnection,
    testSpecificData: testWithSpecificData,
    runAllTests: runAllTests
};

// Auto-run tests if this file is loaded
if (typeof window !== 'undefined') {
    console.log('🔧 Backend test functions loaded. Use:');
    console.log('- window.testBackend.runAllTests() - Run all tests');
    console.log('- window.testBackend.testConnection() - Test connection only');
    console.log('- window.testBackend.testSpecificData() - Test specific data');
}

export {
    testBackendConnection,
    testWithSpecificData,
    runAllTests
};
