'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function LandingLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPortal, setSelectedPortal] = useState<'store' | 'super'>('store');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please provide both your registered email and secure password.');
      return;
    }
    
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    
    try {
      // 1. Authenticate user via Supabase Auth
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (authError || !data?.session) {
        throw new Error(authError?.message || 'Authentication failed. Please verify your email and password.');
      }

      // 2. Fetch mapped store and role from database
      const { data: storeUser, error: roleError } = await supabase
        .from('store_users')
        .select(`
          role,
          store_id,
          stores (
            name
          )
        `)
        .eq('user_id', data.session.user.id)
        .limit(1)
        .maybeSingle();

      if (roleError) {
        throw new Error(`Authorization check failed: ${roleError.message}`);
      }

      if (!storeUser) {
        await supabase.auth.signOut();
        throw new Error('Access Denied: No active business licensing mapped for this account.');
      }

      const assignedStoreId = storeUser.store_id;
      const assignedStoreName = (storeUser.stores as any)?.name || 'Operations Store';

      // 3. Process routing depending on role and selected toggle portal
      if (storeUser.role === 'super_admin') {
        if (selectedPortal !== 'super') {
          await supabase.auth.signOut();
          throw new Error('Access Denied: Super Admin accounts must authenticate via "PlatePixels Admin" portal.');
        }
        
        // Save general corporate context details
        localStorage.setItem('mino_active_store_id', assignedStoreId);
        localStorage.setItem('mino_active_store_name', assignedStoreName);
        
        setSuccessMsg('System Decrypted. Loading PlatePixels Master Console...');
        setTimeout(() => {
          window.location.href = '/super-admin';
        }, 1000);
      } else if (storeUser.role === 'store_admin') {
        if (selectedPortal !== 'store') {
          await supabase.auth.signOut();
          throw new Error('Access Denied: Store Admin accounts must authenticate via "Store Operator" portal.');
        }

        // Save active store context details for the store admin screens
        localStorage.setItem('mino_active_store_id', assignedStoreId);
        localStorage.setItem('mino_active_store_name', assignedStoreName);

        setSuccessMsg('Authorization Token verified. Decrypting Store Catalog...');
        setTimeout(() => {
          window.location.href = '/store-admin/menu';
        }, 1000);
      } else {
        // Staff/Devices roles are restricted from accessing web portal
        await supabase.auth.signOut();
        throw new Error(`Access Denied: Staff role "${storeUser.role}" must authenticate on physical POS or Kiosk terminals.`);
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err?.message || 'An unexpected connection error occurred.');
    }
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
        maxWidth: '480px',
        zIndex: 1,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '28px'
      }}>
        {/* Upper Logo branding */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.6rem', fontWeight: 800, marginBottom: '6px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            <span className="text-gradient">Mino</span>Order
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>
            Enterprise Restaurant Gateway
          </p>
        </div>

        {/* Dynamic Dual-Login Card wrapper */}
        <div className="glass-card" style={{ 
          padding: '36px 32px 32px 32px', 
          width: '100%', 
          background: 'rgba(11, 15, 25, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
          borderRadius: '24px'
        }}>
          {/* Dual Toggle Pill Switcher */}
          <div style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '14px',
            padding: '4px',
            marginBottom: '28px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            position: 'relative',
            gap: '4px'
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
                borderRadius: '11px',
                color: selectedPortal === 'store' ? '#ffffff' : 'var(--text-secondary)',
                padding: '13px 16px',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)',
                boxShadow: selectedPortal === 'store' ? '0 4px 14px rgba(99, 102, 241, 0.3)' : 'none',
                letterSpacing: '0.01em'
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
                borderRadius: '11px',
                color: selectedPortal === 'super' ? '#ffffff' : 'var(--text-secondary)',
                padding: '13px 16px',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)',
                boxShadow: selectedPortal === 'super' ? '0 4px 14px rgba(99, 102, 241, 0.3)' : 'none',
                letterSpacing: '0.01em'
              }}
            >
              👑 PlatePixels Admin
            </button>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '6px', fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>
              {selectedPortal === 'super' ? 'Master Console' : 'Operations Portal'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.6, maxWidth: '320px', margin: '0 auto' }}>
              {selectedPortal === 'super' 
                ? 'Sign in with your admin credentials to access global settings.' 
                : 'Sign in to manage your store menu, orders & settings.'}
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
            <div style={{ marginBottom: '18px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '0.78rem', 
                color: 'var(--text-secondary)', 
                marginBottom: '8px', 
                fontWeight: 600, 
                letterSpacing: '0.02em' 
              }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  fontSize: '1rem',
                  pointerEvents: 'none',
                  opacity: 0.7
                }}>
                  📧
                </span>
                <input
                  type="email"
                  className="form-input"
                  placeholder={selectedPortal === 'super' ? 'admin@platepixels.com' : 'manager@restaurant.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  style={{
                    paddingLeft: '44px',
                    paddingTop: '13px',
                    paddingBottom: '13px',
                    fontSize: '0.9rem',
                    background: 'rgba(255, 255, 255, 0.025)',
                    borderColor: 'rgba(255, 255, 255, 0.07)',
                    borderRadius: '12px',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Access Password */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ 
                  fontSize: '0.78rem', 
                  color: 'var(--text-secondary)', 
                  fontWeight: 600, 
                  letterSpacing: '0.02em' 
                }}>
                  Password
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
                    fontWeight: 600,
                    transition: 'var(--transition-smooth)',
                    padding: '2px 4px'
                  }}
                >
                  {showPassword ? '🫣 Hide' : '👁️ Show'}
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  fontSize: '1rem',
                  pointerEvents: 'none',
                  opacity: 0.7
                }}>
                  🔒
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  style={{
                    paddingLeft: '44px',
                    paddingTop: '13px',
                    paddingBottom: '13px',
                    fontSize: '0.9rem',
                    background: 'rgba(255, 255, 255, 0.025)',
                    borderColor: 'rgba(255, 255, 255, 0.07)',
                    borderRadius: '12px',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ 
                width: '100%', 
                padding: '14px', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                gap: '10px',
                borderRadius: '12px',
                fontSize: '0.88rem',
                fontWeight: 700,
                boxShadow: '0 8px 24px rgba(99, 102, 241, 0.35)',
                cursor: 'pointer',
                border: 'none',
                color: '#fff'
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
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
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
        /* Login page input placeholder styling */
        .form-input::placeholder {
          color: rgba(156, 163, 175, 0.45);
          font-weight: 400;
          letter-spacing: 0.01em;
        }
        .form-input:focus::placeholder {
          color: rgba(156, 163, 175, 0.25);
        }
      `}</style>
    </div>
  );
}
