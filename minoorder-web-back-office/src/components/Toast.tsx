'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const ICONS: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

const COLORS: Record<ToastType, { bg: string; border: string; icon: string; bar: string }> = {
  success: {
    bg: 'rgba(16,185,129,0.08)',
    border: 'rgba(16,185,129,0.25)',
    icon: '#10b981',
    bar: '#10b981',
  },
  error: {
    bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.25)',
    icon: '#ef4444',
    bar: '#ef4444',
  },
  warning: {
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.25)',
    icon: '#f59e0b',
    bar: '#f59e0b',
  },
  info: {
    bg: 'rgba(99,102,241,0.08)',
    border: 'rgba(99,102,241,0.25)',
    icon: '#a5b4fc',
    bar: '#6366f1',
  },
};

// Individual toast item
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const c = COLORS[toast.type];
  const [exiting, setExiting] = React.useState(false);

  const dismiss = () => {
    setExiting(true);
    setTimeout(() => onRemove(toast.id), 280);
  };

  React.useEffect(() => {
    const timer = setTimeout(() => dismiss(), 4200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        padding: '12px 14px',
        borderRadius: '10px',
        background: 'rgba(13,18,30,0.96)',
        border: `1px solid ${c.border}`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(16px)',
        minWidth: '280px',
        maxWidth: '420px',
        overflow: 'hidden',
        transform: exiting ? 'translateX(110%)' : 'translateX(0)',
        opacity: exiting ? 0 : 1,
        transition: 'transform 0.28s cubic-bezier(0.4,0,1,1), opacity 0.28s ease',
      }}
    >
      {/* Left accent bar */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: c.bar, borderRadius: '10px 0 0 10px' }} />

      {/* Icon circle */}
      <div style={{
        width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
        background: c.bg, border: `1px solid ${c.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.75rem', fontWeight: 900, color: c.icon,
      }}>
        {ICONS[toast.type]}
      </div>

      {/* Message */}
      <p style={{ flex: 1, fontSize: '0.78rem', fontWeight: 500, color: '#f1f5f9', lineHeight: 1.45, margin: 0, paddingTop: '2px' }}>
        {toast.message}
      </p>

      {/* Close button */}
      <button
        onClick={dismiss}
        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', fontSize: '1rem', lineHeight: 1, padding: '0 2px', flexShrink: 0, transition: 'color 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
      >
        ×
      </button>

      {/* Auto-dismiss progress bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'rgba(255,255,255,0.04)' }}>
        <div style={{
          height: '100%',
          background: c.bar,
          opacity: 0.5,
          animation: 'toastProgress 4.2s linear forwards',
        }} />
      </div>

      <style>{`
        @keyframes toastProgress {
          from { width: 100%; }
          to { width: 0%; }
        }
        @keyframes toastSlideIn {
          from { transform: translateX(110%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// Toast container + provider
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = `toast_${Date.now()}_${counterRef.current++}`;
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast stack — fixed bottom-right */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        alignItems: 'flex-end',
        pointerEvents: 'none',
      }}>
        {toasts.map(toast => (
          <div key={toast.id} style={{ pointerEvents: 'auto', animation: 'toastSlideIn 0.28s cubic-bezier(0.34,1.56,0.64,1) forwards' }}>
            <ToastItem toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
