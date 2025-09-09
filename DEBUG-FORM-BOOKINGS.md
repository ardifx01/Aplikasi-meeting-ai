# 🔍 Debugging Pemesanan Form Tidak Muncul di Dashboard

## Masalah yang Ditemukan:

Berdasarkan analisis kode, ada beberapa kemungkinan penyebab:

### 1. **User ID Tidak Ada**
```typescript
if (!userId) {
    console.log('User baru detected - showing empty dashboard');
    setServerBookings([]);
    setAiBookings([]);
    return;
}
```

### 2. **API Endpoint Bermasalah**
- Endpoint: `http://localhost:8080/backend/api/bookings.php/user?user_id=${userId}`
- Mungkin tidak mengembalikan data

### 3. **Filter Waktu**
- Dashboard hanya menampilkan reservasi "akan datang"
- Reservasi yang sudah lewat tidak ditampilkan

## Langkah Debugging:

### 1. Buka Browser Console
- Akses: `http://localhost:5174/`
- Tekan `F12` untuk membuka Developer Console
- Pergi ke tab `Console`

### 2. Jalankan Script Debugging
Copy dan paste script berikut ke console:

```javascript
// Script untuk debugging pemesanan form tidak muncul di dashboard
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

// 3. Test date filter logic
console.log('\n3️⃣ TEST DATE FILTER LOGIC:');
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
```

### 3. Periksa Hasil

Script akan menampilkan:

#### **A. Jika User ID Tidak Ada:**
```
❌ No user_data found in localStorage
```
**Solusi**: Login ulang atau buat user baru

#### **B. Jika API Mengembalikan Data:**
```
✅ SUCCESS! Found X form bookings
Form Booking 1: {id: 308, room_name: "Auditorium Jawadwipa 2", ...}
```
**Solusi**: Data ada, periksa filter waktu

#### **C. Jika API Error:**
```
❌ Fetch error: ...
```
**Solusi**: Periksa apakah backend server berjalan di port 8080

#### **D. Jika Tanggal Sudah Lewat:**
```
❌ Booking will NOT appear in dashboard (date is in past)
```
**Solusi**: Buat reservasi baru dengan tanggal di masa depan

## Kemungkinan Solusi:

### 1. **Jika User ID Tidak Ada:**
- Login ulang ke aplikasi
- Atau buat user baru

### 2. **Jika API Error:**
- Pastikan backend server berjalan: `php -S localhost:8080 -t .`
- Periksa apakah file `backend/api/bookings.php` ada

### 3. **Jika Tanggal Sudah Lewat:**
- Buat reservasi baru dengan tanggal besok atau minggu depan
- Reservasi akan muncul di dashboard

### 4. **Jika Data Ada Tapi Tidak Muncul:**
- Periksa console log di dashboard untuk error
- Refresh halaman dashboard

## Expected Results:

- ✅ **User ID ada** di localStorage
- ✅ **API mengembalikan data** booking
- ✅ **Tanggal di masa depan** 
- ✅ **Dashboard menampilkan** reservasi

Silakan jalankan script debugging dan beri tahu hasilnya!
