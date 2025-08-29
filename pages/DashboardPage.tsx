
import React, { useEffect, useState } from 'react';
import { Page, type Booking } from '../types';
import { ChatIcon } from '../components/icons';
import { getHistory, type HistoryEntry } from '../services/historyService';
import { ApiService } from '../src/config/api';

const RobotIllustration: React.FC = () => (
    <div className="relative">
        {/* Robot PNG Image */}
        <img 
            src="/images/robot.png" 
            alt="AI Assistant Robot" 
            className="w-64 h-64 lg:w-80 lg:h-80 object-contain drop-shadow-lg"
        />
        
        {/* Additional Floating Elements for Enhancement */}
        <div className="absolute -top-4 -left-4 w-4 h-4 bg-blue-300 rounded-full animate-pulse opacity-60"></div>
        <div className="absolute -bottom-4 -right-4 w-3 h-3 bg-blue-200 rounded-full animate-pulse delay-1000 opacity-60"></div>
        <div className="absolute top-1/2 -right-8 w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-500 opacity-60"></div>
    </div>
);

const FeatureCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg text-center h-full border border-slate-200/50">
        <h3 className="text-2xl font-bold text-cyan-500 mb-4">{title}</h3>
        <p className="text-gray-600">{children}</p>
    </div>
);

const SiteFooter: React.FC = () => (
    <footer className="mt-10 w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-gradient-to-b from-cyan-500 via-sky-600 to-blue-700 text-white min-h-[240px] mb-[-2rem]">
        <div className="w-full px-6 md:px-10 py-12 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            <div>
                <h4 className="text-xl font-semibold mb-4">Tentang Kami</h4>
                <ul className="space-y-2 text-blue-50/90">
                    <li><a href="#" className="hover:underline">Profil Kami</a></li>
                    <li><a href="#" className="hover:underline">Kontak Kami</a></li>
                </ul>
            </div>
            <div>
                <h4 className="text-xl font-semibold mb-4">Hubungan Investor</h4>
                <ul className="space-y-2 text-blue-50/90">
                    <li><a href="#" className="hover:underline">Laporan Tahunan</a></li>
                </ul>
                <h4 className="text-xl font-semibold mt-6 mb-4">Publikasi</h4>
                <ul className="space-y-2 text-teal-100">
                    <li><a href="#" className="hover:underline">Berita</a></li>
                </ul>
            </div>
            <div>
                <h4 className="text-xl font-semibold mb-4">Informasi & Profil Bandara</h4>
                <div className="mt-6">
                    <p className="text-sm uppercase tracking-wider text-teal-200">Member Of</p>
                    <div className="mt-3 flex items-center">
                        <img src="/images/injourney-logo.png" alt="InJourney" className="h-10 object-contain" onError={(e:any)=>{e.currentTarget.style.display='none';}} />
                        {!false && <span className="ml-2 font-semibold">InJourney</span>}
                    </div>
                    <div className="mt-4 text-blue-50/90 text-sm leading-relaxed">
                        <p>InJourney Airports Center</p>
                        <p>Bandar Udara Internasional Soekarno-Hatta</p>
                        <p>Jl. M2, Pajang, Kec. Benda, Kota Tangerang, Banten 15126</p>
                    </div>
                </div>
            </div>
            <div className="lg:text-right">
                <div className="flex lg:justify-end items-center">
                    <img src="/images/injourney-airports-logo.png" alt="InJourney Airports" className="h-10 object-contain" onError={(e:any)=>{e.currentTarget.style.display='none';}} />
                </div>
                <p className="mt-2 text-sm text-blue-50/90">PT Angkasa Pura Indonesia</p>
                <a href="https://www.injourneyairports.id" target="_blank" rel="noreferrer" className="mt-1 inline-block text-blue-50/90 underline">www.injourneyairports.id</a>
            </div>
        </div>
        <div className="border-t border-white/10">
            <div className="w-full px-6 md:px-10 py-4 text-center text-sm text-blue-50/90">
                PT Angkasa Pura Indonesia © 2024. All Rights Reserved
            </div>
        </div>
    </footer>
);

const ReservationCard: React.FC<{ booking: Booking }> = ({ booking }) => (
  <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-cyan-500">
    <h4 className="font-bold text-lg text-gray-800">{booking.topic}</h4>
    <p className="text-gray-600 font-medium">{booking.roomName}</p>
    <div className="mt-2 text-sm text-gray-500">
      <p><strong>PIC:</strong> {booking.pic}</p>
      <p><strong>Jenis:</strong> {booking.meetingType}</p>
      <p><strong>Tanggal:</strong> {booking.date}</p>
      <p><strong>Waktu:</strong> {booking.time}</p>
      <p><strong>Peserta:</strong> {booking.participants} orang</p>
      <p><strong>Makanan:</strong> {
        booking.foodOrder === 'tidak' ? 'Tidak pesan makanan' : 
        booking.foodOrder === 'ringan' ? 'Makanan Ringan' : 'Makanan Berat'
      }</p>
    </div>
  </div>
);

