const http = require('http');

const options = {
    hostname: '127.0.0.1',
    port: 8080,
    path: '/backend/api/bookings.php/ai-success?user_id=1',
    method: 'GET'
};

const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log('Response:', data);
        try {
            const jsonData = JSON.parse(data);
            console.log('Parsed data:', jsonData);
            console.log('Data count:', jsonData.data ? jsonData.data.length : 0);
        } catch (e) {
            console.log('Failed to parse JSON:', e.message);
        }
    });
});

req.on('error', (e) => {
    console.error('Error:', e.message);
});

req.end();
