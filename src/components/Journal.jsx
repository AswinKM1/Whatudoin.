import React, { useState, useEffect } from 'react';
import { db, auth, messaging } from '../firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { GoogleAuthProvider, linkWithPopup } from 'firebase/auth';
import { getToken } from 'firebase/messaging';
import { motion, AnimatePresence } from 'framer-motion';

export default function Journal({ user }) {
    const [entry, setEntry] = useState('');
    const [saving, setSaving] = useState(false);
    const [recentEntries, setRecentEntries] = useState([]);
    const [notificationStatus, setNotificationStatus] = useState('default'); // default, granted, denied
    const [errorMsg, setErrorMsg] = useState(null);

    useEffect(() => {
        let unsubscribe = () => { };

        if (user) {
            const q = query(
                collection(db, 'users', user.uid, 'entries'),
                orderBy('createdAt', 'desc'),
                limit(5)
            );

            unsubscribe = onSnapshot(q, (snapshot) => {
                const entries = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setRecentEntries(entries);
            }, (error) => {
                console.error("Error fetching entries:", error);
                setErrorMsg("Error loading entries: " + error.message);
            });
        }

        return () => unsubscribe();
    }, [user]);

    const requestNotificationPermission = async () => {
        try {
            const permission = await Notification.requestPermission();
            setNotificationStatus(permission);

            if (permission === 'granted') {
                const token = await getToken(messaging);
                console.log('FCM Token:', token);

                if (user && token) {
                    await addDoc(collection(db, 'users', user.uid, 'tokens'), {
                        token: token,
                        createdAt: serverTimestamp()
                    });
                }
            }
        } catch (error) {
            console.error("Notification permission error:", error);
        }
    };

    const saveEntry = async () => {
        if (!entry.trim()) return;
        setSaving(true);
        try {
            await addDoc(collection(db, 'users', user.uid, 'entries'), {
                text: entry,
                createdAt: serverTimestamp()
            });
            setEntry('');
        } catch (error) {
            console.error("Error saving entry:", error);
            setErrorMsg("Failed to save: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleLinkGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await linkWithPopup(auth.currentUser, provider);
            // User is now linked! UI will update via basic auth state if we triggered a re-render, 
            // but component receives `user` prop. Parent might need to update or we force update.
            // Since `user` object in Firebase SDK mutates, a force update might be needed 
            // but typically onAuthStateChanged fires? Link doesn't always fire it.
            alert("Account linked successfully! You can now login on other devices.");
        } catch (error) {
            console.error("Link failed:", error);
            setErrorMsg("Link failed: " + error.message);
        }
    };

    return (
        <div className="fade-in">
            {errorMsg && (
                <div style={{ backgroundColor: '#f85149', color: 'white', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '0.9rem' }}>
                    {errorMsg}
                </div>
            )}
            <div className="card">
                <h2 style={{ marginTop: 0 }}>What did you do last hour?</h2>
                <textarea
                    value={entry}
                    onChange={(e) => setEntry(e.target.value)}
                    placeholder="I built a cool feature..."
                    autoFocus
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                    <button
                        onClick={requestNotificationPermission}
                        style={{
                            backgroundColor: 'transparent',
                            color: notificationStatus === 'granted' ? '#238636' : '#8b949e',
                            border: '1px solid #30363d'
                        }}
                    >
                        {notificationStatus === 'granted' ? 'Notifications Active' : 'Enable Notifications'}
                    </button>
                    {!user.isAnonymous ? (
                        <span style={{ fontSize: '0.8rem', color: '#58a6ff', alignSelf: 'center' }}>Synced ✅</span>
                    ) : (
                        <button
                            onClick={handleLinkGoogle}
                            style={{ backgroundColor: '#1f6feb', color: 'white', border: 'none', marginLeft: '8px' }}
                        >
                            Sync Data
                        </button>
                    )}
                    <button className="primary" onClick={saveEntry} disabled={saving}>
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>

            <div style={{ marginTop: '32px' }}>
                <h3 style={{ color: '#8b949e', fontSize: '1rem' }}>Recent Entries</h3>
                <AnimatePresence>
                    {recentEntries.map(item => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="card"
                            style={{ padding: '16px' }}
                        >
                            <div style={{ fontSize: '0.85rem', color: '#8b949e', marginBottom: '8px' }}>
                                {item.createdAt?.toDate().toLocaleString()}
                            </div>
                            <div style={{ whiteSpace: 'pre-wrap' }}>{item.text}</div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