const HistoryListPreview: React.FC = () => {
  const [items, setItems] = React.useState<HistoryEntry[]>([]);
  React.useEffect(() => {
    setItems(getHistory().slice(0, 3));
  }, []);
  if (items.length === 0) return <div className="text-center text-gray-500 bg-gray-50 p-8 rounded-xl border">Belum ada histori.</div>;
  return (
    <div className="space-y-4">
      {items.map((h) => (
        <div key={`${h.id}-${h.savedAt}`} className="flex items-center justify-between bg-white p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center border border-cyan-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a2 2 0 0 1 2 2v3H3V6a2 2 0 0 1 2-2h1V3a1 1 0 0 1 1-1ZM3 10h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8Zm4 3a1 1 0 1 0 0 2h3a1 1 0 1 0 0-2H7Z"/></svg>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 leading-tight">{h.topic || '—'}</h4>
              <p className="text-gray-600 text-sm">{h.roomName}</p>
            </div>
          </div>
          <div className="text-right text-sm">
            <span className={`inline-block px-3 py-1 rounded-full font-semibold ${h.status === 'Selesai' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{h.status}</span>
            <div className="text-gray-500 mt-1">{h.date} {String(h.time).slice(0,5)}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

const DashboardPage: React.FC<{ onNavigate: (page: Page) => void, bookings: Booking[] }> = ({ onNavigate, bookings }) => {
    const [serverBookings, setServerBookings] = useState<Booking[]>([]);
    const [mongoBookings, setMongoBookings] = useState<Booking[]>([]);

    useEffect(() => {
        const userDataStr = localStorage.getItem('user_data');
        const userData = userDataStr ? JSON.parse(userDataStr) : null;
        const userId = userData?.id || 1;
        
        // Load MySQL bookings (form-based)
        ApiService.getUserBookings(userId)
            .then(res => {
                const mapped: Booking[] = (res.data || []).map((b: any) => ({
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
                setServerBookings(mapped);
            })
            .catch(() => setServerBookings([]));

        // Load MongoDB bookings (AI-based)
        ApiService.getConversations(userId)
            .then(res => {
                const mapped: Booking[] = (res.data || []).map((b: any) => ({
                    id: `mongo_${b.id}`,
                    roomName: b.room_name || `Room ${b.room_id}` || '—',
                    topic: b.topic,
                    date: b.meeting_date,
                    time: b.meeting_time,
                    participants: Number(b.participants || 0),
                    pic: '-',
                    meetingType: (b.meeting_type === 'external' ? 'external' : 'internal'),
                    foodOrder: (b.food_order === 'berat' ? 'berat' : b.food_order === 'ringan' ? 'ringan' : 'tidak')
                }));
                setMongoBookings(mapped);
            })
            .catch(() => setMongoBookings([]));
    }, []);

    // Pilih reservasi mendatang terdekat dari gabungan DB + lokal
    const normalizeTime = (t: string) => {
        if (!t) return '00:00:00';
        const v = String(t).replace(/\./g, ':');
        const m = v.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
        if (!m) return v;
        const hh = String(Math.min(23, Math.max(0, parseInt(m[1], 10)))).padStart(2, '0');
        const mm = String(Math.min(59, Math.max(0, parseInt(m[2], 10)))).padStart(2, '0');
        const ss = m[3] ? String(Math.min(59, Math.max(0, parseInt(m[3], 10)))).padStart(2, '0') : '00';
        return `${hh}:${mm}:${ss}`;
    };

    const toTs = (b: Booking) => {
        const time = normalizeTime(b.time);
        // date bisa YYYY-MM-DD atau DD/MM/YYYY; coba parse keduanya
        let dateStr = b.date;
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
            const [dd, mm, yy] = dateStr.split('/');
            dateStr = `${yy}-${mm}-${dd}`;
        }
        return new Date(`${dateStr}T${time}`).getTime();
    };

    const unified: Booking[] = (() => {
        const seen = new Set<string>();
        const merged: Booking[] = [];
        // MongoDB terlebih dahulu (AI bookings)
        mongoBookings.forEach(b => { 
            const key = String(b.id);
            if (!seen.has(key)) { merged.push(b); seen.add(key); } 
        });
        // lalu MySQL (form bookings)
        serverBookings.forEach(b => { 
            const key = String(b.id);
            if (!seen.has(key)) { merged.push(b); seen.add(key); } 
        });
        // lalu lokal
        bookings.forEach(b => { 
            const key = String(b.id);
            if (!seen.has(key)) { merged.push(b); seen.add(key); } 
        });
        return merged;
    })();

    const nowTs = Date.now();
    const future = unified.filter(b => toTs(b) >= nowTs).sort((a, b) => toTs(a) - toTs(b));
    const past = unified.filter(b => toTs(b) < nowTs).sort((a, b) => toTs(b) - toTs(a));
    const upcomingBooking = future[0] || past[0] || null;
    // Prioritaskan AI booking terbaru dari MongoDB, fallback ke MySQL, lalu logika waktu
    const latestAiBooking = mongoBookings.length > 0 ? mongoBookings[0] : null;
    const latestDbBooking = serverBookings.length > 0 ? serverBookings[0] : null;
    const bookingToShow = latestAiBooking || latestDbBooking || upcomingBooking;

    return (
        <div>
            {/* Hero Section */}
            <div className="relative z-10 -mt-16 text-white font-['Poppins']">
                <div className="container mx-auto px-4 md:px-8 py-10">
                    <div className="grid lg:grid-cols-12 items-center gap-8">
                        <div className="lg:col-span-7 text-left">
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
                               Let AI Help You Book the Perfect Meeting Room!
                            </h2>
                            <p className="mt-3 text-base md:text-lg text-white/90 max-w-2xl">
                                Temukan dan pesan ruang rapat ideal secara instan dengan bantuan Asisten AI cerdas kami. Proses pemesanan jadi lebih cepat, efisien, dan sesuai kebutuhan Anda.
                            </p>
                            
                        </div>
                        <div className="lg:col-span-5 flex justify-center lg:justify-end lg:mr-16">
                            <RobotIllustration />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="relative z-20">
                {/* Button bridging between hero and white section */}
                <div className="pointer-events-none">
                    <div className="container mx-auto px-4 md:px-8 -mt-12 md:-mt-14">
                        <div className="flex">
                            <button onClick={() => onNavigate(Page.AiAssistant)} className="pointer-events-auto inline-flex items-center bg-white text-cyan-600 font-bold text-lg px-8 py-3 rounded-full shadow-lg hover:bg-gray-100 transition">
                                <ChatIcon className="w-6 h-6 mr-2.5" />
                                Mari Mengobrol dengan AI!
                            </button>
                        </div>
                    </div>
                </div>
            
            <div className="bg-slate-50 rounded-t-3xl mt-6 pt-12 pb-12 shadow-2xl shadow-slate-300/30">
                {/* Upcoming + History side-by-side */}
                <div className="mb-16 px-4">
                    <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
                        {/* Left: Upcoming Reservation */}
                        <div className="bg-white p-6 rounded-2xl shadow-md border">
                            <h3 className="text-3xl font-bold text-gray-700 mb-6 text-center lg:text-left">Reservasi Mendatang</h3>
                            <div>
                                {bookingToShow ? (
                                    <ReservationCard booking={bookingToShow} />
                                ) : (
                                    <div className="text-center text-gray-500 bg-gray-50 p-8 rounded-2xl border">
                                        <p>Anda belum memiliki reservasi terjadwal.</p>
                                    </div>
                                )}
                                <div className="text-center lg:text-left mt-6">
                                    <button 
                                        onClick={() => onNavigate(Page.Reservations)} 
                                        className="bg-cyan-500 text-white font-bold py-3 px-8 rounded-xl hover:bg-cyan-600 transition shadow-lg text-lg"
                                    >
                                        Lihat Semua Reservasi
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right: History Preview */}
                        <div className="bg-white p-6 rounded-2xl shadow-md border">
                            <h3 className="text-3xl font-bold text-gray-700 mb-6 text-center lg:text-left">Histori Pemesanan</h3>
                            <p className="text-gray-600 mb-4">Ringkasan histori terbaru Anda (tersimpan lokal meski data database telah dihapus).</p>
                            <HistoryListPreview />
                            <div className="text-center lg:text-left mt-6">
                                <button 
                                    onClick={() => onNavigate(Page.History)} 
                                    className="bg-white text-cyan-600 border border-cyan-500 font-bold py-3 px-8 rounded-xl hover:bg-gray-50 transition shadow text-lg"
                                >
                                    Lihat Histori
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feature Cards Section */}
                <div className="px-4">
                    <h3 className="text-3xl font-bold text-gray-700 mb-8 text-center">Fitur Unggulan</h3>
                    <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        <FeatureCard title="Rekomendasi Cerdas">AI kami akan merekomendasikan ruang terbaik berdasarkan kebutuhan Anda, jumlah peserta, dan preferensi fasilitas.</FeatureCard>
                        <FeatureCard title="Penjadwalan Otomatis">Secara otomatis menemukan slot waktu terbaik yang sesuai untuk semua peserta rapat tanpa konflik jadwal.</FeatureCard>
                        <FeatureCard title="Bahasa Alami">Berinteraksi dengan Asisten AI kami menggunakan bahasa manusia untuk pengalaman pemesanan yang lebih intuitif.</FeatureCard>
                    </div>
                </div>

                {/* Feature Cards remains below */}
            </div>
            </div>
            <SiteFooter />
        </div>
    );
};

export default DashboardPage;