
import React from 'react';
import { Page, type Booking } from '../types';
import { ChatIcon } from '../components/icons';

const RobotIllustration: React.FC = () => (
    <div className="relative">
        <img 
            src="/images/robot.png" 
            alt="AI Assistant Robot" 
            className="w-48 h-48 lg:w-64 lg:h-64 object-contain drop-shadow-lg"
        />
    </div>
);

const DashboardPage: React.FC<{ onNavigate: (page: Page) => void, bookings: Booking[] }> = ({ onNavigate, bookings }) => {
    console.log('DashboardPage rendered with bookings:', bookings);

    return (
        <div className="w-full text-white">
            {/* Simple Hero Section */}
            <div className="min-h-[400px] flex items-center justify-center mb-8">
                <div className="text-center">
                    <div className="flex flex-col lg:flex-row items-center justify-center gap-8 px-4">
                        <div className="lg:text-left max-w-2xl">
                            <h2 className="text-4xl md:text-5xl font-bold mb-4">Selamat Datang di Spacio!</h2>
                            <p className="text-xl mb-8">AI Meeting Room Booking System</p>
                            <button 
                                onClick={() => onNavigate(Page.AiAssistant)} 
                                className="bg-white text-cyan-600 font-bold text-xl px-8 py-4 rounded-full hover:bg-gray-100 transition"
                            >
                                Mulai dengan AI Assistant
                            </button>
                        </div>
                        <RobotIllustration />
                    </div>
                </div>
            </div>

            {/* Simple Content */}
            <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-8">
                <h3 className="text-3xl font-bold mb-6 text-center">Dashboard</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white/30 p-6 rounded-xl">
                        <h4 className="text-xl font-bold mb-4">Reservasi Terbaru</h4>
                        {bookings.length > 0 ? (
                            <p>Anda memiliki {bookings.length} reservasi</p>
                        ) : (
                            <p>Belum ada reservasi</p>
                        )}
                    </div>
                    <div className="bg-white/30 p-6 rounded-xl">
                        <h4 className="text-xl font-bold mb-4">Menu Cepat</h4>
                        <div className="space-y-2">
                            <button 
                                onClick={() => onNavigate(Page.MeetingRooms)}
                                className="block w-full text-left p-2 hover:bg-white/20 rounded"
                            >
                                Meeting Rooms
                            </button>
                            <button 
                                onClick={() => onNavigate(Page.Reservations)}
                                className="block w-full text-left p-2 hover:bg-white/20 rounded"
                            >
                                Reservasi
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;