import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import Auth from './components/Auth';
import Transactions from './components/Transactions';

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // get initial user
    const sessionUser = supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
    });

    // listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  return (
    <div className="container">
      <header>
        <h1>Finance Tracker</h1>
        {user && (
          <div className="header-right">
            <span>Signed in: {user.email}</span>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                setUser(null);
              }}
            >
              Sign out
            </button>
          </div>
        )}
      </header>

      <main>
        {!user ? (
          <Auth onLogin={(u) => setUser(u)} />
        ) : (
          <Transactions user={user} />
        )}
      </main>

      <footer>
        <small>Built with Supabase & Netlify</small>
      </footer>
    </div>
  );
}
