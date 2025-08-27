# Dokumentasi Database dan API untuk Aplikasi Meeting AI

## Struktur Database

Aplikasi Meeting AI menggunakan database MySQL dengan nama `spacio_meeting_db`. Berikut adalah struktur tabel yang digunakan:

### Tabel Utama

1. **users** - Menyimpan data pengguna
   - `id` - ID pengguna (primary key)
   - `username` - Nama pengguna (unik)
   - `email` - Email pengguna (unik)
   - `password` - Password pengguna
   - `full_name` - Nama lengkap pengguna
   - dll.

2. **meeting_rooms** - Menyimpan data ruang rapat
   - `id` - ID ruang rapat (primary key)
   - `room_name` - Nama ruang rapat (unik)
   - `room_number` - Nomor ruang rapat
   - `capacity` - Kapasitas ruang rapat
   - `floor` - Lantai ruang rapat
   - `building` - Gedung ruang rapat
   - `description` - Deskripsi ruang rapat
   - `features` - Fitur ruang rapat
   - `image_url` - URL gambar ruang rapat
   - `is_available` - Status ketersediaan ruang rapat
   - `is_maintenance` - Status pemeliharaan ruang rapat

3. **reservations** - Menyimpan data pemesanan ruang rapat
   - `id` - ID pemesanan (primary key)
   - `room_id` - ID ruang rapat (foreign key ke meeting_rooms.id)
   - `user_id` - ID pengguna (foreign key ke users.id)
   - `title` - Judul rapat
   - `description` - Deskripsi rapat
   - `start_time` - Waktu mulai rapat
   - `end_time` - Waktu selesai rapat
   - `attendees` - Jumlah peserta rapat
   - `meeting_type` - Jenis rapat (internal, external, training, interview, other)
   - `food_order` - Pesanan makanan (ya, tidak)
   - `status` - Status pemesanan (pending, confirmed, cancelled, completed)
   - `created_by_ai` - Flag apakah pemesanan dibuat oleh AI (1) atau tidak (0)

### Tabel untuk AI Assistant

1. **ai_conversations** - Menyimpan riwayat percakapan dengan AI
   - `id` - ID percakapan (primary key)
   - `user_id` - ID pengguna (foreign key ke users.id)
   - `session_id` - ID sesi percakapan
   - `message` - Pesan dari pengguna
   - `response` - Respons dari AI
   - `booking_state` - Status pemesanan saat percakapan
   - `booking_data` - Data pemesanan dalam format JSON

2. **ai_booking_data** - Menyimpan data pemesanan sementara selama percakapan dengan AI
   - `id` - ID data pemesanan (primary key)
   - `user_id` - ID pengguna (foreign key ke users.id)
   - `session_id` - ID sesi percakapan
   - `room_id` - ID ruang rapat (foreign key ke meeting_rooms.id)
   - `topic` - Topik rapat
   - `meeting_date` - Tanggal rapat
   - `meeting_time` - Waktu rapat
   - `duration` - Durasi rapat (dalam menit)
   - `participants` - Jumlah peserta rapat
   - `meeting_type` - Jenis rapat
   - `food_order` - Pesanan makanan
   - `booking_state` - Status pemesanan

## API Endpoints

### API untuk AI Assistant

#### 1. Conversation API

**Endpoint:** `/api/ai/conversation.php`

**Metode:** `POST`

**Deskripsi:** Menyimpan percakapan antara pengguna dan AI assistant.

**Request Body:**
```json
{
  "user_id": 1,
  "session_id": "session123",
  "message": "Pesan dari pengguna",
  "response": "Respons dari AI",
  "booking_state": "ASKING_TOPIC",
  "booking_data": {
    "topic": "Rapat Tim"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Conversation saved successfully",
  "conversation_id": 123
}
```

**Metode:** `GET`

**Deskripsi:** Mendapatkan riwayat percakapan untuk pengguna dan sesi tertentu.

