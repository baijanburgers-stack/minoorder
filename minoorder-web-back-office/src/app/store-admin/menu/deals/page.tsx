'use client';

import React, { useState } from 'react';
import { useMenu } from '../context';
import { translations } from '../translations';
import { useToast } from '../../../../components/Toast';

export default function DealsPage() {
  const { deals, setDeals, language } = useMenu();
  const t = translations[language];
  const { showToast } = useToast();

  // Modal open state
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form states
  const [newDealNameEn, setNewDealNameEn] = useState('');
  const [newDealNameFr, setNewDealNameFr] = useState('');
  const [newDealNameNl, setNewDealNameNl] = useState('');
  const [newDealPrice, setNewDealPrice] = useState('12.00');
  const [newDealItemsCount, setNewDealItemsCount] = useState('3');

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '');
    if (!digits) {
      setNewDealPrice('0.00');
      return;
    }
    const parsedValue = parseInt(digits, 10) / 100;
    setNewDealPrice(parsedValue.toFixed(2));
  };

  const handlePriceFocus = (e: React.FocusEvent<HTMLInputElement> | React.MouseEvent<HTMLInputElement>) => {
    const target = e.currentTarget;
    setTimeout(() => {
      const length = target.value.length;
      target.setSelectionRange(length, length);
    }, 0);
  };

  const handleAddDeal = (e: React.FormEvent) => {
    e.preventDefault();
    const primaryName = newDealNameEn || newDealNameFr || newDealNameNl;
    if (!primaryName) return;

    const finalEn = (newDealNameEn || primaryName).toUpperCase();
    const finalFr = (newDealNameFr || primaryName).toUpperCase();
    const finalNl = (newDealNameNl || primaryName).toUpperCase();

    const newDl = {
      id: 'd_' + Date.now().toString(),
      name: finalEn, // Save primary/En as base name
      nameEn: finalEn,
      nameFr: finalFr,
      nameNl: finalNl,
      fixedPrice: parseFloat(newDealPrice) || 0.00,
      itemsCount: parseInt(newDealItemsCount) || 1,
      isAvailable: true
    };

    setDeals([...deals, newDl]);
    setNewDealNameEn('');
    setNewDealNameFr('');
    setNewDealNameNl('');
    setNewDealPrice('12.00');
    setNewDealItemsCount('3');
    setIsCreateOpen(false); // Close the modal
    const activeName = language === 'en' ? finalEn : language === 'fr' ? finalFr : finalNl;
    showToast(t.alertDealAdded.replace('{name}', activeName), 'success');
  };

  const handleDeleteDeal = (id: string) => {
    setDeals(deals.filter(d => d.id !== id));
    showToast(t.alertDealDeleted, 'info');
  };

  return (
    <div>
      {/* Header bar */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '4px' }}>
            <span className="text-gradient">{t.comboDealsTitle}</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>{t.comboDealsDesc}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="glass-card" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent)' }} />
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{t.activeSnapshot}</span>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="btn-primary"
            style={{
              padding: '10px 20px',
              fontSize: '0.875rem',
              fontWeight: 600,
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
              border: 'none',
              transition: 'var(--transition-smooth)'
            }}
          >
            <span style={{ fontSize: '1.25rem', lineHeight: '1', fontWeight: 'bold' }}>+</span> {t.createCombo}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
        {/* Deals Inventory List */}
        <div className="glass-card" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', fontWeight: 700 }}>{t.comboDealsTitle}</h3>
          {deals.length === 0 ? (
            <div style={{ height: '240px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '16px', color: 'var(--text-muted)' }}>
              <span>{t.noDeals}</span>
              <button 
                onClick={() => setIsCreateOpen(true)} 
                className="btn-primary"
                style={{ padding: '8px 16px', fontSize: '0.8rem', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
              >
                + {t.createCombo}
              </button>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  <th style={{ paddingBottom: '12px' }}>{language === 'fr' ? 'TITRE DE LA FORMULE' : (language === 'nl' ? 'DEAL TITEL' : 'DEAL TITLE')}</th>
                  <th style={{ paddingBottom: '12px' }}>{language === 'fr' ? 'NOMBRE D\'ARTICLES' : (language === 'nl' ? 'AANTAL PRODUCTEN' : 'ITEMS COUNT')}</th>
                  <th style={{ paddingBottom: '12px' }}>{t.status}</th>
                  <th style={{ paddingBottom: '12px' }}>{language === 'fr' ? 'PRIX FIXE DE LA FORMULE' : (language === 'nl' ? 'VASTE PAKKETPRIJS' : 'FIXED PACKAGE PRICE')}</th>
                  <th style={{ paddingBottom: '12px', textAlign: 'right' }}>{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {deals.map(deal => {
                  const dealTranslatedName = (t as any).menu?.deals?.[deal.id] || (language === 'en' ? deal.nameEn : language === 'fr' ? deal.nameFr : deal.nameNl) || deal.name;
                  return (
                    <tr key={deal.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9375rem' }}>
                      <td style={{ padding: '16px 0', fontWeight: 600 }}>{dealTranslatedName}</td>
                    <td style={{ padding: '16px 0', color: 'var(--text-muted)' }}>
                      {t.itemsCount.replace('{count}', String(deal.itemsCount))}
                    </td>
                    <td style={{ padding: '16px 0' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: deal.isAvailable ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        color: deal.isAvailable ? 'var(--accent)' : 'var(--danger)',
                      }}>
                        {deal.isAvailable ? t.posActive : (language === 'fr' ? 'Désactivé' : (language === 'nl' ? 'Uitgeschakeld' : 'Disabled'))}
                      </span>
                    </td>
                    <td style={{ padding: '16px 0', fontWeight: 600, color: 'var(--accent)' }}>
                      € {deal.fixedPrice.toFixed(2)}
                    </td>
                    <td style={{ padding: '16px 0', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDeleteDeal(deal.id)}
                        style={{
                          background: 'rgba(239,68,68,0.08)',
                          border: '1px solid var(--danger)',
                          borderRadius: '6px',
                          color: '#fca5a5',
                          padding: '6px 12px',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          transition: 'var(--transition-smooth)'
                        }}
                      >
                        {t.delete}
                      </button>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Glassmorphic Modal Dialog Overlay */}
      {isCreateOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px'
        }}>
          <div className="glass-card animate-modal" style={{
            width: '100%',
            maxWidth: '680px',
            padding: '36px',
            position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.12)'
          }}>
            {/* Modal Close Button */}
            <button
              onClick={() => setIsCreateOpen(false)}
              style={{
                position: 'absolute',
                top: '24px',
                right: '24px',
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '1.75rem',
                cursor: 'pointer',
                transition: 'color 0.2s',
                lineHeight: '1',
                zIndex: 10
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              &times;
            </button>

            <h3 style={{ fontSize: '1.5rem', marginBottom: '28px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
              {language === 'fr' ? 'Créer une Offre Combo' : (language === 'nl' ? 'Combodeal Aanmaken' : 'Create Combo Deal')}
            </h3>
            <form onSubmit={handleAddDeal}>
              <div className="form-grid-layout" style={{ marginBottom: '32px' }}>
                {/* Left Column: Localized Names */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '-8px', fontWeight: 700, letterSpacing: '0.05em' }}>{t.dealTitle}</label>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>English 🇬🇧</span>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. STANDARD COMBO DEAL 🍔🍟🥤"
                      value={newDealNameEn}
                      onChange={e => setNewDealNameEn(e.target.value.toUpperCase())}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Français 🇫🇷</span>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="ex. FORMULE COMBO STANDARD 🍔🍟🥤"
                      value={newDealNameFr}
                      onChange={e => setNewDealNameFr(e.target.value.toUpperCase())}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Nederlands 🇳🇱</span>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="bijv. STANDAARD COMBODEAL 🍔🍟🥤"
                      value={newDealNameNl}
                      onChange={e => setNewDealNameNl(e.target.value.toUpperCase())}
                      required
                    />
                  </div>
                </div>

                {/* Right Column: Price and Component Limit */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Fixed Price Input */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 700, letterSpacing: '0.05em' }}>{t.fixedPrice}</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontWeight: 700, fontSize: '1.1rem' }}>€</span>
                      <input
                        type="text"
                        className="form-input"
                        value={newDealPrice}
                        onChange={handlePriceChange}
                        onFocus={handlePriceFocus}
                        onClick={handlePriceFocus}
                        style={{ padding: '14px 16px 14px 32px', textAlign: 'right', width: '100%', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--accent)', letterSpacing: '0.05em' }}
                        required
                      />
                    </div>
                  </div>

                  {/* Component Limit Input */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 700, letterSpacing: '0.05em' }}>{t.componentLimit}</label>
                    <input
                      type="number"
                      className="form-input"
                      value={newDealItemsCount}
                      onChange={e => setNewDealItemsCount(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '24px' }}>
                <button 
                  type="button" 
                  onClick={() => setIsCreateOpen(false)}
                  style={{
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    color: 'var(--text-secondary)',
                    padding: '14px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                >
                  {t.cancel}
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1.5, padding: '14px', fontSize: '0.9rem' }}>
                  {t.saveCombo}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
