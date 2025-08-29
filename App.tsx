
import React, { useState } from 'react';
import { Page, type MeetingRoom, type Booking, type User } from './types';
import { BackendService } from './src/services/backendService';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MeetingRoomsPage from './pages/MeetingRoomsPage';
import BookingFormPage from './pages/BookingFormPage';
import AiAssistantPage from './pages/AiAssistantPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import ReservationsPage from './pages/ReservationsPage';
import ReservationDetailPage from './pages/ReservationDetailPage';
import HistoryPage from './pages/HistoryPage';
import { addHistory } from './services/historyService';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import HelpCenterPage from './pages/HelpCenterPage';
import MainLayout from './components/MainLayout';

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentPage, setCurrentPage] = useState<Page>(Page.Login);
    const [selectedRoom, setSelectedRoom] = useState<MeetingRoom | null>(null);
    const [currentBookingData, setCurrentBookingData] = useState<Partial<Booking>>({});
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
    const [detailBooking, setDetailBooking] = useState<Booking | null>(null);
    
    // Mock user data
    const [user, setUser] = useState<User>({
        fullName: 'Eaan Arviant',
        email: 'user@example.com',
        role: 'User',
        avatar: undefined,
    });

    const handleLogin = (loggedInUser: User) => {
        setUser({
            fullName: loggedInUser.fullName || 'User',
            email: loggedInUser.email || 'user@example.com',
            role: loggedInUser.role || 'User',
            avatar: loggedInUser.avatar,
        });
        setIsAuthenticated(true);
        setCurrentPage(Page.Dashboard);
    };

    const handleLogout = () => {
        // Clear user data from localStorage
        localStorage.removeItem('user_data');
        localStorage.removeItem('session_token');
        
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
        } else {
             setCurrentPage(page);
        }
    };

    const handleBookRoom = (room: MeetingRoom) => {
        setSelectedRoom(room);
        navigateTo(Page.Booking);
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
            // Show confirmation dialog
            const confirmed = window.confirm('Apakah Anda yakin ingin membatalkan pemesanan ini? Data akan dihapus dari database.');
            if (!confirmed) return;

            console.log('Cancelling booking with ID:', id);
            
            // Call backend API to delete booking from database
            await BackendService.cancelBooking(id);
            
            // Remove from local state only after successful API call
            setBookings(prev => prev.filter(b => b.id !== id));
            
            alert('Pemesanan berhasil dibatalkan dan dihapus dari database.');

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
        } catch (error) {
            console.error('Error cancelling booking:', error);
            alert('Gagal membatalkan pemesanan. Mohon coba lagi.');
        }
    };

    const renderContent = () => {
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
            [Page.MeetingRooms]: <MeetingRoomsPage onNavigate={navigateTo} onBookRoom={handleBookRoom} bookings={bookings} />,
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
    );
};

export default App;