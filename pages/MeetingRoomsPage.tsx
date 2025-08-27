
import React from 'react';
import { Page, type MeetingRoom, type Booking } from '../types';
import { MEETING_ROOMS } from '../constants';
import { BackArrowIcon } from '../components/icons';

const MeetingRoomCard: React.FC<{ room: MeetingRoom, onBook: (room: MeetingRoom) => void, isBooked: boolean }> = ({ room, onBook, isBooked }) => {
    const cardClasses = `bg-white rounded-2xl shadow-lg overflow-hidden transform transition ${isBooked ? 'opacity-60 cursor-not-allowed' : 'hover:-translate-y-2 cursor-pointer'}`;
    
    const handleCardClick = () => {
        if (!isBooked) {
            onBook(room);
        }
    }

    return (
        <div className={cardClasses} onClick={handleCardClick}>
            <div className="p-6 relative">
                 {isBooked && (
                    <div className="absolute inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center rounded-2xl z-10">
                        <span className="text-white text-xl font-bold bg-black/50 px-4 py-2 rounded-lg">Sudah Dipesan</span>
                    </div>
                )}
                <p className="text-sm text-gray-500">{room.floor}</p>
                <h3 className="text-xl font-bold text-gray-800 mt-1 mb-4 truncate" title={room.name}>{room.name}</h3>
                <div className="h-40 rounded-lg mb-4 overflow-hidden">
                    <img 
                        src={room.image} 
                        alt={room.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/images/meeting-rooms/default-room.svg';
                        }}
                    />
                </div>
                <div className="space-y-2 text-sm text-gray-700">
                    <p><span className="font-semibold">No Of Seat:</span> {room.capacity}</p>
                    <p><span className="font-semibold">Address:</span> {room.address}</p>
                    <p><span className="font-semibold">Facilities:</span> {room.facilities.join(', ')}</p>
                </div>
            </div>
        </div>
    );
};

interface MeetingRoomsPageProps {
  onNavigate: (page: Page) => void;
  onBookRoom: (room: MeetingRoom) => void;
  bookings: Booking[];
}
const MeetingRoomsPage: React.FC<MeetingRoomsPageProps> = ({ onNavigate, onBookRoom, bookings }) => {
    const bookedRoomNames = new Set(bookings.map(b => b.roomName));

    return (
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg">
            <div className="flex items-center mb-6">
                <button onClick={() => onNavigate(Page.Dashboard)} className="mr-4 p-2 rounded-full hover:bg-gray-200">
                    <BackArrowIcon />
                </button>
                <h2 className="text-3xl font-bold">Meeting Rooms</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {MEETING_ROOMS.map(room => (
                    <MeetingRoomCard 
                        key={room.id} 
                        room={room} 
                        onBook={onBookRoom} 
                        isBooked={bookedRoomNames.has(room.name)}
                    />
                ))}
            </div>
        </div>
    );
};

export default MeetingRoomsPage;