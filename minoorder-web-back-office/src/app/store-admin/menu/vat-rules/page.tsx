'use client';

import React, { useState, useEffect } from 'react';
import { useMenu } from '../context';
import { useToast } from '../../../../components/Toast';

const VAT_GROUPS = [
  { key: 'food',    emoji: '🍔', label: 'STANDARD FOOD',   color: '#a5b4fc', tkKey: 'foodTakeaway',       diKey: 'foodDineIn' },
  { key: 'soft',    emoji: '🥤', label: 'SOFT DRINKS',     color: '#6ee7b7', tkKey: 'softDrinkTakeaway',  diKey: 'softDrinkDineIn' },
  { key: 'alcohol', emoji: '🍺', label: 'ALCOHOLIC BEV',   color: '#fbbf24', tkKey: 'alcoholTakeaway',    diKey: 'alcoholDineIn' },
] as const;

export default function VatRulesPage() {
  const { storeVatRates, setStoreVatRates } = useMenu();
  const { showToast } = useToast();

  const fmt = (n: number) => n.toFixed(2);

  const [isLocked, setIsLocked] = useState(true);
  const [foodTakeaway,    setFoodTakeaway]    = useState(fmt(storeVatRates.foodTakeaway));
  const [foodDineIn,      setFoodDineIn]      = useState(fmt(storeVatRates.foodDineIn));
  const [softTakeaway,    setSoftTakeaway]    = useState(fmt(storeVatRates.softDrinkTakeaway));
  const [softDineIn,      setSoftDineIn]      = useState(fmt(storeVatRates.softDrinkDineIn));
  const [alcoholTakeaway, setAlcoholTakeaway] = useState(fmt(storeVatRates.alcoholTakeaway));
  const [alcoholDineIn,   setAlcoholDineIn]   = useState(fmt(storeVatRates.alcoholDineIn));

  // Sync local form fields whenever context updates (e.g. after localStorage hydration).
  // Only sync when locked — never override user input mid-edit.
  useEffect(() => {
    if (!isLocked) return;
    setFoodTakeaway(fmt(storeVatRates.foodTakeaway));
    setFoodDineIn(fmt(storeVatRates.foodDineIn));
    setSoftTakeaway(fmt(storeVatRates.softDrinkTakeaway));
    setSoftDineIn(fmt(storeVatRates.softDrinkDineIn));
    setAlcoholTakeaway(fmt(storeVatRates.alcoholTakeaway));
    setAlcoholDineIn(fmt(storeVatRates.alcoholDineIn));
  }, [storeVatRates]); // eslint-disable-line react-hooks/exhaustive-deps

  // POS currency-style input: digits only, last 2 are decimals
  const posInput = (setter: (v: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const digits = e.target.value.replace(/\D/g, '');
      setter(digits ? (parseInt(digits, 10) / 100).toFixed(2) : '0.00');
    };

  const vals: Record<string, string> = {
    foodTakeaway, foodDineIn, softDrinkTakeaway: softTakeaway,
    softDrinkDineIn: softDineIn, alcoholTakeaway, alcoholDineIn,
  };
  const setters: Record<string, (v: string) => void> = {
    foodTakeaway: setFoodTakeaway, foodDineIn: setFoodDineIn,
    softDrinkTakeaway: setSoftTakeaway, softDrinkDineIn: setSoftDineIn,
    alcoholTakeaway: setAlcoholTakeaway, alcoholDineIn: setAlcoholDineIn,
  };

  const handleEdit = () => setIsLocked(false);

  const handleCancel = () => {
    setFoodTakeaway(fmt(storeVatRates.foodTakeaway));
    setFoodDineIn(fmt(storeVatRates.foodDineIn));
    setSoftTakeaway(fmt(storeVatRates.softDrinkTakeaway));
    setSoftDineIn(fmt(storeVatRates.softDrinkDineIn));
    setAlcoholTakeaway(fmt(storeVatRates.alcoholTakeaway));
    setAlcoholDineIn(fmt(storeVatRates.alcoholDineIn));
    setIsLocked(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setStoreVatRates({
      foodTakeaway:      parseFloat(foodTakeaway),
      foodDineIn:        parseFloat(foodDineIn),
      softDrinkTakeaway: parseFloat(softTakeaway),
      softDrinkDineIn:   parseFloat(softDineIn),
      alcoholTakeaway:   parseFloat(alcoholTakeaway),
      alcoholDineIn:     parseFloat(alcoholDineIn),
    });
    setIsLocked(true);
    showToast('VAT rules saved and locked — rates are now active across the catalog and combo engine.', 'success');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>

      {/* ── Page header ── */}
      <div style={{ marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
          <span style={{ fontSize: '1.1rem' }}>📐</span>
          <h1 className="page-title"><span className="text-gradient">Store VAT Rules</span></h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
          Belgium fiscal tax rates per product category and service channel.
        </p>
      </div>

      <form onSubmit={handleSave}>
        <div className="glass-card" style={{ padding: '22px 24px', position: 'relative' }}>

          {/* ── Card header row ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>Store-Level VAT Rules</h3>
                {/* Lock status badge */}
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  padding: '2px 8px', borderRadius: '20px', fontSize: '0.6rem', fontWeight: 800,
                  background: isLocked ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                  color: isLocked ? '#6ee7b7' : '#fbbf24',
                  border: isLocked ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(245,158,11,0.3)',
                  letterSpacing: '0.05em',
                }}>
                  {isLocked ? '🔒 LOCKED' : '✏️ EDITING'}
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', margin: 0 }}>
                {isLocked
                  ? 'Rates are active and locked. Click Edit to make changes.'
                  : 'Editing mode — modify rates and save to apply across the catalog.'}
              </p>
            </div>

            {/* Edit button (only when locked) */}
            {isLocked && (
              <button type="button" onClick={handleEdit}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 16px', borderRadius: '7px', border: '1px solid rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.07)', color: '#a5b4fc', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.14)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.07)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; }}
              >
                ✏️ Edit Rates
              </button>
            )}
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: 'linear-gradient(to right, rgba(99,102,241,0.2), transparent)', marginBottom: '20px' }} />

          {/* ── Column headers ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '12px', padding: '0 4px' }}>
            {VAT_GROUPS.map(g => (
              <div key={g.key} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '1rem' }}>{g.emoji}</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: g.color, letterSpacing: '0.08em' }}>{g.label}</span>
              </div>
            ))}
          </div>

          {/* ── Rate rows ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', padding: '18px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)', marginBottom: '20px' }}>
            {VAT_GROUPS.map(g => (
              <div key={g.key} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Takeaway */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
                    <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Takeaway</span>
                    <span style={{ fontSize: '0.58rem', padding: '1px 5px', borderRadius: '3px', background: 'rgba(99,102,241,0.08)', color: '#818cf8', fontWeight: 700 }}>TVA</span>
                  </div>
                  {isLocked ? (
                    <div style={{ padding: '9px 12px', borderRadius: '7px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: g.color, fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>{parseFloat(vals[g.tkKey]).toFixed(2)}</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>%</span>
                    </div>
                  ) : (
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text" inputMode="numeric" className="form-input"
                        value={vals[g.tkKey]}
                        onChange={posInput(setters[g.tkKey])}
                        style={{ paddingRight: '28px', textAlign: 'right', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.15rem', color: g.color, letterSpacing: '-0.01em' }}
                      />
                      <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 800, pointerEvents: 'none' }}>%</span>
                    </div>
                  )}
                </div>

                {/* Dine-in */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
                    <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Dine-In</span>
                    <span style={{ fontSize: '0.58rem', padding: '1px 5px', borderRadius: '3px', background: 'rgba(16,185,129,0.08)', color: '#6ee7b7', fontWeight: 700 }}>TVA</span>
                  </div>
                  {isLocked ? (
                    <div style={{ padding: '9px 12px', borderRadius: '7px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: g.color, fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>{parseFloat(vals[g.diKey]).toFixed(2)}</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>%</span>
                    </div>
                  ) : (
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text" inputMode="numeric" className="form-input"
                        value={vals[g.diKey]}
                        onChange={posInput(setters[g.diKey])}
                        style={{ paddingRight: '28px', textAlign: 'right', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.15rem', color: g.color, letterSpacing: '-0.01em' }}
                      />
                      <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 800, pointerEvents: 'none' }}>%</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* ── Locked info strip ── */}
          {isLocked ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.12)' }}>
              <span style={{ fontSize: '1rem', flexShrink: 0 }}>🔒</span>
              <div>
                <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6ee7b7', margin: 0 }}>VAT configuration is locked</p>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: 0, marginTop: '1px' }}>These rates are live across catalog, combos, and fiscal reports. Click <strong style={{ color: '#a5b4fc' }}>Edit Rates</strong> to unlock.</p>
              </div>
            </div>
          ) : (
            /* ── Edit mode actions ── */
            <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
              <button type="button" onClick={handleCancel}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary"
                style={{ flex: 2, padding: '10px', fontSize: '0.82rem', fontWeight: 700, borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                🔒 Save & Lock VAT Rules
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
