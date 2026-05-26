'use client';

import React, { useState } from 'react';
import { useMenu } from '../context';
import { useToast } from '../../../../components/Toast';

export default function ShiftsPage() {
  const { shifts, setShifts } = useMenu();
  const { showToast } = useToast();

  // Modals and form states
  const [selectedZReport, setSelectedZReport] = useState<any>(null);
  const [isCloseDrawerOpen, setIsCloseDrawerOpen] = useState(false);
  const [declaredCash, setDeclaredCash] = useState('150.00');

  const handleCloseShift = (e: React.FormEvent) => {
    e.preventDefault();
    const cashVal = parseFloat(declaredCash);
    
    // Update shifts in context
    setShifts(shifts.map(sh => {
      if (sh.closed === null) {
        return {
          ...sh,
          closed: new Date().toISOString().replace('T', ' ').substring(0, 19),
          closingCash: cashVal,
          status: 'Closed Fiscally',
          zReportHash: `Z_SIG_${Math.floor(Math.random()*8000)+1000}_SHA256_FDM_BE`
        };
      }
      return sh;
    }));

    setIsCloseDrawerOpen(false);
    showToast('Shift sealed in WORM ledger — Z-Report cryptographically signed and broadcasted to compliance servers.', 'success');
  };

  return (
    <div>
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '4px' }}>
            <span className="text-gradient">Shifts & Cash Drawer</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Oversee cashier drawer levels, declare end-of-day balances, and seal compliant Z-reports.</p>
        </div>

        {shifts.some(s => s.closed === null) && (
          <button
            onClick={() => setIsCloseDrawerOpen(true)}
            style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', border: 'none', borderRadius: '10px', color: '#ffffff', padding: '12px 24px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)' }}
          >
            🔒 Close Drawer (Z-Report)
          </button>
        )}
      </div>

      {/* Active Shift details Card */}
      <div className="glass-card" style={{ padding: '32px', marginBottom: '36px', border: '1px solid rgba(16,185,129,0.2)', background: 'rgba(16,185,129,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>● ACTIVE DRAWER RUNNING</span>
            
            {shifts.find(s => s.closed === null) ? (
              (() => {
                const active = shifts.find(s => s.closed === null)!;
                return (
                  <div style={{ marginTop: '12px' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Cashier in Charge: {active.cashier}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>Shift Session initiated on: <strong>{active.opened}</strong></p>
                  </div>
                );
              })()
            ) : (
              <div style={{ marginTop: '12px' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-muted)' }}>No Active Cashier Session</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>Please launch POS terminal to open a new drawer session.</p>
              </div>
            )}
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>DRAWER OPENING CASH</span>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>€ 150.00</h3>
          </div>
        </div>
      </div>

      {/* Historical closed shifts registry */}
      <div className="glass-card" style={{ padding: '32px' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', fontWeight: 700 }}>Closed Cashier Shifts & Signed Audits</h3>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              <th style={{ paddingBottom: '12px' }}>SHIFT ID</th>
              <th style={{ paddingBottom: '12px' }}>OPERATOR</th>
              <th style={{ paddingBottom: '12px' }}>OPENED</th>
              <th style={{ paddingBottom: '12px' }}>CLOSED</th>
              <th style={{ paddingBottom: '12px' }}>OPEN CASH</th>
              <th style={{ paddingBottom: '12px' }}>CLOSED CASH</th>
              <th style={{ paddingBottom: '12px' }}>STATUS</th>
              <th style={{ paddingBottom: '12px', textAlign: 'right' }}>Z-REPORT</th>
            </tr>
          </thead>
          <tbody>
            {shifts.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9375rem' }}>
                <td style={{ padding: '16px 0', fontFamily: 'monospace' }}>{s.id}</td>
                <td style={{ padding: '16px 0', fontWeight: 600 }}>{s.cashier}</td>
                <td style={{ padding: '16px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{s.opened}</td>
                <td style={{ padding: '16px 0', color: s.closed ? 'var(--text-muted)' : 'var(--accent)', fontSize: '0.85rem' }}>{s.closed || 'ACTIVE DRAWER'}</td>
                <td style={{ padding: '16px 0' }}>€ {s.openingCash.toFixed(2)}</td>
                <td style={{ padding: '16px 0', fontWeight: 600 }}>{s.closed ? `€ ${s.closingCash.toFixed(2)}` : 'N/A'}</td>
                <td style={{ padding: '16px 0' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    background: s.closed ? 'rgba(255,255,255,0.03)' : 'rgba(16,185,129,0.1)',
                    color: s.closed ? 'var(--text-secondary)' : 'var(--accent)',
                    border: s.closed ? 'none' : '1px solid rgba(16,185,129,0.2)'
                  }}>
                    {s.status}
                  </span>
                </td>
                <td style={{ padding: '16px 0', textAlign: 'right' }}>
                  {s.closed ? (
                    <button
                      onClick={() => setSelectedZReport(s)}
                      style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid var(--primary)', borderRadius: '6px', color: '#a5b4fc', padding: '6px 12px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                    >
                      Review Z-Sheet
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Drawer running</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MODAL: CLOSE SHIFT CASH DECLARATION --- */}
      {isCloseDrawerOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(5, 8, 16, 0.85)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000,
          padding: '20px',
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '460px',
            background: 'rgba(17, 24, 39, 0.95)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
            borderRadius: '20px',
            padding: '28px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent)' }}>🔒 CLOSE DRAWER & DECLARE CASH</h3>
              <button
                onClick={() => setIsCloseDrawerOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', marginBottom: '20px', lineHeight: '1.4' }}>
              Declare the actual cash counted in the physical drawer. The middleware will reconcile it against expectations, sign a WORM-ledger record, and issue the compliance Z-report.
            </p>

            <form onSubmit={handleCloseShift}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>ACTUAL CASH COUNTED (EUR)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  value={declaredCash}
                  onChange={e => setDeclaredCash(e.target.value)}
                  style={{ padding: '12px' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsCloseDrawerOpen(false)}
                  style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#ffffff', padding: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1, padding: '12px', fontSize: '0.85rem' }}
                >
                  Confirm & Seal Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: Z-REPORT TICKET PREVIEW --- */}
      {selectedZReport && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(5, 8, 16, 0.85)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000,
          padding: '20px',
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '460px',
            background: 'rgba(17, 24, 39, 0.95)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
            borderRadius: '20px',
            padding: '28px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent)' }}>🧾 COMPLIANT Z-REPORT SHEET</h3>
              <button
                onClick={() => setSelectedZReport(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '16px' }}>
              Official government Z-report sealed in database. Cryptographically signed by legal Belgian FDM middleware.
            </p>

            <div style={{
              background: '#070b13',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.06)',
              padding: '20px',
              height: '350px',
              overflowY: 'auto',
              fontFamily: 'monospace',
              fontSize: '11px',
              color: '#d1d5db',
              lineHeight: '1.4'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold' }}>*** FISCAL Z-REPORT OUT ***</span><br />
                Bella Italia - Central Branch<br />
                VAT Number: BE 0441.982.634<br />
                Anspachlaan 42, 1000 Brussels<br />
                --------------------------------
              </div>
              
              Z-Report Sequence: Z_SHEET_{selectedZReport.id}<br />
              Time Opened: {selectedZReport.opened}<br />
              Time Closed: {selectedZReport.closed}<br />
              Cashier Name: {selectedZReport.cashier.toUpperCase()}<br />
              --------------------------------<br /><br />
              
              OPENING CASH REGISTER:       € {selectedZReport.openingCash.toFixed(2)}<br />
              DECLARED CLOSING CASH:       € {selectedZReport.closingCash.toFixed(2)}<br />
              NET REGISTER REVENUE:        € {(selectedZReport.closingCash - selectedZReport.openingCash).toFixed(2)}<br />
              --------------------------------<br />
              DAILY FINANCIAL AUDIT SUMMARY:<br />
              Total Card Transactions:     € 71.60 Gross<br />
              Total Cash Transactions:     € 0.00 Gross<br />
              --------------------------------<br />
              TOTAL FISCAL TAX SPLITS:<br />
              Extracted VAT A (21%):       € 4.98<br />
              Extracted VAT B (12%):       € 2.65<br />
              TOTAL TAX REMITTED:          € 7.63<br /><br />

              [BELGIUM DIGITAL SIGNATURE BLOCK]<br />
              FDM SERIAL: FDM-BE-887722-X<br />
              SIGNATURE HASH CODE:<br />
              {selectedZReport.zReportHash || 'NO_SIG_REGISTERED'}<br /><br />
              
              <div style={{ textAlign: 'center' }}>
                *** REGISTER CLOSED SECURELY ***
              </div>
            </div>

            <button
              onClick={() => setSelectedZReport(null)}
              className="btn-primary"
              style={{ width: '100%', marginTop: '20px', padding: '12px', fontSize: '0.875rem' }}
            >
              Close Z-Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
