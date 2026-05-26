'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MenuProvider } from './context';
import { ToastProvider } from '../../../components/Toast';
import '../../../styles/globals.css';

export default function StoreAdminMenuLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isMenuTabActive = pathname.startsWith('/store-admin/menu/categories') ||
                          pathname.startsWith('/store-admin/menu/items') ||
                          pathname.startsWith('/store-admin/menu/modifiers') ||
                          pathname.startsWith('/store-admin/menu/deals');

  const getActiveMainTab = () => {
    if (pathname === '/store-admin/menu') return 'dashboard';
    if (isMenuTabActive) return 'menu';
    if (pathname.startsWith('/store-admin/menu/combo-sandbox')) return 'combo_engine';
    if (pathname.startsWith('/store-admin/menu/vat-rules')) return 'vat_rules';
    if (pathname.startsWith('/store-admin/menu/printers')) return 'printers';
    if (pathname.startsWith('/store-admin/menu/shifts')) return 'shifts';
    if (pathname.startsWith('/store-admin/menu/orders')) return 'orders';
    return 'dashboard';
  };

  const activeMainTab = getActiveMainTab();

  return (
    <ToastProvider>
      <MenuProvider>
        <StoreAdminMenuLayoutInner pathname={pathname} activeMainTab={activeMainTab}>
          {children}
        </StoreAdminMenuLayoutInner>
      </MenuProvider>
    </ToastProvider>
  );
}

import { useMenu } from './context';
import { translations } from './translations';

