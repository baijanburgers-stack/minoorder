'use client';

import React, { useState } from 'react';
import { useMenu } from '../context';
import { translations } from '../translations';
import { useToast } from '../../../../components/Toast';

export default function ModifiersPage() {
  const { modifierGroups, setModifierGroups, items, setItems, language } = useMenu();
  const t = translations[language];
  const { showToast } = useToast();

  // Modal open states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupMetaId, setEditingGroupMetaId] = useState<string | null>(null);
  const [assigningGroupId, setAssigningGroupId] = useState<string | null>(null);
  const [assignSearch, setAssignSearch] = useState('');

  // Modifier Group Form states (Multi-Language)
  const [newMgNameEn, setNewMgNameEn] = useState('');
  const [newMgNameFr, setNewMgNameFr] = useState('');
  const [newMgNameNl, setNewMgNameNl] = useState('');
  const [newMgMin, setNewMgMin] = useState('0');
  const [newMgMax, setNewMgMax] = useState('1');
  const [newMgReq, setNewMgReq] = useState(false);
  const [newMgAllowMultiple, setNewMgAllowMultiple] = useState(false);

  // New Option Form states (Single Language)
  const [newOptName, setNewOptName] = useState('');
  const [newOptUpcharge, setNewOptUpcharge] = useState('0.00');
  const [newOptImage, setNewOptImage] = useState<string | null>(null);

  // Find the group currently being edited
  const editingGroup = modifierGroups.find(mg => mg.id === editingGroupId);

  const handleStartEditGroupMeta = (group: any) => {
    setEditingGroupMetaId(group.id);
    setNewMgNameEn(group.nameEn || group.name || '');
    setNewMgNameFr(group.nameFr || group.name || '');
    setNewMgNameNl(group.nameNl || group.name || '');
    setNewMgMin(String(group.minSelection || 0));
    setNewMgMax(String(group.maxSelection || 1));
    setNewMgReq(group.isRequired || false);
    setNewMgAllowMultiple(group.allowMultiple || false);
  };

  const handleSaveModifierGroupMeta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroupMetaId) return;

    const primaryName = newMgNameEn || newMgNameFr || newMgNameNl;
    if (!primaryName) return;

    const finalEn = (newMgNameEn || primaryName).toUpperCase();
    const finalFr = (newMgNameFr || primaryName).toUpperCase();
    const finalNl = (newMgNameNl || primaryName).toUpperCase();

    const updated = modifierGroups.map(g => {
      if (g.id === editingGroupMetaId) {
        return {
          ...g,
          name: finalEn,
          nameEn: finalEn,
          nameFr: finalFr,
          nameNl: finalNl,
          minSelection: parseInt(newMgMin) || 0,
          maxSelection: parseInt(newMgMax) || 1,
          isRequired: newMgReq,
          allowMultiple: newMgAllowMultiple
        };
      }
      return g;
    });

    setModifierGroups(updated);
    setNewMgNameEn('');
    setNewMgNameFr('');
    setNewMgNameNl('');
    setNewMgMin('0');
    setNewMgMax('1');
    setNewMgReq(false);
    setNewMgAllowMultiple(false);
    setEditingGroupMetaId(null);
  };

  const handleAddModifierGroup = (e: React.FormEvent) => {
    e.preventDefault();
    const primaryName = newMgNameEn || newMgNameFr || newMgNameNl;
    if (!primaryName) return;

    const finalEn = (newMgNameEn || primaryName).toUpperCase();
    const finalFr = (newMgNameFr || primaryName).toUpperCase();
    const finalNl = (newMgNameNl || primaryName).toUpperCase();

    const newMg = {
      id: 'mg_' + Date.now().toString(),
      name: finalEn,
      nameEn: finalEn,
      nameFr: finalFr,
      nameNl: finalNl,
      minSelection: parseInt(newMgMin) || 0,
      maxSelection: parseInt(newMgMax) || 1,
      isRequired: newMgReq,
      allowMultiple: newMgAllowMultiple,
      options: [] // Start with zero options!
    };

    setModifierGroups([...modifierGroups, newMg]);
    setNewMgNameEn('');
    setNewMgNameFr('');
    setNewMgNameNl('');
    setNewMgMin('0');
    setNewMgMax('1');
    setNewMgReq(false);
    setNewMgAllowMultiple(false);
    setIsCreateOpen(false); // Close the creation modal

    // Automatically transition to managing options for the newly created group!
    setEditingGroupId(newMg.id);
  };

  const handleDeleteModifierGroup = (id: string) => {
    setModifierGroups(modifierGroups.filter(mg => mg.id !== id));
    showToast(t.alertModifierDeleted, 'info');
  };

  const handleToggleItemAssignment = (itemId: string, groupId: string) => {
    setItems(items.map(item => {
      if (item.id !== itemId) return item;
      const current = item.modifierIds || [];
      const hasGroup = current.includes(groupId);
      return {
        ...item,
        modifierIds: hasGroup
          ? current.filter(id => id !== groupId)
          : [...current, groupId]
      };
    }));
  };

  const handleAddOptionToGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroupId || !newOptName) return;

    const finalName = newOptName.toUpperCase();

    const newOption = {
      id: 'mo_' + Date.now().toString(),
      name: finalName,
      nameEn: finalName,
      nameFr: finalName,
      nameNl: finalName,
      upcharge: parseFloat(newOptUpcharge) || 0.00,
      imageUrl: newOptImage || undefined
    };

    const updatedGroups = modifierGroups.map(g => {
      if (g.id === editingGroupId) {
        return {
          ...g,
          options: [...g.options, newOption]
        };
      }
      return g;
    });

    setModifierGroups(updatedGroups);
    setNewOptName('');
    setNewOptUpcharge('0.00');
    setNewOptImage(null);
  };

  const handleToggleGroupRequired = (groupId: string) => {
    const updated = modifierGroups.map(g => {
      if (g.id === groupId) {
        return { ...g, isRequired: !g.isRequired };
      }
      return g;
    });
    setModifierGroups(updated);
  };

  const handleDeleteOptionFromGroup = (optionId: string) => {
    if (!editingGroupId) return;

    const updatedGroups = modifierGroups.map(g => {
      if (g.id === editingGroupId) {
        return {
          ...g,
          options: g.options.filter((o: any) => o.id !== optionId)
        };
      }
      return g;
    });

    setModifierGroups(updatedGroups);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '');
    if (!digits) {
      setNewOptUpcharge('0.00');
      return;
    }
    const parsedValue = parseInt(digits, 10) / 100;
    setNewOptUpcharge(parsedValue.toFixed(2));
  };

  const handlePriceFocus = (e: React.FocusEvent<HTMLInputElement> | React.MouseEvent<HTMLInputElement>) => {
    const target = e.currentTarget;
    setTimeout(() => {
      const length = target.value.length;
      target.setSelectionRange(length, length);
    }, 0);
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
        {/* Modifiers List */}
        <div className="glass-card" style={{ padding: '20px 24px' }}>

          {/* ── Section Header ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '14px', marginBottom: '0', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                  <span style={{ fontSize: '1rem' }}>🧩</span> {t.modifierGroups}
                </h3>
                <span style={{
                  fontSize: '0.62rem', fontWeight: 800,
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.06))',
                  color: '#a5b4fc',
                  border: '1px solid rgba(99,102,241,0.2)',
                  padding: '2px 8px', borderRadius: '20px',
                }}>
                  {modifierGroups.length} {language === 'fr' ? 'groupes' : language === 'nl' ? 'groepen' : 'groups'}
                </span>
              </div>
              <p style={{ fontSize: '0.71rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                {t.modifierDesc}
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
                <span style={{ fontSize: '1rem', lineHeight: 1 }}>+</span> {t.createModifier}
              </button>
            </div>
          </div>

          {/* ── Horizontal Divider ── */}
          <div style={{ height: '1px', background: 'linear-gradient(to right, rgba(99,102,241,0.2), rgba(255,255,255,0.04), transparent)', margin: '0 0 14px' }} />

          {modifierGroups.length === 0 ? (
            <div style={{ height: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '12px', color: 'var(--text-muted)' }}>
              <span style={{ fontSize: '2.5rem', opacity: 0.5 }}>🧩</span>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>{t.noModifiers}</p>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {language === 'fr' ? 'Commencez par créer votre premier groupe' : language === 'nl' ? 'Maak uw eerste groep aan' : 'Start by creating your first modifier group'}
                </p>
              </div>
              <button onClick={() => setIsCreateOpen(true)} className="btn-primary" style={{ padding: '7px 16px', fontSize: '0.78rem', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>
                + {t.createModifier}
              </button>
            </div>
          ) : (
            <div>
              {/* ── Column Header Labels ── */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 0.85fr 0.6fr 0.8fr 0.6fr 1.5fr',
                gap: '8px',
                padding: '5px 12px 8px',
                alignItems: 'center',
              }}>
                {[
                  language === 'fr' ? 'NOM DU GROUPE' : language === 'nl' ? 'GROEPSNAAM' : 'GROUP NAME',
                  language === 'fr' ? 'STATUT' : language === 'nl' ? 'STATUS' : 'STATUS',
                  language === 'fr' ? 'OPTIONS' : language === 'nl' ? 'OPTIES' : 'OPTIONS',
                  language === 'fr' ? 'SÉLECTION' : language === 'nl' ? 'SELECTIE' : 'SELECTION',
                  language === 'fr' ? 'LIÉS' : language === 'nl' ? 'GEKOP.' : 'LINKED',
                  language === 'fr' ? 'ACTIONS' : language === 'nl' ? 'ACTIES' : 'ACTIONS',
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

              {/* ── Group Row Cards ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {modifierGroups.map(group => {
                  const groupTranslatedName = (t as any).menu?.modifiers?.[group.id] || (language === 'en' ? group.nameEn : language === 'fr' ? group.nameFr : group.nameNl) || group.name;
                  const linkedCount = items.filter(item => item.modifierIds?.includes(group.id)).length;

                  return (
                    <div
                      key={group.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 0.85fr 0.6fr 0.8fr 0.6fr 1.5fr',
                        gap: '8px',
                        alignItems: 'center',
                        padding: '9px 12px',
                        background: 'rgba(255,255,255,0.018)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '7px',
                        transition: 'all 0.18s ease',
                        cursor: 'default',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLDivElement).style.background = 'rgba(99,102,241,0.045)';
                        (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(99,102,241,0.18)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.018)';
                        (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.05)';
                      }}
                    >
                      {/* Col 1 – Name + multi badge */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, overflow: 'hidden' }}>
                        <span style={{ fontSize: '0.81rem', fontWeight: 700, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {groupTranslatedName}
                        </span>
                        {group.allowMultiple && (
                          <span style={{ flexShrink: 0, padding: '1px 5px', borderRadius: '3px', fontSize: '0.58rem', fontWeight: 800, background: 'rgba(16,185,129,0.1)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.2)', whiteSpace: 'nowrap' }}>
                            MULTI
                          </span>
                        )}
                      </div>

                      {/* Col 2 – Status pill */}
                      <div>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '3px',
                          padding: '2px 7px', borderRadius: '20px', fontSize: '0.62rem', fontWeight: 700, whiteSpace: 'nowrap',
                          background: group.isRequired ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)',
                          color: group.isRequired ? '#fca5a5' : '#94a3b8',
                          border: group.isRequired ? '1px solid rgba(239,68,68,0.25)' : '1px solid rgba(255,255,255,0.08)',
                        }}>
                          <span style={{ fontSize: '0.55rem' }}>{group.isRequired ? '●' : '○'}</span>
                          {group.isRequired ? t.requiredBadge : t.optionalBadge}
                        </span>
                      </div>

                      {/* Col 3 – Options count */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{
                          minWidth: '22px', height: '22px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          borderRadius: '5px', fontSize: '0.75rem', fontWeight: 800,
                          background: group.options.length > 0 ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.04)',
                          color: group.options.length > 0 ? '#a5b4fc' : 'var(--text-muted)',
                        }}>
                          {group.options.length}
                        </span>
                      </div>

                      {/* Col 4 – Selection range */}
                      <div>
                        <span style={{
                          padding: '2px 7px', borderRadius: '4px', fontSize: '0.71rem', fontWeight: 700,
                          background: 'rgba(245,158,11,0.07)', color: '#fcd34d', border: '1px solid rgba(245,158,11,0.15)',
                          whiteSpace: 'nowrap',
                        }}>
                          {group.minSelection}–{group.maxSelection}
                        </span>
                      </div>

                      {/* Col 5 – Linked items */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{
                          minWidth: '22px', height: '22px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          borderRadius: '5px', fontSize: '0.75rem', fontWeight: 800,
                          background: linkedCount > 0 ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.04)',
                          color: linkedCount > 0 ? '#93c5fd' : 'var(--text-muted)',
                        }}>
                          {linkedCount}
                        </span>
                      </div>

                      {/* Col 6 – Actions */}
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center', justifyContent: 'flex-end' }}>
                        {/* Edit group meta */}
                        <button
                          onClick={() => handleStartEditGroupMeta(group)}
                          title={language === 'fr' ? 'Modifier le groupe' : language === 'nl' ? 'Groep bewerken' : 'Edit group'}
                          style={{
                            padding: '4px 8px', cursor: 'pointer', fontSize: '0.68rem', fontWeight: 600,
                            borderRadius: '5px', border: '1px solid rgba(255,255,255,0.08)',
                            background: 'rgba(255,255,255,0.04)', color: '#cbd5e1',
                            display: 'flex', alignItems: 'center', gap: '3px',
                            transition: 'all 0.18s ease', whiteSpace: 'nowrap',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = '#fff'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#cbd5e1'; }}
                        >
                          ✏️ {language === 'fr' ? 'Éditer' : language === 'nl' ? 'Editer' : 'Edit'}
                        </button>

                        {/* Assign to items */}
                        <button
                          onClick={() => { setAssigningGroupId(group.id); setAssignSearch(''); }}
                          title={language === 'fr' ? 'Assigner aux produits' : language === 'nl' ? 'Koppelen aan producten' : 'Assign to items'}
                          style={{
                            padding: '4px 8px', cursor: 'pointer', fontSize: '0.68rem', fontWeight: 700,
                            borderRadius: '5px', border: '1px solid rgba(59,130,246,0.3)',
                            background: linkedCount > 0 ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.05)',
                            color: '#93c5fd',
                            display: 'flex', alignItems: 'center', gap: '3px',
                            transition: 'all 0.18s ease', whiteSpace: 'nowrap',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.2)'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = linkedCount > 0 ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.05)'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)'; }}
                        >
                          🔗 {language === 'fr' ? 'Assigner' : language === 'nl' ? 'Koppelen' : 'Assign'}
                        </button>

                        {/* Manage options */}
                        <button
                          onClick={() => setEditingGroupId(group.id)}
                          className="btn-primary"
                          title={language === 'fr' ? 'Gérer les options' : language === 'nl' ? 'Opties beheren' : 'Manage options'}
                          style={{
                            padding: '4px 8px', cursor: 'pointer', fontSize: '0.68rem', fontWeight: 700,
                            borderRadius: '5px', border: 'none', display: 'flex', alignItems: 'center', gap: '3px',
                            boxShadow: '0 2px 8px rgba(99,102,241,0.18)', whiteSpace: 'nowrap',
                          }}
                        >
                          ⚙️ {language === 'fr' ? 'Options' : language === 'nl' ? 'Opties' : 'Options'}
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteModifierGroup(group.id)}
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

      {/* ── Assign to Items Modal ── */}
      {assigningGroupId && (() => {
        const group = modifierGroups.find(g => g.id === assigningGroupId);
        if (!group) return null;
        const groupName = (language === 'fr' ? group.nameFr : language === 'nl' ? group.nameNl : group.nameEn) || group.name;
        const filtered = items.filter(item => {
          const name = (language === 'fr' ? item.nameFr : language === 'nl' ? item.nameNl : item.nameEn) || item.name || '';
          return name.toLowerCase().includes(assignSearch.toLowerCase());
        });
        const assignedCount = items.filter(i => (i.modifierIds || []).includes(assigningGroupId)).length;

        return (
          <div
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}
            onClick={e => { if (e.target === e.currentTarget) setAssigningGroupId(null); }}
          >
            <div className="glass-card animate-modal" style={{ width: '100%', maxWidth: '540px', padding: '0', position: 'relative', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', overflow: 'hidden' }}>

              {/* Modal Header */}
              <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(99,102,241,0.08))' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '1.1rem' }}>🔗</span>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.01em' }}>
                        {language === 'fr' ? 'Assigner aux Produits' : language === 'nl' ? 'Koppelen aan Producten' : 'Assign to Menu Items'}
                      </h3>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.72rem', color: '#a5b4fc', fontWeight: 700, background: 'rgba(99,102,241,0.12)', padding: '1px 8px', borderRadius: '20px', border: '1px solid rgba(99,102,241,0.2)' }}>
                        {groupName}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        · {assignedCount} {language === 'fr' ? 'produits assignés' : language === 'nl' ? 'producten gekoppeld' : 'items assigned'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setAssigningGroupId(null)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1, padding: '2px 4px', borderRadius: '4px', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                  >×</button>
                </div>

                {/* Search */}
                <div style={{ marginTop: '12px', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', color: 'var(--text-muted)', pointerEvents: 'none' }}>🔍</span>
                  <input
                    type="text"
                    value={assignSearch}
                    onChange={e => setAssignSearch(e.target.value)}
                    placeholder={language === 'fr' ? 'Rechercher un produit…' : language === 'nl' ? 'Product zoeken…' : 'Search items…'}
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      padding: '7px 10px 7px 32px',
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '7px', color: '#fff', fontSize: '0.78rem', outline: 'none',
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>
              </div>

              {/* Item List */}
              <div style={{ maxHeight: '340px', overflowY: 'auto', padding: '10px 16px' }}>
                {filtered.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {language === 'fr' ? 'Aucun produit trouvé' : language === 'nl' ? 'Geen producten gevonden' : 'No items found'}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {filtered.map(item => {
                      const itemName = (language === 'fr' ? item.nameFr : language === 'nl' ? item.nameNl : item.nameEn) || item.name || '';
                      const isAssigned = (item.modifierIds || []).includes(assigningGroupId);
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleToggleItemAssignment(item.id, assigningGroupId)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '9px 12px', borderRadius: '8px', cursor: 'pointer',
                            background: isAssigned ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.02)',
                            border: isAssigned ? '1px solid rgba(59,130,246,0.3)' : '1px solid rgba(255,255,255,0.05)',
                            transition: 'all 0.16s ease',
                          }}
                          onMouseEnter={e => {
                            if (!isAssigned) {
                              (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.05)';
                              (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.1)';
                            }
                          }}
                          onMouseLeave={e => {
                            if (!isAssigned) {
                              (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.02)';
                              (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.05)';
                            }
                          }}
                        >
                          {/* Checkbox visual */}
                          <div style={{
                            width: '18px', height: '18px', flexShrink: 0, borderRadius: '5px',
                            border: isAssigned ? '2px solid #60a5fa' : '2px solid rgba(255,255,255,0.2)',
                            background: isAssigned ? 'rgba(59,130,246,0.4)' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.16s ease',
                          }}>
                            {isAssigned && <span style={{ color: '#fff', fontSize: '0.65rem', fontWeight: 900, lineHeight: 1 }}>✓</span>}
                          </div>

                          {/* Item info */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: isAssigned ? '#93c5fd' : '#e2e8f0', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {itemName}
                            </span>
                            {item.grossPrice !== undefined && (
                              <span style={{ fontSize: '0.67rem', color: 'var(--text-muted)' }}>
                                €{Number(item.grossPrice).toFixed(2)}
                              </span>
                            )}
                          </div>

                          {/* Assigned badge */}
                          {isAssigned && (
                            <span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#60a5fa', background: 'rgba(59,130,246,0.15)', padding: '2px 7px', borderRadius: '20px', border: '1px solid rgba(59,130,246,0.25)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                              {language === 'fr' ? 'ASSIGNÉ' : language === 'nl' ? 'GEKOPPELD' : 'ASSIGNED'}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div style={{ padding: '12px 24px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.15)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {language === 'fr' ? "Cliquez sur un produit pour basculer l'assignation" : language === 'nl' ? 'Klik op een product om te koppelen/ontkoppelen' : 'Click any item to toggle assignment'}
                </span>
                <button
                  onClick={() => setAssigningGroupId(null)}
                  className="btn-primary"
                  style={{ padding: '6px 18px', fontSize: '0.78rem', fontWeight: 700, borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                >
                  {language === 'fr' ? 'Terminé' : language === 'nl' ? 'Klaar' : 'Done'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Glassmorphic Modal Dialog Overlay: Create Group */}
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
            maxWidth: '520px',
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
              {language === 'fr' ? 'Créer un Groupe de Modificateurs' : (language === 'nl' ? 'Modificatorgroep Aanmaken' : 'Create Modifier Group')}
            </h3>
            <form onSubmit={handleAddModifierGroup}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '28px' }}>
                
                {/* Modifier Group Name Inputs (Multi-Language Stack with Flag Badges) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '2px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    {t.groupName}
                  </label>
                  
                  <div className="flag-input-wrapper">
                    <span className="flag-badge">🇬🇧 EN</span>
                    <input
                      type="text"
                      className="form-input flag-input"
                      placeholder="e.g. CHOOSE DRINK TEMPERATURE 🥤"
                      value={newMgNameEn}
                      onChange={e => setNewMgNameEn(e.target.value.toUpperCase())}
                      required
                      style={{ fontSize: '0.9rem', padding: '10px 12px 10px 64px' }}
                    />
                  </div>

                  <div className="flag-input-wrapper">
                    <span className="flag-badge">🇫🇷 FR</span>
                    <input
                      type="text"
                      className="form-input flag-input"
                      placeholder="ex. CHOISIR LA TEMPÉRATURE 🥤"
                      value={newMgNameFr}
                      onChange={e => setNewMgNameFr(e.target.value.toUpperCase())}
                      required
                      style={{ fontSize: '0.9rem', padding: '10px 12px 10px 64px' }}
                    />
                  </div>

                  <div className="flag-input-wrapper">
                    <span className="flag-badge">🇳🇱 NL</span>
                    <input
                      type="text"
                      className="form-input flag-input"
                      placeholder="bijv. KIES DRANK TEMPERATUUR 🥤"
                      value={newMgNameNl}
                      onChange={e => setNewMgNameNl(e.target.value.toUpperCase())}
                      required
                      style={{ fontSize: '0.9rem', padding: '10px 12px 10px 64px' }}
                    />
                  </div>
                </div>

                {/* Min / Max Choice inputs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{t.minChoice}</label>
                    <input
                      type="number"
                      className="form-input"
                      value={newMgMin}
                      onChange={e => setNewMgMin(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{t.maxChoice}</label>
                    <input
                      type="number"
                      className="form-input"
                      value={newMgMax}
                      onChange={e => setNewMgMax(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Required Switch Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{t.requiredSelection}</span>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={newMgReq}
                      onChange={e => setNewMgReq(e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                {/* Allow Multiple Switch Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {language === 'fr' ? 'Autoriser choix multiples de la même option' : (language === 'nl' ? 'Meerdere keuzes van dezelfde optie toestaan' : 'Allow multiple choices of the same option')}
                  </span>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={newMgAllowMultiple}
                      onChange={e => setNewMgAllowMultiple(e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
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
                  {language === 'fr' ? 'Créer le Groupe' : (language === 'nl' ? 'Groep Aanmaken' : 'Create Group')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Glassmorphic Modal Dialog Overlay: Edit Group Meta */}
      {editingGroupMetaId && (
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
            maxWidth: '520px',
            padding: '36px',
            position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.12)'
          }}>
            {/* Modal Close Button */}
            <button
              onClick={() => {
                setEditingGroupMetaId(null);
                setNewMgNameEn('');
                setNewMgNameFr('');
                setNewMgNameNl('');
                setNewMgMin('0');
                setNewMgMax('1');
                setNewMgReq(false);
                setNewMgAllowMultiple(false);
              }}
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
              {language === 'fr' ? 'Modifier le Groupe' : (language === 'nl' ? 'Groep Bewerken' : 'Edit Modifier Group')}
            </h3>
            <form onSubmit={handleSaveModifierGroupMeta}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '28px' }}>
                
                {/* Modifier Group Name Inputs (Multi-Language Stack with Flag Badges) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '2px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    {t.groupName}
                  </label>
                  
                  <div className="flag-input-wrapper">
                    <span className="flag-badge">🇬🇧 EN</span>
                    <input
                      type="text"
                      className="form-input flag-input"
                      placeholder="e.g. CHOOSE DRINK TEMPERATURE 🥤"
                      value={newMgNameEn}
                      onChange={e => setNewMgNameEn(e.target.value.toUpperCase())}
                      required
                      style={{ fontSize: '0.9rem', padding: '10px 12px 10px 64px' }}
                    />
                  </div>

                  <div className="flag-input-wrapper">
                    <span className="flag-badge">🇫🇷 FR</span>
                    <input
                      type="text"
                      className="form-input flag-input"
                      placeholder="ex. CHOISIR LA TEMPÉRATURE 🥤"
                      value={newMgNameFr}
                      onChange={e => setNewMgNameFr(e.target.value.toUpperCase())}
                      required
                      style={{ fontSize: '0.9rem', padding: '10px 12px 10px 64px' }}
                    />
                  </div>

                  <div className="flag-input-wrapper">
                    <span className="flag-badge">🇳🇱 NL</span>
                    <input
                      type="text"
                      className="form-input flag-input"
                      placeholder="bijv. KIES DRANK TEMPERATUUR 🥤"
                      value={newMgNameNl}
                      onChange={e => setNewMgNameNl(e.target.value.toUpperCase())}
                      required
                      style={{ fontSize: '0.9rem', padding: '10px 12px 10px 64px' }}
                    />
                  </div>
                </div>

                {/* Min / Max Choice inputs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{t.minChoice}</label>
                    <input
                      type="number"
                      className="form-input"
                      value={newMgMin}
                      onChange={e => setNewMgMin(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{t.maxChoice}</label>
                    <input
                      type="number"
                      className="form-input"
                      value={newMgMax}
                      onChange={e => setNewMgMax(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Required Switch Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{t.requiredSelection}</span>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={newMgReq}
                      onChange={e => setNewMgReq(e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                {/* Allow Multiple Switch Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {language === 'fr' ? 'Autoriser choix multiples de la même option' : (language === 'nl' ? 'Meerdere keuzes van dezelfde optie toestaan' : 'Allow multiple choices of the same option')}
                  </span>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={newMgAllowMultiple}
                      onChange={e => setNewMgAllowMultiple(e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '24px' }}>
                <button 
                  type="button" 
                  onClick={() => {
                    setEditingGroupMetaId(null);
                    setNewMgNameEn('');
                    setNewMgNameFr('');
                    setNewMgNameNl('');
                    setNewMgMin('0');
                    setNewMgMax('1');
                    setNewMgReq(false);
                    setNewMgAllowMultiple(false);
                  }}
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
                  {language === 'fr' ? 'Enregistrer' : (language === 'nl' ? 'Opslaan' : 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Glassmorphic Modal Dialog Overlay: Manage Options (Professional Inline Form) */}
      {editingGroupId && editingGroup && (
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
            maxWidth: '640px',
            maxHeight: 'calc(100vh - 40px)',
            overflowY: 'auto',
            padding: '36px',
            position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.12)'
          }}>
            {/* Modal Close Button */}
            <button
              onClick={() => {
                setEditingGroupId(null);
                setNewOptName('');
                setNewOptUpcharge('0.00');
              }}
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

            <div style={{ marginBottom: '28px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, background: 'rgba(99,102,241,0.1)', color: 'var(--accent)', padding: '4px 10px', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.15)', textTransform: 'uppercase', display: 'inline-block', marginBottom: '8px' }}>
                {language === 'fr' ? 'Configuration des choix' : (language === 'nl' ? 'Opties instellen' : 'Choices Configuration')}
              </span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginTop: '2px' }}>
                {language === 'fr' ? `Options pour: ${editingGroup.name}` : (language === 'nl' ? `Opties voor: ${editingGroup.name}` : `Options for: ${editingGroup.name}`)}
              </h3>
            </div>

            {/* List of current options inside the group */}
            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '10px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {language === 'fr' ? 'Options Actuelles' : (language === 'nl' ? 'Huidige Opties' : 'Current Options')}
              </label>
              
              {editingGroup.options.length === 0 ? (
                <div style={{
                  padding: '24px',
                  borderRadius: '12px',
                  border: '1px dashed rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.01)',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem'
                }}>
                  {language === 'fr' ? 'Aucune option créée pour ce groupe. Utilisez le formulaire ci-dessous pour en ajouter.' : (language === 'nl' ? 'Nog geen opties gemaakt. Gebruik het onderstaande formulier om toe te voegen.' : 'No options created for this group yet. Use the form below to add your first option.')}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto', background: 'rgba(0,0,0,0.15)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                  {editingGroup.options.map((opt: any) => {
                    const optTranslatedName = (t as any).menu?.modifiers?.[opt.id] || (language === 'en' ? opt.nameEn : language === 'fr' ? opt.nameFr : opt.nameNl) || opt.name;
                    return (
                      <div key={opt.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {opt.imageUrl ? (
                            <img
                              src={opt.imageUrl}
                              alt={optTranslatedName}
                              style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }}
                            />
                          ) : (
                            <span style={{ fontSize: '0.85rem' }}>🔹</span>
                          )}
                          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ffffff' }}>{optTranslatedName}</span>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 700, fontFamily: 'monospace' }}>
                            {opt.upcharge > 0 ? `+€${opt.upcharge.toFixed(2)}` : t.freeOption}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteOptionFromGroup(opt.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-secondary)',
                              fontSize: '1.2rem',
                              cursor: 'pointer',
                              padding: '2px 6px',
                              lineHeight: '1',
                              transition: 'color 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                          >
                            &times;
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Form to add new option inside the active group */}
            <form onSubmit={handleAddOptionToGroup} style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '16px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                ➕ {language === 'fr' ? 'Ajouter une Nouvelle Option' : (language === 'nl' ? 'Nieuwe Optie Toevoegen' : 'Add New Option')}
              </label>
              
              {/* Single Line Flex Row Form */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
                {/* Option Name Input */}
                <div style={{ flex: '2', minWidth: '180px' }}>
                  <label style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase' }}>
                    {language === 'fr' ? "Nom de l'option" : (language === 'nl' ? 'Optienaam' : 'Option Name')}
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={language === 'fr' ? 'ex. FROMAGE 🧀' : (language === 'nl' ? 'bijv. KAAS 🧀' : 'e.g. CHEESE 🧀')}
                    value={newOptName}
                    onChange={e => setNewOptName(e.target.value.toUpperCase())}
                    required
                    style={{ fontSize: '0.85rem', padding: '10px 12px' }}
                  />
                </div>

                {/* Option Upcharge Input */}
                <div style={{ flex: '1', minWidth: '100px' }}>
                  <label style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase' }}>
                    {language === 'fr' ? 'Supplément' : (language === 'nl' ? 'Extra' : 'Price')}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>€</span>
                    <input
                      type="text"
                      className="form-input"
                      value={newOptUpcharge}
                      onChange={handlePriceChange}
                      onFocus={handlePriceFocus}
                      onClick={handlePriceFocus}
                      style={{ padding: '10px 10px 10px 24px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '0.85rem' }}
                      required
                    />
                  </div>
                </div>

                {/* Option Image Uploader (Local File PC Reader) */}
                <div style={{ flex: '1.2', minWidth: '140px' }}>
                  <label style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase' }}>
                    {language === 'fr' ? 'Image PC' : (language === 'nl' ? 'PC Afbeelding' : 'PC Image')}
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="file"
                      id="opt-file-upload"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setNewOptImage(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <label
                      htmlFor="opt-file-upload"
                      className="btn-primary"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        fontSize: '0.8rem',
                        textAlign: 'center',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: newOptImage ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)',
                        border: newOptImage ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.1)',
                        color: newOptImage ? '#a7f3d0' : 'var(--text-secondary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'block',
                        transition: 'var(--transition-smooth)'
                      }}
                    >
                      {newOptImage ? '📷 Uploaded' : '📁 Choose File'}
                    </label>
                  </div>
                </div>

                {/* Inline Action Button */}
                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    padding: '10px 16px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '38px',
                    border: 'none',
                    boxShadow: '0 4px 10px rgba(99, 102, 241, 0.15)'
                  }}
                >
                  ➕ {language === 'fr' ? 'Ajouter' : (language === 'nl' ? 'Toeg.' : 'Add')}
                </button>
              </div>

              {/* Done/Close Bottom Row */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setEditingGroupId(null);
                    setNewOptName('');
                    setNewOptUpcharge('0.00');
                    setNewOptImage(null);
                  }}
                  className="btn-primary"
                  style={{
                    padding: '10px 24px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
                  }}
                >
                  {language === 'fr' ? 'Terminé' : (language === 'nl' ? 'Gereed' : 'Done')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
