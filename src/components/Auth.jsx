import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInAnonymously } from 'firebase/auth';
import { motion } from 'framer-motion';

export default function Auth({ onLogin }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            await signInAnonymously(auth);
            if (onLogin) onLogin();
        } catch (err) {
            console.error("Login failed", err);
            // specific check for common error
            if (err.code === 'auth/operation-not-allowed') {
                setError("Anonymous auth is not enabled in Firebase Console. Go to Build > Authentication > Sign-in method.");
            } else {
                setError("Failed to sign in: " + err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card fade-in" style={{ textAlign: 'center', marginTop: '50px' }}>
            <h2 style={{ marginBottom: '20px' }}>Hour Journal</h2>
            <p style={{ color: '#8b949e', marginBottom: '30px' }}>
                Track your day, one hour at a time.
            </p>

            {error && <p style={{ color: '#f85149', marginBottom: '20px' }}>{error}</p>}

            <button
                className="primary"
                onClick={handleLogin}
                disabled={loading}
            >
                {loading ? 'Starting...' : 'Start Journaling'}
            </button>
        </div>
    );
}
