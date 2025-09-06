
import React, { useState, useEffect } from 'react';
import { Page, type MeetingRoom, type Booking, type User } from './types';
import { BackendService } from './src/services/backendService';
import { ApiService } from './src/config/api';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MeetingRoomsPage from './pages/MeetingRoomsPage';
import RoomDetailPage from './pages/RoomDetailPage';
import EditRoomPage from './pages/EditRoomPage';
import AddRoomPage from './pages/AddRoomPage';
import BookingFormPage from './pages/BookingFormPage';
import AiAssistantPage from './pages/AiAssistantPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import ReservationsPage from './pages/ReservationsPage';
import ReservationDetailPage from './pages/ReservationDetailPage';
import HistoryPage from './pages/HistoryPage';
import { addHistory } from './services/historyService';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import HelpCenterPage from './pages/HelpCenter';
import MainLayout from './components/MainLayout';
import { LanguageProvider } from './contexts/LanguageContext';
import { DarkModeProvider } from './contexts/DarkModeContext';

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentPage, setCurrentPage] = useState<Page>(Page.Login);
    const [selectedRoom, setSelectedRoom] = useState<MeetingRoom | null>(null);
    const [currentBookingData, setCurrentBookingData] = useState<Partial<Booking>>({});
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
    const [detailBooking, setDetailBooking] = useState<Booking | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // Mock user data
    const [user, setUser] = useState<User>({
        fullName: 'Eaan Arviant',
        email: 'user@example.com',
        role: 'User',
        avatar: undefined,
    });

    // Check session on app load
    useEffect(() => {
        const checkSession = async () => {
            try {
                const sessionToken = localStorage.getItem('session_token');
                const userDataStr = localStorage.getItem('user_data');
                const savedPage = localStorage.getItem('current_page');
                
                console.log('Session check - Token:', sessionToken ? 'Present' : 'Missing');
                console.log('Session check - User data:', userDataStr ? 'Present' : 'Missing');
                console.log('Session check - Saved page:', savedPage);
                
                if (sessionToken && userDataStr) {
                    // Validate session token
                    console.log('Validating session token...');
                    const userId = await ApiService.getUserBySessionToken(sessionToken);
                    console.log('Session validation result:', userId ? 'Valid' : 'Invalid');
                    
                    if (userId) {
                        // Session is valid, restore user data
                        const userData = JSON.parse(userDataStr);
                        console.log('Restoring user data for ID:', userData.id);
                        
                        setUser({
                            fullName: userData.full_name || userData.username || 'User',
                            email: userData.email || 'user@example.com',
                            role: userData.role || 'User',
                            avatar: userData.avatar,
                        });
                        // Ensure user_data has the id field
                        if (!userData.id) {
                            // Don't set default ID for new users - let them have empty dashboard
                            console.log('New user detected - will show empty dashboard');
                        }
                        setIsAuthenticated(true);
                        
                        // Restore the last visited page or default to Dashboard
                        const pageToRestore = savedPage && Object.values(Page).includes(savedPage as unknown as Page) 
                            ? (savedPage as unknown as Page)
                            : Page.Dashboard;
                        console.log('Restoring page:', pageToRestore);
                        setCurrentPage(pageToRestore);
                        
                        // Load bookings from server
                        if (userData.id) {
                            await loadBookingsFromServer(userData.id);
                        }
                    } else {
                        // Session is invalid, clear storage
                        console.log('Session invalid, clearing storage');
                        localStorage.removeItem('session_token');
                        localStorage.removeItem('user_data');
                        localStorage.removeItem('current_page');
                    }
                } else {
                    console.log('No session token or user data found');
                }
            } catch (error) {
                console.error('Error checking session:', error);
                // Clear invalid session data
                localStorage.removeItem('session_token');
                localStorage.removeItem('user_data');
                localStorage.removeItem('current_page');
            } finally {
                setIsLoading(false);
            }
        };

        checkSession();
    }, []);

    // Load bookings from server
    const loadBookingsFromServer = async (userId: number) => {
        try {
            // Load MySQL bookings (form-based)
            const serverBookingsRes = await ApiService.getUserBookings(userId);
            const serverBookings = serverBookingsRes.data || [];
            
            // Load AI bookings from ai_bookings_success table
            const aiBookingsRes = await ApiService.getAIBookingsByUserId(userId);
            const aiBookings = aiBookingsRes.data || [];
            
            // Format server bookings
            const serverBookingsFormatted: Booking[] = serverBookings.map((b: any): Booking => ({
                id: b.id,
                roomId: b.room_id || 0,
                roomName: b.room_name || `Room ${b.room_id}` || '—',
                topic: b.topic,
                date: b.meeting_date,
                time: b.meeting_time,
                participants: Number(b.participants || 0),
                pic: (b.pic && String(b.pic).trim()) ? b.pic : '-',
                meetingType: (b.meeting_type === 'external' ? 'external' : 'internal'),
                foodOrder: (b.food_order === 'berat' ? 'berat' : b.food_order === 'ringan' ? 'ringan' : 'tidak')
            }));

            // Format AI bookings
            const aiBookingsFormatted: Booking[] = aiBookings.map((b: any): Booking => ({
                id: `ai_${b.id}`, // Prefix dengan 'ai_' untuk membedakan dari form bookings
                roomId: b.room_id || 0,
                roomName: b.room_name || `Room ${b.room_id}` || '—',
                topic: b.topic,
                date: b.meeting_date,
                time: b.meeting_time,
                participants: Number(b.participants || 0),
                pic: (b.pic && String(b.pic).trim()) ? b.pic : '-',
                meetingType: (b.meeting_type === 'external' ? 'external' : 'internal'),
                foodOrder: (b.food_order === 'berat' ? 'berat' : b.food_order === 'ringan' ? 'ringan' : 'tidak')
            }));

            // Combine and deduplicate bookings
            const allBookings = [...serverBookingsFormatted, ...aiBookingsFormatted];
            const uniqueBookings = allBookings.filter((booking, index, self) => 
                index === self.findIndex(b => b.id === booking.id)
            );
            
            setBookings(uniqueBookings);
        } catch (error) {
            console.error('Error loading bookings from server:', error);
        }
    };

    const handleLogin = (loggedInUser: User) => {
        setUser({
            fullName: loggedInUser.fullName || 'User',
            email: loggedInUser.email || 'user@example.com',
            role: loggedInUser.role || 'User',
            avatar: loggedInUser.avatar,
        });
        
        // Ensure user_data has the id field
        const userDataStr = localStorage.getItem('user_data');
        if (userDataStr) {
            try {
                const userData = JSON.parse(userDataStr);
                if (!userData.id) {
                    // Don't set default ID for new users - let them have empty dashboard
                    console.log('New user detected - will show empty dashboard');
                }
            } catch (e) {
                // If parsing fails, don't create default user data
                console.log('Failed to parse user data - will show empty dashboard');
            }
        }
        
        setIsAuthenticated(true);
        setCurrentPage(Page.Dashboard);
        
        // Load bookings from server after login
        if (userDataStr) {
            try {
                const userData = JSON.parse(userDataStr);
                if (userData.id) {
                    loadBookingsFromServer(userData.id);
                }
            } catch (e) {
                console.log('Failed to parse user data for loading bookings');
            }
        }
    };

    const handleLogout = () => {
        // Clear user data from localStorage
        localStorage.removeItem('user_data');
        localStorage.removeItem('session_token');
        localStorage.removeItem('current_page');
        
        // Reset app state
        setIsAuthenticated(false);
        setCurrentPage(Page.Login);
        setSelectedRoom(null);
        setBookings([]);
        setConfirmedBooking(null);
    };

    const navigateTo = (page: Page) => {
        if (page === Page.Booking && !selectedRoom && currentPage !== Page.MeetingRooms) {
             alert("Silakan pilih ruangan terlebih dahulu dari halaman Meeting Room.");
             setCurrentPage(Page.MeetingRooms);
             // Save the redirected page to localStorage
             localStorage.setItem('current_page', Page.MeetingRooms.toString());
        } else {
             setCurrentPage(page);
             // Save current page to localStorage for session persistence
             localStorage.setItem('current_page', page.toString());
        }
    };

    const handleBookRoom = (room: MeetingRoom, bookingData?: Partial<Booking>) => {
        setSelectedRoom(room);
        if (bookingData) {
            setCurrentBookingData(bookingData);
        }
        navigateTo(Page.Booking);
    };

    const handleRoomDetail = (room: MeetingRoom) => {
        setSelectedRoom(room);
        navigateTo(Page.RoomDetail);
    };

    const handleEditRoom = (room: MeetingRoom) => {
        setSelectedRoom(room);
        navigateTo(Page.EditRoom);
    };

    const handleRoomUpdated = (updatedRoom: MeetingRoom) => {
        setSelectedRoom(updatedRoom);
        // Update rooms list if needed
        // This could trigger a refresh of the rooms list
    };

    const handleAddRoom = () => {
        navigateTo(Page.AddRoom);
    };

    const handleRoomAdded = (newRoom: MeetingRoom) => {
        // Room sudah disimpan ke database, tidak perlu update state lokal
        console.log('New room added:', newRoom);
    };

    const handleDeleteRoom = (roomId: number) => {
        // Room sudah dihapus dari database, tidak perlu update state lokal
        console.log('Room deleted:', roomId);
        // Navigate back to meeting rooms page
        navigateTo(Page.MeetingRooms);
    };

    const handleConfirmBooking = (newBooking: Booking) => {
        setBookings(prev => [newBooking, ...prev]);
        setConfirmedBooking(newBooking);
        setCurrentBookingData({});
        // Catatan: histori 'Selesai' tidak dibuat saat konfirmasi.
        // Status 'Selesai' hanya dihistori ketika user menekan tombol Selesai pada halaman Reservasi.
        navigateTo(Page.BookingConfirmation);
    };
    
    const handleAiBookingData = (bookingData: Partial<Booking>) => {
        setCurrentBookingData(bookingData);
    };

    const handleCancelBooking = async (id: number) => {
        try {
            // Check if this is an AI booking
            const isAiBooking = String(id).startsWith('ai_');
            
            // Show confirmation dialog
            const confirmed = window.confirm('Apakah Anda yakin ingin membatalkan pemesanan ini? Data akan dihapus dari database secara permanen.');
            if (!confirmed) return;

            console.log('Cancelling booking with ID:', id);
            
            if (isAiBooking) {
                // For AI bookings, call the AI cancel endpoint
                await BackendService.cancelBooking(id);
                console.log('AI booking cancelled from App via API:', id);
            } else {
                // For form bookings, call backend API
                await BackendService.cancelBooking(Number(id));
            }
            
            // Remove from local state
            setBookings(prev => prev.filter(b => b.id !== id));
            
            // Simpan ke histori lokal sebagai "Dibatalkan"
            const hist = bookings.find(b => b.id === id);
            if (hist) {
                addHistory({
                    id: hist.id,
                    roomName: hist.roomName,
                    topic: hist.topic,
                    date: hist.date,
                    time: hist.time,
                    participants: hist.participants,
                    status: 'Dibatalkan'
                });
            }
            
            // Show success message
            alert('Pemesanan berhasil dibatalkan dan dihapus dari database!');
        } catch (error) {
            console.error('Error cancelling booking:', error);
            alert('Gagal membatalkan pemesanan. Mohon coba lagi.');
        }
    };

    const renderContent = () => {
        // Show loading while checking session
        if (isLoading) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-500 via-sky-600 to-blue-700">
                    <div className="text-center text-white">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                        <p>Memuat aplikasi...</p>
                    </div>
                </div>
            );
        }

        if (!isAuthenticated) {
            switch (currentPage) {
                case Page.Register:
                    return <RegisterPage onNavigateToLogin={() => navigateTo(Page.Login)} />;
                default:
                    return <LoginPage onLogin={handleLogin} onNavigateToRegister={() => navigateTo(Page.Register)} />;
            }
        }
        
        const pageComponents: { [key in Page]?: React.ReactNode } = {
            [Page.Dashboard]: <DashboardPage onNavigate={navigateTo} bookings={bookings} />,
            [Page.MeetingRooms]: <MeetingRoomsPage onNavigate={navigateTo} onBookRoom={handleBookRoom} onRoomDetail={handleRoomDetail} onAddRoom={handleAddRoom} />,
            [Page.RoomDetail]: <RoomDetailPage onNavigate={navigateTo} onBookRoom={handleBookRoom} room={selectedRoom} bookings={bookings} onEditRoom={handleEditRoom} onDeleteRoom={handleDeleteRoom} />,
            [Page.EditRoom]: <EditRoomPage onNavigate={navigateTo} room={selectedRoom} onRoomUpdated={handleRoomUpdated} />,
            [Page.AddRoom]: <AddRoomPage onNavigate={navigateTo} onRoomAdded={handleRoomAdded} />,
            [Page.Booking]: <BookingFormPage onNavigate={navigateTo} room={selectedRoom} onBookingConfirmed={handleConfirmBooking} bookingData={currentBookingData} />,
            [Page.AiAssistant]: <AiAssistantPage onNavigate={navigateTo} onBookingConfirmed={handleConfirmBooking} onAiBookingData={handleAiBookingData} />,
            [Page.BookingConfirmation]: <BookingConfirmationPage onNavigate={navigateTo} booking={confirmedBooking} />,
            [Page.Reservations]: <ReservationsPage onNavigate={navigateTo} bookings={bookings} onCancelBooking={handleCancelBooking} onRemoveLocalBooking={(id:any)=> setBookings(prev=> prev.filter(b=> String(b.id) !== String(id)))} />, 
            [Page.ReservationDetail]: <ReservationDetailPage onNavigate={navigateTo} booking={detailBooking} />, 
            [Page.History]: <HistoryPage onNavigate={navigateTo} />, 
            [Page.Profile]: <ProfilePage onNavigate={navigateTo} user={user} />,
            [Page.Settings]: <SettingsPage onNavigate={navigateTo} />,
            [Page.HelpCenter]: <HelpCenterPage onNavigate={navigateTo} />
        };

        return (
            <MainLayout onLogout={handleLogout} onNavigate={navigateTo} currentPage={currentPage} user={user}>
                {pageComponents[currentPage] || <DashboardPage onNavigate={navigateTo} bookings={bookings} />}
            </MainLayout>
        );
    };

    return (
        <LanguageProvider>
            <DarkModeProvider>
                <div className="min-h-screen">
                    {renderContent()}
                {/* Bridge event from ReservationsPage to set detail booking and navigate */}
                {(() => {
                    if (typeof window !== 'undefined') {
                        window.addEventListener('set_detail_booking', () => {
                            const raw = sessionStorage.getItem('detail_booking');
                            if (raw) {
                                try {
                                    setDetailBooking(JSON.parse(raw));
                                    navigateTo(Page.ReservationDetail);
                                } catch {}
                            }
                        });
                        window.addEventListener('storage', (e: any) => {
                            if (e.key === 'booking_refresh') {
                                if (currentPage === Page.Reservations) {
                                    // no-op UI will refresh from component
                                }
                            }
                        });
                    }
                    return null;
                })()}
                </div>
            </DarkModeProvider>
        </LanguageProvider>
    );
};

export default App;