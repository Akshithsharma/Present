import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, UserCircle, Activity, Library, LogOut, BookOpen, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
    const location = useLocation();
    const { user, logout } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const navItems = [
        { path: '/', label: 'Home', icon: LayoutDashboard },
        { path: '/practice', label: 'Practice Hub', icon: BookOpen },
        { path: '/saved-dashboards', label: user?.role === 'admin' ? 'All Dashboards' : 'My Dashboard', icon: Library },
        { path: '/simulation', label: 'Simulation', icon: Activity },
    ];

    if (!user) return null;

    return (
        <div className="flex h-screen bg-slate-50 transition-all duration-300">
            {/* Sidebar */}
            <aside
                className={`bg-white border-r border-slate-200 flex flex-col justify-between transition-all duration-300 ease-in-out relative ${isCollapsed ? 'w-20' : 'w-64'
                    }`}
            >
                {/* Toggle Button */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-9 bg-white border border-slate-200 rounded-full p-1 shadow-sm hover:bg-slate-50 z-10"
                >
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>

                <div>
                    <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'} transition-all`}>
                        <Activity className="h-8 w-8 text-primary shrink-0" />
                        <div className={`overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                            <h1 className="text-xl font-bold text-primary whitespace-nowrap">
                                Digital Twin
                            </h1>
                        </div>
                    </div>

                    {!isCollapsed && (
                        <p className="text-xs text-slate-500 mb-4 px-6 whitespace-nowrap overflow-hidden transition-opacity duration-300">
                            Logged in: <span className="font-semibold">{user.username}</span>
                        </p>
                    )}

                    <nav className="px-3 space-y-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all group ${isActive
                                            ? 'bg-primary/10 text-primary font-medium'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                        } ${isCollapsed ? 'justify-center' : ''}`}
                                    title={isCollapsed ? item.label : ''}
                                >
                                    <Icon className="h-5 w-5 shrink-0" />
                                    <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-32 opacity-100'
                                        }`}>
                                        {item.label}
                                    </span>

                                    {/* Tooltip for collapsed state */}
                                    {isCollapsed && (
                                        <div className="absolute left-16 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                                            {item.label}
                                        </div>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-4 border-t border-slate-100">
                    <button
                        onClick={logout}
                        className={`flex items-center gap-3 px-3 py-3 rounded-lg w-full text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors ${isCollapsed ? 'justify-center' : ''
                            }`}
                        title={isCollapsed ? "Logout" : ""}
                    >
                        <LogOut className="h-5 w-5 shrink-0" />
                        <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
                            }`}>
                            Logout
                        </span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-4 md:p-8 transition-all duration-300">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
