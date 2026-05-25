'use client';

import React, { useState, useEffect } from 'react';

export default function LandingLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPortal, setSelectedPortal] = useState<'store' | 'super'>('store');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showHelper, setShowHelper] = useState(false);

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
      if (selectedPortal === 'super') {
        if (email.toLowerCase() === 'admin@platepixles.com' && password === 'PlatePixelsAdmin2026!') {
          setSuccessMsg('System Decrypted. Loading PlatePixels Master Console...');
          setTimeout(() => {
            window.location.href = '/super-admin';
          }, 1000);
        } else {
          setIsLoading(false);
          setErrorMsg('Invalid Master Admin signature. Please verify credentials.');
        }
      } else {
        // Store Admin simulation accepts our mapped test store emails
        const allowedEmails = ['hq@platepixles.com', 'center@burgerhub.be', 'munich@burgerhub.de', 'marais@leparisien.fr', 'manager@restaurant.com'];
        if (allowedEmails.includes(email.toLowerCase())) {
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
      flexDirection: 'row',
      alignItems: 'stretch',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background radial overlays */}
      <div className="bg-ambient-gradient" />

      {/* Decorative floating grids */}
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        background: 'rgba(99, 102, 241, 0.03)',
        borderRadius: '50%',
        top: '-150px',
        left: '-150px',
        filter: 'blur(100px)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        width: '600px',
        height: '600px',
        background: 'rgba(16, 185, 129, 0.02)',
        borderRadius: '50%',
        bottom: '-200px',
        right: '-200px',
        filter: 'blur(120px)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      {/* Left Column: Visual Showcase (Hidden on Mobile) */}
      <div className="showcase-container" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px',
        borderRight: '1px solid rgba(255, 255, 255, 0.05)',
        background: 'rgba(11, 15, 25, 0.4)',
        backdropFilter: 'blur(8px)',
        zIndex: 1,
        position: 'relative'
      }}>
        <div style={{ maxWidth: '540px' }}>
          <span style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            padding: '8px 16px',
            borderRadius: '100px',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#a5b4fc',
            display: 'inline-block',
            marginBottom: '28px'
          }}>
            🔐 European Fiscal Regulatory Standard
          </span>

          <h2 style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.15, marginBottom: '20px', fontFamily: 'var(--font-display)' }}>
            Empowering Modern <span className="text-gradient">Restaurants</span> across Europe.
          </h2>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '40px', lineHeight: 1.6 }}>
            MinoOrder integrates secure multi-country compliance frameworks (BE FDM, DE TSS, FR NF525) alongside proportional combo discount allocation algorithms into a unified, high-availability Cloud SaaS.
          </p>

          {/* Interactive Compliance Badges Visual Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '48px' }}>
            <div className="glass-card" style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.015)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.25rem' }}>🇧🇪</span>
                <h4 style={{ fontSize: '0.9rem', color: '#f9fafb' }}>Belgium Compliance</h4>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Fully integrated FDM cloud and serial black-box digital signing.</p>
            </div>
            <div className="glass-card" style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.015)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.25rem' }}>🇩🇪</span>
                <h4 style={{ fontSize: '0.9rem', color: '#f9fafb' }}>Germany TSS</h4>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Automated cloud Technical Safety System transaction stamping.</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>26 Tables</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Database Entities</span>
            </div>
            <div style={{ height: '32px', width: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>100%</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>RLS Security Enabled</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Secure Dual-Login Form */}
      <div style={{
        width: '100%',
        maxWidth: '560px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 48px',
        zIndex: 1,
        position: 'relative'
      }}>
        {/* Upper Logo branding */}
        <div style={{ textAlign: 'left', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '6px' }}>
            <span className="text-gradient">Mino</span>Order
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>
            Restaurateurs Central Gateway
          </p>
        </div>

        {/* Dynamic Dual-Login Card wrapper */}
        <div className="glass-card" style={{ padding: '36px', width: '100%', background: 'rgba(17, 24, 39, 0.85)' }}>
          {/* Dual Toggle Selectors */}
          <div style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '12px',
            padding: '4px',
            marginBottom: '32px',
            border: '1px solid rgba(255, 255, 255, 0.05)'
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
                background: selectedPortal === 'store' ? 'var(--primary)' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: selectedPortal === 'store' ? '#ffffff' : 'var(--text-secondary)',
                padding: '12px 10px',
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)'
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
                background: selectedPortal === 'super' ? 'var(--primary)' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: selectedPortal === 'super' ? '#ffffff' : 'var(--text-secondary)',
                padding: '12px 10px',
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)'
              }}
            >
              👑 PlatePixels Admin
            </button>
          </div>

          <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', fontWeight: 600 }}>
            {selectedPortal === 'super' ? 'PlatePixels Master Console' : 'Restaurant Operations Portal'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '28px' }}>
            {selectedPortal === 'super' 
              ? 'Input cryptographically verified credentials to decrypt root global settings.' 
              : 'Authenticate store managers or cashier session licenses.'}
          </p>

          {/* Success Notification Alert */}
          {successMsg && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid var(--accent)',
              borderRadius: '10px',
              color: '#d1fae5',
              fontSize: '0.875rem',
              padding: '14px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>⏳</span> {successMsg}
            </div>
          )}

          {/* Error Alert */}
          {errorMsg && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid var(--danger)',
              borderRadius: '10px',
              color: '#fee2e2',
              fontSize: '0.875rem',
              padding: '14px',
              marginBottom: '20px'
            }}>
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin}>
            {/* Registered Email */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Operational Email Address
              </label>
              <input
                type="email"
                className="form-input"
                placeholder={selectedPortal === 'super' ? 'admin@platepixles.com' : 'manager@restaurant.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            {/* Access Password */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Secure Password / Token
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '0.8125rem',
                    color: 'var(--primary)',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
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
              style={{ width: '100%', padding: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
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

          {/* Quick autofill helper widget */}
          <div style={{ marginTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '20px' }}>
            <button
              type="button"
              onClick={() => setShowHelper(!showHelper)}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px dashed rgba(255, 255, 255, 0.1)',
                padding: '10px',
                borderRadius: '8px',
                color: 'var(--text-secondary)',
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontWeight: 600,
                textAlign: 'center',
                transition: 'var(--transition-smooth)'
              }}
            >
              💡 {showHelper ? 'Hide Testing Accounts Helper' : 'Show Testing Accounts Helper'}
            </button>

            {showHelper && (
              <div style={{
                marginTop: '12px',
                background: 'rgba(255,255,255,0.01)',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.03)',
                padding: '12px',
                fontSize: '0.75rem'
              }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '10px', fontWeight: 500 }}>
                  Select a live testing account to auto-fill credentials instantly:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => autofillCredentials('super', 'admin@platepixles.com', 'PlatePixelsAdmin2026!')}
                    style={{
                      background: 'rgba(99, 102, 241, 0.08)',
                      color: '#a5b4fc',
                      border: '1px solid rgba(99,102,241,0.2)',
                      padding: '8px',
                      borderRadius: '6px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    👑 Super Admin: admin@platepixles.com
                  </button>
                  <button
                    type="button"
                    onClick={() => autofillCredentials('store', 'center@burgerhub.be', 'any-password')}
                    style={{
                      background: 'rgba(16, 185, 129, 0.08)',
                      color: '#a7f3d0',
                      border: '1px solid rgba(16,185,129,0.2)',
                      padding: '8px',
                      borderRadius: '6px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    🍔 BE Store: center@burgerhub.be
                  </button>
                  <button
                    type="button"
                    onClick={() => autofillCredentials('store', 'marais@leparisien.fr', 'any-password')}
                    style={{
                      background: 'rgba(245, 158, 11, 0.08)',
                      color: '#fde68a',
                      border: '1px solid rgba(245,158,11,0.2)',
                      padding: '8px',
                      borderRadius: '6px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    🥐 FR Store: marais@leparisien.fr
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Global audit disclaimer */}
        <div style={{
          marginTop: '32px',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-muted)'
        }}>
          🛡️ Secure gateway encryption enabled. Unauthorized access attempts will be audited and reported to security ledgers.
        </div>
      </div>

      {/* Inline styles for spinner animation */}
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @media (max-width: 960px) {
          .showcase-container {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
