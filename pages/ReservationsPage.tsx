
import React from 'react';
import { Page, type Booking } from '../types';
import { BackArrowIcon } from '../components/icons';

const ReservationListItem: React.FC<{ booking: Booking }> = ({ booking }) => (
  <div className="bg-white p-5 rounded-xl shadow-md border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
    <div className="flex items-center">
      <div className="bg-cyan-100 text-cyan-600 p-3 rounded-lg mr-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
      </div>
      <div>
        <h4 className="font-bold text-lg text-gray-800">{booking.topic}</h4>
        <p className="text-gray-600 font-medium">{booking.roomName}</p>
        <p className="text-sm text-gray-500 mt-1">
          {booking.date} at {booking.time} &middot; {booking.participants} participants
        </p>
        <p className="text-sm text-gray-500">
          PIC: {booking.pic} &middot; {booking.meetingType} &middot; {
            booking.foodOrder === 'tidak' ? 'Tanpa makanan' : 
            booking.foodOrder === 'ringan' ? 'Makanan Ringan' : 'Makanan Berat'
          }
        </p>
      </div>
    </div>
    <div className="flex space-x-2 self-end sm:self-center">
      <button className="text-sm bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition">Batalkan</button>
    </div>
  </div>
);


const ReservationsPage: React.FC<{ onNavigate: (page: Page) => void, bookings: Booking[] }> = ({ onNavigate, bookings }) => {
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
                    className="w-full md:flex-grow p-3 bg-white border border-gray-300 rounded-xl shadow-sm focus:ring-cyan-500 focus:border-cyan-500"
                />
                <select className="p-3 bg-white border border-gray-300 rounded-xl shadow-sm focus:ring-cyan-500 focus:border-cyan-500">
                    <option>Filter berdasarkan Tanggal</option>
                    <option>Terbaru</option>
                    <option>Terlama</option>
                </select>
            </div>

            {/* Reservations List */}
            <div className="space-y-4">
                {bookings.length > 0 ? (
                    bookings.map(booking => <ReservationListItem key={booking.id} booking={booking} />)
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
