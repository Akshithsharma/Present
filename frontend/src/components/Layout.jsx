import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, LayoutDashboard, Play, Settings } from 'lucide-react';

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full transition-all duration-300">
                <div className="p-6">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        DigitalTwin
                    </h1>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    <Link to="/" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-all">
                        {user.role === 'admin' ? <User size={20} /> : <LayoutDashboard size={20} />}
                        {/* Admin Home is Saved Profiles, Student Home is Dashboard */}
                        <span>{user.role === 'admin' ? 'Saved Profiles' : 'Dashboard'}</span>
                    </Link>

                    {/* Admin Context Menu (Dynamic) */}
                    {user.role === 'admin' && (
                        <>
                            {/* Check if we are viewing a specific student */}
                            {location.pathname.includes('/student/') && (
                                <div className="mt-4 pt-4 border-t border-slate-700 animate-in fade-in">
                                    <div className="px-4 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Student Context</div>

                                    {/* We need to extract ID if possible, or reliance on the fact that we are in a sub-route */}
                                    {/* Simple trick: use the same path structure logic */}
                                    <div className="space-y-1">
                                        <div className="px-4 py-2 bg-slate-800 rounded text-blue-300 text-sm font-bold flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span> Acting as Student
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {user.role === 'student' && (
                        <>
                            <Link to={`/simulation/${user.student_id}`} className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-all">
                                <Play size={20} />
                                <span>Simulation</span>
                            </Link>
                            <Link to={`/profile/${user.student_id}`} className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-all">
                                <User size={20} />
                                <span>My Profile</span>
                            </Link>
                            <Link to="/practice" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-all">
                                <span className="text-xl">⚔️</span>
                                <span>Practice Hub</span>
                            </Link>
                        </>
                    )}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold">
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium truncate">{user.username}</p>
                            <p className="text-xs text-slate-400 capitalize">{user.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-slate-800 rounded-lg transition-colors text-sm"
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
