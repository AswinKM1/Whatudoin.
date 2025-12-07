import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Auth from './components/Auth';
import Journal from './components/Journal';
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  if (!auth) {
    return (
      <div style={{ color: 'white', textAlign: 'center', marginTop: '50px', padding: '20px' }}>
        <h2>Configuration Error</h2>
        <p>Firebase configuration is missing.</p>
        <p>Please create a <code>.env</code> file in the project root with your Firebase credentials.</p>
        <p>See <code>.env.example</code> for the required format.</p>
      </div>
    );
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setInitializing(false);
    });
    return () => unsubscribe();
  }, []);

  if (initializing) {
    return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>Loading...</div>;
  }

  return (
    <div className="App">
      {!user ? (
        <Auth onLogin={() => { }} />
      ) : (
        <Journal user={user} />
      )}
    </div>
  );
}

export default App;
