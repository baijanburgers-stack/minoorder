'use client';

import React, { useState } from 'react';
import '../../../styles/globals.css';

// VAT Categories matching DB schema
type VatCategory = 'food' | 'soft_drink' | 'alcohol' | 'service';

interface MenuItem {
  id: string;
  name: string;
  grossPrice: number;
  vatCategory: VatCategory;
}

export default function StoreAdminMenuPage() {
  const [activeTab, setActiveTab] = useState<'menu' | 'combo_engine' | 'vat_rules'>('menu');

  // Dynamic store-level VAT rates (zero-hardcoding architecture)
  const [storeVatRates, setStoreVatRates] = useState({
    foodTakeaway: 6.00,
    foodDineIn: 12.00,
    softDrinkTakeaway: 6.00,
    softDrinkDineIn: 12.00,
    alcoholTakeaway: 21.00,
    alcoholDineIn: 21.00,
  });

  // VAT Category Inputs for rules editing form
  const [foodTakeawayInput, setFoodTakeawayInput] = useState('6.00');
  const [foodDineInInput, setFoodDineInInput] = useState('12.00');
  const [softTakeawayInput, setSoftTakeawayInput] = useState('6.00');
  const [softDineInInput, setSoftDineInInput] = useState('12.00');
  const [alcoholTakeawayInput, setAlcoholTakeawayInput] = useState('21.00');
  const [alcoholDineInInput, setAlcoholDineInInput] = useState('21.00');

  // Core items available for selecting in the combo engine
  const [items, setItems] = useState<MenuItem[]>([
    { id: '1', name: 'Classic Beef Burger', grossPrice: 10.00, vatCategory: 'food' },
    { id: '2', name: 'Gourmet Double Cheese', grossPrice: 13.50, vatCategory: 'food' },
    { id: '3', name: 'Frites Classic Belgian', grossPrice: 3.00, vatCategory: 'food' },
    { id: '4', name: 'Sweet Potato Fries', grossPrice: 4.00, vatCategory: 'food' },
    { id: '5', name: 'Coca-Cola Zero 33cl', grossPrice: 2.50, vatCategory: 'soft_drink' },
    { id: '6', name: 'Duvel Blonde Ale 33cl', grossPrice: 4.80, vatCategory: 'alcohol' },
    { id: '7', name: 'Vanilla Milkshake', grossPrice: 4.50, vatCategory: 'soft_drink' },
  ]);

  // Menu Creation fields
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('0.00');
  const [newItemVat, setNewItemVat] = useState<VatCategory>('food');

  // Combo Engine Sandbox states
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [comboFixedPrice, setComboFixedPrice] = useState<string>('12.00');
  const [isTakeaway, setIsTakeaway] = useState<boolean>(true);
  const [calcResult, setCalcResult] = useState<any>(null);

  // Dynamic VAT rates powered by store-level rules state
  const getVatRate = (category: VatCategory, takeaway: boolean): number => {
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

  const handleUpdateVatRules = (e: React.FormEvent) => {
    e.preventDefault();
    setStoreVatRates({
      foodTakeaway: parseFloat(foodTakeawayInput),
      foodDineIn: parseFloat(foodDineInInput),
      softDrinkTakeaway: parseFloat(softTakeawayInput),
      softDrinkDineIn: parseFloat(softDineInInput),
      alcoholTakeaway: parseFloat(alcoholTakeawayInput),
      alcoholDineIn: parseFloat(alcoholDineInInput),
    });
    alert('Store VAT Rules updated successfully! Menu item extractions and Combo engine sandbox calculations will now dynamically use these updated rates.');
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || parseFloat(newItemPrice) <= 0) return;

    const newItem: MenuItem = {
      id: Date.now().toString(),
      name: newItemName,
      grossPrice: parseFloat(newItemPrice),
      vatCategory: newItemVat,
    };

    setItems([...items, newItem]);
    setNewItemName('');
    setNewItemPrice('0.00');
  };

  // Proportional Combo Discount Allocation Algorithm (TypeScript Port)
  const calculateComboAllocation = () => {
    if (selectedItemIds.length === 0) return;

    const selectedComponents = selectedItemIds.map(id => items.find(item => item.id === id)!).filter(Boolean);
    const fixedPrice = parseFloat(comboFixedPrice);
    
    // 1. Calculate sum of normal prices
    let totalNormalPrice = 0;
    selectedComponents.forEach(comp => {
      totalNormalPrice += comp.grossPrice;
    });

    // 2. Determine discount total & ratio
    let totalDiscount = totalNormalPrice - fixedPrice;
    if (totalDiscount < 0) totalDiscount = 0;
    const discountRatio = totalNormalPrice > 0 ? (totalDiscount / totalNormalPrice) : 0;

    let allocatedItems: any[] = [];
    let calculatedTotalGross = 0;
    let calculatedTotalNet = 0;
    let calculatedTotalVat = 0;

    // 3. Proportional distribution
    for (let i = 0; i < selectedComponents.length; i++) {
      const comp = selectedComponents[i];
      let allocatedGross = comp.grossPrice * (1.0 - discountRatio);

      // Handle precision rounding adjustments on last item
      if (i === selectedComponents.length - 1) {
        let currentGrossSum = 0;
        allocatedItems.forEach(item => {
          currentGrossSum += item.allocatedGrossPrice;
        });
        allocatedGross = fixedPrice - currentGrossSum;
      }

      // Round to 2 decimals
      allocatedGross = Math.round(allocatedGross * 100) / 100;

      // Extract Net price based on VAT Rule rates
      const rate = getVatRate(comp.vatCategory, isTakeaway);
      const net = Math.round((allocatedGross / (1.0 + rate)) * 10000) / 10000;
      const vat = Math.round((allocatedGross - net) * 10000) / 10000;

      allocatedItems.push({
        name: comp.name,
        normalPrice: comp.grossPrice,
        allocatedGrossPrice: allocatedGross,
        allocatedNetPrice: net,
        allocatedVatAmount: vat,
        vatRate: rate,
      });

      calculatedTotalGross += allocatedGross;
      calculatedTotalNet += net;
      calculatedTotalVat += vat;
    }

    setCalcResult({
      totalComboFixedPrice: fixedPrice,
      totalNormalPrice: totalNormalPrice,
      totalDiscount: totalDiscount,
      totalNet: Math.round(calculatedTotalNet * 100) / 100,
      totalVat: Math.round(calculatedTotalVat * 100) / 100,
      items: allocatedItems
    });
  };

  const handleSelectItemToggle = (id: string) => {
    if (selectedItemIds.includes(id)) {
      setSelectedItemIds(selectedItemIds.filter(itemId => itemId !== id));
    } else {
      setSelectedItemIds([...selectedItemIds, id]);
    }
  };



  return (
    <div style={{ padding: '40px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '4px' }}>
            <span className="text-gradient">Store Menu</span> Architect
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>MinoOrder Restaurant Catalog & Proportional VAT Combo Engine Sandbox</p>
        </div>
        <div className="glass-card" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent)' }} />
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Active Menu Snapshot: Version 5</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '28px' }}>
        <button
          onClick={() => setActiveTab('menu')}
          style={{
            background: activeTab === 'menu' ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
            border: 'none',
            borderRadius: '8px',
            color: '#ffffff',
            padding: '12px 24px',
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'var(--transition-smooth)'
          }}
        >
          Dynamic Catalog Builder
        </button>
        <button
          onClick={() => setActiveTab('combo_engine')}
          style={{
            background: activeTab === 'combo_engine' ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
            border: 'none',
            borderRadius: '8px',
            color: '#ffffff',
            padding: '12px 24px',
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'var(--transition-smooth)'
          }}
        >
          Proportional VAT Combo Sandbox
        </button>
        <button
          onClick={() => setActiveTab('vat_rules')}
          style={{
            background: activeTab === 'vat_rules' ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
            border: 'none',
            borderRadius: '8px',
            color: '#ffffff',
            padding: '12px 24px',
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'var(--transition-smooth)'
          }}
        >
          ⚖️ Store VAT Rules
        </button>
      </div>

      {/* Main Tab Views */}
      {activeTab === 'vat_rules' ? (
        <div className="glass-card" style={{ padding: '36px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          <div style={{ marginBottom: '28px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '6px' }}>Store-Level VAT Rules Manager</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Configure custom regional tax rates. These rates dynamically power all catalog item extractions and proportional combo discount breakdowns for this store location.
            </p>
          </div>

          <form onSubmit={handleUpdateVatRules}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '32px', background: 'rgba(255,255,255,0.01)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
              
              {/* 1. Food Group */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', color: '#a5b4fc', marginBottom: '12px', fontWeight: 700 }}>🍔 STANDARD FOOD</label>
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Takeaway VAT (%)</span>
                  <input type="number" step="0.01" className="form-input" style={{ padding: '8px 12px', marginTop: '4px' }} value={foodTakeawayInput} onChange={e => setFoodTakeawayInput(e.target.value)} required />
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Dine-In VAT (%)</span>
                  <input type="number" step="0.01" className="form-input" style={{ padding: '8px 12px', marginTop: '4px' }} value={foodDineInInput} onChange={e => setFoodDineInInput(e.target.value)} required />
                </div>
              </div>

              {/* 2. Soft Drinks Group */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', color: '#a5b4fc', marginBottom: '12px', fontWeight: 700 }}>🥤 SOFT DRINKS</label>
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Takeaway VAT (%)</span>
                  <input type="number" step="0.01" className="form-input" style={{ padding: '8px 12px', marginTop: '4px' }} value={softTakeawayInput} onChange={e => setSoftTakeawayInput(e.target.value)} required />
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Dine-In VAT (%)</span>
                  <input type="number" step="0.01" className="form-input" style={{ padding: '8px 12px', marginTop: '4px' }} value={softDineInInput} onChange={e => setSoftDineInInput(e.target.value)} required />
                </div>
              </div>

              {/* 3. Alcohol Group */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', color: '#a5b4fc', marginBottom: '12px', fontWeight: 700 }}>🍺 ALCOHOLIC BEV</label>
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Takeaway VAT (%)</span>
                  <input type="number" step="0.01" className="form-input" style={{ padding: '8px 12px', marginTop: '4px' }} value={alcoholTakeawayInput} onChange={e => setAlcoholTakeawayInput(e.target.value)} required />
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Dine-In VAT (%)</span>
                  <input type="number" step="0.01" className="form-input" style={{ padding: '8px 12px', marginTop: '4px' }} value={alcoholDineInInput} onChange={e => setAlcoholDineInInput(e.target.value)} required />
                </div>
              </div>

            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn-primary" style={{ padding: '12px 32px', fontSize: '0.875rem' }}>
                Save Store VAT Rules
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 1.2fr', gap: '32px' }}>
          
          {/* Left Side dynamic panels */}
          <div>
            {activeTab === 'menu' ? (
              <div className="glass-card" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>Product Catalog Items</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      <th style={{ paddingBottom: '12px' }}>ITEM TITLE</th>
                      <th style={{ paddingBottom: '12px' }}>VAT CATEGORY</th>
                      <th style={{ paddingBottom: '12px' }}>TAKEAWAY RATE</th>
                      <th style={{ paddingBottom: '12px' }}>DINE-IN RATE</th>
                      <th style={{ paddingBottom: '12px', textAlign: 'right' }}>GROSS PRICE (VAT INCL)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => (
                      <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9375rem' }}>
                        <td style={{ padding: '16px 0', fontWeight: 600 }}>{item.name}</td>
                        <td style={{ padding: '16px 0', textTransform: 'capitalize', color: 'var(--text-secondary)' }}>
                          {item.vatCategory.replace('_', ' ')}
                        </td>
                        <td style={{ padding: '16px 0', color: 'var(--primary)' }}>
                          {(getVatRate(item.vatCategory, true) * 100).toFixed(0)}%
                        </td>
                        <td style={{ padding: '16px 0', color: '#818cf8' }}>
                          {(getVatRate(item.vatCategory, false) * 100).toFixed(0)}%
                        </td>
                        <td style={{ padding: '16px 0', textAlign: 'right', fontWeight: 600, color: 'var(--accent)' }}>
                          € {item.grossPrice.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              // TAB 2: COMBO PROPORTIONAL DISCOUNT ALLOCATION SANDBOX
              <div className="glass-card" style={{ padding: '32px' }}>
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Proportional Combo VAT Allocation Simulator</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    Select items on the right side and input a fixed combo package price. Our algorithm will proportionally allocate the discount and extract legal Net and VAT amounts.
                  </p>
                </div>

                {calcResult ? (
                  <div>
                    {/* Total summary row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', marginBottom: '28px', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>COMBO FIXED PRICE</span>
                        <h4 style={{ fontSize: '1.5rem', marginTop: '4px', color: 'var(--accent)' }}>€ {calcResult.totalComboFixedPrice.toFixed(2)}</h4>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>NORMAL TOTAL PRICE</span>
                        <h4 style={{ fontSize: '1.5rem', marginTop: '4px' }}>€ {calcResult.totalNormalPrice.toFixed(2)}</h4>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>TOTAL DISCOUNT SAVINGS</span>
                        <h4 style={{ fontSize: '1.5rem', marginTop: '4px', color: 'var(--danger)' }}>€ {calcResult.totalDiscount.toFixed(2)}</h4>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ALLOCATED NET (EXTRACTED)</span>
                        <h4 style={{ fontSize: '1.5rem', marginTop: '4px' }}>€ {calcResult.totalNet.toFixed(2)}</h4>
                      </div>
                    </div>

                    {/* Calculations breakdown table */}
                    <h4 style={{ fontSize: '1rem', marginBottom: '12px', fontWeight: 600 }}>Proportional Allocation Table</h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginBottom: '24px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                          <th style={{ paddingBottom: '10px' }}>COMPONENT</th>
                          <th style={{ paddingBottom: '10px' }}>NORMAL</th>
                          <th style={{ paddingBottom: '10px' }}>ALLOCATED GROSS</th>
                          <th style={{ paddingBottom: '10px' }}>RATE</th>
                          <th style={{ paddingBottom: '10px' }}>NET PRICE</th>
                          <th style={{ paddingBottom: '10px', textAlign: 'right' }}>VAT PORTION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {calcResult.items.map((allocated: any, idx: number) => (
                          <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.875rem' }}>
                            <td style={{ padding: '12px 0', fontWeight: 600 }}>{allocated.name}</td>
                            <td style={{ padding: '12px 0', color: 'var(--text-muted)' }}>€ {allocated.normalPrice.toFixed(2)}</td>
                            <td style={{ padding: '12px 0', color: 'var(--accent)', fontWeight: 600 }}>€ {allocated.allocatedGrossPrice.toFixed(2)}</td>
                            <td style={{ padding: '12px 0', color: 'var(--primary)' }}>{(allocated.vatRate * 100).toFixed(0)}%</td>
                            <td style={{ padding: '12px 0' }}>€ {allocated.allocatedNetPrice.toFixed(2)}</td>
                            <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 600 }}>€ {allocated.allocatedVatAmount.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Mathematical sanity checks */}
                    <div style={{ display: 'flex', gap: '20px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      <div>
                        ✔️ Sum of allocated gross equals package price: <strong>€ {calcResult.items.reduce((sum: number, i: any) => sum + i.allocatedGrossPrice, 0).toFixed(2)}</strong>
                      </div>
                      <div>
                        ✔️ Proportional Net + VAT checks: <strong>€ {(calcResult.totalNet + calcResult.totalVat).toFixed(2)}</strong>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ height: '240px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)' }}>
                    Select multiple items on the right side and click 'Run Allocation Engine' to calculate.
                  </div>
                )}
              </div>
            )}
          </div>

        {/* Right Side Control Drawers */}
        <div>
          {activeTab === 'menu' ? (
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '16px', fontWeight: 600 }}>Add Product</h3>
              <form onSubmit={handleAddItem}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>ITEM TITLE</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Classic Fries"
                    value={newItemName}
                    onChange={e => setNewItemName(e.target.value)}
                    style={{ padding: '10px' }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>GROSS PRICE (EUR)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={newItemPrice}
                    onChange={e => setNewItemPrice(e.target.value)}
                    style={{ padding: '10px' }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>VAT CLASSIFICATION</label>
                  <select
                    value={newItemVat}
                    onChange={e => setNewItemVat(e.target.value as any)}
                    className="form-input"
                    style={{ padding: '10px', background: '#111827' }}
                  >
                    <option value="food">Standard Food (BE 6% / 12%)</option>
                    <option value="soft_drink">Soft Drinks (BE 6% / 12%)</option>
                    <option value="alcohol">Alcoholic Beverages (BE 21%)</option>
                    <option value="service">Catering Services (BE 21%)</option>
                  </select>
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px', fontSize: '0.875rem' }}>
                  Insert Menu Item
                </button>
              </form>
            </div>
          ) : (
            // CONTROLLER DRAWER FOR COMBO SANDBOX
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '16px', fontWeight: 600 }}>Combo Setup</h3>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>COMBO FIXED PRICE (€)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  value={comboFixedPrice}
                  onChange={e => setComboFixedPrice(e.target.value)}
                  style={{ padding: '10px' }}
                />
              </div>

              {/* Service Type selector */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>SERVICE CHANNEL</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => setIsTakeaway(true)}
                    style={{
                      flex: 1,
                      background: isTakeaway ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#ffffff',
                      padding: '8px',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}
                  >
                    Takeaway (6%)
                  </button>
                  <button 
                    onClick={() => setIsTakeaway(false)}
                    style={{
                      flex: 1,
                      background: !isTakeaway ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#ffffff',
                      padding: '8px',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}
                  >
                    Dine-In (12%)
                  </button>
                </div>
              </div>

              {/* Dynamic selection of components */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>SELECT COMPONENTS</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
                  {items.map(item => {
                    const isSelected = selectedItemIds.includes(item.id);
                    return (
                      <div 
                        key={item.id}
                        onClick={() => handleSelectItemToggle(item.id)}
                        style={{
                          background: isSelected ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.02)',
                          border: `1px solid ${isSelected ? 'var(--primary)' : 'rgba(255,255,255,0.04)'}`,
                          borderRadius: '8px',
                          padding: '10px 12px',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '0.8125rem'
                        }}
                      >
                        <span style={{ fontWeight: 600, color: isSelected ? '#a5b4fc' : '#ffffff' }}>{item.name}</span>
                        <span style={{ color: 'var(--accent)' }}>€ {item.grossPrice.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button 
                onClick={calculateComboAllocation} 
                className="btn-primary" 
                style={{ width: '100%', padding: '12px', fontSize: '0.875rem' }}
                disabled={selectedItemIds.length === 0}
              >
                Run Allocation Engine
              </button>
            </div>
          )}
        </div>

      </div>
      )}
    </div>
  );
}
