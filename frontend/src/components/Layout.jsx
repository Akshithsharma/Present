import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, UserCircle, Activity, Library, LogOut, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
    const location = useLocation();
    const { user, logout } = useAuth();

    const navItems = [
        { path: '/', label: 'Home', icon: LayoutDashboard },
        { path: '/practice', label: 'Practice Hub', icon: BookOpen },
        { path: '/saved-dashboards', label: user?.role === 'admin' ? 'All Dashboards' : 'My Dashboard', icon: Library },
        // Edit Profile moved to Dashboard page
        { path: '/simulation', label: 'Simulation', icon: Activity },
    ];

    if (!user) return null;

    return (
        <div className="flex h-screen bg-slate-50">
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between">
                <div>
                    <div className="p-6">
                        <h1 className="text-xl font-bold text-primary flex items-center gap-2">
                            <Activity className="h-6 w-6" />
                            Digital Twin
                        </h1>
                        <p className="text-xs text-slate-500 mt-1 ml-8">
                            Logged in as: <span className="font-semibold">{user.username}</span> ({user.role})
                        </p>
                    </div>
                    <nav className="px-4 space-y-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                        ? 'bg-primary/10 text-primary font-medium'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                >
                                    <Icon className="h-5 w-5" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-4 border-t border-slate-100">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                        <LogOut className="h-5 w-5" />
                        Logout
                    </button>
                </div>
            </aside>
            <main className="flex-1 overflow-auto p-8">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
