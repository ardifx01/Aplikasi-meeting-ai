
import React, { useState } from 'react';
import { Page, type MeetingRoom, type Booking, type User } from './types';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MeetingRoomsPage from './pages/MeetingRoomsPage';
import BookingFormPage from './pages/BookingFormPage';
import AiAssistantPage from './pages/AiAssistantPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import ReservationsPage from './pages/ReservationsPage';
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
        navigateTo(Page.BookingConfirmation);
    };
    
    const handleAiBookingData = (bookingData: Partial<Booking>) => {
        setCurrentBookingData(bookingData);
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
            [Page.Reservations]: <ReservationsPage onNavigate={navigateTo} bookings={bookings} />,
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
        </div>
    );
};

export default App;