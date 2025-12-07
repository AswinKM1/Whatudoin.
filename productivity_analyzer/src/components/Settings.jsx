import React, { useState } from 'react';
import { Bell, LogOut, Moon, Sun, ToggleLeft, ToggleRight, User, Link as LinkIcon } from 'lucide-react';
import { auth } from '../firebase';
import { signOut, linkWithPopup, GoogleAuthProvider } from 'firebase/auth';

export default function Settings() {
    const [notifications, setNotifications] = useState(false);

    // In a real app, this would check Notification.permission
    // and maybe context state for Theme.

    const handleLinkGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await linkWithPopup(auth.currentUser, provider);
            alert("Account linked successfully!");
        } catch (error) {
            console.error("Link failed:", error);
            alert("Link failed: " + error.message);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            // App component handles redirects via auth state listener
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
                <p className="text-muted-foreground">Manage your preferences.</p>
            </header>

            <div className="bg-black/20 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
                {/* Profile Section */}
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl">
                            {auth.currentUser?.email ? auth.currentUser.email[0].toUpperCase() : 'U'}
                        </div>
                        <div>
                            <h3 className="text-white font-medium">
                                {auth.currentUser?.isAnonymous ? 'Anonymous User' : auth.currentUser?.email}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {auth.currentUser?.isAnonymous ? 'Local Account' : 'Cloud Sync Enabled'}
                            </p>
                        </div>
                    </div>
                    {auth.currentUser?.isAnonymous && (
                        <button
                            onClick={handleLinkGoogle}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-medium"
                        >
                            <LinkIcon className="w-4 h-4" />
                            Connect Google
                        </button>
                    )}
                </div>

                {/* Notifications */}
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                            <Bell className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-white font-medium">Notifications</h3>
                            <p className="text-sm text-muted-foreground">Get daily productivity reminders</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setNotifications(!notifications)}
                        className={`text-2xl transition-colors ${notifications ? 'text-purple-400' : 'text-gray-600'}`}
                    >
                        {notifications ? <ToggleRight /> : <ToggleLeft />}
                    </button>
                </div>

                {/* Sign Out */}
                <div className="p-6">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 text-rose-400 hover:text-rose-300 transition-colors font-medium"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </div>

            <div className="text-center pt-10">
                <p className="text-xs text-gray-600">Productivity Analyzer v1.0.0</p>
            </div>
        </div>
    );
}
