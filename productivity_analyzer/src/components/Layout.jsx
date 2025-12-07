import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, Settings, Activity } from 'lucide-react';

export default function Layout({ children }) {
    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-background text-foreground overflow-hidden font-sans selection:bg-purple-500/30">
            {/* Ambient Background Glow */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />
            </div>

            {/* Desktop Sidebar (Hidden on Mobile) */}
            <aside className="hidden lg:flex w-64 h-screen sticky top-0 border-r border-white/10 bg-black/20 backdrop-blur-xl flex-col p-4 z-50">
                <div className="flex items-center gap-3 mb-10 pl-2">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg shadow-lg shadow-purple-500/20">
                        <Activity className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                        Prod.AI
                    </span>
                </div>

                <nav className="flex-1 space-y-2">
                    <NavItem to="/" icon={<LayoutDashboard />} label="Dashboard" />
                    <NavItem to="/history" icon={<Calendar />} label="History" />
                    <NavItem to="/settings" icon={<Settings />} label="Settings" />
                </nav>

                <div className="mt-auto p-4 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-xs text-muted-foreground">Logged in as</p>
                    <p className="text-sm font-medium truncate">User</p>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto h-screen relative scrollbar-hide pb-24 lg:pb-0">
                <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Navigation (Visible only on Mobile) */}
            <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-black/40 backdrop-blur-xl border-t border-white/10 z-50 px-6 py-3 flex justify-around items-center pb-safe">
                <MobileNavItem to="/" icon={<LayoutDashboard />} label="Dashboard" />
                <MobileNavItem to="/history" icon={<Calendar />} label="History" />
                <MobileNavItem to="/settings" icon={<Settings />} label="Settings" />
            </nav>
        </div>
    );
}

function NavItem({ to, icon, label }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) => `flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-200 group
                ${isActive
                    ? 'bg-white/10 text-white shadow-lg shadow-black/20 border border-white/5'
                    : 'text-muted-foreground hover:bg-white/5 hover:text-white'
                }`
            }
        >
            {({ isActive }) => (
                <>
                    <div className={`${isActive ? 'text-purple-400' : 'group-hover:text-purple-400 transition-colors'}`}>
                        {icon}
                    </div>
                    <span className="font-medium">{label}</span>
                </>
            )}
        </NavLink>
    );
};

function MobileNavItem({ to, icon, label }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) => `flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200
                ${isActive
                    ? 'text-purple-400'
                    : 'text-muted-foreground'
                }`
            }
        >
            {icon}
            <span className="text-[10px] font-medium">{label}</span>
        </NavLink>
    );
}
