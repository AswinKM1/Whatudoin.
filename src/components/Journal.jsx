import React, { useState, useEffect } from 'react';
import { db, auth, messaging } from '../firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { getToken } from 'firebase/messaging';
import { motion, AnimatePresence } from 'framer-motion';

export default function Journal() {
    const [entry, setEntry] = useState('');
    const [saving, setSaving] = useState(false);
    const [recentEntries, setRecentEntries] = useState([]);
    const [notificationStatus, setNotificationStatus] = useState('default'); // default, granted, denied

    useEffect(() => {
        // Load recent entries
        if (!auth.currentUser) return;

        const q = query(
            collection(db, 'users', auth.currentUser.uid, 'entries'),
            orderBy('createdAt', 'desc'),
            limit(5)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const entries = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setRecentEntries(entries);
        });

        return () => unsubscribe();
    }, []);

    const requestNotificationPermission = async () => {
        try {
            const permission = await Notification.requestPermission();
            setNotificationStatus(permission);

            if (permission === 'granted') {
                // Get token
                // VAPID key should be in env or just use default if configured in firebase console
                // For simplicity, we assume default if not provided, but ideally needs VAPID key from Console -> Project Settings -> Cloud Messaging
                const token = await getToken(messaging, {
                    // vapidKey: 'YOUR_VAPID_KEY' // Adding this later if needed
                });
                console.log('FCM Token:', token);

                // Save token to user profile
                if (auth.currentUser && token) {
                    await addDoc(collection(db, 'users', auth.currentUser.uid, 'tokens'), {
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
            await addDoc(collection(db, 'users', auth.currentUser.uid, 'entries'), {
                text: entry,
                createdAt: serverTimestamp()
            });
            setEntry('');
        } catch (error) {
            console.error("Error saving entry:", error);
            alert("Failed to save entry");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fade-in">
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
