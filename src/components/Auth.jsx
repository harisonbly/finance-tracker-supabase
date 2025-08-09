import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Auth({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password
        });
        if (error) throw error;
        setMessage('Sign up successful. Check your email to confirm if required.');
        onLogin(data.user ?? null);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        onLogin(data.user ?? null);
      }
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleMagicLink(e) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      setMessage('Magic link sent to your email.');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>{isSignUp ? 'Create account' : 'Sign in'}</h2>

      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input required value={email} onChange={(e) => setEmail(e.target.value)} type="email" />

        <label>Password</label>
        <input required value={password} onChange={(e) => setPassword(e.target.value)} type="password" />

        <div className="row">
          <button type="submit" disabled={loading}>{isSignUp ? 'Sign up' : 'Sign in'}</button>
          <button type="button" onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? 'Have an account? Sign in' : "Don't have account? Sign up"}
          </button>
        </div>
      </form>

      <hr />

      <form onSubmit={handleMagicLink}>
        <label>Or sign in with magic link</label>
        <input required value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
        <button type="submit" disabled={loading}>Send magic link</button>
      </form>

      {message && <p className="message">{message}</p>}
    </div>
  );
}