function StoreAdminMenuLayoutInner({
  children,
  pathname,
  activeMainTab,
}: {
  children: React.ReactNode;
  pathname: string;
  activeMainTab: string;
}) {
  const { language, setLanguage } = useMenu();
  const t = translations[language];
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isMenuTabActive = pathname.startsWith('/store-admin/menu/categories') ||
                          pathname.startsWith('/store-admin/menu/items') ||
                          pathname.startsWith('/store-admin/menu/modifiers') ||
                          pathname.startsWith('/store-admin/menu/deals');

  const layoutT = (() => {
    switch (language) {
      case 'fr': return {
        activeSession: 'SESSION ACTIVE', role: 'Opérateur', signOut: 'Déconnexion',
        signOutConfirm: 'Êtes-vous sûr de vouloir vous déconnecter ?',
        branch: 'Bruxelles · Centrale',
      };
      case 'nl': return {
        activeSession: 'ACTIEVE SESSIE', role: 'Winkelbeheerder', signOut: 'Afmelden',
        signOutConfirm: 'Weet u zeker dat u wilt afmelden?',
        branch: 'Brussel · Centraal',
      };
      default: return {
        activeSession: 'ACTIVE SESSION', role: 'Store Operator', signOut: 'Sign Out',
        signOutConfirm: 'Sign out and clear the active store session?',
        branch: 'Brussels · Central',
      };
    }
  })();

  const navItems = [
    { id: 'dashboard',    name: t.dashboard,     icon: '📈', href: '/store-admin/menu' },
    { id: 'menu',         name: t.menuArchitect, icon: '🍔', href: '/store-admin/menu/categories' },
    { id: 'combo_engine', name: language === 'fr' ? 'Formules Combo' : language === 'nl' ? 'Combo Deals' : 'Combo Deals', icon: '🎁', href: '/store-admin/menu/combo-sandbox' },
    { id: 'vat_rules',    name: t.vatRules,      icon: '📐', href: '/store-admin/menu/vat-rules' },
    { id: 'shifts',       name: t.shifts,        icon: '🔑', href: '/store-admin/menu/shifts' },
    { id: 'orders',       name: t.vatAudits,     icon: '🧾', href: '/store-admin/menu/orders' },
  ];

  const subTabs = [
    { subId: 'categories', name: t.categories, href: '/store-admin/menu/categories', active: pathname === '/store-admin/menu/categories' },
    { subId: 'items',      name: t.products,   href: '/store-admin/menu/items',      active: pathname === '/store-admin/menu/items' },
    { subId: 'modifiers',  name: t.modifiers,  href: '/store-admin/menu/modifiers',  active: pathname === '/store-admin/menu/modifiers' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0b0f19', color: '#f9fafb', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>

      {/* Sidebar mobile overlay backdrop */}
      <div className={`sidebar-backdrop ${isSidebarOpen ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)} />

      {/* ── LEFT SIDEBAR ─────────────────────────────── */}
      <div className={`sidebar-nav ${isSidebarOpen ? 'sidebar-open' : ''}`}
        style={{ display: 'flex', flexDirection: 'column', padding: '20px 14px' }}>

        {/* Brand mini-header */}
        <div style={{ marginBottom: '20px', paddingLeft: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: 'linear-gradient(135deg, var(--primary), #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: '#fff', flexShrink: 0 }}>M</div>
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em', display: 'block', lineHeight: 1.1 }}>
              <span className="text-gradient">Mino</span>Order
            </span>
            <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em' }}>{t.adminConsole}</span>
          </div>
        </div>

        {/* Nav section label */}
        <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)', letterSpacing: '0.1em', fontWeight: 800, textTransform: 'uppercase', paddingLeft: '4px', marginBottom: '6px' }}>
          {language === 'fr' ? 'NAVIGATION' : language === 'nl' ? 'NAVIGATIE' : 'NAVIGATION'}
        </span>

        {/* Sidebar nav items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, overflowY: 'auto' }}>
          {navItems.map(tab => {
            const isActive = activeMainTab === tab.id;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`sidebar-link${isActive ? ' active' : ''}`}
              >
                <span style={{ fontSize: '0.9rem', flexShrink: 0 }}>{tab.icon}</span>
                <span style={{ fontSize: '0.79rem', fontWeight: isActive ? 700 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tab.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Sidebar footer */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* User info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 800, fontSize: '0.62rem', flexShrink: 0, color: '#fff' }}>SC</div>
            <div style={{ minWidth: 0 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f1f5f9', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Sarah Connor</span>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{layoutT.role}</span>
            </div>
          </div>
          {/* Branch label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '3px 8px', borderRadius: '5px', background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.12)' }}>
            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#6ee7b7' }}>{layoutT.branch}</span>
          </div>
          {/* Sign out button */}
          <button
            onClick={() => { if (confirm(layoutT.signOutConfirm)) window.location.href = '/'; }}
            style={{ width: '100%', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '7px', color: '#fca5a5', padding: '6px 10px', cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', transition: 'var(--transition-smooth)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.14)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.07)'}
          >
            🚪 {layoutT.signOut}
          </button>
        </div>
      </div>

      {/* ── MAIN VIEWPORT ────────────────────────────── */}
      <div className="main-viewport" style={{ background: 'var(--bg-primary)' }}>
        <div className="bg-ambient-gradient" style={{ pointerEvents: 'none' }} />

        {/* ── GLOBAL HEADER BAR ── */}
        <div style={{ marginBottom: isMenuTabActive ? '10px' : '16px' }}>
          <div className="glass-card" style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '9px 16px', borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.07)',
            background: 'rgba(13, 18, 30, 0.8)',
            backdropFilter: 'blur(14px)',
          }}>
            {/* Left: Hamburger + Store logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)} title="Toggle Sidebar">☰</button>
              <div style={{ width: '30px', height: '30px', borderRadius: '7px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.18)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1rem' }}>🍔</div>
              <div>
                <h2 style={{ fontSize: '0.88rem', fontWeight: 800, margin: 0, color: '#fff', lineHeight: 1.1 }}>BurgerHub</h2>
                <span style={{ fontSize: '0.6rem', color: 'var(--accent)', fontWeight: 600 }}>{layoutT.branch}</span>
              </div>
            </div>

            {/* Center: Language switcher */}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '2px', gap: '2px', backdropFilter: 'blur(8px)' }}>
              {[{ code: 'en', label: '🇬🇧 EN' }, { code: 'fr', label: '🇫🇷 FR' }, { code: 'nl', label: '🇳🇱 NL' }].map(lang => {
                const sel = language === lang.code;
                return (
                  <button key={lang.code} onClick={() => setLanguage(lang.code as any)}
                    style={{ background: sel ? 'linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%)' : 'transparent', border: 'none', borderRadius: '5px', color: sel ? '#fff' : 'rgba(255,255,255,0.45)', padding: '4px 10px', cursor: 'pointer', fontWeight: 700, fontSize: '0.67rem', transition: 'all 0.18s ease' }}>
                    {lang.label}
                  </button>
                );
              })}
            </div>

            {/* Right: MinoOrder brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ textAlign: 'right' }}>
                <h3 style={{ fontSize: '0.88rem', fontWeight: 800, margin: 0, lineHeight: 1.1 }}>
                  <span className="text-gradient">Mino</span>Order
                </h3>
                <span style={{ fontSize: '0.57rem', color: 'var(--accent)', letterSpacing: '0.04em', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '3px', marginTop: '1px' }}>
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--accent)', display: 'inline-block' }} />
                  {t.secureGateway.replace('MinoOrder - ', '').toUpperCase()}
                </span>
              </div>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'linear-gradient(135deg, var(--primary) 0%, #10b981 100%)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 800, fontSize: '0.75rem', color: '#fff' }}>M</div>
            </div>
          </div>

          {/* ── Sub-tab navigation bar (Menu section only) ── */}
          {isMenuTabActive && (
            <div style={{ display: 'flex', background: 'rgba(13,18,30,0.7)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '3px', gap: '3px', marginTop: '8px', boxShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>
              {subTabs.map(sub => (
                <Link key={sub.subId} href={sub.href}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: sub.active ? 'linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%)' : 'transparent',
                    borderRadius: '6px', color: sub.active ? '#fff' : 'rgba(255,255,255,0.45)',
                    padding: '5px 8px', fontWeight: sub.active ? 700 : 500,
                    fontSize: '0.72rem', textDecoration: 'none',
                    boxShadow: sub.active ? '0 3px 8px rgba(99,102,241,0.2)' : 'none',
                    transition: 'var(--transition-smooth)',
                    letterSpacing: '0.01em',
                  }}
                >
                  {sub.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Dynamic page children */}
        {children}
      </div>
    </div>
  );
}
