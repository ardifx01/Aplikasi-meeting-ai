
import React, { useEffect, useMemo, useState } from 'react';
import { Page, type Booking } from '../types';
import { BackArrowIcon } from '../components/icons';
import { ApiService } from '../src/config/api';
import { addHistory } from '../services/historyService';

const ReservationListItem: React.FC<{ booking: Booking, onCancel: (id: number) => void, onDetail: (b: Booking) => void, onComplete: (b: Booking) => void }> = ({ booking, onCancel, onDetail, onComplete }) => {
  const getRoomImage = (roomName?: string) => {
    if (!roomName) return '/images/meeting-rooms/default-room.svg';
    const name = roomName.toLowerCase();
    // Pakai gambar foto nyata jika tersedia (r1.jpeg - r9.jpeg)
    if (name.includes('samudrantha')) return '/images/meeting-rooms/r1.jpeg';
    if (name.includes('nusanipa') || name.includes('nusanipa')) return '/images/meeting-rooms/r2.jpeg';
    if (name.includes('garuda')) return '/images/meeting-rooms/r3.jpeg';
    if (name.includes('jawadwipa 1') || name.includes('jawadwipa1')) return '/images/meeting-rooms/r4.jpeg';
    if (name.includes('jawadwipa 2') || name.includes('jawadwipa2')) return '/images/meeting-rooms/r5.jpeg';
    if (name.includes('kalamant') || name.includes('kalamanthana')) return '/images/meeting-rooms/r6.jpeg';
    if (name.includes('cedaya')) return '/images/meeting-rooms/r7.jpeg';
    if (name.includes('celebes')) return '/images/meeting-rooms/r8.jpeg';
    if (name.includes('balidwipa')) return '/images/meeting-rooms/r9.jpeg';
    // Fallback ke ikon SVG bila tidak ada foto spesifik
    return '/images/meeting-rooms/default-room.svg';
  };

  const formatTime = (time?: string) => (time || '').slice(0,5);

  const handleDetail = () => {
    alert(
      `Rincian Reservasi\n\n`+
      `Ruangan : ${booking.roomName}\n`+
      `Topik   : ${booking.topic}\n`+
      `Tanggal : ${booking.date}\n`+
      `Waktu   : ${formatTime(booking.time)}\n`+
      `Peserta : ${booking.participants}\n`+
      `PIC     : ${booking.pic || '-'}\n`+
      `Jenis   : ${booking.meetingType}\n`+
      `Makanan : ${booking.foodOrder}`
    );
  };

  const handleComplete = () => onComplete(booking);

  return (
    <div className="bg-white p-5 rounded-xl shadow-md border flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <img
          src={getRoomImage(booking.roomName)}
          alt={booking.roomName}
          className="w-16 h-16 rounded-lg object-cover border"
        />
        <div>
          <h4 className="font-extrabold text-xl text-gray-900">{booking.roomName || 'Meeting Room'}</h4>
          <p className="text-gray-600 text-sm">{booking.topic || '-'}</p>
          <p className="text-sm text-gray-500 mt-1">
            {booking.date} &middot; {formatTime(booking.time)} &middot; PIC: {booking.pic || '-'}
          </p>
        </div>
      </div>
      <div className="flex space-x-2 self-end sm:self-center">
        <button onClick={() => onDetail(booking)} className="text-sm bg-white border text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 transition">Detail</button>
        <button onClick={handleComplete} className="text-sm bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition">Selesai</button>
        <button onClick={() => onCancel(booking.id)} className="text-sm bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition">Batalkan</button>
      </div>
    </div>
  );
};


