'use client';

export default function PrintersPage() {
  return (
    <div style={{ maxWidth: '600px', margin: '60px auto', width: '100%' }}>
      <div className="glass-card" style={{ padding: '40px 36px', textAlign: 'center' }}>

        {/* Icon */}
        <div style={{
          width: '72px', height: '72px', borderRadius: '18px', margin: '0 auto 20px',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(16,185,129,0.08))',
          border: '1px solid rgba(99,102,241,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem',
        }}>📱</div>

        <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '8px', letterSpacing: '-0.01em' }}>
          Printers Managed via Android App
        </h2>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '24px', maxWidth: '420px', margin: '0 auto 24px' }}>
          Printer configuration, assignment, and test printing are handled directly from the <strong style={{ color: '#a5b4fc' }}>Minoorder Android POS app</strong>. Open the app on your device to manage printers.
        </p>

        {/* Info cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px', textAlign: 'left' }}>
          {[
            { icon: '🖨️', label: 'Receipt Printers',  desc: 'Star, Epson, Sunmi — configured in app' },
            { icon: '🍳', label: 'Kitchen Printers',   desc: 'Hot-pass tickets per section' },
            { icon: '🍹', label: 'Bar Printers',       desc: 'Drinks station pass-through' },
            { icon: '📶', label: 'Connection Types',   desc: 'USB, Bluetooth, Network (IP)' },
          ].map(item => (
            <div key={item.label} style={{ padding: '12px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{item.icon}</div>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#f1f5f9', margin: 0, marginBottom: '2px' }}>{item.label}</p>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', fontSize: '0.7rem', color: '#a5b4fc', fontWeight: 600 }}>
          💡 Go to <strong>Settings → Printers</strong> in the Minoorder Android app
        </div>
      </div>
    </div>
  );
}
