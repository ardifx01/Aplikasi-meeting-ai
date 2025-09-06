
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Page, type MeetingRoom, type Booking } from '../types';
import { ApiService } from '../src/config/api';
import { BackArrowIcon } from '../components/icons';

interface BookingFormPageProps {
    onNavigate: (page: Page) => void;
    room: MeetingRoom | null;
    onBookingConfirmed: (booking: Booking) => void;
    bookingData?: Partial<Booking>;
}

const BookingFormPage: React.FC<BookingFormPageProps> = ({ onNavigate, room, onBookingConfirmed, bookingData }) => {
    const [selectedRoom, setSelectedRoom] = useState<MeetingRoom | null>(room);
    const [availableRooms, setAvailableRooms] = useState<MeetingRoom[]>([]);
    const [loadingRooms, setLoadingRooms] = useState(true);
    const [topic, setTopic] = useState(bookingData?.topic || '');
    const [date, setDate] = useState(bookingData?.date || '');
    const [time, setTime] = useState(bookingData?.time || '');
    const [endTime, setEndTime] = useState('');
    const [participants, setParticipants] = useState(bookingData?.participants || 1);
    const [pic, setPic] = useState(bookingData?.pic || '');
    const [meetingType, setMeetingType] = useState<'internal' | 'external'>(bookingData?.meetingType || 'internal');
    const [foodOrder, setFoodOrder] = useState<'berat' | 'ringan' | 'tidak'>(bookingData?.foodOrder || 'tidak');

    // Load available rooms from API
    useEffect(() => {
        const loadRooms = async () => {
            try {
                setLoadingRooms(true);
                const response = await ApiService.getAllRooms();
                const raw = (response && (response as any).data) ? (response as any).data : response;
                const mapped: MeetingRoom[] = (raw || []).map((r: any) => ({
                    id: r.id ?? r.room_id,
                    name: r.name ?? r.room_name,
                    floor: r.floor || '-',
                    capacity: Number(r.capacity || 0),
                    address: r.building || r.description || '-',
                    facilities: (() => {
                        const f = r.features;
                        if (Array.isArray(f)) return f as string[];
                        if (typeof f === 'string') {
                            try { const j = JSON.parse(f); if (Array.isArray(j)) return j; } catch {}
                            return f.split(',').map((s: string) => s.trim()).filter(Boolean);
                        }
                        return [] as string[];
                    })(),
                    image: r.image_url || '/images/meeting-rooms/default-room.jpg',
                }));
                setAvailableRooms(mapped);
            } catch (error) {
                console.error('Failed to load rooms:', error);
                // Fallback to empty array if API fails
                setAvailableRooms([]);
            } finally {
                setLoadingRooms(false);
            }
        };

        loadRooms();
    }, []);

    // Optimized handlers to prevent re-renders
    const handleTopicChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setTopic(e.target.value);
    }, []);

    const handlePicChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setPic(e.target.value);
    }, []);

    const handleTimeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        // Normalisasi segera: ganti titik menjadi titik dua (beberapa locale menuliskan 15.34)
        const val = (e.target.value || '').replace(/\./g, ':');
        setTime(val);
    }, []);

    const handleEndTimeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const val = (e.target.value || '').replace(/\./g, ':');
        setEndTime(val);
    }, []);

    const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setDate(e.target.value);
    }, []);

    const handleParticipantsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setParticipants(parseInt(e.target.value, 10));
    }, []);

    const handleMeetingTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setMeetingType(e.target.value as 'internal' | 'external');
    }, []);

    const handleFoodOrderChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setFoodOrder(e.target.value as 'berat' | 'ringan' | 'tidak');
    }, []);

    const handleRoomChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const roomId = parseInt(e.target.value, 10);
        const room = availableRooms.find(r => r.id === roomId) || null;
        setSelectedRoom(room);
    }, [availableRooms]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedRoom) {
            alert('Error: No room selected. Please select a room.');
            return;
        }

        if (participants > selectedRoom.capacity) {
            alert(`Jumlah peserta melebihi kapasitas ruangan. Kapasitas maksimal: ${selectedRoom.capacity} orang.`);
            return;
        }

        // 1) Ambil user_id dari localStorage (hasil login)
        const userDataStr = localStorage.getItem('user_data');
        const userData = userDataStr ? JSON.parse(userDataStr) : null;
        const userId = userData?.id || 1; // fallback ke user_id 1 (admin) yang pasti ada
        
        console.log('User data from localStorage:', userData);
        console.log('Using userId:', userId);

        // 2) Siapkan payload sesuai backend (POST /bookings)
        // Use start time and end time separately
        const times = {
            start: time,
            end: endTime
        };

        // Helper: normalize HH:MM to HH:MM:00
        const normalizeTime = (t?: string) => {
            if (!t) return '';
            const val = t.replace(/\./g, ':');
            const m = val.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
            if (m) {
                const hh = String(Math.min(23, Math.max(0, parseInt(m[1], 10)))).padStart(2, '0');
                const mm = String(Math.min(59, Math.max(0, parseInt(m[2], 10)))).padStart(2, '0');
                return `${hh}:${mm}:00`;
            }
            return val;
        };
        const durationMinutes = (() => {
            if (times.start && times.end) {
                const [sH, sM] = times.start.split(':').map(Number);
                const [eH, eM] = times.end.split(':').map(Number);
                const diff = eH * 60 + eM - (sH * 60 + sM);
                return diff > 0 ? diff : 60;
            }
            return 60;
        })();

        // 3) Cocokkan room_id dengan data di database (fallback ke null jika belum ada)
        let resolvedRoomId: number | null = selectedRoom.id;
        try {
            const roomsResp = await ApiService.getAllRooms();
            const rooms = roomsResp?.data || [];
            const found = rooms.find((r: any) => {
                const a = (r.name || r.room_name || '').toLowerCase();
                const b = selectedRoom.name.toLowerCase();
                return a.includes(b) || b.includes(a);
            });
            resolvedRoomId = found ? found.id : null;
        } catch {}

        // Final guards
        if (!times.start) {
            alert('Waktu mulai rapat wajib diisi.');
            return;
        }
        
        if (!times.end) {
            alert('Waktu berakhir rapat wajib diisi.');
            return;
        }
        
        // Validate that end time is after start time
        if (times.start && times.end) {
            const [startHour, startMin] = times.start.split(':').map(Number);
            const [endHour, endMin] = times.end.split(':').map(Number);
            const startMinutes = startHour * 60 + startMin;
            const endMinutes = endHour * 60 + endMin;
            
            if (endMinutes <= startMinutes) {
                alert('Waktu berakhir harus setelah waktu mulai.');
                return;
            }
        }

        if (!resolvedRoomId) {
            alert('Ruangan tidak valid. Mohon pilih ruangan yang tersedia.');
            return;
        }

        const payload = {
            user_id: userId,
            room_id: resolvedRoomId,
            topic,
            meeting_date: date,
            meeting_time: normalizeTime(times.start || time),
            duration: durationMinutes,
            participants,
            pic, // kirim PIC yang diinput user ke backend
            meeting_type: meetingType || 'internal',
            food_order: foodOrder || 'tidak',
            booking_state: 'BOOKED'
        } as any;

        try {
            console.log('Sending booking payload:', payload);
            const res = await ApiService.createBooking(payload);
            console.log('Booking response:', res);
            
            // 3) Konversi response ke tipe Booking frontend untuk halaman konfirmasi
            const newBooking: Booking = {
                id: res?.data?.id || Date.now(),
                roomId: resolvedRoomId || 0,
                roomName: selectedRoom.name,
                topic,
                date,
                time: `${times.start} - ${times.end}`,
                participants,
                pic,
                meetingType,
                foodOrder,
            };
            onBookingConfirmed(newBooking);
        } catch (err: any) {
            console.error('Gagal menyimpan booking ke backend:', err);
            console.error('Error details:', err.message, err.response);
            
            let errorMessage = 'Gagal menyimpan booking ke server. Mohon coba lagi.';
            if (err.message && err.message.includes('Room is not available')) {
                errorMessage = 'Ruangan tidak tersedia pada waktu yang dipilih. Silakan pilih waktu atau ruangan lain.';
            } else if (err.message && err.message.includes('required')) {
                errorMessage = 'Data tidak lengkap. Mohon isi semua field yang diperlukan.';
            }
            
            alert(errorMessage);
        }
    }

    const FormInput: React.FC<{ label: string; id: string; type?: string; value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean; min?: number; placeholder?: string }> = 
        ({ label, id, type = "text", value, onChange, required = true, min, placeholder }) => (
            <div>
                <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}:</label>
                <input 
                    type={type} 
                    id={id} 
                    name={id} 
                    value={value} 
                    onChange={onChange} 
                    required={required}
                    min={min}
                    placeholder={placeholder}
                    autoComplete="off"
                    spellCheck="false"
                    className="w-full p-3 bg-white border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none transition-colors" 
                />
            </div>
        );

    const FormSelect: React.FC<{ label: string; id: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: { value: string; label: string }[]; required?: boolean }> = 
        ({ label, id, value, onChange, options, required = true }) => (
            <div>
                <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}:</label>
                <select 
                    id={id} 
                    name={id} 
                    value={value} 
                    onChange={onChange} 
                    required={required}
                    className="w-full p-3 bg-white border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none transition-colors cursor-pointer" 
                >
                    {options.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
        );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Header Section */}
            <div className="bg-white shadow-lg border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <button 
                                onClick={() => onNavigate(Page.MeetingRooms)} 
                                className="mr-6 p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                            >
                                <BackArrowIcon />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">Formulir Pemesanan</h1>
                                <p className="text-gray-600 text-sm mt-1">Isi formulir untuk memesan ruangan meeting</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Form Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="room" className="block text-sm font-semibold text-gray-700 mb-3">
                                        <span className="flex items-center gap-2">
                                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                            Pilih Ruangan *
                                        </span>
                                    </label>
                                    <select 
                                        id="room" 
                                        name="room" 
                                        value={selectedRoom?.id || ''} 
                                        onChange={handleRoomChange} 
                                        required
                                        disabled={loadingRooms}
                                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 hover:border-gray-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" 
                                    >
                                        <option value="" disabled>
                                            {loadingRooms ? 'Memuat ruangan...' : 'Pilih ruangan meeting'}
                                        </option>
                                        {availableRooms.map(room => (
                                            <option key={room.id} value={room.id}>
                                                {room.name} ({room.capacity} orang)
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="topic" className="block text-sm font-semibold text-gray-700 mb-3">
                                        <span className="flex items-center gap-2">
                                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                            Topik / Nama Rapat *
                                        </span>
                                    </label>
                                    <input 
                                        type="text" 
                                        id="topic" 
                                        name="topic" 
                                        value={topic}
                                        onChange={handleTopicChange}
                                        placeholder="Masukkan topik atau nama rapat"
                                        autoComplete="off"
                                        spellCheck="false"
                                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 hover:border-gray-300" 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="pic" className="block text-sm font-semibold text-gray-700 mb-3">
                                        <span className="flex items-center gap-2">
                                            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                                            PIC (Person in Charge) *
                                        </span>
                                    </label>
                                    <input 
                                        type="text" 
                                        id="pic" 
                                        name="pic" 
                                        value={pic}
                                        onChange={handlePicChange}
                                        placeholder="Masukkan nama PIC"
                                        autoComplete="off"
                                        spellCheck="false"
                                        required
                                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 hover:border-gray-300" 
                                    />
                                </div>
                                <div>
                                    <label htmlFor="participants" className="block text-sm font-semibold text-gray-700 mb-3">
                                        <span className="flex items-center gap-2">
                                            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                            Jumlah Peserta *
                                        </span>
                                    </label>
                                    <input 
                                        type="number" 
                                        id="participants" 
                                        name="participants" 
                                        min={1}
                                        value={participants} 
                                        onChange={handleParticipantsChange}
                                        placeholder="Jumlah peserta"
                                        autoComplete="off"
                                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 hover:border-gray-300" 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="date" className="block text-sm font-semibold text-gray-700 mb-3">
                                        <span className="flex items-center gap-2">
                                            <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                                            Tanggal Rapat *
                                        </span>
                                    </label>
                                    <input 
                                        type="date" 
                                        id="date" 
                                        name="date" 
                                        value={date} 
                                        onChange={handleDateChange}
                                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 hover:border-gray-300" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        <span className="flex items-center gap-2">
                                            <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                                            Waktu Rapat *
                                        </span>
                                    </label>
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <label htmlFor="time" className="block text-xs text-gray-500 mb-1">Mulai:</label>
                                            <input 
                                                type="time" 
                                                id="time" 
                                                name="time" 
                                                value={time}
                                                onChange={handleTimeChange}
                                                placeholder="e.g., 14:00"
                                                autoComplete="off"
                                                spellCheck="false"
                                                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 hover:border-gray-300" 
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label htmlFor="endTime" className="block text-xs text-gray-500 mb-1">Berakhir:</label>
                                            <input 
                                                type="time" 
                                                id="endTime" 
                                                name="endTime" 
                                                value={endTime}
                                                onChange={handleEndTimeChange}
                                                placeholder="e.g., 15:00"
                                                autoComplete="off"
                                                spellCheck="false"
                                                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 hover:border-gray-300" 
                                            />
                                        </div>
                                    </div>
                                    {time && endTime && (
                                        <div className="mt-2 text-sm text-gray-600">
                                            <span className="font-medium">Durasi:</span> {
                                                (() => {
                                                    const [startHour, startMin] = time.split(':').map(Number);
                                                    const [endHour, endMin] = endTime.split(':').map(Number);
                                                    const startMinutes = startHour * 60 + startMin;
                                                    const endMinutes = endHour * 60 + endMin;
                                                    const durationMinutes = endMinutes - startMinutes;
                                                    
                                                    if (durationMinutes <= 0) return 'Waktu tidak valid';
                                                    
                                                    const hours = Math.floor(durationMinutes / 60);
                                                    const minutes = durationMinutes % 60;
                                                    
                                                    if (hours > 0 && minutes > 0) {
                                                        return `${hours} jam ${minutes} menit`;
                                                    } else if (hours > 0) {
                                                        return `${hours} jam`;
                                                    } else {
                                                        return `${minutes} menit`;
                                                    }
                                                })()
                                            }
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="meetingType" className="block text-sm font-semibold text-gray-700 mb-3">
                                        <span className="flex items-center gap-2">
                                            <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                                            Jenis Rapat *
                                        </span>
                                    </label>
                                    <select 
                                        id="meetingType" 
                                        name="meetingType" 
                                        value={meetingType} 
                                        onChange={handleMeetingTypeChange}
                                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 hover:border-gray-300 cursor-pointer"
                                    >
                                        <option value="internal">Internal</option>
                                        <option value="external">Eksternal</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="foodOrder" className="block text-sm font-semibold text-gray-700 mb-3">
                                        <span className="flex items-center gap-2">
                                            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                                            Jenis Makanan *
                                        </span>
                                    </label>
                                    <select 
                                        id="foodOrder" 
                                        name="foodOrder" 
                                        value={foodOrder} 
                                        onChange={handleFoodOrderChange}
                                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 hover:border-gray-300 cursor-pointer"
                                    >
                                        <option value="tidak">Tidak pesan makanan</option>
                                        <option value="ringan">Makanan Ringan</option>
                                        <option value="berat">Makanan Berat</option>
                                    </select>
                                </div>
                            </div>

                            {/* Room Details Section */}
                            {selectedRoom && (
                                <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8 rounded-2xl border-2 border-blue-200 shadow-lg">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                                            <span className="text-white text-sm font-bold">🏢</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800">Detail Ruangan</h3>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-blue-100 shadow-sm">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                                    <span className="text-green-600 text-xs">👥</span>
                                                </div>
                                                <span className="font-semibold text-gray-700 text-sm">Kapasitas</span>
                                            </div>
                                            <p className="text-lg font-bold text-gray-800">{selectedRoom.capacity} orang</p>
                                        </div>
                                        
                                        <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-blue-100 shadow-sm">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <span className="text-blue-600 text-xs">📍</span>
                                                </div>
                                                <span className="font-semibold text-gray-700 text-sm">Lokasi</span>
                                            </div>
                                            <p className="text-sm font-medium text-gray-800">{selectedRoom.floor}, {selectedRoom.address}</p>
                                        </div>
                                        
                                        <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-blue-100 shadow-sm md:col-span-1 col-span-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                                                    <span className="text-purple-600 text-xs">⚙️</span>
                                                </div>
                                                <span className="font-semibold text-gray-700 text-sm">Fasilitas</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {selectedRoom.facilities.map((facility, index) => (
                                                    <span 
                                                        key={index}
                                                        className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium"
                                                    >
                                                        {facility}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Room Image Preview */}
                                    {selectedRoom.image && (
                                        <div className="mt-6">
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                                                    <span className="text-orange-600 text-xs">📷</span>
                                                </div>
                                                <span className="font-semibold text-gray-700 text-sm">Preview Ruangan</span>
                                            </div>
                                            <div className="relative">
                                                <img 
                                                    src={selectedRoom.image} 
                                                    alt={selectedRoom.name}
                                                    className="w-full h-48 object-cover rounded-xl border-2 border-blue-200 shadow-md"
                                                />
                                                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg">
                                                    <span className="text-xs font-medium text-gray-700">{selectedRoom.name}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-4 pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => onNavigate(Page.MeetingRooms)}
                                    className="flex-1 bg-gray-100 text-gray-700 font-semibold py-4 px-6 rounded-xl hover:bg-gray-200 transition-all duration-200 border-2 border-gray-200 hover:border-gray-300"
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        <span>↩️</span>
                                        Batal
                                    </span>
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        <span>✅</span>
                                        Konfirmasi Pemesanan
                                    </span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingFormPage;