import React, { useState } from 'react';
import { MailIcon, LockIcon, EyeIcon, EyeOffIcon, GoogleIcon, FacebookIcon } from '../components/icons';
import { User } from '../types';

interface LoginPageProps {
    onLogin: (user: User) => void;
    onNavigateToRegister: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onNavigateToRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Simulate login success for demo purposes
            // In real app, this would call the actual API
            const userData = {
                username: email.split('@')[0], // Use email prefix as username
                full_name: email.split('@')[0], // Use email prefix as full name
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
            
            onLogin(userForApp);
        } catch (err: any) {
            alert('Terjadi kesalahan saat login');
        }
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-cyan-400 via-sky-200 to-cyan-400 flex justify-center items-center font-['Poppins'] p-4">
            <div className="container mx-auto max-w-screen-2xl max-h-[1024px] h-full flex w-full">
                {/* Left Panel */}
                <div className="hidden md:flex w-[55%] relative flex-col justify-between items-center p-10 text-white">
                    <div className="self-start">
                        {/* IAC Logo */}
                        <img src="/images/logoIAC.png" alt="IAC Logo" className="w-[220px] h-auto object-contain" />
                    </div>
                     {/* Illustration with person sitting */}
                    <img src="/images/logo orang duduk.png" alt="Person sitting illustration" className="max-w-[80%] my-5" />
                    <div className="w-full h-20"></div> {/* Spacer */}
                </div>

                {/* Right Panel */}
                <div className="w-full md:w-[45%] flex justify-center items-center p-4">
                    <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 sm:p-12 text-center">
                        <h1 className="text-3xl font-medium text-gray-800">Welcome to <span className="text-cyan-500 font-semibold">Spacio</span></h1>
                        <h2 className="text-2xl font-medium text-cyan-500 uppercase tracking-wider mt-2 mb-8">USER LOGIN</h2>
                        
                        <div className="space-y-4">
                            <button className="w-full flex items-center justify-center gap-2.5 py-3 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition font-medium text-gray-600">
                                <GoogleIcon /> Login with Google
                            </button>
                            <button className="w-full flex items-center justify-center gap-2.5 py-3 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition font-medium text-gray-600">
                                <FacebookIcon /> Login with Facebook
                            </button>
                        </div>

                        <div className="my-6 flex items-center">
                            <hr className="flex-grow border-gray-300" />
                            <span className="mx-4 text-gray-400 font-semibold text-xs">OR</span>
                            <hr className="flex-grow border-gray-300" />
                        </div>

                        <form onSubmit={handleLogin} className="text-left">
                            <div className="relative mb-4 bg-cyan-500 rounded-lg px-5 py-2.5 flex items-center">
                                <MailIcon className="w-6 h-6 text-white mr-4" />
                                <div className="w-full">
                                    <label htmlFor="email" className="text-xs text-white/90">Email</label>
                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="example@gmail.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-transparent text-white placeholder-white/70 font-medium focus:outline-none"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="relative mb-4 bg-cyan-500 rounded-lg px-5 py-2.5 flex items-center">
                                <LockIcon className="w-6 h-6 text-white mr-4" />
                                <div className="w-full">
                                    <label htmlFor="password" className="text-xs text-white/90">Password</label>
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder=""
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-transparent text-white placeholder-white/70 font-medium focus:outline-none"
                                        required
                                    />
                                </div>
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/90">
                                    {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                </button>
                            </div>
                            
                            <div className="flex justify-between items-center text-sm mb-6 text-gray-600">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input type="checkbox" className="accent-cyan-500 h-4 w-4 rounded border-gray-300 focus:ring-cyan-500 text-cyan-500" />
                                    <span>Remember me</span>
                                </label>
                                <a href="#" className="font-medium text-cyan-500 hover:underline">Forgot Password?</a>
                            </div>
                            
                            <button type="submit" className="w-full bg-cyan-500 text-white font-semibold py-3.5 rounded-lg hover:bg-cyan-600 transition shadow-md text-lg">
                                Login
                            </button>
                        </form>

                        <p className="mt-8 text-sm text-gray-600">
                            Don't have an account? <button onClick={onNavigateToRegister} className="font-medium text-cyan-500 hover:underline">Register</button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;