**Query Parameters:**
- `user_id` - ID pengguna
- `session_id` - ID sesi

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "session_id": "session123",
      "message": "Pesan dari pengguna",
      "response": "Respons dari AI",
      "booking_state": "ASKING_TOPIC",
      "booking_data": "{\"topic\":\"Rapat Tim\"}",
      "created_at": "2023-06-01 10:00:00"
    }
  ]
}
```

#### 2. Booking API

**Endpoint:** `/api/ai/booking.php`

**Metode:** `POST`

**Deskripsi:** Menyimpan atau memperbarui data pemesanan dari AI assistant.

**Request Body:**
```json
{
  "user_id": 1,
  "session_id": "session123",
  "room_name": "Samudrantha Meeting Room",
  "topic": "Rapat Tim",
  "meeting_date": "2023-06-01",
  "meeting_time": "10:00:00",
  "duration": 60,
  "participants": 5,
  "meeting_type": "internal",
  "food_order": "tidak",
  "booking_state": "BOOKED"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booking data saved successfully",
  "booking_id": 123
}
```

**Metode:** `GET`

**Deskripsi:** Mendapatkan data pemesanan untuk pengguna dan sesi tertentu.

**Query Parameters:**
- `user_id` - ID pengguna
- `session_id` - ID sesi (opsional)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "session_id": "session123",
      "room_id": 1,
      "room_name": "Samudrantha Meeting Room",
      "topic": "Rapat Tim",
      "meeting_date": "2023-06-01",
      "meeting_time": "10:00:00",
      "duration": 60,
      "participants": 5,
      "meeting_type": "internal",
      "food_order": "tidak",
      "booking_state": "BOOKED",
      "created_at": "2023-06-01 09:30:00",
      "updated_at": "2023-06-01 09:45:00"
    }
  ]
}
```

## Integrasi dengan Frontend

Untuk mengintegrasikan backend dengan frontend, gunakan file `aiDatabaseService.ts` yang menyediakan fungsi-fungsi berikut:

### 1. saveConversation

```typescript
saveConversation(
  userId: number,
  sessionId: string,
  message: string,
  response: string,
  bookingState: BookingState,
  bookingData?: Partial<Booking>
): Promise<boolean>
```

Fungsi ini menyimpan percakapan antara pengguna dan AI assistant ke database.

### 2. getConversationHistory

```typescript
getConversationHistory(
  userId: number,
  sessionId: string
): Promise<any[]>
```

Fungsi ini mendapatkan riwayat percakapan untuk pengguna dan sesi tertentu.

### 3. saveBookingData

```typescript
saveBookingData(
  userId: number,
  sessionId: string,
  bookingState: BookingState,
  bookingData: Partial<Booking>
): Promise<boolean>
```

Fungsi ini menyimpan atau memperbarui data pemesanan dari AI assistant.

### 4. getBookingData

```typescript
getBookingData(
  userId: number,
  sessionId?: string
): Promise<any>
```

Fungsi ini mendapatkan data pemesanan untuk pengguna dan sesi tertentu.

## Cara Menggunakan

### 1. Setup Database

1. Buat database MySQL dengan nama `spacio_meeting_db`
2. Import file SQL berikut untuk membuat struktur tabel:
   - `sql/auth_schema.sql` - Untuk tabel autentikasi
   - `sql/booking_schema.sql` - Untuk tabel pemesanan dan AI

### 2. Konfigurasi Koneksi Database

Edit file `config/database.php` sesuai dengan konfigurasi database Anda:

```php
private $host = 'localhost';
private $db_name = 'spacio_meeting_db';
private $username = 'root';
private $password = '';
```

### 3. Integrasi dengan AI Assistant

Untuk menggunakan AI assistant dengan database, panggil fungsi `processBookingConversation` dengan parameter `userId` dan `sessionId`:

```typescript
const result = await processBookingConversation(
  message,
  currentState,
  bookingData,
  userId,
  sessionId
);
```

Fungsi ini akan otomatis menyimpan percakapan dan data pemesanan ke database.

### 4. Mengambil Data dari Database

Untuk mengambil data dari database, gunakan fungsi-fungsi yang disediakan di `aiDatabaseService.ts`:

```typescript
// Mendapatkan riwayat percakapan
const conversations = await getConversationHistory(userId, sessionId);

// Mendapatkan data pemesanan
const bookingData = await getBookingData(userId, sessionId);
```

## Troubleshooting

### 1. Masalah Koneksi Database

Jika terjadi masalah koneksi database, periksa:
- Apakah database MySQL berjalan
- Apakah konfigurasi di `config/database.php` sudah benar
- Apakah user database memiliki hak akses yang cukup

### 2. Masalah API

Jika API tidak berfungsi dengan baik, periksa:
- Log error di server (biasanya di `error.log`)
- Apakah format request sudah benar
- Apakah semua field yang diperlukan sudah disediakan

### 3. Masalah Integrasi Frontend-Backend

Jika integrasi frontend-backend tidak berfungsi dengan baik, periksa:
- Apakah path API sudah benar
- Apakah format data yang dikirim sudah sesuai
- Apakah ada error di console browser