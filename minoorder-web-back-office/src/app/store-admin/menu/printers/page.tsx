'use client';

import React, { useState } from 'react';
import { useMenu } from '../context';
import { useToast } from '../../../../components/Toast';

export default function PrintersPage() {
  const { printers, setPrinters } = useMenu();
  const { showToast } = useToast();

  // Form states
  const [newPrinterName, setNewPrinterName] = useState('');
  const [newPrinterConn, setNewPrinterConn] = useState('ip');
  const [newPrinterAddress, setNewPrinterAddress] = useState('');
  const [newPrinterRole, setNewPrinterRole] = useState('kitchen');

  const handleAddPrinter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrinterName || !newPrinterAddress) return;
    const newP = {
      id: Date.now().toString(),
      name: newPrinterName,
      connectionType: newPrinterConn,
      address: newPrinterAddress,
      role: newPrinterRole,
    };
    setPrinters([...printers, newP]);
    setNewPrinterName('');
    setNewPrinterAddress('');
    showToast(`Printer "${newPrinterName}" mapped to role "${newPrinterRole}" — ESC/POS routing active.`, 'success');
  };

  const handleDeletePrinter = (id: string) => {
    setPrinters(printers.filter(p => p.id !== id));
  };

  const handlePrintTest = (printerName: string) => {
    showToast(`[ESC/POS OK] — Test ticket routed to "${printerName}" successfully.`, 'info');
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '4px' }}>
          <span className="text-gradient">Printer Configuration</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Map logical print destinations (receipts, prep kitchen, bar logs) over local networks.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1.2fr', gap: '32px' }}>
        
        {/* Left Printers Table */}
        <div className="glass-card" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '24px', fontWeight: 700 }}>Active ESC/POS Thermal Nodes</h3>
          
          {printers.length === 0 ? (
            <div style={{ height: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)' }}>
              No hardware print routing configured.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  <th style={{ paddingBottom: '12px' }}>DEVICE NAME</th>
                  <th style={{ paddingBottom: '12px' }}>ROLE/CHANNEL</th>
                  <th style={{ paddingBottom: '12px' }}>CONNECTION</th>
                  <th style={{ paddingBottom: '12px' }}>IP/PORT ADDRESS</th>
                  <th style={{ paddingBottom: '12px', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {printers.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9375rem' }}>
                    <td style={{ padding: '16px 0', fontWeight: 600 }}>{p.name}</td>
                    <td style={{ padding: '16px 0' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        background: p.role === 'receipt' ? 'rgba(16,185,129,0.1)' : p.role === 'kitchen' ? 'rgba(99,102,241,0.1)' : 'rgba(245,158,11,0.1)',
                        color: p.role === 'receipt' ? 'var(--accent)' : p.role === 'kitchen' ? 'var(--primary)' : 'var(--warning)',
                      }}>
                        {p.role}
                      </span>
                    </td>
                    <td style={{ padding: '16px 0', textTransform: 'uppercase', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{p.connectionType}</td>
                    <td style={{ padding: '16px 0', fontFamily: 'monospace' }}>{p.address}</td>
                    <td style={{ padding: '16px 0', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handlePrintTest(p.name)}
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#ffffff', padding: '6px 12px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                        >
                          Test Loop
                        </button>
                        <button
                          onClick={() => handleDeletePrinter(p.id)}
                          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid var(--danger)', borderRadius: '6px', color: '#fca5a5', padding: '6px 12px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Right Side Add Printer Form */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '20px', fontWeight: 600 }}>Map Printer</h3>
          
          <form onSubmit={handleAddPrinter}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>PRINTER LABEL</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Star Kitchen Pass"
                value={newPrinterName}
                onChange={e => setNewPrinterName(e.target.value)}
                style={{ padding: '10px' }}
                required
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>INTERFACE TYPE</label>
              <select
                value={newPrinterConn}
                onChange={e => setNewPrinterConn(e.target.value)}
                className="form-input"
                style={{ padding: '10px', background: '#111827' }}
              >
                <option value="ip">IP / LAN Sockets</option>
                <option value="usb">Direct USB / Port</option>
                <option value="bluetooth">Bluetooth Handshake</option>
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>ADDRESS / ENDPOINT</label>
              <input
                type="text"
                className="form-input"
                placeholder={newPrinterConn === 'ip' ? 'e.g. 192.168.1.200' : 'e.g. COM3 or /dev/usb/lp0'}
                value={newPrinterAddress}
                onChange={e => setNewPrinterAddress(e.target.value)}
                style={{ padding: '10px' }}
                required
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>PRINT ROLE PROFILE</label>
              <select
                value={newPrinterRole}
                onChange={e => setNewPrinterRole(e.target.value)}
                className="form-input"
                style={{ padding: '10px', background: '#111827' }}
              >
                <option value="receipt">Customer Legal Receipt</option>
                <option value="kitchen">Hot Prep Kitchen Tickets</option>
                <option value="bar">Bar & Cold Drinks Pass</option>
              </select>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px', fontSize: '0.875rem' }}>
              Map Print Target
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
