import React from 'react';
import { Page, User } from '../types';
import { BackArrowIcon } from '../components/icons';

interface ProfilePageProps {
  onNavigate: (page: Page) => void;
  user: User;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate, user }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg">
      <div className="flex items-center mb-6">
        <button onClick={() => onNavigate(Page.Dashboard)} className="mr-4 p-2 rounded-full hover:bg-gray-200">
          <BackArrowIcon />
        </button>
        <h2 className="text-3xl font-bold">Profil</h2>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Profile Header */}
        <div className="text-center mb-8">
          <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
            {user.avatar ? (
              <img src={user.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
            ) : (
              (user.fullName || 'U').charAt(0).toUpperCase()
            )}
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{user.fullName || 'User'}</h3>
          <p className="text-gray-600">{user.email || 'user@example.com'}</p>
                      <span className="inline-block mt-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {user.role || 'User'}
            </span>
        </div>

        {/* Profile Information */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Informasi Pribadi</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">Nama Lengkap</span>
              <span className="font-medium">{user.fullName || 'User'}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">Email</span>
              <span className="font-medium">{user.email || 'user@example.com'}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">Role</span>
              <span className="font-medium">{user.role || 'User'}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-600">Status Akun</span>
              <span className="text-green-600 font-medium">Aktif</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={() => onNavigate(Page.Settings)}
            className="p-4 bg-blue-50 hover:bg-blue-100 rounded-xl text-left transition-colors"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h5 className="font-semibold text-gray-800">Pengaturan</h5>
                <p className="text-sm text-gray-600">Ubah preferensi akun</p>
              </div>
            </div>
          </button>

          <button 
            onClick={() => onNavigate(Page.HelpCenter)}
            className="p-4 bg-green-50 hover:bg-green-100 rounded-xl text-left transition-colors"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h5 className="font-semibold text-gray-800">Pusat Bantuan</h5>
                <p className="text-sm text-gray-600">Dapatkan bantuan</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;


