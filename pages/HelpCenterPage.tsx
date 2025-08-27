import React from 'react';
import { Page } from '../types';

interface HelpCenterPageProps {
    onNavigate: (page: Page) => void;
}

const HelpCenterPage: React.FC<HelpCenterPageProps> = ({ onNavigate }) => {
    const faqs = [
        {
            question: "Bagaimana cara booking ruangan meeting?",
            answer: "Pilih menu 'Meeting Rooms', pilih ruangan yang tersedia, lalu klik 'Book Now' dan isi form booking."
        },
        {
            question: "Apakah bisa membatalkan booking?",
            answer: "Ya, Anda bisa membatalkan booking melalui menu 'Reservations' dan klik tombol 'Cancel' pada booking yang ingin dibatalkan."
        },
        {
            question: "Berapa lama durasi maksimal booking?",
            answer: "Durasi maksimal booking adalah 8 jam per hari untuk setiap ruangan."
        },
        {
            question: "Apakah ada biaya untuk booking ruangan?",
            answer: "Booking ruangan meeting adalah gratis untuk karyawan perusahaan."
        },
        {
            question: "Bagaimana jika ruangan yang diinginkan sudah dibooking?",
            answer: "Anda bisa melihat jadwal booking di halaman 'Meeting Rooms' dan memilih waktu yang tersedia."
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => onNavigate(Page.Dashboard)}
                        className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Kembali ke Dashboard
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Help Center</h1>
                    <p className="text-gray-600">Temukan jawaban untuk pertanyaan yang sering diajukan</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* FAQ Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                                <svg className="h-6 w-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Pertanyaan yang Sering Diajukan
                            </h2>
                            <div className="space-y-6">
                                {faqs.map((faq, index) => (
                                    <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            {faq.question}
                                        </h3>
                                        <p className="text-gray-600">{faq.answer}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Contact Section */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat</h3>
                            <div className="space-y-3">
                                <button
                                    onClick={() => onNavigate(Page.MeetingRooms)}
                                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Lihat Ruangan Meeting
                                </button>
                                <button
                                    onClick={() => onNavigate(Page.Reservations)}
                                    className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    Lihat Booking Saya
                                </button>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <svg className="h-5 w-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                Hubungi Kami
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center text-gray-600">
                                    <svg className="h-5 w-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <span>+62 21 1234 5678</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <svg className="h-5 w-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span>support@spacio.com</span>
                                </div>
                                <div className="pt-4">
                                    <p className="text-sm text-gray-500">
                                        Jam operasional: Senin - Jumat, 08:00 - 17:00 WIB
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* AI Assistant */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-sm p-6 text-white">
                            <h3 className="text-lg font-semibold mb-2">AI Assistant</h3>
                            <p className="text-blue-100 mb-4">
                                Dapatkan bantuan instan dengan AI Assistant kami
                            </p>
                            <button
                                onClick={() => onNavigate(Page.AiAssistant)}
                                className="w-full bg-white text-blue-600 py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                            >
                                Chat dengan AI
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpCenterPage;
