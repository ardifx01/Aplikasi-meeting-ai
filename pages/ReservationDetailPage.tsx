import React from 'react';
import { Page, type Booking } from '../types';
import { BackArrowIcon } from '../components/icons';

interface Props {
  onNavigate: (page: Page) => void;
  booking: Booking | null;
}

const InfoRow: React.FC<{ label: string; value?: string | number }> = ({ label, value }) => (
  <div className="flex items-start justify-between py-2 border-b border-slate-100">
    <span className="text-slate-500">{label}</span>
    <span className="font-semibold text-slate-800 ml-6 text-right">{String(value ?? '—')}</span>
  </div>
);

const ReservationDetailPage: React.FC<Props> = ({ onNavigate, booking }) => {
  if (!booking) {
    return (
      <div className="bg-white/80 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-lg">
        <div className="flex items-center mb-6">
          <button onClick={() => onNavigate(Page.Reservations)} className="mr-4 p-2 rounded-full hover:bg-gray-200">
            <BackArrowIcon />
          </button>
          <h2 className="text-3xl font-bold text-gray-800">Detail Reservasi</h2>
        </div>
        <p className="text-slate-600">Data reservasi tidak ditemukan.</p>
      </div>
    );
  }

  const displayTime = (booking.time || '').slice(0,5);

  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-lg">
      <div className="flex items-center mb-6">
        <button onClick={() => onNavigate(Page.Reservations)} className="mr-4 p-2 rounded-full hover:bg-gray-200">
          <BackArrowIcon />
        </button>
        <h2 className="text-3xl font-bold text-gray-800">Detail Reservasi</h2>
      </div>

      <div className="grid md:grid-cols-5 gap-6">
        <div className="md:col-span-3 bg-white p-6 rounded-2xl border shadow-sm">
          <h3 className="text-xl font-extrabold text-slate-800">{booking.roomName}</h3>
          <p className="text-slate-600">{booking.topic || '—'}</p>
          <div className="mt-4 space-y-1">
            <InfoRow label="Tanggal" value={booking.date} />
            <InfoRow label="Waktu" value={displayTime} />
            <InfoRow label="PIC" value={booking.pic || '—'} />
            <InfoRow label="Jumlah Peserta" value={`${booking.participants} orang`} />
            <InfoRow label="Jenis Rapat" value={booking.meetingType} />
            <InfoRow label="Pesanan Makanan" value={booking.foodOrder} />
          </div>
        </div>

        <div className="md:col-span-2 bg-white p-6 rounded-2xl border shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-3">Ringkasan</h3>
          <ul className="text-slate-700 list-disc list-inside space-y-1">
            <li>Ruangan: {booking.roomName}</li>
            <li>Jadwal: {booking.date} {displayTime}</li>
            <li>Peserta: {booking.participants} orang</li>
          </ul>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button onClick={() => onNavigate(Page.Reservations)} className="bg-slate-100 text-slate-700 font-semibold py-2.5 px-4 rounded-xl border hover:bg-slate-200 transition">Kembali</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationDetailPage;



