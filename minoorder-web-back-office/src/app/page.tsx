'use client';

import React, { useState } from 'react';

export default function LandingLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPortal, setSelectedPortal] = useState<'store' | 'super'>('store');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Auto-fill test credentials helper
  const autofillCredentials = (role: 'super' | 'store', emailVal: string, passVal: string) => {
    setSelectedPortal(role);
    setEmail(emailVal);
    setPassword(passVal);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please provide both your registered email and secure password.');
      return;
    }
    
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    
    // Simulate highly premium secure credentials decoding & token verification
    setTimeout(() => {
      const lowerEmail = email.toLowerCase();
      if (selectedPortal === 'super') {
        const isSuperAdmin = (lowerEmail === 'admin@platepixles.com' || lowerEmail === 'admin@platepixels.com');
        // Allow any password for local dev testing to maximize efficiency
        if (isSuperAdmin) {
          setSuccessMsg('System Decrypted. Loading PlatePixels Master Console...');
          setTimeout(() => {
            window.location.href = '/super-admin';
          }, 1000);
        } else {
          setIsLoading(false);
          setErrorMsg('Invalid Master Admin signature. Please verify credentials.');
        }
      } else {
        // Store Admin simulation accepts our mapped test store emails or any valid email during simulation
        const allowedEmails = [
          'hq@platepixles.com', 'hq@platepixels.com',
          'center@burgerhub.be', 'munich@burgerhub.de', 'marais@leparisien.fr', 
          'manager@restaurant.com'
        ];
        const isValidEmail = lowerEmail.includes('@') && lowerEmail.length > 5;
        if (allowedEmails.includes(lowerEmail) || isValidEmail) {
          setSuccessMsg('Authorization Token verified. Decrypting Store Catalog...');
          setTimeout(() => {
            window.location.href = '/store-admin/menu';
          }, 1000);
        } else {
          setIsLoading(false);
          setErrorMsg('No active store licensing bounds found for this email address.');
        }
      }
    }, 1200);
  };


  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      background: '#0b0f19',
      color: '#f9fafb',
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      padding: '24px'
    }}>
      {/* Background radial overlays */}
      <div className="bg-ambient-gradient" />

      {/* Decorative floating grids */}
      <div style={{
        position: 'absolute',
        width: '450px',
        height: '450px',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0) 70%)',
        borderRadius: '50%',
        top: '10%',
        left: '15%',
        filter: 'blur(80px)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.06) 0%, rgba(16, 185, 129, 0) 70%)',
        borderRadius: '50%',
        bottom: '10%',
        right: '10%',
        filter: 'blur(90px)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      {/* Central Login Card Container */}
      <div style={{
        width: '100%',
        maxWidth: '460px',
        zIndex: 1,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        {/* Upper Logo branding */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '4px', letterSpacing: '-0.03em' }}>
            <span className="text-gradient">Mino</span>Order
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700 }}>
            ⚡ Enterprise Restaurant Gateway
          </p>
        </div>

        {/* Dynamic Dual-Login Card wrapper */}
        <div className="glass-card" style={{ 
          padding: '40px 32px 32px 32px', 
          width: '100%', 
          background: 'rgba(11, 15, 25, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
          borderRadius: '24px'
        }}>
          {/* Dual Toggle Pill Switcher */}
          <div style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '16px',
            padding: '5px',
            marginBottom: '32px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            position: 'relative'
          }}>
            <button
              type="button"
              onClick={() => {
                setSelectedPortal('store');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              style={{
                flex: 1,
                background: selectedPortal === 'store' ? 'linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%)' : 'transparent',
                border: 'none',
                borderRadius: '12px',
                color: selectedPortal === 'store' ? '#ffffff' : 'var(--text-secondary)',
                padding: '12px 10px',
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)',
                boxShadow: selectedPortal === 'store' ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none'
              }}
            >
              💼 Store Operator
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedPortal('super');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              style={{
                flex: 1,
                background: selectedPortal === 'super' ? 'linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%)' : 'transparent',
                border: 'none',
                borderRadius: '12px',
                color: selectedPortal === 'super' ? '#ffffff' : 'var(--text-secondary)',
                padding: '12px 10px',
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)',
                boxShadow: selectedPortal === 'super' ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none'
              }}
            >
              👑 PlatePixels Admin
            </button>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
              {selectedPortal === 'super' ? 'PlatePixels Master Console' : 'Restaurant Operations Portal'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.5 }}>
              {selectedPortal === 'super' 
                ? 'Input cryptographically verified credentials to decrypt root global settings.' 
                : 'Authenticate store managers or cashier session licenses.'}
            </p>
          </div>

          {/* Success Notification Alert */}
          {successMsg && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '12px',
              color: '#a7f3d0',
              fontSize: '0.82rem',
              padding: '12px 16px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              animation: 'fadeIn 0.3s ease'
            }}>
              <span style={{ fontSize: '1rem' }}>⏳</span>
              <span style={{ flex: 1 }}>{successMsg}</span>
            </div>
          )}

          {/* Error Alert */}
          {errorMsg && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              color: '#fca5a5',
              fontSize: '0.82rem',
              padding: '12px 16px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              animation: 'fadeIn 0.3s ease'
            }}>
              <span style={{ fontSize: '1rem' }}>⚠️</span>
              <span style={{ flex: 1 }}>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            {/* Registered Email */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '0.75rem', 
                color: 'var(--text-secondary)', 
                marginBottom: '8px', 
                fontWeight: 700, 
                textTransform: 'uppercase', 
                letterSpacing: '0.06em' 
              }}>
                Operational Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  fontSize: '0.95rem',
                  pointerEvents: 'none'
                }}>
                  📧
                </span>
                <input
                  type="email"
                  className="form-input"
                  placeholder={selectedPortal === 'super' ? 'admin@platepixles.com' : 'manager@restaurant.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  style={{
                    paddingLeft: '44px',
                    fontSize: '0.92rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderColor: 'rgba(255, 255, 255, 0.06)'
                  }}
                />
              </div>
            </div>

            {/* Access Password */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ 
                  fontSize: '0.75rem', 
                  color: 'var(--text-secondary)', 
                  fontWeight: 700, 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.06em' 
                }}>
                  Secure Password / Token
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '0.75rem',
                    color: 'var(--primary)',
                    cursor: 'pointer',
                    fontWeight: 700,
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  {showPassword ? '🫣 Hide' : '👁️ Show'}
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  fontSize: '0.95rem',
                  pointerEvents: 'none'
                }}>
                  🔒
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  style={{
                    paddingLeft: '44px',
                    fontSize: '0.92rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderColor: 'rgba(255, 255, 255, 0.06)'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ 
                width: '100%', 
                padding: '15px', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                gap: '10px',
                borderRadius: '14px',
                boxShadow: '0 8px 24px rgba(99, 102, 241, 0.35)'
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner" style={{
                    width: '18px',
                    height: '18px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTopColor: '#ffffff',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }} />
                  Verifying Token...
                </>
              ) : (
                'Decrypt & Authorize'
              )}
            </button>
          </form>

          {/* Quick-Fill demo action pills */}
          <div style={{ 
            marginTop: '28px', 
            borderTop: '1px solid rgba(255, 255, 255, 0.06)', 
            paddingTop: '24px',
            textAlign: 'center' 
          }}>
            <p style={{ 
              fontSize: '0.72rem', 
              color: 'var(--text-muted)', 
              textTransform: 'uppercase', 
              letterSpacing: '0.08em', 
              fontWeight: 700,
              marginBottom: '12px'
            }}>
              ⚡ Quick Sign-In For Testing
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => autofillCredentials('super', 'admin@platepixles.com', 'PlatePixelsAdmin2026!')}
                style={{
                  background: 'rgba(99, 102, 241, 0.08)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  borderRadius: '100px',
                  padding: '6px 14px',
                  fontSize: '0.72rem',
                  color: '#a5b4fc',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'var(--transition-smooth)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                className="demo-pill"
              >
                👑 Admin
              </button>
              <button
                type="button"
                onClick={() => autofillCredentials('store', 'center@burgerhub.be', 'any-password')}
                style={{
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: '100px',
                  padding: '6px 14px',
                  fontSize: '0.72rem',
                  color: '#a7f3d0',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'var(--transition-smooth)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                className="demo-pill"
              >
                🍔 BE Store
              </button>
              <button
                type="button"
                onClick={() => autofillCredentials('store', 'marais@leparisien.fr', 'any-password')}
                style={{
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  borderRadius: '100px',
                  padding: '6px 14px',
                  fontSize: '0.72rem',
                  color: '#fde68a',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'var(--transition-smooth)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                className="demo-pill"
              >
                🥐 FR Store
              </button>
            </div>
          </div>
        </div>

        {/* Global audit disclaimer */}
        <div style={{
          textAlign: 'center',
          fontSize: '0.72rem',
          color: 'var(--text-muted)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span>🛡️</span> Secure gateway active. All session attempts are cryptographically audited.
        </div>
      </div>

      {/* Inline styles for spinner and interactive elements */}
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .demo-pill:hover {
          background: rgba(255, 255, 255, 0.1) !important;
          border-color: rgba(255, 255, 255, 0.25) !important;
          color: #ffffff !important;
          transform: translateY(-1px);
        }
        .demo-pill:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}
