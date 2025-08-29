
import React, { useState, useRef, useEffect } from 'react';
import { Page, User } from '../types';

const UserProfileIcon = () => (
  <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
  </svg>
);

const SettingsIcon = () => (
    <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
);

const HelpIcon = () => (
  <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.79 4 4s-1.79 4-4 4c-1.742 0-3.223-.835-3.772-2M12 18h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
);

const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
);

interface HeaderProps {
    onNavigate: (page: Page) => void;
    currentPage: Page;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage, onLogout }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [userData, setUserData] = useState<any>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Get user data from localStorage instead of API
                const userDataStr = localStorage.getItem('user_data');
                if (userDataStr) {
                    const userData = JSON.parse(userDataStr);
                    setUserData(userData);
                }
            } catch (error) {
                console.error('Failed to fetch user data:', error);
            }
        };

        fetchUserData();
    }, []);

    const navItems = [
        { label: 'Dashboard', page: Page.Dashboard },
        { label: 'Meeting Room', page: Page.MeetingRooms },
        { label: 'Reservasi', page: Page.Reservations },
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header className="bg-white/80 backdrop-blur-md shadow-md sticky top-4 mx-4 md:mx-8 rounded-xl z-50">
            <div className="container mx-auto px-6 py-3 flex justify-between items-center">
                <button onClick={() => onNavigate(Page.Dashboard)} className="flex items-center cursor-pointer group">
                    <img src="/images/logoIAC.png" alt="IAC Logo" className="h-10 md:h-12 w-auto mr-3 rounded-sm" />
                    <span className="text-3xl font-bold text-cyan-500 group-hover:text-cyan-600">Spacio</span>
                </button>
                <nav className="hidden md:flex items-center space-x-8">
                    {navItems.map(item => (
                        <button 
                            key={item.label} 
                            onClick={() => onNavigate(item.page)}
                            className={`text-lg font-medium transition ${currentPage === item.page ? 'text-cyan-500 border-b-2 border-cyan-500' : 'text-gray-600 hover:text-cyan-500'}`}
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>
                <div className="relative">
                    <button onClick={() => setIsDropdownOpen(prev => !prev)} className="flex items-center space-x-2 cursor-pointer p-1 rounded-full hover:bg-gray-200/50 transition-colors">
                        <img src={`https://i.pravatar.cc/150?u=${Date.now()}`} alt="User Avatar" className="w-10 h-10 rounded-full border-2 border-cyan-500" />
                        <div className="text-right hidden sm:block">
                            <p className="font-semibold text-sm">{userData?.full_name || userData?.username || 'User'}</p>
                            <p className="text-xs text-gray-500">{userData?.username || 'Free Account'}</p>
                        </div>
                    </button>

                    {isDropdownOpen && (
                        <div ref={dropdownRef} className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 z-50 origin-top-right">
                            <div className="py-1">
                                <div className="py-1">
                                    <button 
                                        onClick={() => {
                                            onNavigate(Page.Profile);
                                            setIsDropdownOpen(false);
                                        }}
                                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                    >
                                        <UserProfileIcon />
                                        Profil
                                    </button>
                                    <button 
                                        onClick={() => {
                                            onNavigate(Page.Settings);
                                            setIsDropdownOpen(false);
                                        }}
                                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                    >
                                        <SettingsIcon />
                                        Pengaturan
                                    </button>
                                    <button 
                                        onClick={() => {
                                            onNavigate(Page.HelpCenter);
                                            setIsDropdownOpen(false);
                                        }}
                                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                    >
                                        <HelpIcon />
                                        Pusat Bantuan
                                    </button>
                                </div>
                                <div className="border-t border-gray-200"></div>
                                <button onClick={onLogout} className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 font-medium transition-colors">
                                    <LogoutIcon />
                                    Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

interface MainLayoutProps {
    children: React.ReactNode;
    onNavigate: (page: Page) => void;
    currentPage: Page;
    onLogout: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, onNavigate, currentPage, onLogout }) => (
    <div className="min-h-screen bg-gradient-to-br from-cyan-500 via-sky-600 to-blue-700">
        <div className="relative">
            <div className="relative pt-4 z-30">
                <Header onNavigate={onNavigate} currentPage={currentPage} onLogout={onLogout} />
            </div>
            <main className="container mx-auto px-4 md:px-8 pt-8 pb-8">
                {children}
            </main>
        </div>
    </div>
);

export default MainLayout;
