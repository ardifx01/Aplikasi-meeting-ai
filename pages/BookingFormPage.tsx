
import React, { useState, useCallback, useRef } from 'react';
import { Page, type MeetingRoom, type Booking } from '../types';
import { BackArrowIcon } from '../components/icons';
import { MEETING_ROOMS } from '../constants';

interface BookingFormPageProps {
    onNavigate: (page: Page) => void;
    room: MeetingRoom | null;
    onBookingConfirmed: (booking: Booking) => void;
    bookingData?: Partial<Booking>;
}

const BookingFormPage: React.FC<BookingFormPageProps> = ({ onNavigate, room, onBookingConfirmed, bookingData }) => {
    const [selectedRoom, setSelectedRoom] = useState<MeetingRoom | null>(room);
    const [topic, setTopic] = useState(bookingData?.topic || '');
    const [date, setDate] = useState(bookingData?.date || '');
    const [time, setTime] = useState(bookingData?.time || '');
    const [participants, setParticipants] = useState(bookingData?.participants || 1);
    const [pic, setPic] = useState(bookingData?.pic || '');
    const [meetingType, setMeetingType] = useState<'internal' | 'external'>(bookingData?.meetingType || 'internal');
    const [foodOrder, setFoodOrder] = useState<'berat' | 'ringan' | 'tidak'>(bookingData?.foodOrder || 'tidak');

    // Optimized handlers to prevent re-renders
    const handleTopicChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setTopic(e.target.value);
    }, []);

    const handlePicChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setPic(e.target.value);
    }, []);

    const handleTimeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setTime(e.target.value);
    }, []);

    const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setDate(e.target.value);
    }, []);

    const handleParticipantsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setParticipants(parseInt(e.target.value, 10));
    }, []);

    const handleMeetingTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setMeetingType(e.target.value as 'internal' | 'external');
    }, []);

    const handleFoodOrderChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setFoodOrder(e.target.value as 'berat' | 'ringan' | 'tidak');
    }, []);

    const handleRoomChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const roomId = parseInt(e.target.value, 10);
        const room = MEETING_ROOMS.find(r => r.id === roomId) || null;
        setSelectedRoom(room);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedRoom) {
            alert('Error: No room selected. Please select a room.');
            return;
        }

        if (participants > selectedRoom.capacity) {
            alert(`Jumlah peserta melebihi kapasitas ruangan. Kapasitas maksimal: ${selectedRoom.capacity} orang.`);
            return;
        }

        const newBooking: Booking = {
            id: Date.now(),
            roomName: selectedRoom.name,
            topic,
            date,
            time,
            participants,
            pic,
            meetingType,
            foodOrder,
        };
        
        onBookingConfirmed(newBooking);
    }

    const FormInput: React.FC<{ label: string; id: string; type?: string; value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean; min?: number; placeholder?: string }> = 
        ({ label, id, type = "text", value, onChange, required = true, min, placeholder }) => (
            <div>
                <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}:</label>
                <input 
                    type={type} 
                    id={id} 
                    name={id} 
                    value={value} 
                    onChange={onChange} 
                    required={required}
                    min={min}
                    placeholder={placeholder}
                    autoComplete="off"
                    spellCheck="false"
                    className="w-full p-3 bg-white border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none transition-colors" 
                />
            </div>
        );

    const FormSelect: React.FC<{ label: string; id: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: { value: string; label: string }[]; required?: boolean }> = 
        ({ label, id, value, onChange, options, required = true }) => (
            <div>
                <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}:</label>
                <select 
                    id={id} 
                    name={id} 
                    value={value} 
                    onChange={onChange} 
                    required={required}
                    className="w-full p-3 bg-white border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none transition-colors cursor-pointer" 
                >
                    {options.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
        );

    return (
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg max-w-4xl mx-auto">
             <div className="flex items-center mb-6">
                <button onClick={() => onNavigate(Page.MeetingRooms)} className="mr-4 p-2 rounded-full hover:bg-gray-200">
                    <BackArrowIcon />
                </button>
                <h2 className="text-3xl font-bold">Formulir Pemesanan</h2>
            </div>

            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label htmlFor="room" className="block text-sm font-medium text-gray-700 mb-1">Pilih Ruangan:</label>
                        <select 
                            id="room" 
                            name="room" 
                            value={selectedRoom?.id || ''} 
                            onChange={handleRoomChange} 
                            required
                            className="w-full p-3 bg-white border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none transition-colors cursor-pointer" 
                        >
                            <option value="" disabled>Pilih ruangan meeting</option>
                            {MEETING_ROOMS.map(room => (
                                <option key={room.id} value={room.id}>
                                    {room.name} ({room.capacity} orang)
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">Topik / Nama Rapat:</label>
                        <input 
                            type="text" 
                            id="topic" 
                            name="topic" 
                            defaultValue={topic}
                            onBlur={(e) => setTopic(e.target.value)}
                            placeholder="Masukkan topik atau nama rapat"
                            autoComplete="off"
                            spellCheck="false"
                            className="w-full p-3 bg-white border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none transition-colors" 
                        />
                    </div>
                    <div>
                        <label htmlFor="pic" className="block text-sm font-medium text-gray-700 mb-1">PIC (Person in Charge):</label>
                        <input 
                            type="text" 
                            id="pic" 
                            name="pic" 
                            defaultValue={pic}
                            onBlur={(e) => setPic(e.target.value)}
                            placeholder="Masukkan nama PIC"
                            autoComplete="off"
                            spellCheck="false"
                            className="w-full p-3 bg-white border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none transition-colors" 
                        />
                    </div>
                    <div>
                        <label htmlFor="participants" className="block text-sm font-medium text-gray-700 mb-1">Jumlah Peserta:</label>
                        <input 
                            type="number" 
                            id="participants" 
                            name="participants" 
                            min={1}
                            value={participants} 
                            onChange={handleParticipantsChange}
                            placeholder="Jumlah peserta"
                            autoComplete="off"
                            className="w-full p-3 bg-white border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none transition-colors" 
                        />
                    </div>
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Tanggal Rapat:</label>
                        <input 
                            type="date" 
                            id="date" 
                            name="date" 
                            value={date} 
                            onChange={handleDateChange}
                            className="w-full p-3 bg-white border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none transition-colors" 
                        />
                    </div>
                    <div>
                        <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">Waktu Rapat:</label>
                        <input 
                            type="text" 
                            id="time" 
                            name="time" 
                            defaultValue={time}
                            onBlur={(e) => setTime(e.target.value)}
                            placeholder="e.g., 14:00 - 15:00"
                            autoComplete="off"
                            spellCheck="false"
                            className="w-full p-3 bg-white border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none transition-colors" 
                        />
                    </div>
                    
                    <FormSelect 
                        label="Jenis Rapat" 
                        id="meetingType" 
                        value={meetingType} 
                        onChange={handleMeetingTypeChange}
                        options={[
                            { value: 'internal', label: 'Internal' },
                            { value: 'external', label: 'Eksternal' }
                        ]}
                    />

                    <FormSelect 
                        label="Jenis Makanan" 
                        id="foodOrder" 
                        value={foodOrder} 
                        onChange={handleFoodOrderChange}
                        options={[
                            { value: 'tidak', label: 'Tidak pesan makanan' },
                            { value: 'ringan', label: 'Makanan Ringan' },
                            { value: 'berat', label: 'Makanan Berat' }
                        ]}
                    />
                </div>

                {selectedRoom && (
                    <div className="p-4 bg-gray-100 rounded-lg text-sm">
                        <p className="font-bold text-gray-700">Detail Ruangan:</p>
                        <p><span className="font-medium">Kapasitas:</span> {selectedRoom.capacity} orang</p>
                        <p><span className="font-medium">Lokasi:</span> {selectedRoom.floor}, {selectedRoom.address}</p>
                        <p><span className="font-medium">Fasilitas:</span> {selectedRoom.facilities.join(', ')}</p>
                    </div>
                )}

                <div className="flex justify-end pt-4">
                    <button type="submit" className="bg-cyan-500 text-white font-bold py-3 px-8 rounded-xl hover:bg-cyan-600 transition shadow-lg text-lg">
                        Konfirmasi Pemesanan
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BookingFormPage;