const ReservationsPage: React.FC<{ onNavigate: (page: Page) => void, bookings: Booking[], onCancelBooking: (id: number) => void, onRemoveLocalBooking?: (id:number)=>void }> = ({ onNavigate, bookings, onCancelBooking, onRemoveLocalBooking }) => {
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState<'Terbaru' | 'Terlama'>('Terbaru');
    const [serverBookings, setServerBookings] = useState<any[]>([]);
    const [mongoBookings, setMongoBookings] = useState<any[]>([]);

    const loadServerBookings = () => {
        const userDataStr = localStorage.getItem('user_data');
        const userData = userDataStr ? JSON.parse(userDataStr) : null;
        const primaryUserId = userData?.id || 1;
        const fallbackUserId = 1;

        // Load MySQL bookings (form-based) with fallback to userId 1
        ApiService.getUserBookings(primaryUserId)
            .then(res => {
                const rows = res.data || [];
                if (rows.length > 0 || primaryUserId === fallbackUserId) {
                    setServerBookings(rows);
                } else {
                    // Fallback to default user to mimic original behavior
                    return ApiService.getUserBookings(fallbackUserId)
                        .then(res2 => setServerBookings(res2.data || []))
                        .catch(() => setServerBookings([]));
                }
            })
            .catch(() => setServerBookings([]));

        // Load MongoDB bookings (AI-based) with fallback to userId 1
        ApiService.getUserAIBookingsMongo(primaryUserId)
            .then(res => {
                const rows = res.data || [];
                if (rows.length > 0 || primaryUserId === fallbackUserId) {
                    setMongoBookings(rows);
                } else {
                    return ApiService.getUserAIBookingsMongo(fallbackUserId)
                        .then(res2 => setMongoBookings(res2.data || []))
                        .catch(() => setMongoBookings([]));
                }
            })
            .catch(() => setMongoBookings([]));
    };

    useEffect(() => {
        loadServerBookings();
    }, []);

    const handleCancel = async (id: number) => {
        await onCancelBooking(id);
        // Hapus dari state lokal jika ada
        onRemoveLocalBooking?.(id);
        // Optimistic remove from server/mongo lists
        setServerBookings(prev => prev.filter((b:any) => Number(b.id) !== Number(id)));
        setMongoBookings(prev => prev.filter((b:any) => String(b.id) !== String(id) && String(b._id) !== String(id)));
        // Refresh server bookings setelah pembatalan
        loadServerBookings();
    };

    // Selesaikan booking: hapus DB, catat histori, hapus dari tampilan, refresh
    const handleCompleteBooking = async (b: Booking) => {
        try {
            const idStr = String(b.id);
            if (idStr.startsWith('mongo_')) {
                const realId = idStr.replace('mongo_','');
                await ApiService.cancelAIBookingMongo(realId as any);
            } else if (/^[a-fA-F0-9]{24}$/.test(idStr)) {
                await ApiService.cancelAIBookingMongo(idStr);
            } else {
                await ApiService.cancelBooking(Number(b.id));
            }
        } catch (e) {
            alert('Gagal menyelesaikan booking.');
            return;
        }

        try {
            addHistory({
                id: b.id,
                roomName: b.roomName,
                topic: b.topic,
                date: b.date,
                time: b.time,
                participants: b.participants,
                status: 'Selesai'
            });
        } catch {}

        onRemoveLocalBooking?.(Number(b.id));
        setServerBookings(prev => prev.filter((x:any) => String(x.id) !== String(b.id)));
        const rid = String(b.id).replace(/^mongo_/,'');
        setMongoBookings(prev => prev.filter((x:any) => String(x.id) !== rid && String(x._id) !== rid));
        loadServerBookings();
    };

    const filteredSorted = useMemo(() => {
        // Format MySQL bookings (form-based)
        const serverBookingsFormatted: Booking[] = serverBookings.map((b: any): Booking => ({
            id: b.id,
            roomName: b.room_name || `Room ${b.room_id}` || '—',
            topic: b.topic,
            date: b.meeting_date,
            time: b.meeting_time,
            participants: Number(b.participants || 0),
            pic: '-',
            meetingType: (b.meeting_type === 'external' ? 'external' : 'internal'),
            foodOrder: (b.food_order === 'berat' ? 'berat' : b.food_order === 'ringan' ? 'ringan' : 'tidak')
        }));

        // Format MongoDB bookings (AI-based)
        const mongoBookingsFormatted: Booking[] = mongoBookings.map((b: any): Booking => ({
            id: `mongo_${String(b.id || b._id)}`, // Add prefix to avoid ID conflicts
            roomName: b.room_name || `Room ${b.room_id}` || '—',
            topic: b.topic,
            date: b.meeting_date,
            time: b.meeting_time,
            participants: Number(b.participants || 0),
            pic: '-',
            meetingType: (b.meeting_type === 'external' ? 'external' : 'internal'),
            foodOrder: (b.food_order === 'berat' ? 'berat' : b.food_order === 'ringan' ? 'ringan' : 'tidak')
        }));

        const unified: Booking[] = [];
        const seenIds = new Set<string>();

        // Add all bookings with deduplication
        serverBookingsFormatted.forEach(b => { 
            const key = String(b.id);
            if (!seenIds.has(key)) { unified.push(b); seenIds.add(key); } 
        });
        mongoBookingsFormatted.forEach(b => { 
            const key = String(b.id);
            if (!seenIds.has(key)) { unified.push(b); seenIds.add(key); } 
        });
        bookings.forEach(b => { 
            const key = String(b.id);
            if (!seenIds.has(key)) { unified.push(b); seenIds.add(key); } 
        });

        const list = unified.filter(b => {
            const hay = `${b.topic} ${b.roomName}`.toLowerCase();
            return hay.includes(search.toLowerCase());
        });
        const toDate = (b: Booking) => new Date(`${b.date} ${b.time}`).getTime();
        return list.slice().sort((a, b) => sort === 'Terbaru' ? toDate(b) - toDate(a) : toDate(a) - toDate(b));
    }, [bookings, search, sort, serverBookings, mongoBookings]);

    return (
        <div className="bg-white/80 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-lg">
            <div className="flex items-center mb-6">
                <button onClick={() => onNavigate(Page.Dashboard)} className="mr-4 p-2 rounded-full hover:bg-gray-200">
                    <BackArrowIcon />
                </button>
                <h2 className="text-3xl font-bold text-gray-800">Reservasi Saya</h2>
            </div>
            
            {/* Search and Filter Bar */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
                <input 
                    type="text" 
                    placeholder="Cari berdasarkan topik atau ruangan..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full md:flex-grow p-3 bg-white border border-gray-300 rounded-xl shadow-sm focus:ring-cyan-500 focus:border-cyan-500"
                />
                <select value={sort} onChange={e => setSort(e.target.value as any)} className="p-3 bg-white border border-gray-300 rounded-xl shadow-sm focus:ring-cyan-500 focus:border-cyan-500">
                    <option value="Terbaru">Terbaru</option>
                    <option value="Terlama">Terlama</option>
                </select>
            </div>

            {/* Reservations List */}
            <div className="space-y-4">
                {filteredSorted.length > 0 ? (
                    filteredSorted.map(booking => <ReservationListItem key={booking.id} booking={booking} onCancel={handleCancel} onDetail={(b)=>{
                        // Simpan sementara ke session untuk ditarik di App
                        sessionStorage.setItem('detail_booking', JSON.stringify(b));
                        const ev = new CustomEvent('set_detail_booking');
                        window.dispatchEvent(ev as any);
                    }} onComplete={handleCompleteBooking} />)
                ) : (
                    <div className="text-center py-12 px-6 bg-gray-50 rounded-xl border">
                        <h3 className="text-xl font-medium text-gray-700">Tidak Ada Reservasi</h3>
                        <p className="text-gray-500 mt-2">Anda belum membuat pemesanan apa pun. Mulai dengan mencari ruangan yang tersedia.</p>
                        <button 
                            onClick={() => onNavigate(Page.MeetingRooms)}
                            className="mt-4 bg-cyan-500 text-white font-bold py-2 px-5 rounded-lg hover:bg-cyan-600 transition"
                        >
                            Cari Ruangan
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReservationsPage;
