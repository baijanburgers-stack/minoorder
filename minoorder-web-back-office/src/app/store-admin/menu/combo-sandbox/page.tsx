'use client';

import React, { useState } from 'react';
import { useMenu } from '../context';
import { translations } from '../translations';
import { useToast } from '../../../../components/Toast';

export default function ComboBuilderPage() {
  const { deals, setDeals, items, categories, language } = useMenu();
  const t = translations[language];
  const { showToast } = useToast();

  // Modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<any>(null);

  // Form fields
  const [comboName, setComboName] = useState('');
  const [fixedPrice, setFixedPrice] = useState('12.00');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [isAvailable, setIsAvailable] = useState(true);

  // Label helpers
  const lbl = {
    en: { title: 'Combo Deals', desc: 'Build combo packages with fixed prices. The cart handles proportional discount distribution automatically.', createBtn: 'New Combo', noItems: 'No combos yet', noItemsDesc: 'Create your first combo package', nameLabel: 'Combo Name', namePh: 'e.g. BURGER COMBO MEAL', priceLabel: 'Fixed Combo Price', itemsLabel: 'Select Items for this Combo', availLabel: 'Available for order', saveBtn: 'Save Combo', editTitle: 'Edit Combo', createTitle: 'New Combo', normalTotal: 'Normal total', itemsIn: 'items' },
    fr: { title: 'Formules Combo', desc: "Créez des formules combo avec un prix fixe. La caisse gère automatiquement la répartition proportionnelle des remises.", createBtn: 'Nouvelle Formule', noItems: 'Aucune formule', noItemsDesc: 'Créez votre première formule combo', nameLabel: 'Nom de la Formule', namePh: 'ex. FORMULE COMBO BURGER', priceLabel: 'Prix Fixe du Combo', itemsLabel: 'Sélectionner les Articles', availLabel: 'Disponible à la commande', saveBtn: 'Enregistrer', editTitle: 'Modifier', createTitle: 'Nouvelle Formule', normalTotal: 'Total normal', itemsIn: 'articles' },
    nl: { title: 'Combo Deals', desc: 'Maak combopakketten met vaste prijzen. De kassa verwerkt de proportionele kortingsverdeling automatisch.', createBtn: 'Nieuwe Combo', noItems: 'Geen combos', noItemsDesc: 'Maak uw eerste combopakket aan', nameLabel: 'Combonaam', namePh: 'bijv. BURGER COMBO MAALTIJD', priceLabel: 'Vaste Comboprijs', itemsLabel: 'Selecteer Artikelen', availLabel: 'Beschikbaar voor bestelling', saveBtn: 'Opslaan', editTitle: 'Bewerken', createTitle: 'Nieuwe Combo', normalTotal: 'Normaal totaal', itemsIn: 'artikelen' },
  }[language];

  const getItemName = (item: any) =>
    (language === 'en' ? item.nameEn : language === 'fr' ? item.nameFr : item.nameNl) || item.name;
  const getCatName = (catId: string) => {
    const c = categories.find((x: any) => x.id === catId);
    if (!c) return '';
    return (language === 'en' ? c.nameEn : language === 'fr' ? c.nameFr : c.nameNl) || c.name;
  };
  const getDealName = (deal: any) => deal.name;

  const normalTotal = selectedItemIds.reduce((sum, id) => {
    const it = items.find((x: any) => x.id === id);
    return sum + (it ? it.grossPrice : 0);
  }, 0);
  const savings = Math.max(0, normalTotal - parseFloat(fixedPrice || '0'));

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '');
    if (!digits) { setFixedPrice('0.00'); return; }
    setFixedPrice((parseInt(digits, 10) / 100).toFixed(2));
  };

  const openCreate = () => {
    setEditingDeal(null);
    setComboName('');
    setFixedPrice('12.00');
    setSelectedItemIds([]);
    setIsAvailable(true);
    setIsCreateOpen(true);
  };

  const openEdit = (deal: any) => {
    setEditingDeal(deal);
    setComboName(deal.name);
    setFixedPrice(deal.fixedPrice.toFixed(2));
    setSelectedItemIds(deal.itemIds || []);
    setIsAvailable(deal.isAvailable);
    setIsCreateOpen(true);
  };

  const toggleItem = (id: string) => {
    setSelectedItemIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comboName.trim() || selectedItemIds.length === 0) return;
    const name = comboName.trim().toUpperCase();

    if (editingDeal) {
      setDeals(deals.map((d: any) => d.id === editingDeal.id
        ? { ...d, name, nameEn: name, nameFr: name, nameNl: name, fixedPrice: parseFloat(fixedPrice), itemIds: selectedItemIds, isAvailable }
        : d
      ));
      showToast(`Combo "${name}" updated.`, 'success');
    } else {
      const newDeal = { id: 'd_' + Date.now(), name, nameEn: name, nameFr: name, nameNl: name, fixedPrice: parseFloat(fixedPrice), itemIds: selectedItemIds, isAvailable };
      setDeals([...deals, newDeal]);
      showToast(`Combo "${name}" created.`, 'success');
    }
    setIsCreateOpen(false);
  };

  const handleDelete = (id: string) => {
    setDeals(deals.filter((d: any) => d.id !== id));
    showToast('Combo deleted.', 'info');
  };

  // Group items by category for the item picker
  const itemsByCategory = categories.map((cat: any) => ({
    cat,
    catItems: items.filter((it: any) => it.categoryId === cat.id),
  })).filter(g => g.catItems.length > 0);

  return (
    <div>
      {/* ── Page Header ── */}
      <div style={{ marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
          <span style={{ fontSize: '1.1rem' }}>🎁</span>
          <h1 className="page-title"><span className="text-gradient">{lbl.title}</span></h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{lbl.desc}</p>
      </div>

      {/* ── Combo List Card ── */}
      <div className="glass-card" style={{ padding: '20px 24px' }}>

        {/* Section header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                <span>🎁</span> {lbl.title}
              </h3>
              <span style={{ fontSize: '0.62rem', fontWeight: 800, background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.06))', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)', padding: '2px 8px', borderRadius: '20px' }}>
                {deals.length} {language === 'fr' ? 'formules' : language === 'nl' ? 'combos' : 'combos'}
              </span>
            </div>
            <p style={{ fontSize: '0.71rem', color: 'var(--text-muted)', marginTop: '3px' }}>
              {language === 'fr' ? 'Prix fixe · Les articles sont sélectionnés à la création' : language === 'nl' ? 'Vaste prijs · Artikelen worden bij aanmaken geselecteerd' : 'Fixed price · Items are selected at creation'}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '20px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', boxShadow: '0 0 6px rgba(16,185,129,0.6)' }} />
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#6ee7b7' }}>{t.activeSnapshot}</span>
            </div>
            <button onClick={openCreate} className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.74rem', fontWeight: 700, borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', border: 'none', boxShadow: '0 4px 12px rgba(99,102,241,0.2)' }}>
              <span style={{ fontSize: '1rem', lineHeight: 1 }}>+</span> {lbl.createBtn}
            </button>
          </div>
        </div>

        {/* Gradient divider */}
        <div style={{ height: '1px', background: 'linear-gradient(to right, rgba(99,102,241,0.2), rgba(255,255,255,0.04), transparent)', marginBottom: '14px' }} />

        {deals.length === 0 ? (
          <div style={{ height: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '12px', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '2.5rem', opacity: 0.5 }}>🎁</span>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>{lbl.noItems}</p>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{lbl.noItemsDesc}</p>
            </div>
            <button onClick={openCreate} className="btn-primary" style={{ padding: '7px 16px', fontSize: '0.78rem', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>
              + {lbl.createBtn}
            </button>
          </div>
        ) : (
          <div>
            {/* Column headers */}
            <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr 1fr 0.6fr 0.9fr', gap: '8px', padding: '4px 12px 8px', alignItems: 'center' }}>
              {[
                language === 'fr' ? 'FORMULE' : language === 'nl' ? 'COMBO' : 'COMBO',
                language === 'fr' ? 'ARTICLES' : language === 'nl' ? 'ARTIKELEN' : 'ITEMS',
                language === 'fr' ? 'PRIX FIXE' : language === 'nl' ? 'PRIJS' : 'FIXED PRICE',
                language === 'fr' ? 'DISPO.' : language === 'nl' ? 'BESCHIKB.' : 'STATUS',
                language === 'fr' ? 'ACTIONS' : language === 'nl' ? 'ACTIES' : 'ACTIONS',
              ].map((label, i) => (
                <span key={i} style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: i === 4 ? 'right' : 'left' }}>
                  {label}
                </span>
              ))}
            </div>
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', marginBottom: '6px' }} />

            {/* Combo rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {deals.map((deal: any) => {
                const dealItems = (deal.itemIds || []).map((id: string) => items.find((x: any) => x.id === id)).filter(Boolean);
                const normalSum = dealItems.reduce((s: number, it: any) => s + it.grossPrice, 0);
                const saving = Math.max(0, normalSum - deal.fixedPrice);
                return (
                  <div key={deal.id}
                    style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr 1fr 0.6fr 0.9fr', gap: '8px', alignItems: 'center', padding: '10px 12px', borderRadius: '7px', background: 'rgba(255,255,255,0.018)', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.18s ease' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(99,102,241,0.04)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(99,102,241,0.18)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.018)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.05)'; }}
                  >
                    {/* Col 1 – Name + item thumbnails */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {getDealName(deal)}
                      </span>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {dealItems.map((it: any) => (
                          <span key={it.id} style={{ fontSize: '0.6rem', fontWeight: 700, background: 'rgba(99,102,241,0.07)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.15)', padding: '1px 6px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                            {getItemName(it)}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Col 2 – Item count + savings */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f1f5f9' }}>{dealItems.length} {lbl.itemsIn.split(' ')[0]}</span>
                      {saving > 0 && (
                        <span style={{ fontSize: '0.63rem', color: '#6ee7b7', fontWeight: 700 }}>−€{saving.toFixed(2)} {language === 'fr' ? 'écon.' : language === 'nl' ? 'bespaar.' : 'saving'}</span>
                      )}
                    </div>

                    {/* Col 3 – Price */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>€ {deal.fixedPrice.toFixed(2)}</span>
                      {normalSum > deal.fixedPrice && (
                        <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>€ {normalSum.toFixed(2)}</span>
                      )}
                    </div>

                    {/* Col 4 – Status */}
                    <div>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '2px 7px', borderRadius: '20px', fontSize: '0.62rem', fontWeight: 700, whiteSpace: 'nowrap', background: deal.isAvailable ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.08)', color: deal.isAvailable ? '#6ee7b7' : '#fca5a5', border: deal.isAvailable ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(239,68,68,0.22)' }}>
                        <span style={{ fontSize: '0.55rem' }}>{deal.isAvailable ? '●' : '○'}</span>
                        {deal.isAvailable ? (language === 'fr' ? 'Actif' : language === 'nl' ? 'Actief' : 'Active') : (language === 'fr' ? 'Masqué' : language === 'nl' ? 'Verborgen' : 'Hidden')}
                      </span>
                    </div>

                    {/* Col 5 – Actions */}
                    <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-end' }}>
                      <button onClick={() => openEdit(deal)}
                        style={{ padding: '4px 8px', cursor: 'pointer', fontSize: '0.72rem', borderRadius: '5px', border: '1px solid rgba(99,102,241,0.25)', background: 'rgba(99,102,241,0.06)', color: '#a5b4fc', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.15)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.06)'; }}
                      >✏️</button>
                      <button onClick={() => handleDelete(deal.id)}
                        style={{ padding: '4px 8px', cursor: 'pointer', fontSize: '0.72rem', borderRadius: '5px', border: '1px solid rgba(239,68,68,0.22)', background: 'rgba(239,68,68,0.05)', color: '#fca5a5', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.14)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.05)'; }}
                      >🗑️</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════ */}
      {/* CREATE / EDIT MODAL                           */}
      {/* ══════════════════════════════════════════════ */}
      {isCreateOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '24px 16px', overflowY: 'auto' }}>
          <div className="glass-card animate-modal" style={{ width: '100%', maxWidth: '780px', padding: '28px 32px', position: 'relative', boxShadow: '0 25px 60px rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '24px' }}>

            {/* Close */}
            <button onClick={() => setIsCreateOpen(false)}
              style={{ position: 'absolute', top: '18px', right: '20px', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1, transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            >&times;</button>

            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', marginBottom: '20px', letterSpacing: '-0.01em' }}>
              🎁 {editingDeal ? lbl.editTitle : lbl.createTitle}
            </h3>

            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

                {/* LEFT: Name + price + availability */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>{lbl.nameLabel}</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder={lbl.namePh}
                      value={comboName}
                      onChange={e => setComboName(e.target.value.toUpperCase())}
                      style={{ fontSize: '0.82rem', fontWeight: 600 }}
                      required
                    />
                  </div>

                  {/* Fixed price */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>{lbl.priceLabel}</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontWeight: 800, fontSize: '1rem' }}>€</span>
                      <input type="text" className="form-input" value={fixedPrice} onChange={handlePriceChange}
                        style={{ paddingLeft: '30px', textAlign: 'right', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem', color: 'var(--accent)', letterSpacing: '-0.01em' }} required />
                    </div>
                    {/* Live savings preview */}
                    {selectedItemIds.length > 0 && (
                      <div style={{ marginTop: '8px', padding: '8px 12px', borderRadius: '7px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{lbl.normalTotal}: <strong style={{ color: '#f1f5f9' }}>€ {normalTotal.toFixed(2)}</strong></span>
                        {savings > 0 && <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#6ee7b7' }}>−€ {savings.toFixed(2)} {language === 'fr' ? 'économisé' : language === 'nl' ? 'besparing' : 'saving'}</span>}
                      </div>
                    )}
                  </div>

                  {/* Availability toggle */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <label className="switch">
                      <input type="checkbox" checked={isAvailable} onChange={e => setIsAvailable(e.target.checked)} />
                      <span className="slider"></span>
                    </label>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: isAvailable ? '#6ee7b7' : 'var(--text-muted)' }}>{lbl.availLabel}</span>
                  </div>
                </div>

                {/* RIGHT: Item picker grouped by category */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {lbl.itemsLabel} <span style={{ color: selectedItemIds.length > 0 ? '#a5b4fc' : 'var(--text-muted)' }}>({selectedItemIds.length})</span>
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '340px', overflowY: 'auto', paddingRight: '4px' }}>
                    {itemsByCategory.length === 0 ? (
                      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', border: '2px dashed rgba(255,255,255,0.06)', borderRadius: '8px' }}>
                        {language === 'fr' ? 'Créez des articles dans le catalogue d\'abord' : language === 'nl' ? 'Maak eerst artikelen in de catalogus' : 'Create items in the catalog first'}
                      </div>
                    ) : itemsByCategory.map(({ cat, catItems }) => (
                      <div key={cat.id}>
                        <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '4px', paddingLeft: '4px' }}>
                          {getCatName(cat.id) || cat.name}
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          {catItems.map((it: any) => {
                            const selected = selectedItemIds.includes(it.id);
                            return (
                              <div key={it.id} onClick={() => toggleItem(it.id)}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', borderRadius: '6px', cursor: 'pointer', background: selected ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.02)', border: selected ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.05)', transition: 'all 0.15s' }}
                                onMouseEnter={e => { if (!selected) (e.currentTarget as HTMLDivElement).style.background = 'rgba(99,102,241,0.04)'; }}
                                onMouseLeave={e => { if (!selected) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.02)'; }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div style={{ width: '16px', height: '16px', borderRadius: '4px', border: selected ? '2px solid var(--primary)' : '2px solid rgba(255,255,255,0.15)', background: selected ? 'var(--primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                                    {selected && <span style={{ fontSize: '0.6rem', color: '#fff', fontWeight: 900 }}>✓</span>}
                                  </div>
                                  <span style={{ fontSize: '0.78rem', fontWeight: selected ? 700 : 500, color: selected ? '#f1f5f9' : 'var(--text-secondary)' }}>
                                    {getItemName(it)}
                                  </span>
                                </div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: selected ? 'var(--accent)' : 'var(--text-muted)', flexShrink: 0 }}>
                                  € {it.grossPrice.toFixed(2)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px', marginTop: '20px' }}>
                <button type="button" onClick={() => setIsCreateOpen(false)}
                  style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: 'var(--text-secondary)', padding: '10px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                >
                  {t.cancel}
                </button>
                <button type="submit" className="btn-primary"
                  style={{ flex: 1.5, padding: '10px', fontSize: '0.85rem', opacity: selectedItemIds.length === 0 ? 0.5 : 1, cursor: selectedItemIds.length === 0 ? 'not-allowed' : 'pointer' }}
                  disabled={selectedItemIds.length === 0}
                >
                  {lbl.saveBtn} {selectedItemIds.length > 0 && `(${selectedItemIds.length} items)`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
