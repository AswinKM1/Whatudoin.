import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export function useFirestoreData(date = new Date()) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    // Auth Listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    // Data Listener
    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        // Define start and end of the selected date (07:00 to 22:00 as requested, or full day?)
        // User asked for "7am to end of the day 10pm".
        // Let's grab the full day for Safety, filters can be applied in UI.
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const q = query(
            collection(db, 'users', user.uid, 'entries'),
            where('createdAt', '>=', startOfDay),
            where('createdAt', '<=', endOfDay),
            orderBy('createdAt', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const entries = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    text: data.text,
                    timestamp: data.createdAt?.toDate() || new Date(), // Handle potential null serverTimestamp latency
                };
            });
            setData(entries);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching data:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, date]); // Refetch if user or date changes

    return { data, loading, user };
}
