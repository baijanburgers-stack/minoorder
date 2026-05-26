'use client';

import React, { useState } from 'react';
import { useMenu } from '../context';
import { translations } from '../translations';
import { useToast } from '../../../../components/Toast';

export default function CategoriesPage() {
  const { categories, setCategories, language } = useMenu();
  const t = translations[language];
  const { showToast } = useToast();

  // Modal open state
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form states
  const [newCatNameEn, setNewCatNameEn] = useState('');
  const [newCatNameFr, setNewCatNameFr] = useState('');
  const [newCatNameNl, setNewCatNameNl] = useState('');
  const [newCatPos, setNewCatPos] = useState(true);
  const [newCatKiosk, setNewCatKiosk] = useState(true);

  // Drag and drop states
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Image upload states
  const [newCatImage, setNewCatImage] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [imageError, setImageError] = useState('');

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const updatedCategories = [...categories];
    const draggedItem = updatedCategories[draggedIndex];
    
    updatedCategories.splice(draggedIndex, 1);
    updatedCategories.splice(index, 0, draggedItem);
    
    setDraggedIndex(index);
    setCategories(updatedCategories);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Max 10MB validation
    const maxBytes = 10 * 1024 * 1024; // 10MB
    if (file.size > maxBytes) {
      setImageError(t.fileTooLarge);
      setSelectedFileName('');
      setImagePreview('');
      setNewCatImage('');
      e.target.value = ''; // Reset file input
      return;
    }

    setImageError('');
    setSelectedFileName(file.name);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImagePreview(base64String);
      setNewCatImage(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedFileName('');
    setImagePreview('');
    setNewCatImage('');
    setImageError('');
    const fileInput = document.getElementById('catImageFile') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const primaryName = newCatNameEn || newCatNameFr || newCatNameNl;
    if (!primaryName) return;

    const finalEn = (newCatNameEn || primaryName).toUpperCase();
    const finalFr = (newCatNameFr || primaryName).toUpperCase();
    const finalNl = (newCatNameNl || primaryName).toUpperCase();

    const newCat = {
      id: 'c_' + Date.now().toString(),
      name: finalEn, // Save primary/En as uppercase base name
      nameEn: finalEn,
      nameFr: finalFr,
      nameNl: finalNl,
      sortOrder: categories.length + 1, // Automatically map sort sequence based on count
      visiblePos: newCatPos,
      visibleKiosk: newCatKiosk,
      imageUrl: newCatImage, // Save the image string
    };

    setCategories([...categories, newCat]);
    setNewCatNameEn('');
    setNewCatNameFr('');
    setNewCatNameNl('');
    setNewCatPos(true);
    setNewCatKiosk(true);
    setSelectedFileName('');
    setImagePreview('');
    setNewCatImage('');
    setImageError('');
    setIsCreateOpen(false); // Close the modal
    const activeName = language === 'en' ? finalEn : language === 'fr' ? finalFr : finalNl;
    showToast(t.alertCategoryAdded.replace('{name}', activeName), 'success');
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
    showToast(t.alertCategoryDeleted, 'info');
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
        <div className="glass-card" style={{ padding: '20px 24px' }}>

          {/* ── Section Header ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '14px', marginBottom: '0', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                  <span style={{ fontSize: '1rem' }}>📂</span> {t.categoriesManager}
                </h3>
                <span style={{
                  fontSize: '0.62rem', fontWeight: 800,
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.06))',
                  color: '#a5b4fc',
                  border: '1px solid rgba(99,102,241,0.2)',
                  padding: '2px 8px', borderRadius: '20px',
                }}>
                  {categories.length} {language === 'fr' ? 'catégories' : language === 'nl' ? 'categorieën' : 'categories'}
                </span>
              </div>
              <p style={{ fontSize: '0.71rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                {t.categoriesDesc}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Live indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '20px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', boxShadow: '0 0 6px rgba(16,185,129,0.6)' }} />
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#6ee7b7' }}>{t.activeSnapshot}</span>
              </div>
              {/* Create button */}
              <button
                onClick={() => setIsCreateOpen(true)}
                className="btn-primary"
                style={{ padding: '6px 14px', fontSize: '0.74rem', fontWeight: 700, borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', border: 'none', boxShadow: '0 4px 12px rgba(99,102,241,0.2)' }}
              >
                <span style={{ fontSize: '1rem', lineHeight: 1 }}>+</span> {t.createCategory}
              </button>
            </div>
          </div>

          {/* ── Horizontal Divider ── */}
          <div style={{ height: '1px', background: 'linear-gradient(to right, rgba(99,102,241,0.2), rgba(255,255,255,0.04), transparent)', margin: '0 0 14px' }} />

          {categories.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', border: '2px dashed rgba(255,255,255,0.05)', borderRadius: '12px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📁</div>
              <h4 style={{ margin: '0 0 8px 0' }}>{t.noCategories}</h4>
              <button onClick={() => setIsCreateOpen(true)} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem', borderRadius: '8px' }}>{t.createCategory}</button>
            </div>
          ) : (
            <div>
              {/* ── Column Header Labels ── */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '32px 2fr 0.7fr 0.7fr 0.5fr 1.2fr',
                gap: '8px',
                padding: '5px 12px 8px',
                alignItems: 'center',
              }}>
                {[
                  'DRAG',
                  language === 'fr' ? 'NOM' : language === 'nl' ? 'NAAM' : 'NAME',
                  'POS',
                  language === 'fr' ? 'BORNE' : 'KIOSK',
                  language === 'fr' ? 'TRI' : language === 'nl' ? 'SORT' : 'SORT',
                  t.actions,
                ].map((label, i) => (
                  <span key={i} style={{
                    fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-muted)',
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                    textAlign: i === 5 ? 'right' : 'left'
                  }}>
                    {label}
                  </span>
                ))}
              </div>

              {/* ── Column Underline ── */}
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', marginBottom: '6px' }} />

              {/* ── Category Row Cards ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {categories.map((cat, index) => {
                  const catTranslatedName = (t as any).menu?.categories?.[cat.id] || (language === 'en' ? cat.nameEn : language === 'fr' ? cat.nameFr : cat.nameNl) || cat.name;
                  return (
                    <div
                      key={cat.id}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '32px 2fr 0.7fr 0.7fr 0.5fr 1.2fr',
                        gap: '8px',
                        alignItems: 'center',
                        padding: '8px 12px',
                        background: draggedIndex === index ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.018)',
                        border: draggedIndex === index ? '1px solid rgba(99,102,241,0.35)' : '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '7px',
                        opacity: draggedIndex === index ? 0.4 : 1,
                        transition: 'all 0.18s ease',
                        cursor: 'default',
                      }}
                      onMouseEnter={e => {
                        if (draggedIndex !== index) {
                          (e.currentTarget as HTMLDivElement).style.background = 'rgba(99,102,241,0.045)';
                          (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(99,102,241,0.18)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (draggedIndex !== index) {
                          (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.018)';
                          (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.05)';
                        }
                      }}
                    >
                      {/* Col 1 – Drag handle */}
                      <div style={{ color: 'var(--text-muted)', cursor: 'grab', fontSize: '1rem', userSelect: 'none', textAlign: 'center', lineHeight: 1 }}>
                        ⋮⋮
                      </div>

                      {/* Col 2 – Thumbnail + Name */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, overflow: 'hidden' }}>
                        <div style={{
                          width: '32px', height: '32px', flexShrink: 0,
                          borderRadius: '6px',
                          border: '1px solid rgba(255,255,255,0.1)',
                          background: 'rgba(255,255,255,0.03)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          overflow: 'hidden',
                        }}>
                          {cat.imageUrl ? (
                            <img src={cat.imageUrl} alt={catTranslatedName as string} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <span style={{ fontSize: '1rem' }}>
                              {(Array.from(catTranslatedName as string).find(char => (char as string).charCodeAt(0) > 127) as string) || '📁'}
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '0.81rem', fontWeight: 700, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {catTranslatedName}
                        </span>
                      </div>

                      {/* Col 3 – POS visibility pill */}
                      <div>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '3px',
                          padding: '2px 7px', borderRadius: '20px', fontSize: '0.62rem', fontWeight: 700, whiteSpace: 'nowrap',
                          background: cat.visiblePos ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                          color: cat.visiblePos ? '#6ee7b7' : '#fca5a5',
                          border: cat.visiblePos ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(239,68,68,0.25)',
                        }}>
                          <span style={{ fontSize: '0.55rem' }}>{cat.visiblePos ? '●' : '○'}</span>
                          {cat.visiblePos ? t.posActive : t.posHidden}
                        </span>
                      </div>

                      {/* Col 4 – Kiosk visibility pill */}
                      <div>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '3px',
                          padding: '2px 7px', borderRadius: '20px', fontSize: '0.62rem', fontWeight: 700, whiteSpace: 'nowrap',
                          background: cat.visibleKiosk ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                          color: cat.visibleKiosk ? '#6ee7b7' : '#fca5a5',
                          border: cat.visibleKiosk ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(239,68,68,0.25)',
                        }}>
                          <span style={{ fontSize: '0.55rem' }}>{cat.visibleKiosk ? '●' : '○'}</span>
                          {cat.visibleKiosk ? t.posActive : t.posHidden}
                        </span>
                      </div>

                      {/* Col 5 – Sort order amber chip */}
                      <div>
                        <span style={{
                          padding: '2px 7px', borderRadius: '4px', fontSize: '0.71rem', fontWeight: 700,
                          background: 'rgba(245,158,11,0.07)', color: '#fcd34d', border: '1px solid rgba(245,158,11,0.15)',
                          whiteSpace: 'nowrap',
                        }}>
                          {cat.sortOrder}
                        </span>
                      </div>

                      {/* Col 6 – Delete button right-aligned */}
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          title={language === 'fr' ? 'Supprimer' : language === 'nl' ? 'Verwijderen' : 'Delete'}
                          style={{
                            padding: '4px 7px', cursor: 'pointer', fontSize: '0.72rem', lineHeight: 1,
                            borderRadius: '5px', border: '1px solid rgba(239,68,68,0.22)',
                            background: 'rgba(239,68,68,0.05)', color: '#fca5a5',
                            transition: 'all 0.18s ease',
                          }}
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
              {language === 'fr' ? 'Créer une Nouvelle Catégorie' : (language === 'nl' ? 'Nieuwe Categorie Maken' : 'Create New Category')}
            </h3>
            <form onSubmit={handleAddCategory}>
              <div className="form-grid-layout" style={{ marginBottom: '32px' }}>
                {/* Left Column: Localized Names */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '-8px', fontWeight: 700, letterSpacing: '0.05em' }}>{t.categoryName}</label>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>English 🇬🇧</span>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. BURGERS 🍔"
                      value={newCatNameEn}
                      onChange={e => setNewCatNameEn(e.target.value.toUpperCase())}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Français 🇫🇷</span>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="ex. BURGERS 🍔"
                      value={newCatNameFr}
                      onChange={e => setNewCatNameFr(e.target.value.toUpperCase())}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Nederlands 🇳🇱</span>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="bijv. BURGERS 🍔"
                      value={newCatNameNl}
                      onChange={e => setNewCatNameNl(e.target.value.toUpperCase())}
                      required
                    />
                  </div>
                </div>

                {/* Right Column: Settings & Image Upload */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Category Image upload */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 700, letterSpacing: '0.05em' }}>{t.categoryImage}</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                      id="catImageFile"
                    />
                    
                    {imagePreview ? (
                      <div style={{
                        position: 'relative',
                        width: '100%',
                        height: '136px',
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
                            top: '8px',
                            right: '8px',
                            background: 'rgba(0,0,0,0.7)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            color: '#ffffff',
                            fontSize: '14px',
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
                      <label htmlFor="catImageFile" className="upload-dropzone" style={{ height: '136px' }}>
                        <span style={{ fontSize: '2rem' }}>📸</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{t.chooseImage}</span>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Drag or Browse (Max 10MB)</span>
                      </label>
                    )}

                    {imageError && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--danger)', fontWeight: 600, display: 'block', marginTop: '6px' }}>
                        ⚠️ {imageError}
                      </span>
                    )}
                  </div>

                  {/* Channel visibility switch toggles */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{t.posVisible}</span>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={newCatPos}
                          onChange={e => setNewCatPos(e.target.checked)}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{t.kioskVisible}</span>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={newCatKiosk}
                          onChange={e => setNewCatKiosk(e.target.checked)}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>
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
                  {t.saveCategory}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
