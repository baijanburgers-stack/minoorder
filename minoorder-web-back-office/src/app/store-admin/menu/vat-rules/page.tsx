'use client';

import React, { useState } from 'react';
import { useMenu } from '../context';
import { useToast } from '../../../../components/Toast';

export default function VatRulesPage() {
  const { storeVatRates, setStoreVatRates } = useMenu();
  const { showToast } = useToast();

  // Form states initialized from shared context
  const [foodTakeawayInput, setFoodTakeawayInput] = useState(storeVatRates.foodTakeaway.toString());
  const [foodDineInInput, setFoodDineInInput] = useState(storeVatRates.foodDineIn.toString());
  const [softTakeawayInput, setSoftTakeawayInput] = useState(storeVatRates.softDrinkTakeaway.toString());
  const [softDineInInput, setSoftDineInInput] = useState(storeVatRates.softDrinkDineIn.toString());
  const [alcoholTakeawayInput, setAlcoholTakeawayInput] = useState(storeVatRates.alcoholTakeaway.toString());
  const [alcoholDineInInput, setAlcoholDineInInput] = useState(storeVatRates.alcoholDineIn.toString());

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
    showToast('VAT rules updated — catalog extractions and combo engine now use updated rates.', 'success');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
          <span style={{ fontSize: '1.1rem' }}>📐</span>
          <h1 className="page-title"><span className="text-gradient">Store VAT Rules</span></h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Zero-hardcoding tax rate settings mapping country code guidelines.</p>
      </div>

      <div className="glass-card" style={{ padding: '22px 24px' }}>
        <div style={{ marginBottom: '18px' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '4px' }}>Store-Level VAT Rules Manager</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
            Configure regional tax rates. These dynamically power all catalog item extractions and proportional combo discount breakdowns.
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
    </div>
  );
}
