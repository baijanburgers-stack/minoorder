'use client';

import React from 'react';
import { useMenu } from './context';

export default function StoreAdminDashboardPage() {
  const { shifts, storeVatRates, language } = useMenu();

  // expected cash calculation from shifts
  const activeShift = shifts.find(s => s.closed === null);
  const expectedCash = activeShift ? '300.00' : '0.00';

  // Locale mappings
  const dashboardT = {
    en: {
      title: "Store Dashboard",
      desc: "Real-time operations summary, tax splits, and hardware health audits.",
      grossSales: "DAILY GROSS SALES",
      grossSalesSub: "From active shifts today",
      activeDevices: "ACTIVE DEVICES",
      devicesConnected: "3 / 5 Connected",
      devicesSub: "1 POS Tablet | 2 Kiosks",
      fdmHardware: "FDM HARDWARE",
      fdmSub: "Serial: FDM-BE-887722-X",
      expectedCash: "EXPECTED CASH",
      expectedCashSub: "Sarah Connor's drawer",
      taxTitle: "Daily Compliance Tax Split (BE Guidelines)",
      foodCategory: "Food & Soft Drinks Category",
      takeaway: "Takeaway",
      dineIn: "Dine-In",
      alcoholCategory: "Alcoholic Beverages Category",
      netSales: "Total Net Sales",
      extractedVat: "Extracted VAT",
      hardwareHeartbeat: "Hardware Heartbeat",
      nodes: [
        { node: 'POS Terminal 01', status: 'Online', delay: '12s ago', type: 'Active shift node' },
        { node: 'Kiosk Terminal A', status: 'Online', delay: '44s ago', type: 'Standby welcomes' },
        { node: 'Kiosk Terminal B', status: 'Online', delay: '5s ago', type: 'Ordering active' },
      ]
    },
    fr: {
      title: "Tableau de Bord du Magasin",
      desc: "Résumé des opérations en temps réel, répartition des taxes et audits de santé du matériel.",
      grossSales: "VENTES BRUTES QUOTIDIENNES",
      grossSalesSub: "À partir des postes actifs aujourd'hui",
      activeDevices: "APPAREILS ACTIFS",
      devicesConnected: "3 / 5 Connectés",
      devicesSub: "1 Tablette POS | 2 Bornes",
      fdmHardware: "MATÉRIEL FDM",
      fdmSub: "Série: FDM-BE-887722-X",
      expectedCash: "ESPÈCES ATTENDUES",
      expectedCashSub: "Tiroir-caisse de Sarah Connor",
      taxTitle: "Répartition fiscale quotidienne de conformité (Directives BE)",
      foodCategory: "Catégorie Aliments & Boissons Non Alcoolisées",
      takeaway: "À emporter",
      dineIn: "Sur place",
      alcoholCategory: "Catégorie Boissons Alcoolisées",
      netSales: "Ventes nettes totales",
      extractedVat: "TVA extraite",
      hardwareHeartbeat: "Pulsation du Matériel",
      nodes: [
        { node: 'POS Terminal 01', status: 'En ligne', delay: 'il y a 12s', type: 'Nœud de session actif' },
        { node: 'Kiosk Terminal A', status: 'En ligne', delay: 'il y a 44s', type: 'Accueil en veille' },
        { node: 'Kiosk Terminal B', status: 'En ligne', delay: 'il y a 5s', type: 'Commande active' },
      ]
    },
    nl: {
      title: "Winkel Dashboard",
      desc: "Real-time operationeel overzicht, btw-verdelingen en hardware-gezondheidsaudits.",
      grossSales: "DAGELIJKSE BRUTOVERKOOP",
      grossSalesSub: "Van actieve diensten vandaag",
      activeDevices: "ACTIEVE APPARATEN",
      devicesConnected: "3 / 5 Verbonden",
      devicesSub: "1 POS-tablet | 2 Kiosken",
      fdmHardware: "FDM HARDWARE",
      fdmSub: "Serienummer: FDM-BE-887722-X",
      expectedCash: "VERWACHT CONTANT GELD",
      expectedCashSub: "Lade van Sarah Connor",
      taxTitle: "Dagelijkse Fiscale Btw-verdeling (BE-richtlijnen)",
      foodCategory: "Categorie Voeding & Frisdranken",
      takeaway: "Afhaal",
      dineIn: "Ter plaatse",
      alcoholCategory: "Categorie Alcoholische Dranken",
      netSales: "Totale netto-omzet",
      extractedVat: "Berekende btw",
      hardwareHeartbeat: "Hardware Heartbeat",
      nodes: [
        { node: 'POS Terminal 01', status: 'Online', delay: '12s geleden', type: 'Actieve dienst-node' },
        { node: 'Kiosk Terminal A', status: 'Online', delay: '44s geleden', type: 'Standby welkom' },
        { node: 'Kiosk Terminal B', status: 'Online', delay: '5s geleden', type: 'Bestelling actief' },
      ]
    }
  }[language || 'en'];

  return (
    <div>
      {/* ── Page Header ── */}
      <div style={{ marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
          <span style={{ fontSize: '1.1rem' }}>📈</span>
          <h1 className="page-title"><span className="text-gradient">{dashboardT.title}</span></h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{dashboardT.desc}</p>
      </div>

      {/* ── KPI Spark Cards ── */}
      <div className="stat-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '18px' }}>
        {[
          { label: dashboardT.grossSales, value: '€ 1,452.80', sub: dashboardT.grossSalesSub, color: 'var(--accent)' },
          { label: dashboardT.activeDevices, value: dashboardT.devicesConnected, sub: dashboardT.devicesSub, color: '#f1f5f9' },
          { label: dashboardT.fdmHardware, value: 'ONLINE', sub: dashboardT.fdmSub, color: 'var(--accent)' },
          { label: dashboardT.expectedCash, value: `€ ${expectedCash}`, sub: dashboardT.expectedCashSub, color: '#f1f5f9' },
        ].map((card, i) => (
          <div key={i} className="glass-card" style={{ padding: '16px 18px' }}>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}>{card.label}</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '6px', color: card.color, fontFamily: 'var(--font-display)', lineHeight: 1.1, letterSpacing: '-0.02em' }}>{card.value}</div>
            <span style={{ fontSize: '0.67rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>{card.sub}</span>
          </div>
        ))}
      </div>

      {/* ── Compliance Tax + Hardware ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '14px' }}>
        <div className="glass-card" style={{ padding: '20px 24px' }}>
          <h3 style={{ fontSize: '0.88rem', marginBottom: '14px', fontWeight: 700 }}>{dashboardT.taxTitle}</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600 }}>🍔 {dashboardT.foodCategory} (BE {storeVatRates.foodTakeaway}% {dashboardT.takeaway} / {storeVatRates.foodDineIn}% {dashboardT.dineIn})</span>
                <span style={{ color: 'var(--accent)', fontWeight: 700 }}>72% (€ 1,046.00 Gross)</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '100px', overflow: 'hidden' }}>
                <div style={{ width: '72%', height: '100%', background: 'linear-gradient(90deg, var(--primary) 0%, #4f46e5 100%)', borderRadius: '100px' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600 }}>🍺 {dashboardT.alcoholCategory} (BE {storeVatRates.alcoholDineIn}%)</span>
                <span style={{ color: 'var(--warning)', fontWeight: 700 }}>28% (€ 406.80 Gross)</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '100px', overflow: 'hidden' }}>
                <div style={{ width: '28%', height: '100%', background: 'linear-gradient(90deg, var(--warning) 0%, #f59e0b 100%)', borderRadius: '100px' }} />
              </div>
            </div>
          </div>

          <div style={{ marginTop: '28px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px', display: 'flex', gap: '24px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <div>
              🔥 {dashboardT.netSales}: <strong>€ 1,296.25</strong>
            </div>
            <div>
              ⚖️ {dashboardT.extractedVat}: <strong>€ 156.55</strong>
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px 22px' }}>
          <h3 style={{ fontSize: '0.88rem', marginBottom: '12px', fontWeight: 700 }}>{dashboardT.hardwareHeartbeat}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {dashboardT.nodes.map((node, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', borderRadius: '7px', background: 'rgba(255,255,255,0.018)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f1f5f9', display: 'block' }}>{node.node}</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{node.type}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--accent)', fontWeight: 800, display: 'block' }}>● {node.status}</span>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{node.delay}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
