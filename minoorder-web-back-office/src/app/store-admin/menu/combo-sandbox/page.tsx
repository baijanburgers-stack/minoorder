'use client';

import React, { useState, useMemo } from 'react';
import { useMenu } from '../context';
import { useToast } from '../../../../components/Toast';

// ─── VAT category emoji map ────────────────────────────────────────────────
const VAT_EMOJI: Record<string, string> = {
  food: '🍔', soft_drink: '🥤', alcohol: '🍺', service: '🛎️',
};

// ─── Savings % badge ───────────────────────────────────────────────────────
function SavingsBadge({ pct }: { pct: number }) {
  if (pct <= 0) return null;
  return (
    <span style={{
      fontSize: '0.6rem', fontWeight: 900, padding: '2px 6px', borderRadius: '4px',
      background: 'linear-gradient(135deg, #10b981, #059669)',
      color: '#fff', letterSpacing: '0.03em', flexShrink: 0,
    }}>
      −{pct.toFixed(0)}%
    </span>
  );
}

export default function ComboBuilderPage() {
  const { deals, setDeals, items, categories, language } = useMenu();
  const { showToast } = useToast();

  // ── Editor panel state ────────────────────────────────────────────────────
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [comboName, setComboName] = useState('');
  const [fixedPrice, setFixedPrice] = useState('12.00');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [activeCatTab, setActiveCatTab] = useState<string>('all');

  // ── Helpers ───────────────────────────────────────────────────────────────
  const iname = (it: any) =>
    (language === 'en' ? it.nameEn : language === 'fr' ? it.nameFr : it.nameNl) || it.name;
  const cname = (cat: any) =>
    (language === 'en' ? cat.nameEn : language === 'fr' ? cat.nameFr : cat.nameNl) || cat.name;
  const dname = (d: any) => d.name;

  const priceNum = parseFloat(fixedPrice || '0');
  const normalTotal = selectedIds.reduce((s, id) => {
    const it = items.find((x: any) => x.id === id) as any;
    return s + (it ? it.grossPrice : 0);
  }, 0);
  const savings = Math.max(0, normalTotal - priceNum);
  const savingsPct = normalTotal > 0 ? (savings / normalTotal) * 100 : 0;

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const d = e.target.value.replace(/\D/g, '');
    setFixedPrice(d ? (parseInt(d, 10) / 100).toFixed(2) : '0.00');
  };

  // Filtered items for picker
  const pickerItems = useMemo(() =>
    activeCatTab === 'all'
      ? items
      : items.filter((it: any) => it.categoryId === activeCatTab),
    [items, activeCatTab]
  );

  const toggleItem = (id: string) =>
    setSelectedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const removeFromTray = (id: string) =>
    setSelectedIds(p => p.filter(x => x !== id));

  // ── Open create / edit ────────────────────────────────────────────────────
  const openCreate = () => {
    setEditingId(null);
    setComboName('');
    setFixedPrice('12.00');
    setSelectedIds([]);
    setIsAvailable(true);
    setActiveCatTab('all');
    setEditorOpen(true);
  };

  const openEdit = (deal: any) => {
    setEditingId(deal.id);
    setComboName(deal.name);
    setFixedPrice(deal.fixedPrice.toFixed(2));
    setSelectedIds(deal.itemIds || []);
    setIsAvailable(deal.isAvailable);
    setActiveCatTab('all');
    setEditorOpen(true);
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = () => {
    if (!comboName.trim() || selectedIds.length === 0) return;
    const name = comboName.trim().toUpperCase();
    if (editingId) {
      setDeals(deals.map((d: any) => d.id === editingId
        ? { ...d, name, nameEn: name, nameFr: name, nameNl: name, fixedPrice: priceNum, itemIds: selectedIds, isAvailable }
        : d
      ));
      showToast(`"${name}" updated.`, 'success');
    } else {
      setDeals([...deals, {
        id: 'd_' + Date.now(), name, nameEn: name, nameFr: name, nameNl: name,
        fixedPrice: priceNum, itemIds: selectedIds, isAvailable,
      }]);
      showToast(`"${name}" created.`, 'success');
    }
    setEditorOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    setDeals(deals.filter((d: any) => d.id !== id));
    showToast(`"${name}" removed.`, 'info');
  };

  const toggleAvailability = (id: string) => {
    setDeals(deals.map((d: any) => d.id === id ? { ...d, isAvailable: !d.isAvailable } : d));
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const trayItems = selectedIds.map(id => items.find((x: any) => x.id === id)).filter(Boolean) as any[];
  const catsWithItems = categories.filter((cat: any) => items.some((it: any) => it.categoryId === cat.id));

  const lbl = language === 'fr'
    ? { page: 'Formules Combo', desc: 'Créez des formules à prix fixe. La caisse gère la remise proportionnelle.', new: 'Nouvelle Formule', edit: 'Modifier la Formule', save: 'Enregistrer', cancel: 'Annuler', noCombo: 'Aucune formule combo', noComboSub: 'Créez votre première formule', name: 'Nom de la formule', ph: 'ex. FORMULE BURGER STANDARD', price: 'Prix fixe', avail: 'Disponible à la commande', allCats: 'Tous', items: 'articles', pick: 'Sélectionner les articles', tray: 'Formule en cours', normalTotal: 'Total normal', saving: 'économie', activate: 'Activer', deactivate: 'Désactiver' }
    : language === 'nl'
    ? { page: 'Combo Deals', desc: 'Maak combopakketten met vaste prijs. De kassa verwerkt de korting automatisch.', new: 'Nieuwe Combo', edit: 'Combo Bewerken', save: 'Opslaan', cancel: 'Annuleren', noCombo: 'Geen combo deals', noComboSub: 'Maak uw eerste combopakket aan', name: 'Combonaam', ph: 'bijv. STANDAARD BURGER COMBO', price: 'Vaste prijs', avail: 'Beschikbaar', allCats: 'Alles', items: 'artikelen', pick: 'Selecteer artikelen', tray: 'Combo in opbouw', normalTotal: 'Normaal totaal', saving: 'besparing', activate: 'Activeren', deactivate: 'Deactiveren' }
    : { page: 'Combo Deals', desc: 'Build fixed-price combo packages. The cart distributes proportional discounts automatically.', new: 'New Combo', edit: 'Edit Combo', save: 'Save Combo', cancel: 'Cancel', noCombo: 'No combo deals yet', noComboSub: 'Create your first combo package', name: 'Combo name', ph: 'e.g. STANDARD BURGER COMBO', price: 'Fixed price', avail: 'Available for ordering', allCats: 'All', items: 'items', pick: 'Select items', tray: 'Combo tray', normalTotal: 'Normal total', saving: 'saving', activate: 'Activate', deactivate: 'Deactivate' };

  return (
    <div style={{ position: 'relative' }}>

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
            <span style={{ fontSize: '1.1rem' }}>🎁</span>
            <h1 className="page-title"><span className="text-gradient">{lbl.page}</span></h1>
            <span style={{ fontSize: '0.62rem', fontWeight: 800, background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)', padding: '2px 8px', borderRadius: '20px' }}>
              {deals.length} {language === 'fr' ? 'formules' : 'combos'}
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{lbl.desc}</p>
        </div>
        <button onClick={openCreate} className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '0.8rem', fontWeight: 700, borderRadius: '8px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(99,102,241,0.3)', flexShrink: 0 }}>
          <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>+</span> {lbl.new}
        </button>
      </div>

      {/* ── Combo Cards Grid ─────────────────────────────────────────────────── */}
      {deals.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>🎁</div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '4px' }}>{lbl.noCombo}</p>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{lbl.noComboSub}</p>
          </div>
          <button onClick={openCreate} className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.8rem', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>+ {lbl.new}</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
          {deals.map((deal: any) => {
            const dealItems = (deal.itemIds || []).map((id: string) => items.find((x: any) => x.id === id)).filter(Boolean) as any[];
            const sum = dealItems.reduce((s: number, it: any) => s + it.grossPrice, 0);
            const sv = Math.max(0, sum - deal.fixedPrice);
            const svPct = sum > 0 ? (sv / sum) * 100 : 0;
            return (
              <div key={deal.id} className="glass-card"
                style={{ padding: 0, overflow: 'hidden', border: deal.isAvailable ? '1px solid rgba(99,102,241,0.15)' : '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s ease', cursor: 'default' }}
                onMouseEnter={e => { (e.currentTarget as any).style.borderColor = 'rgba(99,102,241,0.35)'; (e.currentTarget as any).style.boxShadow = '0 8px 32px rgba(99,102,241,0.12)'; }}
                onMouseLeave={e => { (e.currentTarget as any).style.borderColor = deal.isAvailable ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.05)'; (e.currentTarget as any).style.boxShadow = 'none'; }}
              >
                {/* Card top bar – gradient based on availability */}
                <div style={{ height: '3px', background: deal.isAvailable ? 'linear-gradient(90deg, #6366f1, #10b981)' : 'rgba(255,255,255,0.06)' }} />

                <div style={{ padding: '16px 18px' }}>
                  {/* Header row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', gap: '8px' }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dname(deal)}</span>
                        <SavingsBadge pct={svPct} />
                      </div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        {dealItems.length} {lbl.items}
                        {sv > 0 && <> · <span style={{ color: '#6ee7b7', fontWeight: 700 }}>−€{sv.toFixed(2)} {lbl.saving}</span></>}
                      </span>
                    </div>
                    {/* Price badge */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--accent)', fontFamily: 'var(--font-display)', lineHeight: 1, letterSpacing: '-0.02em' }}>€{deal.fixedPrice.toFixed(2)}</div>
                      {sum > deal.fixedPrice && <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>€{sum.toFixed(2)}</div>}
                    </div>
                  </div>

                  {/* Item pills row */}
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '14px', minHeight: '22px' }}>
                    {dealItems.map((it: any) => (
                      <span key={it.id} style={{
                        display: 'inline-flex', alignItems: 'center', gap: '3px',
                        fontSize: '0.62rem', fontWeight: 700, padding: '2px 7px', borderRadius: '5px',
                        background: 'rgba(99,102,241,0.08)', color: '#c7d2fe',
                        border: '1px solid rgba(99,102,241,0.15)',
                      }}>
                        <span style={{ fontSize: '0.7rem' }}>{VAT_EMOJI[it.vatCategory] || '•'}</span>
                        {iname(it)}
                      </span>
                    ))}
                  </div>

                  {/* Action row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                    {/* Availability toggle pill */}
                    <button onClick={() => toggleAvailability(deal.id)}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: '5px 10px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer', border: 'none', transition: 'all 0.15s', background: deal.isAvailable ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.04)', color: deal.isAvailable ? '#6ee7b7' : 'var(--text-muted)' }}>
                      <span style={{ fontSize: '0.55rem' }}>{deal.isAvailable ? '●' : '○'}</span>
                      {deal.isAvailable ? lbl.deactivate : lbl.activate}
                    </button>
                    <button onClick={() => openEdit(deal)}
                      style={{ padding: '5px 12px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', border: '1px solid rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.06)', color: '#a5b4fc', transition: 'all 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.16)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.06)'}
                    >Edit</button>
                    <button onClick={() => handleDelete(deal.id, dname(deal))}
                      style={{ padding: '5px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)', color: '#fca5a5', transition: 'all 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.14)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.05)'}
                    >🗑</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* FULL-SCREEN EDITOR PANEL                                           */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {editorOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(5,8,18,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'stretch' }}>

          {/* Click-outside to close */}
          <div style={{ flex: 1 }} onClick={() => setEditorOpen(false)} />

          {/* ── Editor Panel (right side drawer) ── */}
          <div style={{ width: '100%', maxWidth: '960px', display: 'flex', flexDirection: 'column', background: '#0d1220', borderLeft: '1px solid rgba(255,255,255,0.07)', animation: 'slideInRight 0.26s cubic-bezier(0.34,1.2,0.64,1) forwards', overflowY: 'auto' }}>
            <style>{`@keyframes slideInRight { from { transform: translateX(60px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>

            {/* Panel Header */}
            <div style={{ padding: '20px 28px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(99,102,241,0.03)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(16,185,129,0.1))', border: '1px solid rgba(99,102,241,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🎁</div>
                <div>
                  <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.1 }}>{editingId ? lbl.edit : lbl.new}</h2>
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: 0 }}>{selectedIds.length > 0 ? `${selectedIds.length} ${lbl.items} selected` : lbl.pick}</p>
                </div>
              </div>
              <button onClick={() => setEditorOpen(false)}
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '7px', color: 'var(--text-muted)', width: '32px', height: '32px', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              >×</button>
            </div>

            {/* Panel Body — split layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', flex: 1, minHeight: 0, overflow: 'hidden' }}>

              {/* ── LEFT: Config panel ── */}
              <div style={{ borderRight: '1px solid rgba(255,255,255,0.05)', padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>

                {/* Combo Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '7px' }}>{lbl.name}</label>
                  <input type="text" className="form-input" placeholder={lbl.ph} value={comboName}
                    onChange={e => setComboName(e.target.value.toUpperCase())}
                    style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.02em' }} required />
                </div>

                {/* Fixed Price */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '7px' }}>{lbl.price}</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', fontWeight: 800, fontSize: '1.1rem', pointerEvents: 'none' }}>€</span>
                    <input type="text" className="form-input" value={fixedPrice} onChange={handlePriceChange}
                      style={{ paddingLeft: '32px', textAlign: 'right', fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.6rem', color: 'var(--accent)', letterSpacing: '-0.02em', lineHeight: 1.1 }} />
                  </div>

                  {/* Price breakdown card */}
                  {selectedIds.length > 0 && (
                    <div style={{ marginTop: '10px', borderRadius: '8px', background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.1)', overflow: 'hidden' }}>
                      <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{lbl.normalTotal}</span>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f1f5f9', textDecoration: savings > 0 ? 'line-through' : 'none' }}>€{normalTotal.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{lbl.price}</span>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent)' }}>€{priceNum.toFixed(2)}</span>
                        </div>
                        {savings > 0 && (
                          <div style={{ borderTop: '1px solid rgba(16,185,129,0.15)', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#6ee7b7' }}>Customer saves</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#6ee7b7' }}>€{savings.toFixed(2)}</span>
                              <SavingsBadge pct={savingsPct} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Availability */}
                <div style={{ padding: '12px 14px', borderRadius: '8px', background: isAvailable ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.02)', border: isAvailable ? '1px solid rgba(16,185,129,0.15)' : '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'all 0.15s' }}
                  onClick={() => setIsAvailable(v => !v)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: '0.78rem', fontWeight: 700, color: isAvailable ? '#6ee7b7' : '#f1f5f9', margin: 0 }}>{lbl.avail}</p>
                      <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)', margin: 0, marginTop: '2px' }}>{isAvailable ? (language === 'fr' ? 'Visible dans la caisse et le kiosk' : 'Visible in POS and kiosk') : (language === 'fr' ? 'Masqué de la vente' : 'Hidden from ordering')}</p>
                    </div>
                    {/* Toggle pill */}
                    <div style={{ width: '36px', height: '20px', borderRadius: '10px', background: isAvailable ? '#10b981' : 'rgba(255,255,255,0.12)', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                      <div style={{ position: 'absolute', top: '2px', left: isAvailable ? '18px' : '2px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
                    </div>
                  </div>
                </div>

                {/* ── Combo Tray ── */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{lbl.tray}</label>
                    <span style={{ fontSize: '0.62rem', fontWeight: 800, color: selectedIds.length > 0 ? '#a5b4fc' : 'var(--text-muted)' }}>{selectedIds.length} {lbl.items}</span>
                  </div>

                  {selectedIds.length === 0 ? (
                    <div style={{ border: '2px dashed rgba(99,102,241,0.15)', borderRadius: '8px', padding: '20px 14px', textAlign: 'center' }}>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                        {language === 'fr' ? 'Cliquez sur les articles à droite →' : language === 'nl' ? 'Klik op artikelen rechts →' : 'Click items on the right →'}
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {trayItems.map((it: any, idx: number) => (
                        <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', borderRadius: '6px', background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.12)' }}>
                          <span style={{ fontSize: '0.7rem', width: '16px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 800, flexShrink: 0 }}>{idx + 1}</span>
                          <span style={{ fontSize: '0.85rem', flexShrink: 0 }}>{VAT_EMOJI[it.vatCategory] || '•'}</span>
                          <span style={{ flex: 1, fontSize: '0.75rem', fontWeight: 600, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{iname(it)}</span>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent)', flexShrink: 0 }}>€{it.grossPrice.toFixed(2)}</span>
                          <button onClick={() => removeFromTray(it.id)}
                            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', cursor: 'pointer', fontSize: '0.9rem', lineHeight: 1, padding: '0 2px', transition: 'color 0.15s', flexShrink: 0 }}
                            onMouseEnter={e => e.currentTarget.style.color = '#fca5a5'}
                            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.25)'}
                          >×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Save / Cancel */}
                <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', flexShrink: 0 }}>
                  <button onClick={() => setEditorOpen(false)}
                    style={{ flex: 1, padding: '9px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                    {lbl.cancel}
                  </button>
                  <button onClick={handleSave}
                    disabled={!comboName.trim() || selectedIds.length === 0}
                    className="btn-primary"
                    style={{ flex: 2, padding: '9px', fontSize: '0.82rem', fontWeight: 700, borderRadius: '8px', border: 'none', cursor: (!comboName.trim() || selectedIds.length === 0) ? 'not-allowed' : 'pointer', opacity: (!comboName.trim() || selectedIds.length === 0) ? 0.45 : 1 }}>
                    {lbl.save} {selectedIds.length > 0 && `· ${selectedIds.length} ${lbl.items}`}
                  </button>
                </div>
              </div>

              {/* ── RIGHT: Item Picker ── */}
              <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>

                {/* Category tab bar */}
                <div style={{ display: 'flex', gap: '4px', padding: '14px 20px 10px', borderBottom: '1px solid rgba(255,255,255,0.04)', flexWrap: 'wrap', flexShrink: 0, background: 'rgba(0,0,0,0.15)' }}>
                  <button onClick={() => setActiveCatTab('all')}
                    style={{ padding: '4px 12px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', border: 'none', background: activeCatTab === 'all' ? 'linear-gradient(135deg, var(--primary), #4f46e5)' : 'rgba(255,255,255,0.04)', color: activeCatTab === 'all' ? '#fff' : 'var(--text-muted)', transition: 'all 0.15s' }}>
                    {lbl.allCats}
                  </button>
                  {catsWithItems.map((cat: any) => (
                    <button key={cat.id} onClick={() => setActiveCatTab(cat.id)}
                      style={{ padding: '4px 12px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', border: 'none', background: activeCatTab === cat.id ? 'linear-gradient(135deg, var(--primary), #4f46e5)' : 'rgba(255,255,255,0.04)', color: activeCatTab === cat.id ? '#fff' : 'var(--text-muted)', transition: 'all 0.15s' }}>
                      {cname(cat)}
                    </button>
                  ))}
                </div>

                {/* Items grid */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
                  {pickerItems.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      {language === 'fr' ? 'Aucun article dans cette catégorie' : language === 'nl' ? 'Geen artikelen in deze categorie' : 'No items in this category'}
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '10px' }}>
                      {(pickerItems as any[]).map((it: any) => {
                        const sel = selectedIds.includes(it.id);
                        return (
                          <div key={it.id} onClick={() => toggleItem(it.id)}
                            style={{ padding: '14px', borderRadius: '10px', cursor: 'pointer', background: sel ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.025)', border: sel ? '1.5px solid rgba(99,102,241,0.4)' : '1.5px solid rgba(255,255,255,0.06)', transition: 'all 0.16s', position: 'relative', userSelect: 'none' }}
                            onMouseEnter={e => { if (!sel) (e.currentTarget as any).style.borderColor = 'rgba(99,102,241,0.2)'; (e.currentTarget as any).style.background = sel ? 'rgba(99,102,241,0.16)' : 'rgba(99,102,241,0.04)'; }}
                            onMouseLeave={e => { (e.currentTarget as any).style.borderColor = sel ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.06)'; (e.currentTarget as any).style.background = sel ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.025)'; }}
                          >
                            {/* Checkmark badge */}
                            <div style={{ position: 'absolute', top: '8px', right: '8px', width: '18px', height: '18px', borderRadius: '50%', background: sel ? 'var(--primary)' : 'rgba(255,255,255,0.06)', border: sel ? 'none' : '1.5px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', flexShrink: 0 }}>
                              {sel && <span style={{ fontSize: '0.6rem', color: '#fff', fontWeight: 900 }}>✓</span>}
                            </div>

                            {/* Item emoji */}
                            <div style={{ fontSize: '1.6rem', marginBottom: '8px', lineHeight: 1 }}>{VAT_EMOJI[it.vatCategory] || '🍽️'}</div>

                            {/* Item name */}
                            <p style={{ fontSize: '0.78rem', fontWeight: sel ? 700 : 600, color: sel ? '#f1f5f9' : 'var(--text-secondary)', margin: 0, marginBottom: '6px', lineHeight: 1.25, letterSpacing: '-0.01em' }}>{iname(it)}</p>

                            {/* Price row */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: sel ? 'var(--accent)' : 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>€{it.grossPrice.toFixed(2)}</span>
                              <span style={{ fontSize: '0.58rem', fontWeight: 700, padding: '1px 5px', borderRadius: '3px', background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {it.vatCategory === 'food' ? (language === 'fr' ? 'alim.' : 'food') : it.vatCategory === 'soft_drink' ? 'drink' : it.vatCategory === 'alcohol' ? 'alc.' : 'svc'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Selection summary bar at bottom of picker */}
                {selectedIds.length > 0 && (
                  <div style={{ padding: '10px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(99,102,241,0.04)', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    <div style={{ flex: 1, display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {trayItems.slice(0, 5).map((it: any) => (
                        <span key={it.id} style={{ fontSize: '0.62rem', fontWeight: 700, padding: '2px 7px', borderRadius: '4px', background: 'rgba(99,102,241,0.15)', color: '#c7d2fe', border: '1px solid rgba(99,102,241,0.2)' }}>
                          {VAT_EMOJI[it.vatCategory]} {iname(it)}
                        </span>
                      ))}
                      {trayItems.length > 5 && <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>+{trayItems.length - 5} more</span>}
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent)', flexShrink: 0 }}>€{normalTotal.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
