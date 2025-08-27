
import React from 'react';
import { Page, type Booking } from '../types';

interface BookingConfirmationPageProps {
    onNavigate: (page: Page) => void;
    booking: Booking | null;
}

const SuccessIcon: React.FC = () => (
    <svg className="w-20 h-20 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
);

const BookingConfirmationPage: React.FC<BookingConfirmationPageProps> = ({ onNavigate, booking }) => {
    if (!booking) {
        return (
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg max-w-2xl mx-auto text-center">
                <h2 className="text-2xl font-bold text-red-600">Error: Booking Not Found</h2>
                <p className="text-gray-600 mt-4">Could not find the booking details. Please try again.</p>
                <button 
                    onClick={() => onNavigate(Page.Dashboard)} 
                    className="mt-6 bg-cyan-500 text-white font-bold py-3 px-6 rounded-xl hover:bg-cyan-600 transition shadow-lg"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }
    
    return (
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg max-w-2xl mx-auto text-center">
            <SuccessIcon />
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Pemesanan Berhasil!</h2>
            <p className="text-gray-600 mb-8">Ruang rapat Anda telah berhasil dikonfirmasi.</p>
            
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-left space-y-3">
                <h3 className="text-xl font-bold text-cyan-600 mb-4 border-b pb-2">Rincian Reservasi</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                    <div>
                        <p className="text-sm text-gray-500">Ruang Rapat</p>
                        <p className="font-semibold text-lg text-gray-800">{booking.roomName}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Topik Rapat</p>
                        <p className="font-semibold text-lg text-gray-800">{booking.topic}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">PIC</p>
                        <p className="font-semibold text-lg text-gray-800">{booking.pic}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Jenis Rapat</p>
                        <p className="font-semibold text-lg text-gray-800 capitalize">{booking.meetingType}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Tanggal</p>
                        <p className="font-semibold text-lg text-gray-800">{booking.date}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Waktu</p>
                        <p className="font-semibold text-lg text-gray-800">{booking.time}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Jumlah Peserta</p>
                        <p className="font-semibold text-lg text-gray-800">{booking.participants} orang</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Jenis Makanan</p>
                        <p className="font-semibold text-lg text-gray-800 capitalize">
                            {booking.foodOrder === 'tidak' ? 'Tidak pesan makanan' : 
                             booking.foodOrder === 'ringan' ? 'Makanan Ringan' : 'Makanan Berat'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <button 
                    onClick={() => onNavigate(Page.Dashboard)} 
                    className="w-full sm:w-auto bg-cyan-500 text-white font-bold py-3 px-6 rounded-xl hover:bg-cyan-600 transition shadow-lg"
                >
                    Kembali ke Dashboard
                </button>
                <button 
                    onClick={() => onNavigate(Page.MeetingRooms)} 
                    className="w-full sm:w-auto bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-xl hover:bg-gray-300 transition"
                >
                    Lihat Ruangan Lain
                </button>
            </div>
        </div>
    );
};

export default BookingConfirmationPage;
