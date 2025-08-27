import React, { useState } from 'react';
import { User } from '../types';

interface LoginPageProps {
    onLogin: (user: User) => void;
    onNavigateToRegister: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onNavigateToRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    console.log('LoginPage component rendered');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Login attempt with:', { email, password });
        
        try {
            // Simulate login success for demo purposes
            const userData = {
                username: email.split('@')[0],
                full_name: email.split('@')[0],
                email: email,
                role: 'User'
            };
            
            // Save user data to localStorage
            localStorage.setItem('user_data', JSON.stringify(userData));
            
            const userForApp = {
                fullName: userData.full_name,
                email: userData.email,
                role: userData.role,
                avatar: undefined,
            };
            
            console.log('Login successful, calling onLogin with:', userForApp);
            onLogin(userForApp);
        } catch (err: any) {
            console.error('Login error:', err);
            alert('Terjadi kesalahan saat login');
        }
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-cyan-400 via-sky-200 to-cyan-400 flex justify-center items-center p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 text-center">
                <h1 className="text-3xl font-medium text-gray-800 mb-2">
                    Welcome to <span className="text-cyan-500 font-semibold">Spacio</span>
                </h1>
                <h2 className="text-xl font-medium text-cyan-500 uppercase tracking-wider mb-8">
                    USER LOGIN
                </h2>
                
                <form onSubmit={handleLogin} className="text-left space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="example@gmail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            required
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            required
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        className="w-full bg-cyan-500 text-white font-semibold py-3 rounded-lg hover:bg-cyan-600 transition shadow-md text-lg"
                    >
                        Login
                    </button>
                </form>

                <p className="mt-6 text-sm text-gray-600">
                    Don't have an account?{' '}
                    <button 
                        onClick={onNavigateToRegister} 
                        className="font-medium text-cyan-500 hover:underline"
                    >
                        Register
                    </button>
                </p>
                
                <div className="mt-4 text-xs text-gray-500">
                    <p>Debug: LoginPage is rendering</p>
                    <p>Email: {email || 'empty'}</p>
                    <p>Password: {password ? '***' : 'empty'}</p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
