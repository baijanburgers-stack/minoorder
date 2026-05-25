'use client';

import React, { useState } from 'react';

export default function LandingLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPortal, setSelectedPortal] = useState<'store' | 'super'>('store');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password credentials.');
      return;
    }
    
    setIsLoading(true);
    setErrorMsg('');
    
    // Simulate safe secure authentication redirecting to back-office dashboards
    setTimeout(() => {
      setIsLoading(false);
      alert(`Success: Redirecting to the secure ${selectedPortal === 'super' ? 'Super Admin' : 'Store Admin'} environment...`);
    }, 1500);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '24px',
    }}>
      {/* Upper Logo and Domain Reference */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '4px' }}>
          <span className="text-gradient">Mino</span>Order
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Platform Domain: minoorder.com
        </p>
      </div>

      {/* Main Glassmorphic Wrapper */}
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '460px',
        padding: '40px',
      }}>
        {/* Toggle between Store Admin & Super Admin */}
        <div style={{
          display: 'flex',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '10px',
          padding: '4px',
          marginBottom: '28px',
          border: '1px solid rgba(255,255,255,0.04)'
        }}>
          <button 
            onClick={() => setSelectedPortal('store')}
            style={{
              flex: 1,
              background: selectedPortal === 'store' ? 'var(--primary)' : 'transparent',
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff',
              padding: '10px',
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'var(--transition-smooth)'
            }}
          >
            Store Operator
          </button>
          <button 
            onClick={() => setSelectedPortal('super')}
            style={{
              flex: 1,
              background: selectedPortal === 'super' ? 'var(--primary)' : 'transparent',
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff',
              padding: '10px',
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'var(--transition-smooth)'
            }}
          >
            PlatePixels Admin
          </button>
        </div>

        <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', fontWeight: 600 }}>
          {selectedPortal === 'super' ? 'Super Administrator Console' : 'Restaurant Portal Login'}
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '24px' }}>
          Provide active tenant secrets or user credentials to authenticate.
        </p>

        {errorMsg && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid var(--danger)',
            borderRadius: '8px',
            color: '#fca5a5',
            fontSize: '0.875rem',
            padding: '12px',
            marginBottom: '20px'
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin}>
          {/* Email input field */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>
              Email Address
            </label>
            <input 
              type="email" 
              className="form-input" 
              placeholder="e.g. manager@restaurant.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          {/* Password input field */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                Access Token / Password
              </label>
              <a href="#reset" style={{ fontSize: '0.8125rem', color: 'var(--primary)', textDecoration: 'none' }}>
                Forgot token?
              </a>
            </div>
            <input 
              type="password" 
              className="form-input" 
              placeholder="••••••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', padding: '16px' }}
            disabled={isLoading}
          >
            {isLoading ? 'Decrypting Session...' : 'Authenticate Credentials'}
          </button>
        </form>

        <div style={{
          marginTop: '28px',
          textAlign: 'center',
          fontSize: '0.8125rem',
          color: 'var(--text-muted)'
        }}>
          Authorized access point. IP logging and active audit trials enabled.
        </div>
      </div>

      {/* Footer License branding */}
      <div style={{
        marginTop: '36px',
        textAlign: 'center',
        fontSize: '0.8125rem',
        color: 'var(--text-muted)'
      }}>
        © 2026 PlatePixels Corp. Licensed restaurant platform MinoOrder.
      </div>
    </div>
  );
}
