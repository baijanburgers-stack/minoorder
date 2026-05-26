'use client';

import React, { useState } from 'react';
import { useMenu, MenuItem } from '../context';
import { translations } from '../translations';
import { useToast } from '../../../../components/Toast';

export default function ItemsPage() {
  const { items, setItems, categories, modifierGroups, storeVatRates, language } = useMenu();
  const t = translations[language];
  const { showToast } = useToast();

  // Modal open state
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form states
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('0.00');
  const [newItemVat, setNewItemVat] = useState<'food' | 'soft_drink' | 'alcohol' | 'service'>('food');
  const [newItemCatId, setNewItemCatId] = useState(categories[0]?.id || 'c1');

  // Attached modifiers & dragging states
  const [attachedModifiers, setAttachedModifiers] = useState<any[]>([]);
  const [selectedModifierGroupId, setSelectedModifierGroupId] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Image upload states
  const [newItemImage, setNewItemImage] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [imageError, setImageError] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Max 10MB validation
    const maxBytes = 10 * 1024 * 1024; // 10MB
    if (file.size > maxBytes) {
      setImageError(t.fileTooLarge);
      setSelectedFileName('');
      setImagePreview('');
      setNewItemImage('');
      e.target.value = ''; // Reset file input
      return;
    }

    setImageError('');
    setSelectedFileName(file.name);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImagePreview(base64String);
      setNewItemImage(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedFileName('');
    setImagePreview('');
    setNewItemImage('');
    setImageError('');
    const fileInput = document.getElementById('itemImageFile') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '');
    if (!digits) {
      setNewItemPrice('0.00');
      return;
    }
    const parsedValue = parseInt(digits, 10) / 100;
    setNewItemPrice(parsedValue.toFixed(2));
  };

  const handlePriceFocus = (e: React.FocusEvent<HTMLInputElement> | React.MouseEvent<HTMLInputElement>) => {
    const target = e.currentTarget;
    setTimeout(() => {
      const length = target.value.length;
      target.setSelectionRange(length, length);
    }, 0);
  };

  const getVatRate = (category: string, takeaway: boolean): number => {
    let ratePercent = 21.00;
    if (category === 'food') {
      ratePercent = takeaway ? storeVatRates.foodTakeaway : storeVatRates.foodDineIn;
    } else if (category === 'soft_drink') {
      ratePercent = takeaway ? storeVatRates.softDrinkTakeaway : storeVatRates.softDrinkDineIn;
    } else if (category === 'alcohol') {
      ratePercent = takeaway ? storeVatRates.alcoholTakeaway : storeVatRates.alcoholDineIn;
    } else if (category === 'service') {
      ratePercent = 21.00;
    }
    return ratePercent / 100;
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || parseFloat(newItemPrice) <= 0) return;

    const newItem: MenuItem = {
      id: Date.now().toString(),
      name: newItemName, // Save name as base name
      nameEn: newItemName,
      nameFr: newItemName,
      nameNl: newItemName,
      grossPrice: parseFloat(newItemPrice),
      vatCategory: newItemVat,
      categoryId: newItemCatId,
      imageUrl: newItemImage, // Save image data
      modifierIds: attachedModifiers.map(m => m.id), // Link modifier groups
    };

    setItems([...items, newItem]);
    setNewItemName('');
    setNewItemPrice('0.00');
    setAttachedModifiers([]);
    setSelectedModifierGroupId('');
    setSelectedFileName('');
    setImagePreview('');
    setNewItemImage('');
    setImageError('');
    setIsCreateOpen(false); // Close the modal
    showToast(t.alertProductAdded.replace('{name}', newItemName), 'success');
  };

  const handleAddModifierGroup = () => {
    if (!selectedModifierGroupId) return;
    const group = modifierGroups.find((m: any) => m.id === selectedModifierGroupId);
    if (group && !attachedModifiers.some((am: any) => am.id === group.id)) {
      setAttachedModifiers([...attachedModifiers, group]);
    }
    setSelectedModifierGroupId('');
  };

  const handleRemoveModifierGroup = (id: string) => {
    setAttachedModifiers(attachedModifiers.filter((m: any) => m.id !== id));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null) return;
    const reordered = [...attachedModifiers];
    const [draggedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(index, 0, draggedItem);
    setAttachedModifiers(reordered);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
    showToast(t.alertProductDeleted, 'info');
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
        {/* Catalog items list */}
        <div className="glass-card" style={{ padding: '20px 24px' }}>

          {/* ── Section Header ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '14px', marginBottom: '0', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                  <span style={{ fontSize: '1rem' }}>🍽️</span> {t.productsCatalog}
                </h3>
                <span style={{
                  fontSize: '0.62rem', fontWeight: 800,
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.06))',
                  color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)',
                  padding: '2px 8px', borderRadius: '20px',
                }}>
                  {items.length} {language === 'fr' ? 'produits' : language === 'nl' ? 'producten' : 'products'}
                </span>
              </div>
              <p style={{ fontSize: '0.71rem', color: 'var(--text-muted)', marginTop: '3px' }}>{t.productsDesc}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '20px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', boxShadow: '0 0 6px rgba(16,185,129,0.6)' }} />
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#6ee7b7' }}>{t.activeSnapshot}</span>
              </div>
              <button onClick={() => setIsCreateOpen(true)} className="btn-primary"
                style={{ padding: '6px 14px', fontSize: '0.74rem', fontWeight: 700, borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', border: 'none', boxShadow: '0 4px 12px rgba(99,102,241,0.2)' }}>
                <span style={{ fontSize: '1rem', lineHeight: 1 }}>+</span> {t.createProduct}
              </button>
            </div>
          </div>

          {/* ── Gradient Divider ── */}
          <div style={{ height: '1px', background: 'linear-gradient(to right, rgba(99,102,241,0.2), rgba(255,255,255,0.04), transparent)', margin: '0 0 14px' }} />

          {items.length === 0 ? (
            <div style={{ height: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '12px', color: 'var(--text-muted)' }}>
              <span style={{ fontSize: '2.5rem', opacity: 0.5 }}>🍽️</span>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>{t.noItems}</p>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {language === 'fr' ? 'Commencez par créer votre premier produit' : language === 'nl' ? 'Maak uw eerste product aan' : 'Start by adding your first menu item'}
                </p>
              </div>
              <button onClick={() => setIsCreateOpen(true)} className="btn-primary" style={{ padding: '7px 16px', fontSize: '0.78rem', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>
                + {t.createProduct}
              </button>
            </div>
          ) : (
            <div>
              {/* ── Column Headers ── */}
              <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr 0.7fr 0.55fr 0.55fr 0.6fr 0.8fr', gap: '8px', padding: '5px 12px 8px', alignItems: 'center' }}>
                {[
                  language === 'fr' ? 'PRODUIT' : language === 'nl' ? 'PRODUCT' : 'PRODUCT',
                  language === 'fr' ? 'CATÉGORIE' : language === 'nl' ? 'CATEGORIE' : 'CATEGORY',
                  language === 'fr' ? 'TVA TYPE' : language === 'nl' ? 'BTW TYPE' : 'VAT TYPE',
                  language === 'fr' ? 'EMPORT.' : language === 'nl' ? 'AFHAAL' : 'T/AWAY',
                  language === 'fr' ? 'PLACE' : language === 'nl' ? 'PLAATSE' : 'DINE-IN',
                  language === 'fr' ? 'PRIX' : language === 'nl' ? 'PRIJS' : 'PRICE',
                  language === 'fr' ? 'ACTIONS' : language === 'nl' ? 'ACTIES' : 'ACTIONS',
                ].map((label, i) => (
                  <span key={i} style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: i === 6 ? 'right' : 'left' }}>
                    {label}
                  </span>
                ))}
              </div>

              {/* ── Column Underline ── */}
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', marginBottom: '6px' }} />

              {/* ── Item Rows ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {items.map(item => {
                  const matchedCat = categories.find(c => c.id === item.categoryId);
                  const catTranslatedName = matchedCat
                    ? ((t as any).menu?.categories?.[matchedCat.id] || (language === 'en' ? matchedCat.nameEn : language === 'fr' ? matchedCat.nameFr : matchedCat.nameNl) || matchedCat.name)
                    : (language === 'fr' ? 'Non Classé' : language === 'nl' ? 'Niet Gecategoriseerd' : 'Uncategorized');
                  const itemTranslatedName = (t as any).menu?.items?.[item.id] || (language === 'en' ? item.nameEn : language === 'fr' ? item.nameFr : item.nameNl) || item.name;
                  const modCount = item.modifierIds?.length || 0;

                  return (
                    <div
                      key={item.id}
                      style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr 0.7fr 0.55fr 0.55fr 0.6fr 0.8fr', gap: '8px', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.018)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '7px', transition: 'all 0.18s ease' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(99,102,241,0.04)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(99,102,241,0.18)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.018)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.05)'; }}
                    >
                      {/* Col 1 – Thumbnail + Name + modifier badges */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <div style={{ width: '30px', height: '30px', flexShrink: 0, borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                          {item.imageUrl
                            ? <img src={item.imageUrl} alt={itemTranslatedName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <span style={{ fontSize: '0.95rem' }}>{(Array.from(catTranslatedName as string).find((c: any) => c.charCodeAt(0) > 127) as string) || '🍽️'}</span>
                          }
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <span style={{ fontSize: '0.81rem', fontWeight: 700, color: '#f1f5f9', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {itemTranslatedName}
                          </span>
                          {modCount > 0 && (
                            <span style={{ fontSize: '0.58rem', fontWeight: 800, color: '#a5b4fc', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', padding: '1px 5px', borderRadius: '3px' }}>
                              ⚙️ {modCount} {language === 'fr' ? 'mod.' : language === 'nl' ? 'mod.' : 'mod.'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Col 2 – Category */}
                      <div>
                        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#c7d2fe', background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.12)', padding: '2px 7px', borderRadius: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-block', maxWidth: '100%' }}>
                          {catTranslatedName}
                        </span>
                      </div>

                      {/* Col 3 – VAT type */}
                      <div>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                          {item.vatCategory.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Col 4 – Takeaway rate */}
                      <div>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#a5b4fc' }}>
                          {(getVatRate(item.vatCategory, true) * 100).toFixed(0)}%
                        </span>
                      </div>

                      {/* Col 5 – Dine-in rate */}
                      <div>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#818cf8' }}>
                          {(getVatRate(item.vatCategory, false) * 100).toFixed(0)}%
                        </span>
                      </div>

                      {/* Col 6 – Price */}
                      <div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#6ee7b7' }}>
                          €{item.grossPrice.toFixed(2)}
                        </span>
                      </div>

                      {/* Col 7 – Actions */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          style={{ padding: '4px 8px', cursor: 'pointer', fontSize: '0.72rem', lineHeight: 1, borderRadius: '5px', border: '1px solid rgba(239,68,68,0.22)', background: 'rgba(239,68,68,0.05)', color: '#fca5a5', transition: 'all 0.18s ease' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.14)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.05)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.22)'; }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
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
            maxHeight: 'calc(100vh - 40px)',
            overflowY: 'auto',
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
              {language === 'fr' ? 'Ajouter un Nouveau Produit' : (language === 'nl' ? 'Nieuw Product Toevoegen' : 'Add New Product')}
            </h3>
            <form onSubmit={handleAddItem}>
              <div className="form-grid-layout" style={{ marginBottom: '24px' }}>
                {/* Left Column: Localized Names (Compact Stack) and Category selector */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Product Title field (Single active language input) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '2px' }}>
                      {t.itemTitle}
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder={language === 'fr' ? 'ex. BURGER AU BŒUF CLASSIQUE 🍔' : (language === 'nl' ? 'bijv. KLASSIEKE RUNDVLEES BURGER 🍔' : 'e.g. CLASSIC BEEF BURGER 🍔')}
                      value={newItemName}
                      onChange={e => setNewItemName(e.target.value.toUpperCase())}
                      required
                      style={{ fontSize: '0.9rem', padding: '10px 12px' }}
                    />
                  </div>

                  {/* Linked Category Dropdown */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      {t.linkedCategory}
                    </label>
                    <select
                      value={newItemCatId}
                      onChange={e => setNewItemCatId(e.target.value)}
                      className="form-input"
                      style={{ background: '#111827', color: '#ffffff', fontSize: '0.85rem', padding: '10px 12px', width: '100%' }}
                    >
                      {categories.map(cat => {
                        const catTranslatedName = (t as any).menu?.categories?.[cat.id] || (language === 'en' ? cat.nameEn : language === 'fr' ? cat.nameFr : cat.nameNl) || cat.name;
                        return (
                          <option key={cat.id} value={cat.id}>{catTranslatedName}</option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {/* Right Column: Compact Media upload, Monospace POS Price input */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Category Image upload - Compact card height of 96px */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      {t.productUpsellImage}
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                      id="itemImageFile"
                    />
                    
                    {imagePreview ? (
                      <div style={{
                        position: 'relative',
                        width: '100%',
                        height: '96px',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        overflow: 'hidden',
                        background: 'rgba(0,0,0,0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          style={{
                            position: 'absolute',
                            top: '6px',
                            right: '6px',
                            background: 'rgba(0,0,0,0.7)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            color: '#ffffff',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            lineHeight: '1',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--danger)'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.7)'}
                        >
                          &times;
                        </button>
                      </div>
                    ) : (
                      <label htmlFor="itemImageFile" className="upload-dropzone" style={{ height: '96px', padding: '12px' }}>
                        <span style={{ fontSize: '1.25rem' }}>📸</span>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-primary)' }}>{t.chooseImage}</span>
                        <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Browse (Max 10MB)</span>
                      </label>
                    )}

                    {imageError && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--danger)', fontWeight: 600, display: 'block', marginTop: '4px' }}>
                        ⚠️ {imageError}
                      </span>
                    )}
                  </div>

                  {/* Price input field with POS style */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      {t.grossPrice}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontWeight: 700, fontSize: '1.1rem' }}>€</span>
                      <input
                        type="text"
                        className="form-input"
                        value={newItemPrice}
                        onChange={handlePriceChange}
                        onFocus={handlePriceFocus}
                        onClick={handlePriceFocus}
                        style={{ padding: '10px 14px 10px 32px', textAlign: 'right', width: '100%', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--accent)', letterSpacing: '0.05em' }}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Full-Width VAT Classification Section */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  {t.vatClassification}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                  {[
                    { id: 'food', label: language === 'fr' ? 'Nourriture' : (language === 'nl' ? 'Voeding' : 'Food'), icon: '🍔', rate: `${storeVatRates.foodTakeaway}% / ${storeVatRates.foodDineIn}%` },
                    { id: 'soft_drink', label: language === 'fr' ? 'Boissons Soft' : (language === 'nl' ? 'Frisdrank' : 'Softs'), icon: '🥤', rate: `${storeVatRates.softDrinkTakeaway}% / ${storeVatRates.softDrinkDineIn}%` },
                    { id: 'alcohol', label: language === 'fr' ? 'Alcools' : (language === 'nl' ? 'Alcohol' : 'Alcohol'), icon: '🍺', rate: `${storeVatRates.alcoholDineIn}%` },
                    { id: 'service', label: language === 'fr' ? 'Services' : (language === 'nl' ? 'Diensten' : 'Service'), icon: '💼', rate: '21%' }
                  ].map(opt => {
                    const isSelected = newItemVat === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setNewItemVat(opt.id as any)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '12px 8px',
                          borderRadius: '10px',
                          background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                          border: isSelected ? '1px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.08)',
                          color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          transition: 'var(--transition-smooth)',
                          gap: '6px',
                          textAlign: 'center',
                          boxShadow: isSelected ? '0 0 12px rgba(99, 102, 241, 0.2)' : 'none'
                        }}
                        onMouseEnter={e => {
                          if (!isSelected) {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                          }
                        }}
                        onMouseLeave={e => {
                          if (!isSelected) {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                          }
                        }}
                      >
                        <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>{opt.icon}</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{opt.label}</span>
                        <span style={{ fontSize: '0.68rem', color: isSelected ? '#a5b4fc' : 'var(--text-muted)', fontWeight: 600 }}>{opt.rate}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

               {/* Modifiers Management Section */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '24px', marginTop: '24px', marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#ffffff', fontWeight: 800, marginBottom: '16px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  ⚙️ {language === 'fr' ? 'Gestion des Modificateurs' : (language === 'nl' ? 'Modificatorbeheer' : 'Modifier Groups Manager')}
                </label>
                
                {/* Visual Quick-Toggle Badges for Modifier Groups */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                  {modifierGroups.map((mg: any) => {
                    const mgTranslatedName = language === 'en' ? mg.nameEn : language === 'fr' ? mg.nameFr : mg.nameNl;
                    const isAttached = attachedModifiers.some(am => am.id === mg.id);
                    return (
                      <button
                        key={mg.id}
                        type="button"
                        onClick={() => {
                          if (isAttached) {
                            handleRemoveModifierGroup(mg.id);
                          } else {
                            setAttachedModifiers([...attachedModifiers, mg]);
                          }
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 16px',
                          borderRadius: '30px',
                          background: isAttached ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                          border: isAttached ? '1px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.08)',
                          color: isAttached ? '#ffffff' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          transition: 'var(--transition-smooth)',
                          boxShadow: isAttached ? '0 0 10px rgba(99, 102, 241, 0.15)' : 'none'
                        }}
                        onMouseEnter={e => {
                          if (!isAttached) {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                          }
                        }}
                        onMouseLeave={e => {
                          if (!isAttached) {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                          }
                        }}
                      >
                        <span style={{ fontSize: '1rem' }}>{isAttached ? '✅' : '➕'}</span>
                        <span>{mgTranslatedName || mg.name}</span>
                        <span style={{
                          fontSize: '0.65rem',
                          padding: '1px 6px',
                          borderRadius: '10px',
                          background: mg.isRequired ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                          color: mg.isRequired ? '#fca5a5' : 'var(--text-muted)'
                        }}>
                          {mg.isRequired ? (language === 'fr' ? 'Requis' : (language === 'nl' ? 'Vereist' : 'Required')) : (language === 'fr' ? 'Optionnel' : (language === 'nl' ? 'Optioneel' : 'Optional'))}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Draggable modifier list with detailed options display */}
                {attachedModifiers.length === 0 ? (
                  <div style={{
                    padding: '24px',
                    borderRadius: '12px',
                    border: '1px dashed rgba(255,255,255,0.08)',
                    background: 'rgba(255,255,255,0.01)',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem'
                  }}>
                    {language === 'fr' ? 'Cliquez sur un groupe ci-dessus pour l\'associer au produit.' : (language === 'nl' ? 'Klik hierboven op een groep om deze aan het product te koppelen.' : 'Click on any modifier group above to attach it to this product.')}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <p style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>↕️</span> {language === 'fr' ? 'Faites glisser les cartes pour réorganiser l\'ordre d\'affichage sur la borne.' : (language === 'nl' ? 'Sleep de kaarten om de volgorde op de kiosk aan te passen.' : 'Drag cards vertically to reorder the selection sequence on the kiosk terminal.')}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {attachedModifiers.map((mg: any, index: number) => {
                        const mgTranslatedName = language === 'en' ? mg.nameEn : language === 'fr' ? mg.nameFr : mg.nameNl;
                        const isRequired = mg.isRequired;
                        return (
                          <div
                            key={mg.id}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDrop={() => handleDrop(index)}
                            onDragEnd={handleDragEnd}
                            className="glass-card animate-modal"
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              padding: '16px',
                              background: draggedIndex === index ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                              border: draggedIndex === index ? '1px dashed var(--primary)' : '1px solid rgba(255, 255, 255, 0.06)',
                              borderRadius: '12px',
                              cursor: 'grab',
                              opacity: draggedIndex === index ? 0.6 : 1,
                              transition: 'all 0.2s',
                              gap: '12px'
                            }}
                            onMouseEnter={(e) => {
                              if (draggedIndex !== index) {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.2)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (draggedIndex !== index) {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                              }
                            }}
                          >
                            {/* Card Header */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '1rem', color: 'var(--text-muted)', userSelect: 'none', cursor: 'grab' }}>⠿</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#ffffff' }}>
                                    {mgTranslatedName || mg.name}
                                  </span>
                                  <span style={{
                                    fontSize: '0.62rem',
                                    fontWeight: 800,
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    background: isRequired ? 'rgba(239, 68, 68, 0.12)' : 'rgba(255, 255, 255, 0.06)',
                                    color: isRequired ? '#fca5a5' : 'var(--text-secondary)',
                                    textTransform: 'uppercase'
                                  }}>
                                    {isRequired ? (language === 'fr' ? 'Requis' : (language === 'nl' ? 'Vereist' : 'Required')) : (language === 'fr' ? 'Optionnel' : (language === 'nl' ? 'Optioneel' : 'Optional'))}
                                  </span>
                                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                    {language === 'fr' ? `Sélection: ${mg.minSelection} à ${mg.maxSelection}` : (language === 'nl' ? `Selectie: ${mg.minSelection}-${mg.maxSelection}` : `Selection: ${mg.minSelection}-${mg.maxSelection}`)}
                                  </span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveModifierGroup(mg.id)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--text-secondary)',
                                  fontSize: '1.25rem',
                                  cursor: 'pointer',
                                  padding: '4px 8px',
                                  lineHeight: '1',
                                  transition: 'color 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--danger)'}
                                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                              >
                                &times;
                              </button>
                            </div>

                            {/* Card Body - Modifier options list */}
                            {mg.options && mg.options.length > 0 && (
                              <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '6px',
                                background: 'rgba(0,0,0,0.15)',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.03)'
                              }}>
                                {mg.options.map((opt: any) => {
                                  const optName = language === 'en' ? opt.nameEn : language === 'fr' ? opt.nameFr : opt.nameNl;
                                  return (
                                    <span
                                      key={opt.id}
                                      style={{
                                        fontSize: '0.72rem',
                                        fontWeight: 600,
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        border: '1px solid rgba(255, 255, 255, 0.05)',
                                        color: 'var(--text-secondary)',
                                        padding: '2px 8px',
                                        borderRadius: '6px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                      }}
                                    >
                                      <span>🔹 {optName || opt.name}</span>
                                      {opt.upcharge > 0 && (
                                        <span style={{ color: 'var(--accent)', fontWeight: 700 }}>
                                          (+€{opt.upcharge.toFixed(2)})
                                        </span>
                                      )}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
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
                  {t.saveProduct}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
