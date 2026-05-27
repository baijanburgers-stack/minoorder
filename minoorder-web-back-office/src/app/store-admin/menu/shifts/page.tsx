'use client';

import React, { useState, useMemo } from 'react';
import { useMenu } from '../context';

export default function ShiftsPage() {
  const { shifts } = useMenu();

  // Filter state
  const [filterTerminal, setFilterTerminal] = useState<string>('all');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');

  // Modal state
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [ticketType, setTicketType] = useState<'x' | 'z'>('z');

  // Extract unique terminal names for filter dropdown
  const terminalNames = useMemo(() => {
    const names = Array.from(new Set(shifts.map((s: any) => s.terminalName))) as string[];
    return names.sort();
  }, [shifts]);

  // Filtered shifts
  const filteredShifts = useMemo(() => {
    return shifts.filter((s: any) => {
      // Terminal filter
      if (filterTerminal !== 'all' && s.terminalName !== filterTerminal) return false;
      // Date range filter (based on opened date)
      if (filterDateFrom) {
        const shiftDate = s.opened.substring(0, 10);
        if (shiftDate < filterDateFrom) return false;
      }
      if (filterDateTo) {
        const shiftDate = s.opened.substring(0, 10);
        if (shiftDate > filterDateTo) return false;
      }
      return true;
    });
  }, [shifts, filterTerminal, filterDateFrom, filterDateTo]);

  // Summary stats
  const stats = useMemo(() => {
    const activeShifts = filteredShifts.filter((s: any) => s.closed === null);
    const closedShifts = filteredShifts.filter((s: any) => s.closed !== null);
    const totalRevenue = filteredShifts.reduce((sum: number, s: any) => sum + (s.grossRevenue || 0), 0);
    const totalOrders = filteredShifts.reduce((sum: number, s: any) => sum + (s.totalOrders || 0), 0);
    return { active: activeShifts.length, closed: closedShifts.length, totalRevenue, totalOrders };
  }, [filteredShifts]);

  const clearFilters = () => {
    setFilterTerminal('all');
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  const hasActiveFilters = filterTerminal !== 'all' || filterDateFrom || filterDateTo;

  const openTicket = (shift: any, type: 'x' | 'z') => {
    setSelectedTicket(shift);
    setTicketType(type);
  };

  const terminalBadge = (name: string, type: string) => {
    const isKiosk = type === 'kiosk';
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '3px 10px',
        borderRadius: '6px',
        fontSize: '0.72rem',
        fontWeight: 700,
        background: isKiosk ? 'rgba(245, 158, 11, 0.08)' : 'rgba(99, 102, 241, 0.08)',
        color: isKiosk ? '#fbbf24' : '#a5b4fc',
        border: `1px solid ${isKiosk ? 'rgba(245, 158, 11, 0.18)' : 'rgba(99, 102, 241, 0.18)'}`,
      }}>
        <span style={{ fontSize: '0.8rem' }}>{isKiosk ? '🖥️' : '💳'}</span>
        {name}
      </span>
    );
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 className="page-title" style={{ marginBottom: '4px' }}>
          <span className="text-gradient">Cashier Shifts</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.5 }}>
          View X and Z reports synced from POS terminals and kiosks. Shifts can only be opened and closed from the terminal devices.
        </p>
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }} className="stat-grid-4">
        {[
          { label: 'Active Now', value: stats.active, icon: '🟢', color: 'var(--accent)', bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.15)' },
          { label: 'Closed Shifts', value: stats.closed, icon: '🔒', color: '#a5b4fc', bg: 'rgba(99,102,241,0.06)', border: 'rgba(99,102,241,0.15)' },
          { label: 'Total Orders', value: stats.totalOrders, icon: '🧾', color: '#fbbf24', bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.15)' },
          { label: 'Gross Revenue', value: `€ ${stats.totalRevenue.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: '💰', color: '#34d399', bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.15)' },
        ].map((stat, i) => (
          <div key={i} className="glass-card" style={{
            padding: '16px 18px',
            background: stat.bg,
            border: `1px solid ${stat.border}`,
            borderRadius: '12px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stat.label}</span>
              <span style={{ fontSize: '1rem' }}>{stat.icon}</span>
            </div>
            <span style={{ fontSize: '1.3rem', fontWeight: 800, color: stat.color, fontFamily: 'var(--font-display)' }}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass-card" style={{
        padding: '16px 20px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        flexWrap: 'wrap',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '12px',
      }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0 }}>
          🔍 Filters
        </span>

        {/* Terminal dropdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>Terminal</label>
          <select
            className="form-input"
            value={filterTerminal}
            onChange={e => setFilterTerminal(e.target.value)}
            style={{
              padding: '7px 12px',
              fontSize: '0.8rem',
              minWidth: '140px',
              borderRadius: '8px',
              cursor: 'pointer',
              appearance: 'auto',
            }}
          >
            <option value="all">All Terminals</option>
            {terminalNames.map((name: string) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        {/* Date from */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>From Date</label>
          <input
            type="date"
            className="form-input"
            value={filterDateFrom}
            onChange={e => setFilterDateFrom(e.target.value)}
            style={{
              padding: '7px 12px',
              fontSize: '0.8rem',
              minWidth: '140px',
              borderRadius: '8px',
              cursor: 'pointer',
              colorScheme: 'dark',
            }}
          />
        </div>

        {/* Date to */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>To Date</label>
          <input
            type="date"
            className="form-input"
            value={filterDateTo}
            onChange={e => setFilterDateTo(e.target.value)}
            style={{
              padding: '7px 12px',
              fontSize: '0.8rem',
              minWidth: '140px',
              borderRadius: '8px',
              cursor: 'pointer',
              colorScheme: 'dark',
            }}
          />
        </div>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '8px',
              color: '#fca5a5',
              padding: '7px 14px',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: 600,
              marginTop: '14px',
              transition: 'var(--transition-smooth)',
            }}
          >
            ✕ Clear
          </button>
        )}

        {/* Result count */}
        <div style={{ marginLeft: 'auto', marginTop: '14px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {filteredShifts.length} shift{filteredShifts.length !== 1 ? 's' : ''} found
          </span>
        </div>
      </div>

      {/* Active Terminals Summary */}
      {filteredShifts.some((s: any) => s.closed === null) && (
        <div className="glass-card" style={{
          padding: '20px 24px',
          marginBottom: '16px',
          border: '1px solid rgba(16,185,129,0.18)',
          background: 'rgba(16,185,129,0.03)',
          borderRadius: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', animation: 'pulse 2s ease-in-out infinite' }} />
            <span style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Active Terminals</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {filteredShifts.filter((s: any) => s.closed === null).map((s: any) => (
              <div key={s.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '10px',
                flex: '1 1 200px',
                minWidth: '200px',
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '8px',
                  background: s.terminalType === 'kiosk' ? 'rgba(245,158,11,0.1)' : 'rgba(99,102,241,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.1rem', flexShrink: 0,
                }}>
                  {s.terminalType === 'kiosk' ? '🖥️' : '💳'}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>{s.terminalName}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {s.cashier} · {s.totalOrders} orders · € {s.grossRevenue.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shifts Table */}
      <div className="glass-card" style={{ padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
        <h3 style={{ fontSize: '0.95rem', marginBottom: '16px', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
          Shift History & Tickets
        </h3>
        
        {filteredShifts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '2rem', display: 'block', marginBottom: '8px' }}>📭</span>
            <p style={{ fontSize: '0.85rem' }}>No shifts match your filters.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  {['Terminal', 'Operator', 'Opened', 'Closed', 'Orders', 'Revenue', 'Status', 'Tickets'].map(h => (
                    <th key={h} style={{
                      paddingBottom: '10px',
                      fontSize: '0.68rem',
                      color: 'var(--text-muted)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      textAlign: h === 'Tickets' ? 'right' : 'left',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredShifts.sort((a: any, b: any) => b.opened.localeCompare(a.opened)).map((s: any) => (
                  <tr key={s.id} style={{
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    transition: 'background 0.15s ease',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.015)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 8px 12px 0' }}>
                      {terminalBadge(s.terminalName, s.terminalType)}
                    </td>
                    <td style={{ padding: '12px 8px', fontWeight: 600, fontSize: '0.82rem' }}>{s.cashier}</td>
                    <td style={{ padding: '12px 8px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      {s.opened.substring(0, 10)}<br />
                      <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>{s.opened.substring(11)}</span>
                    </td>
                    <td style={{ padding: '12px 8px', fontSize: '0.78rem' }}>
                      {s.closed ? (
                        <>
                          <span style={{ color: 'var(--text-muted)' }}>{s.closed.substring(0, 10)}</span><br />
                          <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>{s.closed.substring(11)}</span>
                        </>
                      ) : (
                        <span style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '0.75rem' }}>Running</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 8px', fontSize: '0.82rem', fontWeight: 600 }}>
                      {s.totalOrders}
                    </td>
                    <td style={{ padding: '12px 8px', fontSize: '0.82rem', fontWeight: 600 }}>
                      € {s.grossRevenue.toFixed(2)}
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        background: s.closed ? 'rgba(255,255,255,0.03)' : 'rgba(16,185,129,0.1)',
                        color: s.closed ? 'var(--text-secondary)' : 'var(--accent)',
                        border: s.closed ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(16,185,129,0.2)',
                      }}>
                        {s.closed ? '🔒 Closed' : '● Active'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 0 12px 8px', textAlign: 'right' }}>
                      {s.closed ? (
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          {s.xReportHash && (
                            <button
                              onClick={() => openTicket(s, 'x')}
                              style={{
                                background: 'rgba(245,158,11,0.08)',
                                border: '1px solid rgba(245,158,11,0.2)',
                                borderRadius: '6px',
                                color: '#fbbf24',
                                padding: '5px 10px',
                                cursor: 'pointer',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                transition: 'var(--transition-smooth)',
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,158,11,0.15)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'rgba(245,158,11,0.08)'}
                            >
                              X-Report
                            </button>
                          )}
                          <button
                            onClick={() => openTicket(s, 'z')}
                            style={{
                              background: 'rgba(99,102,241,0.08)',
                              border: '1px solid rgba(99,102,241,0.2)',
                              borderRadius: '6px',
                              color: '#a5b4fc',
                              padding: '5px 10px',
                              cursor: 'pointer',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              transition: 'var(--transition-smooth)',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.15)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.08)'}
                          >
                            Z-Report
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          Awaiting terminal close
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Banner */}
      <div style={{
        marginTop: '16px',
        padding: '14px 20px',
        borderRadius: '10px',
        background: 'rgba(99, 102, 241, 0.04)',
        border: '1px solid rgba(99, 102, 241, 0.12)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <span style={{ fontSize: '1rem', flexShrink: 0 }}>ℹ️</span>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
          Shifts are opened and closed exclusively from POS terminals and self-service kiosks. 
          X-Reports are mid-shift snapshots and Z-Reports are end-of-shift fiscal seals. 
          This back office provides a read-only archive of all synced tickets.
        </p>
      </div>

      {/* ─── TICKET PREVIEW MODAL (X or Z) ─── */}
      {selectedTicket && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(5, 8, 16, 0.88)',
          backdropFilter: 'blur(14px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000,
          padding: '20px',
        }}>
          <div className="glass-card animate-modal" style={{
            width: '100%',
            maxWidth: '480px',
            background: 'rgba(17, 24, 39, 0.97)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.7)',
            borderRadius: '20px',
            padding: '28px',
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: ticketType === 'x' ? 'rgba(245,158,11,0.12)' : 'rgba(99,102,241,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.9rem',
                }}>
                  {ticketType === 'x' ? '📊' : '🧾'}
                </span>
                <div>
                  <h3 style={{
                    fontSize: '1rem', fontWeight: 700,
                    color: ticketType === 'x' ? '#fbbf24' : '#a5b4fc',
                    margin: 0,
                  }}>
                    {ticketType === 'x' ? 'X-Report' : 'Z-Report'} — {selectedTicket.terminalName}
                  </h3>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {ticketType === 'x' ? 'Mid-shift snapshot' : 'End-of-shift fiscal seal'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: 'var(--text-muted)', width: '32px', height: '32px', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'var(--transition-smooth)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              >
                ✕
              </button>
            </div>

            {/* Ticket Receipt Body */}
            <div style={{
              background: '#060a12',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.06)',
              padding: '20px',
              maxHeight: '420px',
              overflowY: 'auto',
              fontFamily: '"Courier New", Courier, monospace',
              fontSize: '11px',
              color: '#d1d5db',
              lineHeight: '1.55',
            }}>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#fff' }}>
                  *** {ticketType === 'x' ? 'X-REPORT (MID-SHIFT)' : 'FISCAL Z-REPORT'} ***
                </span><br />
                BurgerHub — Brussels Central<br />
                VAT Number: BE 0441.982.634<br />
                Anspachlaan 42, 1000 Brussels<br />
                <span style={{ color: 'rgba(255,255,255,0.2)' }}>{'─'.repeat(36)}</span>
              </div>

              {/* Terminal & Shift Info */}
              <span style={{ color: '#9ca3af' }}>Terminal:</span> {selectedTicket.terminalName} ({selectedTicket.terminalType.toUpperCase()})<br />
              <span style={{ color: '#9ca3af' }}>Shift ID:</span> {selectedTicket.id}<br />
              <span style={{ color: '#9ca3af' }}>Operator:</span> {selectedTicket.cashier.toUpperCase()}<br />
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>{'─'.repeat(36)}</span><br />

              <span style={{ color: '#9ca3af' }}>Shift Opened:</span> {selectedTicket.opened}<br />
              {ticketType === 'x' ? (
                <>
                  <span style={{ color: '#9ca3af' }}>X-Report Time:</span> {selectedTicket.xReportTime}<br />
                </>
              ) : (
                <>
                  <span style={{ color: '#9ca3af' }}>Shift Closed:</span> {selectedTicket.closed}<br />
                </>
              )}
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>{'─'.repeat(36)}</span><br /><br />

              {/* Cash Section */}
              {selectedTicket.terminalType === 'pos' && (
                <>
                  <span style={{ color: '#fff', fontWeight: 'bold' }}>CASH DRAWER</span><br />
                  Opening Cash:{'         '}€ {selectedTicket.openingCash.toFixed(2)}<br />
                  {ticketType === 'z' && (
                    <>
                      Closing Cash:{'         '}€ {selectedTicket.closingCash.toFixed(2)}<br />
                      Net Cash Movement:{'    '}€ {(selectedTicket.closingCash - selectedTicket.openingCash).toFixed(2)}<br />
                    </>
                  )}
                  <span style={{ color: 'rgba(255,255,255,0.2)' }}>{'─'.repeat(36)}</span><br /><br />
                </>
              )}

              {/* Revenue Summary */}
              <span style={{ color: '#fff', fontWeight: 'bold' }}>SALES SUMMARY</span><br />
              Total Orders:{'         '}{selectedTicket.totalOrders}<br />
              Gross Revenue:{'        '}€ {selectedTicket.grossRevenue.toFixed(2)}<br />
              Card Payments:{'        '}€ {selectedTicket.cardTotal.toFixed(2)}<br />
              Cash Payments:{'        '}€ {selectedTicket.cashTotal.toFixed(2)}<br />
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>{'─'.repeat(36)}</span><br /><br />

              {/* Tax Summary */}
              <span style={{ color: '#fff', fontWeight: 'bold' }}>FISCAL TAX BREAKDOWN</span><br />
              VAT A (21%):{'          '}€ {(selectedTicket.totalVat * 0.55).toFixed(2)}<br />
              VAT B (12%):{'          '}€ {(selectedTicket.totalVat * 0.30).toFixed(2)}<br />
              VAT C (6%):{'           '}€ {(selectedTicket.totalVat * 0.15).toFixed(2)}<br />
              Total Tax Collected:{'  '}€ {selectedTicket.totalVat.toFixed(2)}<br />
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>{'─'.repeat(36)}</span><br /><br />

              {/* Signature Block */}
              <div style={{ textAlign: 'center', color: ticketType === 'x' ? '#fbbf24' : '#a5b4fc' }}>
                [{ticketType === 'x' ? 'X-REPORT' : 'Z-REPORT'} DIGITAL SIGNATURE]<br />
              </div>
              <span style={{ color: '#9ca3af' }}>FDM Serial:</span> FDM-BE-887722-X<br />
              <span style={{ color: '#9ca3af' }}>Signature:</span><br />
              <span style={{ wordBreak: 'break-all', fontSize: '10px', color: ticketType === 'x' ? 'rgba(251,191,36,0.6)' : 'rgba(165,180,252,0.6)' }}>
                {ticketType === 'x' ? selectedTicket.xReportHash : selectedTicket.zReportHash}
              </span><br /><br />

              <div style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>
                *** {ticketType === 'x' ? 'END OF X-REPORT' : 'REGISTER CLOSED SECURELY'} ***
              </div>
            </div>

            {/* Modal Footer — toggle between X/Z and close */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
              {selectedTicket.xReportHash && (
                <button
                  onClick={() => setTicketType(ticketType === 'x' ? 'z' : 'x')}
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px',
                    color: '#ffffff',
                    padding: '11px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    transition: 'var(--transition-smooth)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                >
                  Switch to {ticketType === 'x' ? 'Z-Report' : 'X-Report'}
                </button>
              )}
              <button
                onClick={() => setSelectedTicket(null)}
                className="btn-primary"
                style={{ flex: 1, padding: '11px', fontSize: '0.8rem', borderRadius: '10px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pulse animation for active indicator */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
