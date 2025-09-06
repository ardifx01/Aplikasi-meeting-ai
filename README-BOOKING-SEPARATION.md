# Pemisahan Data Booking - Spacio Meeting AI

## Overview

Sistem telah diubah untuk memisahkan penyimpanan data booking berdasarkan sumbernya:

1. **Data pemesanan dari formulir** → disimpan di tabel `ai_booking_data`
2. **Data pemesanan dari AI agent** → disimpan di tabel `ai_bookings_success`

## Perubahan yang Dilakukan

### 1. Services (`services/aiDatabaseService.ts`)

#### Fungsi Baru:
- `saveFormBookingData()` - untuk menyimpan data booking dari formulir ke `ai_booking_data`
- `saveAIBookingData()` - untuk menyimpan data booking dari AI agent ke `ai_bookings_success`

#### Fungsi Deprecated:
- `saveBookingData()` - masih tersedia untuk backward compatibility, default ke `saveAIBookingData()`

### 2. AI Assistant Page (`pages/AiAssistantPage.tsx`)

- Menggunakan `saveAIBookingData()` untuk menyimpan data booking dari AI agent
- Data disimpan ke tabel `ai_bookings_success`

### 3. Booking Confirmation Page (`pages/BookingConfirmationPage.tsx`)

- Menggunakan `saveFormBookingData()` untuk menyimpan data booking dari formulir
- Data disimpan ke tabel `ai_booking_data`
- Session ID menggunakan prefix `form_` untuk membedakan dari AI agent

## Struktur Tabel

### Tabel `ai_booking_data` (Form Bookings)
```sql
CREATE TABLE ai_booking_data (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    session_id VARCHAR(100) NOT NULL,
    room_id INT UNSIGNED NULL,
    topic VARCHAR(255) NULL,
    meeting_date DATE NULL,
    meeting_time TIME NULL,
    duration INT UNSIGNED NULL,
    participants INT UNSIGNED NULL,
    meeting_type ENUM('internal', 'external', 'training', 'interview', 'other') NULL,
    food_order ENUM('ya', 'tidak') NULL DEFAULT 'tidak',
    booking_state VARCHAR(50) NOT NULL DEFAULT 'IDLE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Tabel `ai_bookings_success` (AI Agent Bookings)
```sql
CREATE TABLE ai_bookings_success (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_id VARCHAR(255),
    room_id INT,
    room_name VARCHAR(255) NOT NULL,
    topic VARCHAR(500) NOT NULL,
    pic VARCHAR(255) NOT NULL,
    participants INT NOT NULL,
    meeting_date VARCHAR(255) NOT NULL,
    meeting_time VARCHAR(255),
    duration INT DEFAULT 60,
    meeting_type VARCHAR(50) DEFAULT 'internal',
    food_order VARCHAR(100) DEFAULT 'tidak',
    booking_state VARCHAR(50) DEFAULT 'BOOKED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Alur Kerja

### Form Booking Flow:
1. User mengisi formulir booking
2. Data disimpan ke `ai_booking_data` dengan session_id `form_${timestamp}`
3. Konfirmasi booking ditampilkan

### AI Agent Booking Flow:
1. User berinteraksi dengan AI agent
2. Data disimpan ke `ai_bookings_success` dengan session_id dari AI conversation
3. Konfirmasi booking ditampilkan

## Verifikasi

Untuk memverifikasi pemisahan data, jalankan script:
```bash
php scripts/verify_booking_separation.php
```

Script ini akan menampilkan:
- Struktur kedua tabel
- Jumlah data di masing-masing tabel
- Data terbaru dari masing-masing tabel
- Pattern session_id untuk membedakan sumber data

## Keuntungan Pemisahan

1. **Tracking yang Lebih Baik**: Dapat melacak sumber booking (form vs AI)
2. **Analisis Terpisah**: Analisis performa formulir dan AI agent secara terpisah
3. **Maintenance Mudah**: Perubahan pada satu sistem tidak mempengaruhi yang lain
4. **Reporting yang Jelas**: Laporan booking berdasarkan sumber data

## Migration Notes

- Data existing tetap aman
- Fungsi lama masih tersedia untuk backward compatibility
- Tidak ada breaking changes pada API yang ada

## Testing

Untuk testing, pastikan:
1. Form booking tersimpan di `ai_booking_data`
2. AI agent booking tersimpan di `ai_bookings_success`
3. Session ID berbeda untuk membedakan sumber data
4. Tidak ada data yang hilang atau duplikasi
