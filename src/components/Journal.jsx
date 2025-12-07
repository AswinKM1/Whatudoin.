import React, { useState, useEffect } from 'react';
import { db, auth, messaging } from '../firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, where, Timestamp } from 'firebase/firestore';
import { GoogleAuthProvider, linkWithPopup } from 'firebase/auth';
import { getToken } from 'firebase/messaging';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { FaChevronLeft, FaChevronRight, FaFileDownload, FaCalendarAlt, FaClock, FaSave, FaBell, FaCheckCircle, FaGoogle } from 'react-icons/fa';

export default function Journal({ user }) {
    const [activeTab, setActiveTab] = useState('today'); // 'today' | 'history'
    const [selectedDate, setSelectedDate] = useState(new Date());

    return (
        <div className="fade-in" style={{ maxWidth: '100%', overflowX: 'hidden' }}>
            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <button
                    onClick={() => setActiveTab('today')}
                    style={{
                        background: 'none',
                        color: activeTab === 'today' ? '#8b5cf6' : 'var(--text-color)',
                        borderBottom: activeTab === 'today' ? '2px solid #8b5cf6' : 'none',
                        borderRadius: 0,
                        padding: '8px 16px',
                        fontSize: '1rem',
                        fontWeight: '600'
                    }}
                >
                    Today
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    style={{
                        background: 'none',
                        color: activeTab === 'history' ? '#8b5cf6' : 'var(--text-color)',
                        borderBottom: activeTab === 'history' ? '2px solid #8b5cf6' : 'none',
                        borderRadius: 0,
                        padding: '8px 16px',
                        fontSize: '1rem',
                        fontWeight: '600'
                    }}
                >
                    History
                </button>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'today' ? (
                    <TodayView key="today" user={user} />
                ) : (
                    <HistoryView key="history" user={user} />
                )}
            </AnimatePresence>
        </div>
    );
    <button onClick={handleExportToday} className="secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '6px' }}>
        <FaFileDownload /> Export
    </button>
                    )
}
                </div >

    <AnimatePresence>
        {todaysEntries.length === 0 ? (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>
                No entries for today yet.
            </motion.p>
        ) : (
            todaysEntries.map(item => (
                <EntryCard key={item.id} item={item} />
            ))
        )}
    </AnimatePresence>
            </div >
        </motion.div >
    );
}

function HistoryView({ user }) {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch entries for selected date
    useEffect(() => {
        if (!user) return;
        setLoading(true);

        const start = startOfDay(selectedDate);
        const end = endOfDay(selectedDate);

        const q = query(
            collection(db, 'users', user.uid, 'entries'),
            where('createdAt', '>=', Timestamp.fromDate(start)),
            where('createdAt', '<=', Timestamp.fromDate(end)),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setEntries(docs);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, selectedDate]);

    const handleExportHistory = () => {
        const dataStr = JSON.stringify(entries, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `journal_${format(selectedDate, 'yyyy-MM-dd')}.json`;
        link.click();
    };

    // Calendar logic
    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const monthStart = startOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart);
    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endOfWeek(endOfMonth(monthStart))
    });

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
        >
            <div className="card" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <button onClick={prevMonth} className="secondary" style={{ padding: '8px' }}><FaChevronLeft /></button>
                    <h3 style={{ margin: 0 }}>{format(currentMonth, 'MMMM yyyy')}</h3>
                    <button onClick={nextMonth} className="secondary" style={{ padding: '8px' }}><FaChevronRight /></button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center', marginBottom: '8px' }}>
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                        <div key={d} style={{ fontSize: '0.8rem', color: '#6b7280' }}>{d}</div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                    {calendarDays.map((day, idx) => {
                        const isCurrentMonth = isSameMonth(day, currentMonth);
                        const isSelected = isSameDay(day, selectedDate);
                        const isTodayDate = isToday(day);

                        return (
                            <button
                                key={idx}
                                onClick={() => setSelectedDate(day)}
                                style={{
                                    padding: '0',
                                    height: '36px',
                                    borderRadius: '8px',
                                    background: isSelected ? '#8b5cf6' : 'transparent',
                                    color: isSelected ? 'white' : isCurrentMonth ? 'var(--text-color)' : '#4b5563',
                                    border: isTodayDate && !isSelected ? '1px solid #8b5cf6' : 'none',
                                    fontSize: '0.9rem'
                                }}
                            >
                                {format(day, 'd')}
                            </button>
                        )
                    })}
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{format(selectedDate, 'MMMM do')}</h3>
                {entries.length > 0 && (
                    <button onClick={handleExportHistory} className="secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '6px' }}>
                        <FaFileDownload /> Export
                    </button>
                )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>Loading...</div>
                ) : entries.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>No entries found for this day.</div>
                ) : (
                    entries.map(item => (
                        <EntryCard key={item.id} item={item} />
                    ))
                )}
            </div>
        </motion.div>
    );
}

function EntryCard({ item }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
            style={{ padding: '16px', margin: 0, borderLeft: '4px solid #8b5cf6' }}
        >
            <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaClock size={12} /> {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
            </div>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{item.text}</div>
        </motion.div>
    );
}
