import React, { useState, useRef, useEffect } from 'react';

import { Page, type ChatMessage, type QuickAction, BookingState, Booking, MeetingRoom } from '../types';

import { processBookingConversation } from '../services/geminiService';

import { 

    BackArrowIcon, ChatIcon, BookingIcon, HelpIcon, SendIcon 

} from '../components/icons';

import { MEETING_ROOMS } from '../constants';

import { saveAIBookingData, getLastSuggestions } from '../services/aiDatabaseService';

import BackendService from '../src/services/backendService';

const AiIcon: React.FC = () => {
    const [isThinking, setIsThinking] = useState(false);

    // Simulate thinking animation when component mounts
    React.useEffect(() => {
        const interval = setInterval(() => {
            setIsThinking(true);
            setTimeout(() => setIsThinking(false), 2000);
        }, 8000); // Every 8 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md flex-shrink-0 animate-pulse-slow">
            <img 
                src="/images/robot.png" 
                alt="AI Avatar" 
                className={`w-8 h-8 transition-all duration-300 ${
                    isThinking ? 'animate-thinking' : 'animate-wiggle-slow'
                }`} 
            />
        </div>
    );
};



const getQuickActionIcon = (label: string) => {

    const iconClass = "w-4 h-4 mr-2";

    

    switch (label.toLowerCase()) {

        case 'pesan ruangan':

        case 'pesan ruangan baru':

        case 'pesan ruangan lain':

            return <BookingIcon className={iconClass} />;

        case 'rapat tim':

            return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 616 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>;

        case 'presentasi':

            return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2"></path></svg>;

        case 'meeting client':

            return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"></path></svg>;

        case 'brainstorming':

            return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>;

        case 'training':

            return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>;

        case 'besok':

        case 'lusa':

        case 'minggu depan':

        case 'hari ini':

            return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>;

        case 'ya':

        case 'ya, konfirmasi':

            return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>;

        case 'tidak':

        case 'tidak, batal':

            return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>;

        case 'lihat reservasi':

        case 'reservasi saya':

            return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>;

        case 'bantuan':

            return <HelpIcon className={iconClass} />;

        case 'one-shot booking':

        case 'one shot booking':

            return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>;

        default:

            return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;

    }

};



interface AiAssistantPageProps {

    onNavigate: (page: Page) => void;

    onBookingConfirmed: (booking: Booking) => void;

    onAiBookingData: (bookingData: Partial<Booking>) => void;

}



const AiAssistantPage: React.FC<AiAssistantPageProps> = ({ onNavigate, onBookingConfirmed, onAiBookingData }) => {

    const [messages, setMessages] = useState<ChatMessage[]>([]);

    const [input, setInput] = useState('');

    const [isLoading, setIsLoading] = useState(false);

    const chatEndRef = useRef<HTMLDivElement>(null);



    const [bookingState, setBookingState] = useState<BookingState>(BookingState.IDLE);

    const [currentBooking, setCurrentBooking] = useState<Partial<Booking>>({});



    const scrollToBottom = () => {

        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });

    };



    useEffect(scrollToBottom, [messages]);



    useEffect(() => {

        const initialQuickActions: QuickAction[] = [

            { 

                label: 'Pesan Ruangan', 

                icon: <BookingIcon />, 

                action: () => handleQuickAction('start_booking', 'Pesan Ruangan') 

            },

            { 

                label: 'One-Shot Booking', 

                icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>, 

                action: () => handleQuickAction('one_shot_booking', 'One-Shot Booking') 

            },

            { 

                label: 'Bantuan', 

                icon: <HelpIcon />, 

                action: () => handleQuickAction('Bantuan', 'Bantuan') 

            },

        ];



        setMessages([{

            id: 1,

            sender: 'ai',

            text: "Halo! 👋 Saya adalah asisten AI Spacio yang siap membantu Anda memesan ruang rapat dengan mudah! 🎯\n\nSilakan pilih salah satu opsi di bawah atau ketik pesan Anda secara manual.",

            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),

            quickActions: initialQuickActions,

        }]);

    }, []);



    const addMessage = (sender: 'user' | 'ai', text: string, quickActions?: QuickAction[]) => {

      const newMessage: ChatMessage = {

          id: Date.now(),

          sender,

          text,

          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),

          quickActions,

      };

      setMessages(prev => {

          const newMessages = [...prev];

          if (newMessages.length > 0 && sender === 'user') {

              const lastMessage = newMessages[newMessages.length - 1];

              if (lastMessage.quickActions) {

                  delete lastMessage.quickActions;

              }

          }

          return [...newMessages, newMessage];

      });

    };



    const sendMessage = async (text: string) => {

        if (!text.trim() || isLoading) return;

        

        console.log(`📤 sendMessage called with:`, { text, bookingState, currentBooking, isOneShotMode });

        console.log(`🔍 Current bookingState enum value:`, BookingState[bookingState]);

        

        // Jika dalam mode one-shot interaktif, proses input untuk melengkapi data
        if (isOneShotMode) {
            return await handleOneShotInteractiveInput(text);
        }

        // One-shot mode: coba proses perintah lengkap dalam satu kalimat

        const handled = await handleOneShotIfPossible(text);

        if (handled) {

            setInput('');

            return;

        }



        addMessage('user', text);

        setInput('');

        setIsLoading(true);



        console.log(`🔍 Calling processBookingConversation with:`, { text, bookingState, currentBooking });

        const result = await processBookingConversation(text, bookingState, currentBooking);

        

        console.log(`🔍 processBookingConversation result:`, result);

        console.log(`🔍 New state: ${result.newState} (${BookingState[result.newState]})`);

        console.log(`🔍 Updated booking data:`, result.updatedBookingData);

        

        setBookingState(result.newState);

        setCurrentBooking(result.updatedBookingData);



        if (result.finalBooking) {
            // Langsung ke konfirmasi tanpa menyimpan ke database di sini
            // Penyimpanan akan dilakukan di halaman konfirmasi untuk menghindari duplikasi
            const confirmedBooking = {
                ...result.finalBooking,
                roomName: result.finalBooking.roomName,
                topic: result.finalBooking.topic,
                date: result.finalBooking.date,
                time: result.finalBooking.time,
                participants: result.finalBooking.participants,
                meetingType: result.finalBooking.meetingType,
                foodOrder: result.finalBooking.foodOrder,
                pic: result.finalBooking.pic
            };
            
            console.log('=== BOOKING DATA DEBUG ===');
            console.log('Final booking data:', result.finalBooking);
            console.log('User input message:', text);
            console.log('Confirmed booking data:', confirmedBooking);
            console.log('=== END DEBUG ===');
            
            onBookingConfirmed(confirmedBooking);
            onNavigate(Page.BookingConfirmation);

        } else if (result.newState === BookingState.CONFIRMING && result.updatedBookingData.topic && result.updatedBookingData.participants) {

            // Redirect to booking form with pre-filled data if user chooses to go to form

            if (text.toLowerCase().includes('formulir') || text.toLowerCase().includes('lanjut ke formulir')) {

                onAiBookingData(result.updatedBookingData);

                onNavigate(Page.Booking);

            }

        }



        const aiQuickActions: QuickAction[] | undefined = result.quickActions?.map(qa => ({

            label: qa.label,

            icon: getQuickActionIcon(qa.label), 

            action: () => handleQuickAction(qa.actionValue, qa.label)

        }));



        addMessage('ai', result.responseText, aiQuickActions);

        setIsLoading(false);



        // Tidak lagi memanggil pengambilan ruangan otomatis di sini

    };



    const handleSend = () => {

        sendMessage(input);

    };



    // ================= One-shot helpers =================

    const toTitleCase = (s: string) => s

        .split(/\s+/)

        .map(w => w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : '')

        .join(' ');



    const extractTopic = (t: string): string | null => {

        const m = t.match(/(?:topik|topiknya|tema|subject)\s+([^,.\n;]+?)(?=(\s+(jam|pukul|besok|lusa|tanggal|orang|butuh|konsum|catering|pic|atas nama|internal|eksternal)\b)|$)/i);

        if (m) return m[1].trim();

        return null;

    };



    const extractPic = (t: string): string | null => {

        let m = t.match(/atas nama\s+([a-zA-Z.\- ]{2,50}?)(?=(\s+(topik|topiknya|tema|subject|jam|pukul|besok|lusa|tanggal|orang|butuh|konsum|catering|internal|eksternal)\b)|$)/i);

        if (m) return m[1].trim();

        m = t.match(/\bpic\s+(?:atas nama\s+)?([a-zA-Z.\- ]{2,50})(?=\b|$)/i);

        if (m) return m[1].trim();

        return null;

    };



    const parseDateFromText = (t: string): string | null => {

        const lower = t.toLowerCase();

        const now = new Date();

        // 1) Prioritaskan tanggal eksplisit lebih dahulu: "30 agustus" / "30/08/2025"

        const monthMap: Record<string, number> = { januari:0,februari:1,maret:2,april:3,mei:4,juni:5,juli:6,agustus:7,september:8,oktober:9,november:10,desember:11 };

        const m = lower.match(/(\d{1,2})\s+(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)(?:\s+(\d{4}))?/);

        if (m) {

            const day = parseInt(m[1],10);

            const mon = monthMap[m[2]];

            const year = m[3] ? parseInt(m[3],10) : now.getFullYear();

            const d = new Date(year, mon, day);

            return d.toISOString().slice(0,10);

        }

        const dmy = lower.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);

        if (dmy) {

            const day = parseInt(dmy[1],10);

            const mon = parseInt(dmy[2],10)-1;

            const year = parseInt(dmy[3].length===2?('20'+dmy[3]):dmy[3],10);

            const d = new Date(year, mon, day);

            return d.toISOString().slice(0,10);

        }

        // 2) Kata kunci relatif

        if (lower.includes('hari ini')) {

            return now.toISOString().slice(0,10);

        }

        if (lower.includes('besok')) {

            const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

            return d.toISOString().slice(0,10);

        }

        return null;

    };



    // Parse angka dari kata (<=99) untuk frasa bebas: "dua belas", "dua puluh tiga"

    const parseNumberWords = (t: string): number | null => {

        const numMap: Record<string, number> = {

            'nol':0,'kosong':0,'satu':1,'se':1,'dua':2,'tiga':3,'empat':4,'lima':5,'enam':6,'tujuh':7,'delapan':8,'sembilan':9,

            'sepuluh':10,'sebelas':11

        };

        const tokens = t.toLowerCase().split(/[^a-zA-Z]+/).filter(Boolean);

        // cari pola "<unit> belas"

        for (let i = 0; i < tokens.length; i++) {

            const w = tokens[i];

            if (w === 'belas' && i>0 && numMap[tokens[i-1]]!=null && numMap[tokens[i-1]]>=1 && numMap[tokens[i-1]]<=9) {

                return 10 + numMap[tokens[i-1]];

            }

            if (w.endsWith('belas')) {

                const u = w.replace('belas','');

                if (numMap[u]!=null) return 10 + numMap[u];

            }

        }

        // pola "<tens> puluh <unit>?"

        for (let i = 0; i < tokens.length; i++) {

            if (tokens[i] === 'puluh' && i>0) {

                const tensUnit = numMap[tokens[i-1]] || 0;

                const unit = (i+1<tokens.length && numMap[tokens[i+1]]!=null) ? numMap[tokens[i+1]] : 0;

                if (tensUnit>0) return tensUnit*10 + unit;

            }

        }

        // kata tunggal yang dipetakan langsung

        for (const tok of tokens) {

            if (numMap[tok]!=null) return numMap[tok];

        }

        return null;

    };



    const parseParticipantsFromText = (t: string): number | null => {

        // angka digit

        const m = t.match(/(\d{1,3})\s*(orang|org|peserta|kapasitas)?/);

        if (m) return parseInt(m[1],10);

        // angka kata

        const w = parseNumberWords(t);

        return w;

    };



    const parseTimeRangeFromText = (t: string): { start: string; end?: string; duration: number } | null => {

        const lower = t.toLowerCase();

        // "jam 9-11 pagi" atau "9-11" atau "09:00-11:00"

        const m1 = lower.match(/(?:jam\s*)?(\d{1,2})(?::(\d{2}))?\s*[-–]\s*(\d{1,2})(?::(\d{2}))?/);

        if (m1) {

            let h1 = parseInt(m1[1],10); const mm1 = m1[2] || '00';

            let h2 = parseInt(m1[3],10); const mm2 = m1[4] || '00';

            if (lower.includes('pagi')) { if (h1===12) h1=0; if (h2===12) h2=0; }

            if (lower.includes('siang')||lower.includes('sore')||lower.includes('malam')) { if (h1<12) h1+=12; if (h2<12) h2+=12; }

            const start = `${String(h1).padStart(2,'0')}:${mm1}`;

            const end = `${String(h2).padStart(2,'0')}:${mm2}`;

            const dur = (h2*60+parseInt(mm2,10)) - (h1*60+parseInt(mm1,10));

            return { start, end, duration: dur>0?dur:60 };

        }

        // format "14.00-15.00"

        const mDot = lower.match(/(\d{1,2})\.(\d{2})\s*[-–]\s*(\d{1,2})\.(\d{2})/);

        if (mDot) {

            const start = `${String(parseInt(mDot[1],10)).padStart(2,'0')}:${mDot[2]}`;

            const end = `${String(parseInt(mDot[3],10)).padStart(2,'0')}:${mDot[4]}`;

            const dur = (parseInt(mDot[3],10)*60+parseInt(mDot[4],10)) - (parseInt(mDot[1],10)*60+parseInt(mDot[2],10));

            return { start, end, duration: dur>0?dur:60 };

        }

        const m2 = lower.match(/(?:jam|pukul)\s*(\d{1,2})(?::(\d{2}))?/);

        if (m2) {

            let h = parseInt(m2[1],10); const mm = m2[2] || '00';

            if (lower.includes('siang')||lower.includes('sore')||lower.includes('malam')) { if (h<12) h+=12; }

            return { start: `${String(h).padStart(2,'0')}:${mm}`, duration: 60 };

        }

        // format "14-15" (tanpa menit)

        const mShort = lower.match(/(?:jam\s*)?(\d{1,2})\s*[-–]\s*(\d{1,2})(?!\d)/);

        if (mShort) {

            const h1 = parseInt(mShort[1],10); const h2 = parseInt(mShort[2],10);

            const start = `${String(h1).padStart(2,'0')}:00`;

            const end = `${String(h2).padStart(2,'0')}:00`;

            return { start, end, duration: Math.max(60, (h2-h1)*60) };

        }

        return null;

    };



    const normalize = (s: string) => (s||'').toLowerCase()

        .replace(/meeting|room|ruang|rapat/gi,'')

        .replace(/\s+/g,'')

        .replace(/[^a-z0-9]/g,'');



    // State untuk tracking one-shot booking data
    const [oneShotData, setOneShotData] = useState<Partial<Booking>>({});
    const [isOneShotMode, setIsOneShotMode] = useState(false);

    const handleOneShotIfPossible = async (text: string): Promise<boolean> => {

        const lower = text.toLowerCase();

        // Skip one-shot processing jika sedang dalam state booking yang aktif
        if (bookingState !== BookingState.IDLE) {
            console.log(`🔍 Skipping one-shot processing: current state is ${BookingState[bookingState]}, not IDLE`);
            return false;
        }

        // Skip one-shot processing untuk input yang seharusnya diproses oleh state machine
        if (lower === 'internal' || lower === 'eksternal' || lower === 'external' ||
            lower === 'ringan' || lower === 'berat' || lower === 'tidak' ||
            lower === 'ya' || lower === 'tidak') {
            console.log(`🔍 Skipping one-shot processing: input "${text}" should be processed by state machine`);
            return false;
        }

        // Deteksi data yang tersedia
        const hasTime = !!parseTimeRangeFromText(lower);
        const hasDate = !!parseDateFromText(lower);
        const hasPeople = !!parseParticipantsFromText(lower);
        const hasTopic = !!extractTopic(lower);
        const hasPic = !!extractPic(lower);

        // deteksi nama ruangan secara longgar
        let hasRoom = false;
        let availableRooms: any[] = [];
        try {
            const roomsResp = await BackendService.getAllRooms();
            availableRooms = roomsResp.data || [];
            const msgNorm = normalize(lower);
            hasRoom = availableRooms.some((r:any)=> {
                const nm = normalize(r.name || r.room_name || '');
                return nm && (msgNorm.includes(nm) || nm.includes(msgNorm));
            }) || /ruang|room|meeting/.test(lower);
        } catch {}

        // Cek apakah ada minimal 2 data penting (waktu + salah satu dari: ruang, peserta, tanggal)
        const hasMinimumData = hasTime && (hasRoom || hasPeople || hasDate);

        if (!hasMinimumData) return false;

        // Jika data lengkap, proses langsung
        if (hasTime && hasDate && hasPeople && hasRoom) {
            return await processCompleteOneShot(text, lower, availableRooms);
        }

        // Jika data belum lengkap, mulai proses interaktif
        return await processIncompleteOneShot(text, lower, availableRooms, {
            hasTime, hasDate, hasPeople, hasRoom, hasTopic, hasPic
        });
    };

    // Fungsi untuk memproses one-shot booking yang data sudah lengkap
    const processCompleteOneShot = async (text: string, lower: string, availableRooms: any[]): Promise<boolean> => {
        try {
            const date = parseDateFromText(lower) || new Date().toISOString().slice(0,10);
            const timeInfo = parseTimeRangeFromText(lower) || { start: '09:00', duration: 60 };
            const participants = parseParticipantsFromText(lower) || 1;
            const rawPic = extractPic(lower);
            const pic = rawPic ? toTitleCase(rawPic) : '-';
            const needsFood = lower.includes('konsum') || lower.includes('konsumsi') || lower.includes('catering');
            const foodOrder = needsFood ? 'ringan' : 'tidak';
            const topic = extractTopic(lower) || 'Rapat';

            // Deteksi meeting type
            let meetingType: 'internal' | 'external' = 'internal';
            if (lower.includes('client') || lower.includes('klien') || 
                lower.includes('eksternal') || lower.includes('external') ||
                lower.includes('vendor') || lower.includes('supplier') ||
                lower.includes('partner') || lower.includes('mitra')) {
                meetingType = 'external';
            }

            // Cari ruangan yang diminta
            let requestedRoom: any | null = null;
            for (const r of availableRooms) {
                const nm = normalize(r.name || r.room_name || '');
                const msgNorm = normalize(lower);
                if (nm && (msgNorm.includes(nm) || nm.includes(msgNorm))) { 
                    requestedRoom = r; 
                    break; 
                }
            }

            // Jika tidak ada, pilih ruangan dengan kapasitas cukup
            if (!requestedRoom) {
                const byCapacity = [...availableRooms]
                    .filter((r: any) => (r.capacity || 0) >= participants)
                    .sort((a:any,b:any)=> (a.capacity||999)-(b.capacity||999));
                requestedRoom = byCapacity[0] || availableRooms.sort((a:any,b:any)=>(a.capacity||0)-(b.capacity||0)).pop();
            }

            // Cek ketersediaan
            const startTime = timeInfo.start.substring(0,5);
            const duration = timeInfo.duration || 60;
            const avail = await BackendService.checkRoomAvailability(requestedRoom.id, date, startTime, duration);

            let finalRoom = requestedRoom;
            if (avail?.data?.available === false) {
                const candidates = [...availableRooms]
                    .filter((r:any)=> r.id !== requestedRoom.id && (!r.capacity || r.capacity >= participants))
                    .sort((a:any,b:any)=> (a.capacity||999)-(b.capacity||999));

                for (const r of candidates) {
                    try {
                        const c = await BackendService.checkRoomAvailability(r.id, date, startTime, duration);
                        if (c?.data?.available !== false) { 
                            finalRoom = r; 
                            break; 
                        }
                    } catch {}
                }
            }

            // Langsung ke konfirmasi tanpa menyimpan ke database di sini
            // Penyimpanan akan dilakukan di halaman konfirmasi untuk menghindari duplikasi
            const booking: Booking = {
                id: Date.now(),
                roomName: finalRoom.name,
                roomId: finalRoom.id,
                topic,
                date,
                time: timeInfo.start,
                participants,
                pic: pic || '-',
                meetingType: meetingType as any,
                foodOrder: foodOrder as any
            };

            const confirmationNote = (finalRoom.id !== requestedRoom.id)
                ? `Ruangan yang Anda minta tidak tersedia. Kami alihkan ke **${finalRoom.name}** yang kapasitasnya sesuai.`
                : `Ruangan **${finalRoom.name}** tersedia.`;

            addMessage('ai', `Memproses permintaan one-shot...\n\n${confirmationNote}\n\nPemesanan dikonfirmasi untuk ${date} pukul ${startTime}.`);
            onBookingConfirmed(booking);
            onNavigate(Page.BookingConfirmation);

            return true;
        } catch (e) {
            console.warn('Complete one-shot parsing failed, fallback to normal flow:', e);
            return false;
        }
    };

    // Fungsi untuk memproses one-shot booking yang data belum lengkap
    const processIncompleteOneShot = async (text: string, lower: string, availableRooms: any[], detectedData: any): Promise<boolean> => {
        // Masuk ke mode one-shot interaktif
        setIsOneShotMode(true);
        
        // Simpan data yang sudah terdeteksi
        const newOneShotData: Partial<Booking> = {};
        
        if (detectedData.hasTime) {
            const timeInfo = parseTimeRangeFromText(lower);
            if (timeInfo) {
                newOneShotData.time = timeInfo.start;
            }
        }
        
        if (detectedData.hasDate) {
            const date = parseDateFromText(lower);
            if (date) {
                newOneShotData.date = date;
            }
        }
        
        if (detectedData.hasPeople) {
            const participants = parseParticipantsFromText(lower);
            if (participants) {
                newOneShotData.participants = participants;
            }
        }
        
        if (detectedData.hasTopic) {
            const topic = extractTopic(lower);
            if (topic) {
                newOneShotData.topic = topic;
            }
        }
        
        if (detectedData.hasPic) {
            const pic = extractPic(lower);
            if (pic) {
                newOneShotData.pic = toTitleCase(pic);
            }
        }
        
        if (detectedData.hasRoom) {
            // Cari ruangan yang cocok
            for (const r of availableRooms) {
                const nm = normalize(r.name || r.room_name || '');
                const msgNorm = normalize(lower);
                if (nm && (msgNorm.includes(nm) || nm.includes(msgNorm))) { 
                    newOneShotData.roomName = r.name;
                    newOneShotData.roomId = r.id;
                    break; 
                }
            }
        }

        // Update data one-shot
        setOneShotData(prev => ({ ...prev, ...newOneShotData }));

        // Tentukan data apa yang masih kurang
        const missingData = [];
        if (!newOneShotData.time) missingData.push('waktu');
        if (!newOneShotData.date) missingData.push('tanggal');
        if (!newOneShotData.participants) missingData.push('jumlah peserta');
        if (!newOneShotData.roomName) missingData.push('ruangan');
        if (!newOneShotData.topic) missingData.push('topik rapat');
        if (!newOneShotData.pic) missingData.push('PIC (atas nama siapa)');

        // Buat pesan AI yang interaktif
        let aiMessage = `Saya mendeteksi permintaan booking Anda! 🎯\n\n`;
        
        if (Object.keys(newOneShotData).length > 0) {
            aiMessage += `**Data yang sudah saya catat:**\n`;
            if (newOneShotData.time) aiMessage += `• Waktu: ${newOneShotData.time}\n`;
            if (newOneShotData.date) aiMessage += `• Tanggal: ${newOneShotData.date}\n`;
            if (newOneShotData.participants) aiMessage += `• Peserta: ${newOneShotData.participants} orang\n`;
            if (newOneShotData.roomName) aiMessage += `• Ruangan: ${newOneShotData.roomName}\n`;
            if (newOneShotData.topic) aiMessage += `• Topik: ${newOneShotData.topic}\n`;
            if (newOneShotData.pic) aiMessage += `• PIC: ${newOneShotData.pic}\n`;
            aiMessage += `\n`;
        }

        if (missingData.length > 0) {
            aiMessage += `**Masih perlu melengkapi:** ${missingData.join(', ')}\n\n`;
            aiMessage += `Silakan berikan informasi yang kurang, atau pilih dari opsi di bawah:`;
        }

        // Buat quick actions berdasarkan data yang kurang
        const quickActions: QuickAction[] = [];
        
        if (!newOneShotData.time) {
            quickActions.push({
                label: 'Pilih Waktu',
                icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>,
                action: () => {
                    addMessage('ai', 'Silakan ketik waktu yang Anda inginkan (contoh: 14:00, 09:00-11:00, atau jam 2 siang)');
                }
            });
        }
        
        if (!newOneShotData.date) {
            quickActions.push({
                label: 'Pilih Tanggal',
                icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>,
                action: () => {
                    addMessage('ai', 'Silakan ketik tanggal yang Anda inginkan (contoh: besok, lusa, 30 Januari, atau 15/02/2025)');
                }
            });
        }
        
        if (!newOneShotData.participants) {
            quickActions.push({
                label: 'Jumlah Peserta',
                icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 616 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>,
                action: () => {
                    addMessage('ai', 'Silakan ketik jumlah peserta (contoh: 5 orang, sepuluh peserta, atau 3)');
                }
            });
        }
        
        if (!newOneShotData.roomName) {
            // Tampilkan opsi ruangan yang tersedia
            const roomOptions = availableRooms.slice(0, 3).map(room => ({
                label: room.name,
                icon: <BookingIcon className="w-4 h-4" />,
                action: () => {
                    setOneShotData(prev => ({ ...prev, roomName: room.name, roomId: room.id }));
                    addMessage('user', room.name);
                    checkOneShotCompletion();
                }
            }));
            quickActions.push(...roomOptions);
        }

        addMessage('ai', aiMessage, quickActions);
        return true;
    };

    // Fungsi untuk menangani input user dalam mode one-shot interaktif
    const handleOneShotInteractiveInput = async (text: string): Promise<boolean> => {
        const lower = text.toLowerCase();
        let updated = false;
        const newData: Partial<Booking> = {};

        // Cek apakah user memberikan waktu
        const timeInfo = parseTimeRangeFromText(lower);
        if (timeInfo && !oneShotData.time) {
            newData.time = timeInfo.start;
            updated = true;
        }

        // Cek apakah user memberikan tanggal
        const date = parseDateFromText(lower);
        if (date && !oneShotData.date) {
            newData.date = date;
            updated = true;
        }

        // Cek apakah user memberikan jumlah peserta
        const participants = parseParticipantsFromText(lower);
        if (participants && !oneShotData.participants) {
            newData.participants = participants;
            updated = true;
        }

        // Cek apakah user memberikan topik
        const topic = extractTopic(lower);
        if (topic && !oneShotData.topic) {
            newData.topic = topic;
            updated = true;
        }

        // Cek apakah user memberikan PIC
        const pic = extractPic(lower);
        if (pic && !oneShotData.pic) {
            newData.pic = toTitleCase(pic);
            updated = true;
        }

        // Cek apakah user memberikan ruangan
        if (!oneShotData.roomName) {
            try {
                const roomsResp = await BackendService.getAllRooms();
                const rooms: Array<any> = roomsResp.data || [];
                const msgNorm = normalize(lower);
                
                for (const r of rooms) {
                    const nm = normalize(r.name || r.room_name || '');
                    if (nm && (msgNorm.includes(nm) || nm.includes(msgNorm))) {
                        newData.roomName = r.name;
                        newData.roomId = r.id;
                        updated = true;
                        break;
                    }
                }
            } catch {}
        }

        // Update data jika ada yang baru
        if (updated) {
            setOneShotData(prev => ({ ...prev, ...newData }));
            addMessage('user', text);
            
            // Cek apakah data sudah lengkap
            const updatedData = { ...oneShotData, ...newData };
            if (updatedData.time && updatedData.date && updatedData.participants && updatedData.roomName) {
                // Data sudah lengkap, proses booking
                await processCompleteOneShotBooking(updatedData);
            } else {
                // Masih ada data yang kurang, tanyakan lagi
                await askForMissingData(updatedData);
            }
        } else {
            // Jika tidak ada data yang terdeteksi, tanyakan lagi
            addMessage('user', text);
            addMessage('ai', 'Maaf, saya tidak dapat memahami informasi yang Anda berikan. Silakan coba lagi atau gunakan format yang lebih jelas.\n\nContoh:\n• Waktu: "14:00" atau "jam 2 siang"\n• Tanggal: "besok" atau "30 Januari"\n• Peserta: "5 orang" atau "sepuluh"\n• Ruangan: nama ruangan yang tersedia');
        }

        setInput('');
        return true;
    };

    // Fungsi untuk memproses booking one-shot yang sudah lengkap
    const processCompleteOneShotBooking = async (data: Partial<Booking>) => {
        setIsOneShotMode(false);
        
        // Langsung ke konfirmasi tanpa menyimpan ke database di sini
        // Penyimpanan akan dilakukan di halaman konfirmasi untuk menghindari duplikasi
        const booking: Booking = {
            id: Date.now(),
            roomName: data.roomName!,
            roomId: data.roomId || 0,
            topic: data.topic || 'Rapat',
            date: data.date!,
            time: data.time!,
            participants: data.participants!,
            pic: data.pic || '-',
            meetingType: 'internal' as any,
            foodOrder: 'tidak' as any
        };

        addMessage('ai', `✅ **Booking berhasil!**\n\nSemua data sudah lengkap. Pemesanan dikonfirmasi untuk ${data.date} pukul ${data.time}.`);
        onBookingConfirmed(booking);
        onNavigate(Page.BookingConfirmation);
    };

    // Fungsi untuk menanyakan data yang masih kurang
    const askForMissingData = async (currentData: Partial<Booking>) => {
        const missingData = [];
        if (!currentData.time) missingData.push('waktu');
        if (!currentData.date) missingData.push('tanggal');
        if (!currentData.participants) missingData.push('jumlah peserta');
        if (!currentData.roomName) missingData.push('ruangan');
        if (!currentData.topic) missingData.push('topik rapat');
        if (!currentData.pic) missingData.push('PIC (atas nama siapa)');

        let aiMessage = `Terima kasih! Data sudah diperbarui. 🎯\n\n`;
        
        if (Object.keys(currentData).length > 0) {
            aiMessage += `**Data yang sudah saya catat:**\n`;
            if (currentData.time) aiMessage += `• Waktu: ${currentData.time}\n`;
            if (currentData.date) aiMessage += `• Tanggal: ${currentData.date}\n`;
            if (currentData.participants) aiMessage += `• Peserta: ${currentData.participants} orang\n`;
            if (currentData.roomName) aiMessage += `• Ruangan: ${currentData.roomName}\n`;
            if (currentData.topic) aiMessage += `• Topik: ${currentData.topic}\n`;
            if (currentData.pic) aiMessage += `• PIC: ${currentData.pic}\n`;
            aiMessage += `\n`;
        }

        if (missingData.length > 0) {
            aiMessage += `**Masih perlu melengkapi:** ${missingData.join(', ')}\n\n`;
            aiMessage += `Silakan berikan informasi yang kurang:`;
        }

        addMessage('ai', aiMessage);
    };

    // Fungsi untuk mengecek apakah one-shot booking sudah lengkap
    const checkOneShotCompletion = async () => {
        const { time, date, participants, roomName, topic, pic } = oneShotData;
        
        if (time && date && participants && roomName) {
            // Data sudah lengkap, proses booking
            setIsOneShotMode(false);
            
            // Langsung ke konfirmasi tanpa menyimpan ke database di sini
            // Penyimpanan akan dilakukan di halaman konfirmasi untuk menghindari duplikasi
            const booking: Booking = {
                id: Date.now(),
                roomName,
                roomId: oneShotData.roomId || 0,
                topic: topic || 'Rapat',
                date,
                time,
                participants,
                pic: pic || '-',
                meetingType: 'internal' as any,
                foodOrder: 'tidak' as any
            };

            addMessage('ai', `✅ **Booking berhasil!**\n\nSemua data sudah lengkap. Pemesanan dikonfirmasi untuk ${date} pukul ${time}.`);
            onBookingConfirmed(booking);
            onNavigate(Page.BookingConfirmation);
        }
    };



    const handleQuickAction = (actionValue: string, label?: string) => {

        console.log(`🔍 handleQuickAction called with:`, { actionValue, label, bookingState, currentBooking });

        // Handle special actions

        if (actionValue === 'start_booking') {

            sendMessage('Pesan Ruangan');

        } else if (actionValue === 'one_shot_booking') {
            // One-shot booking - beri instruksi untuk mengetik perintah lengkap
            addMessage('ai', 'Untuk One-Shot Booking, silakan ketik perintah lengkap Anda dalam satu kalimat.\n\nContoh:\n• "Pesan ruang A untuk rapat tim besok jam 14:00 dengan 5 orang"\n• "Booking ruang meeting hari ini jam 09:00-11:00 untuk presentasi client"\n• "Reservasi ruang 1 lusa jam 13:00 untuk brainstorming 8 peserta"');

        } else if (actionValue === 'Cek reservasi saya') {

            onNavigate(Page.Reservations);

        } else if (actionValue === 'Bantuan') {

            sendMessage('Bantuan');

        } else if (actionValue === 'Lanjut ke Formulir') {

            // Send the current booking data to the form

            if (currentBooking.roomName && currentBooking.topic && currentBooking.participants) {

                onAiBookingData(currentBooking);

                onNavigate(Page.Booking);

            } else {

                sendMessage('Mohon lengkapi semua data terlebih dahulu sebelum melanjutkan ke formulir.');

            }

        } else if (actionValue === 'pilih ruangan lain') {

            // Reset to room selection

            setBookingState(BookingState.ASKING_ROOM);

            setCurrentBooking(prev => ({ ...prev, roomName: undefined }));

            sendMessage('Baik, mari pilih ruangan yang lain.');

        } else if (actionValue.toLowerCase() === 'ubah waktu') {

            // Force modify time

            setBookingState(BookingState.ASKING_TIME);

            setCurrentBooking(prev => ({ ...prev, time: undefined }));

            // Tampilkan slot yang tersedia dari database

            proposeAvailableTimeSlots();

        } else if (actionValue === 'kurangi peserta') {

            // Go back to participant selection

            setBookingState(BookingState.ASKING_PARTICIPANTS);

            setCurrentBooking(prev => ({ ...prev, participants: undefined }));

            sendMessage('Baik, mari tentukan jumlah peserta yang sesuai.');

        } else if (actionValue === 'Rapat Tim' || actionValue === 'Presentasi' || actionValue === 'Meeting Client' || 

                   actionValue === 'Brainstorming' || actionValue === 'Training' || actionValue === 'Diskusi Proyek' || actionValue === 'Lainnya') {

            // Handle topic selection by sending message normally

            console.log(`📝 Topic selected via quick action: ${actionValue}`);

            console.log(`📝 Current bookingState: ${bookingState}`);

            console.log(`📝 Current currentBooking:`, currentBooking);

            sendMessage(actionValue);

        } else if (actionValue === 'internal' || actionValue === 'eksternal') {
            // Handle meeting type selection with state management
            console.log(`🔍 Meeting type quick action: ${actionValue}`);
            console.log(`🔍 Current bookingState: ${bookingState}`);
            console.log(`🔍 Current booking data:`, currentBooking);
            
            // Pastikan kita berada di state yang benar untuk meeting type
            if (bookingState === BookingState.ASKING_TIME) {
                // Jika masih di state ASKING_TIME, set waktu default dan lanjut ke meeting type
                console.log(`🔄 Still in ASKING_TIME state, setting default time and transitioning to ASKING_MEETING_TYPE`);
                setCurrentBooking(prev => ({ ...prev, time: '09:00' }));
                setBookingState(BookingState.ASKING_MEETING_TYPE);
                
                // Tunggu sebentar agar state berubah, lalu kirim pesan
                setTimeout(() => {
                    sendMessage(actionValue);
                }, 100);
            } else if (bookingState !== BookingState.ASKING_MEETING_TYPE) {
                // Jika bukan di state yang tepat, set state yang benar
                console.log(`🔄 Setting state to ASKING_MEETING_TYPE`);
                setBookingState(BookingState.ASKING_MEETING_TYPE);
                
                // Tunggu sebentar agar state berubah, lalu kirim pesan
                setTimeout(() => {
                    sendMessage(actionValue);
                }, 100);
            } else {
                // Jika sudah di state yang benar, langsung kirim pesan
                sendMessage(actionValue);
            }
        } else {

            // Send the action value as a message

            console.log(`🔍 Generic quick action: ${actionValue}`);

            sendMessage(actionValue);

        }

    };



    // Usulkan slot waktu tersedia berdasarkan DB untuk room & date terkini

    const proposeAvailableTimeSlots = async () => {

        try {

            const date = currentBooking.date || new Date().toISOString().slice(0,10);

            const duration = 60; // asumsi default

            // Cari room_id dari nama

            let roomId: number | null = null;

            if (currentBooking.roomName) {

                const roomsResp = await BackendService.getAllRooms();

                const found = (roomsResp.data || []).find((r: any) => (r.name||'').toLowerCase().includes(String(currentBooking.roomName).toLowerCase()));

                roomId = found ? found.id : null;

            }

            const candidates: string[] = [];

            // jam kerja 09:00 - 17:00, step 30 menit

            for (let h = 9; h <= 17; h++) {

                for (let m = 0; m < 60; m += 30) {

                    const hh = String(h).padStart(2,'0');

                    const mm = String(m).padStart(2,'0');

                    candidates.push(`${hh}:${mm}`);

                }

            }

            const available: string[] = [];

            if (roomId) {

                for (const t of candidates) {

                    try {

                        const res = await BackendService.checkRoomAvailability(roomId, date, t, duration);

                        if (res?.data?.available !== false) {

                            available.push(t);

                        }

                    } catch {}

                    if (available.length >= 8) break; // tampilkan maksimal 8 opsi

                }

            }

            const quicks: QuickAction[] = (available.length ? available : ['09:00','10:00','13:00','15:00']).map((t: string) => ({

                label: t,

                icon: getQuickActionIcon('ubah waktu'),

                action: () => {

                    setBookingState(BookingState.ASKING_TIME);

                    setCurrentBooking(prev => ({ ...prev, time: t }));

                    sendMessage(t);

                }

            }));

            addMessage('ai', available.length ? 'Berikut waktu yang tersedia. Silakan pilih salah satu:' : 'Silakan pilih waktu:', quicks);

        } catch (e) {

            addMessage('ai', 'Silakan ketik jam yang Anda inginkan (contoh: 14:00).');

        }

    };



    // (dikembalikan seperti semula) tidak ada ambil ruangan otomatis di sini



    const handleKeyPress = (e: React.KeyboardEvent) => {

        if (e.key === 'Enter' && !e.shiftKey) {

            e.preventDefault();

            handleSend();

        }

    };


    return (

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg h-[80vh] flex flex-col">

            <header className="p-4 border-b flex justify-between items-center">

                <div className="flex items-center">

                    <button onClick={() => onNavigate(Page.Dashboard)} className="mr-4 p-2 rounded-full hover:bg-gray-200 transition-colors">

                        <BackArrowIcon />

                    </button>

                    <AiIcon/>

                    <div className="ml-3">

                        <h2 className="text-lg font-bold text-gray-800">Asisten AI Spacio</h2>

                        <p className="text-sm text-gray-500">Online</p>

                    </div>

                </div>

            </header>

            <div className="flex-grow p-4 overflow-y-auto bg-slate-50">

                {messages.map((msg) => (

                    <div key={msg.id} className={`flex items-end ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-6`}>

                        {msg.sender === 'ai' && <div className="mr-3"><AiIcon/></div>}

                        <div className={`max-w-lg ${msg.sender === 'user' ? 'text-right' : ''}`}>

                            <div className={`px-4 py-3 rounded-2xl inline-block shadow-md ${msg.sender === 'user' ? 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none'}`}>

                                <p className="text-left" style={{ whiteSpace: 'pre-wrap'}} dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></p>

                            </div>
                            
                            {msg.quickActions && (
                                <div className={`mt-2.5 flex flex-wrap gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.quickActions.map(qa => (
                                        <button key={qa.label} onClick={qa.action} className="bg-sky-100/80 border border-sky-200 text-sky-700 font-medium rounded-lg px-3 py-2 text-sm flex items-center hover:bg-sky-200/80 transition-colors shadow-sm">
                                            {qa.icon} {qa.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                             <p className="text-xs text-gray-400 mt-1.5 px-1">{msg.timestamp}</p>
                        </div>
                        {msg.sender === 'user' && <img src={`https://i.pravatar.cc/150?u=eaanarviant`} alt="User Avatar" className="w-10 h-10 rounded-full ml-3 flex-shrink-0 shadow-md" />}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-end justify-start mb-4">
                        <div className="mr-3"><AiIcon/></div>
                        <div className="px-4 py-3 rounded-2xl bg-white text-gray-800 rounded-bl-none inline-block shadow-md">
                            <div className="flex items-center justify-center space-x-1">
                                <span className="text-sm text-gray-500 mr-2">Asisten AI sedang mengetik</span>
                                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse-fast"></span>
                                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse-fast animation-delay-150"></span>
                                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse-fast animation-delay-300"></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>
            <div className="p-4 border-t bg-white/70 rounded-b-2xl">
                <div className="relative">
                    <input 
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={isLoading ? "Menunggu balasan AI..." : "Ketik pesan Anda atau tekan Enter..."}
                        disabled={isLoading}
                        className="w-full pl-5 pr-14 py-3 border border-gray-200 bg-gray-50 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-shadow disabled:bg-gray-100 text-black placeholder-gray-700"
                    />
                    <button onClick={handleSend} disabled={!input.trim() || isLoading} className="absolute right-2 top-1/2 -translate-y-1/2 bg-cyan-500 p-2.5 rounded-full text-white hover:bg-cyan-600 transition disabled:bg-cyan-300 disabled:cursor-not-allowed">
                        <SendIcon />
                    </button>
                </div>
            </div>
        </div>

    );
};

export default AiAssistantPage;



