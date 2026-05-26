'use client';

import React, { useState } from 'react';
import { useMenu } from '../context';

export default function OrdersPage() {
  const { orders } = useMenu();

  // Modal state
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '4px' }}>
          <span className="text-gradient">VAT Audits & Ledger</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Legally signed cashier receipts and checkout logs securely stored in PostgreSQL WORM ledger.</p>
      </div>

      <div className="glass-card" style={{ padding: '32px' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '24px', fontWeight: 700 }}>Compliant Transaction Ledger</h3>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              <th style={{ paddingBottom: '12px' }}>Daily Seq</th>
              <th style={{ paddingBottom: '12px' }}>LEGAL RECEIPT NUMBER</th>
              <th style={{ paddingBottom: '12px' }}>CHECKOUT TIME</th>
              <th style={{ paddingBottom: '12px' }}>GROSS TOTAL</th>
              <th style={{ paddingBottom: '12px' }}>NET TAXABLE</th>
              <th style={{ paddingBottom: '12px' }}>VAT AMOUNT</th>
              <th style={{ paddingBottom: '12px' }}>PAY CHANNEL</th>
              <th style={{ paddingBottom: '12px', textAlign: 'right' }}>FDM SIGNATURE</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9375rem' }}>
                <td style={{ padding: '16px 0', fontFamily: 'monospace', fontWeight: 600 }}>{o.orderNumber}</td>
                <td style={{ padding: '16px 0', fontWeight: 600, color: 'var(--accent)' }}>{o.receiptNumber}</td>
                <td style={{ padding: '16px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{o.time}</td>
                <td style={{ padding: '16px 0', fontWeight: 700 }}>€ {o.gross.toFixed(2)}</td>
                <td style={{ padding: '16px 0' }}>€ {o.net.toFixed(2)}</td>
                <td style={{ padding: '16px 0', color: 'var(--primary)', fontWeight: 600 }}>€ {o.vat.toFixed(2)}</td>
                <td style={{ padding: '16px 0', textTransform: 'capitalize', fontSize: '0.85rem' }}>{o.method}</td>
                <td style={{ padding: '16px 0', textAlign: 'right' }}>
                  <button
                    onClick={() => setSelectedReceipt(o)}
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#ffffff', padding: '6px 12px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                  >
                    Review Ticket
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MODAL: INTERACTIVE ESC/POS THERMAL RECEIPT VISUALIZER --- */}
      {selectedReceipt && (
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
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent)' }}>🧾 COMPLIANT FDM TICKET</h3>
              <button
                onClick={() => setSelectedReceipt(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '16px' }}>
              Cryptographically signed by legal FDM black box and backed up inside redundant ledger buckets.
            </p>

            {/* Simulated monochrome POS receipt paper */}
            <div style={{
              background: '#070b13',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.06)',
              padding: '20px',
              height: '380px',
              overflowY: 'auto',
              fontFamily: 'monospace',
              fontSize: '11px',
              color: '#d1d5db',
              lineHeight: '1.4'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold' }}>*** MINOORDER SAAS HUB ***</span><br />
                Bella Italia - Central Branch<br />
                VAT Number: BE 0441.982.634<br />
                Anspachlaan 42, 1000 Brussels<br />
                --------------------------------
              </div>
              
              Order Reference: {selectedReceipt.receiptNumber}<br />
              Time of Checkout: {selectedReceipt.time}<br />
              Payment Channel: {selectedReceipt.method.toUpperCase()}<br />
              --------------------------------<br /><br />
              
              1x Classic Angus Burger      € 10.00 (B)<br />
              1x Frites Classic Belgian    €  3.50 (B)<br />
              1x Jupiler Pilsner Beer      €  3.80 (A)<br />
              <br />
              *Proportional Discount Allocated*<br />
              --------------------------------<br />
              GROSS CHARGED:               € {selectedReceipt.gross.toFixed(2)}<br />
              NET SALES VALUE:             € {selectedReceipt.net.toFixed(2)}<br />
              TOTAL VAT EXTRACTED:         € {selectedReceipt.vat.toFixed(2)}<br /><br />
              
              VAT TAX CATEGORIES BREAKDOWN:<br />
              (A) 21% Rate: Net € {Math.round(selectedReceipt.net * 0.28 * 100)/100} | VAT € {Math.round(selectedReceipt.vat * 0.28 * 100)/100}<br />
              (B) 12% Rate: Net € {Math.round(selectedReceipt.net * 0.72 * 100)/100} | VAT € {Math.round(selectedReceipt.vat * 0.72 * 100)/100}<br />
              --------------------------------<br /><br />
              
              [BELGIUM COMPLIANCE MIDDLEWARE BLOCK]<br />
              FDM SERIAL: FDM-BE-887722-X<br />
              SIG COUNTER: 10842<br />
              HASH KEY VALUE:<br />
              {selectedReceipt.fdmHash}<br /><br />
              
              <div style={{ textAlign: 'center' }}>
                ** THANK YOU FOR YOUR VISIT **
              </div>
            </div>

            <button
              onClick={() => setSelectedReceipt(null)}
              className="btn-primary"
              style={{ width: '100%', marginTop: '20px', padding: '12px', fontSize: '0.875rem' }}
            >
              Close Receipt Visualizer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
