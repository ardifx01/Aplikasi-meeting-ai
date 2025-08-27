
import React, { useState, useRef, useEffect } from 'react';
import { Page, type ChatMessage, type QuickAction, BookingState, Booking, MeetingRoom } from '../types';
import { processBookingConversation } from '../services/geminiService';
import { 
    BackArrowIcon, ChatIcon, BookingIcon, HelpIcon, SendIcon 
} from '../components/icons';
import { MEETING_ROOMS } from '../constants';

const AiIcon: React.FC = () => (
    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md flex-shrink-0">
        <img src="/images/robot.png" alt="AI Avatar" className="w-8 h-8" />
    </div>
);

const getQuickActionIcon = (label: string) => {
    const iconClass = "w-4 h-4 mr-2";
    
    switch (label.toLowerCase()) {
        case 'pesan ruangan':
        case 'pesan ruangan baru':
        case 'pesan ruangan lain':
            return <BookingIcon className={iconClass} />;
        case 'rapat tim':
            return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>;
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
                label: 'Ruang Besar (10+ orang)', 
                icon: <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>, 
                action: () => handleQuickAction('Saya butuh ruangan untuk 10 orang atau lebih', 'Ruang Besar') 
            },
            { 
                label: 'Ruang Kecil (2-5 orang)', 
                icon: <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path></svg>, 
                action: () => handleQuickAction('Saya butuh ruangan untuk 2-5 orang', 'Ruang Kecil') 
            },
            { 
                label: 'Meeting Internal', 
                icon: <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>, 
                action: () => handleQuickAction('Saya mau booking ruangan untuk meeting internal', 'Meeting Internal') 
            },
            { 
                label: 'Meeting Eksternal', 
                icon: <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"></path></svg>, 
                action: () => handleQuickAction('Saya mau booking ruangan untuk meeting eksternal', 'Meeting Eksternal') 
            },
            { 
                label: 'Dengan Makanan', 
                icon: <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>, 
                action: () => handleQuickAction('Saya mau booking ruangan dengan makanan', 'Dengan Makanan') 
            },
            { 
                label: 'Reservasi Saya', 
                icon: <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>, 
                action: () => handleQuickAction('Cek reservasi saya', 'Reservasi Saya') 
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
            text: "Halo 👋 Ada yang bisa saya bantu terkait ruang rapat? Silakan pilih salah satu opsi di bawah ini atau ketik pesan Anda.",
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
        
        addMessage('user', text);
        setInput('');
        setIsLoading(true);

        const result = await processBookingConversation(text, bookingState, currentBooking);
        
        setBookingState(result.newState);
        setCurrentBooking(result.updatedBookingData);

        if (result.finalBooking) {
            onBookingConfirmed(result.finalBooking);
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
    };

    const handleSend = () => {
        sendMessage(input);
    };

    const handleQuickAction = (actionValue: string, label?: string) => {
        sendMessage(actionValue);
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
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={isLoading ? "Menunggu balasan AI..." : "Ketik pesan Anda..."}
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
