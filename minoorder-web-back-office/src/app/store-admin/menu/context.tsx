'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type VatCategory = 'food' | 'soft_drink' | 'alcohol' | 'service';

export interface MenuItem {
  id: string;
  name: string;
  nameEn?: string;
  nameFr?: string;
  nameNl?: string;
  grossPrice: number;
  vatCategory: VatCategory;
  categoryId?: string;
  imageUrl?: string;
  modifierIds?: string[];
}

interface MenuContextType {
  items: MenuItem[];
  setItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  categories: any[];
  setCategories: React.Dispatch<React.SetStateAction<any[]>>;
  modifierGroups: any[];
  setModifierGroups: React.Dispatch<React.SetStateAction<any[]>>;
  deals: any[];
  setDeals: React.Dispatch<React.SetStateAction<any[]>>;
  printers: any[];
  setPrinters: React.Dispatch<React.SetStateAction<any[]>>;
  shifts: any[];
  setShifts: React.Dispatch<React.SetStateAction<any[]>>;
  orders: any[];
  setOrders: React.Dispatch<React.SetStateAction<any[]>>;
  storeVatRates: any;
  setStoreVatRates: React.Dispatch<React.SetStateAction<any>>;
  language: 'en' | 'fr' | 'nl';
  setLanguage: React.Dispatch<React.SetStateAction<'en' | 'fr' | 'nl'>>;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

// ─── Safe localStorage helpers (client-only) ────────────────────────────────
function lsGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function lsSet(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// ─── Seed data ──────────────────────────────────────────────────────────────
const SEED_ITEMS: MenuItem[] = [
  { id: '1', name: 'Classic Beef Burger', nameEn: 'Classic Beef Burger', nameFr: 'Burger au Bœuf Classique', nameNl: 'Klassieke Rundvlees Burger', grossPrice: 10.00, vatCategory: 'food', categoryId: 'c1', modifierIds: ['mg1', 'mg2'] },
  { id: '2', name: 'Gourmet Double Cheese', nameEn: 'Gourmet Double Cheese', nameFr: 'Double Cheese Gourmet', nameNl: 'Gourmet Dubbele Kaas', grossPrice: 13.50, vatCategory: 'food', categoryId: 'c1', modifierIds: ['mg1', 'mg2'] },
  { id: '3', name: 'Frites Classic Belgian', nameEn: 'Frites Classic Belgian', nameFr: 'Frites Belges Classiques', nameNl: 'Klassieke Belgische Frieten', grossPrice: 3.00, vatCategory: 'food', categoryId: 'c2' },
  { id: '4', name: 'Sweet Potato Fries', nameEn: 'Sweet Potato Fries', nameFr: 'Frites de Patates Douces', nameNl: 'Zoete Aardappel Friet', grossPrice: 4.00, vatCategory: 'food', categoryId: 'c2' },
  { id: '5', name: 'Coca-Cola Zero 33cl', nameEn: 'Coca-Cola Zero 33cl', nameFr: 'Coca-Cola Zéro 33cl', nameNl: 'Coca-Cola Zero 33cl', grossPrice: 2.50, vatCategory: 'soft_drink', categoryId: 'c3' },
  { id: '6', name: 'Duvel Blonde Ale 33cl', nameEn: 'Duvel Blonde Ale 33cl', nameFr: 'Bière Blonde Duvel 33cl', nameNl: 'Duvel Blond Bier 33cl', grossPrice: 4.80, vatCategory: 'alcohol', categoryId: 'c3' },
  { id: '7', name: 'Vanilla Milkshake', nameEn: 'Vanilla Milkshake', nameFr: 'Milkshake à la Vanille', nameNl: 'Vanille Milkshake', grossPrice: 4.50, vatCategory: 'soft_drink', categoryId: 'c3' },
];
const SEED_CATEGORIES = [
  { id: 'c1', name: 'Burgers 🍔', nameEn: 'Burgers 🍔', nameFr: 'Burgers 🍔', nameNl: 'Burgers 🍔', sortOrder: 1, visiblePos: true, visibleKiosk: true },
  { id: 'c2', name: 'Sides 🍟', nameEn: 'Sides 🍟', nameFr: 'Accompagnements 🍟', nameNl: 'Bijgerechten 🍟', sortOrder: 2, visiblePos: true, visibleKiosk: true },
  { id: 'c3', name: 'Drinks 🥤', nameEn: 'Drinks 🥤', nameFr: 'Boissons 🥤', nameNl: 'Dranken 🥤', sortOrder: 3, visiblePos: true, visibleKiosk: true },
];
const SEED_MODIFIERS = [
  { id: 'mg1', name: 'Choose Burger Temperature 🥩', nameEn: 'Choose Burger Temperature 🥩', nameFr: 'Choisir la Cuisson du Burger 🥩', nameNl: 'Kies Bakwijze Burger 🥩', minSelection: 1, maxSelection: 1, isRequired: true, options: [
    { id: 'mo1', name: 'Medium Rare', nameEn: 'Medium Rare', nameFr: 'Bleu / Saignant', nameNl: 'Medium Rare', upcharge: 0.00 },
    { id: 'mo2', name: 'Medium Well', nameEn: 'Medium Well', nameFr: 'À Point', nameNl: 'Medium Gekookt', upcharge: 0.00 },
    { id: 'mo3', name: 'Well Done', nameEn: 'Well Done', nameFr: 'Bien Cuit', nameNl: 'Goed Doorgeraden', upcharge: 0.00 },
  ]},
  { id: 'mg2', name: 'Add Extra Toppings 🧀', nameEn: 'Add Extra Toppings 🧀', nameFr: 'Ajouter des Suppléments 🧀', nameNl: 'Extra Toppings Toevoegen 🧀', minSelection: 0, maxSelection: 4, isRequired: false, options: [
    { id: 'mo4', name: 'Smoked Crispy Bacon', nameEn: 'Smoked Crispy Bacon', nameFr: 'Bacon Croustillant Fumé', nameNl: 'Gerookt Krokant Spek', upcharge: 1.50 },
    { id: 'mo5', name: 'Aged Cheddar Cheese', nameEn: 'Aged Cheddar Cheese', nameFr: 'Fromage Cheddar Affiné', nameNl: 'Gerijpte Cheddarkaas', upcharge: 1.00 },
    { id: 'mo6', name: 'Guacamole Spread', nameEn: 'Guacamole Spread', nameFr: "Purée d'Avocat Guacamole", nameNl: 'Guacamole Spread', upcharge: 1.80 },
  ]},
];
const SEED_DEALS = [
  { id: 'd1', name: 'Standard Burger Combo Deal 🍔🍟🥤', nameEn: 'Standard Burger Combo Deal 🍔🍟🥤', nameFr: 'Offre Combo Burger Standard 🍔🍟🥤', nameNl: 'Standaard Burger Combodeal 🍔🍟🥤', fixedPrice: 12.00, itemIds: ['1', '3', '5'], isAvailable: true },
  { id: 'd2', name: 'Double Feast Deal 🍔🍔🍟🥤🥤', nameEn: 'Double Feast Deal 🍔🍔🍟🥤🥤', nameFr: 'Offre Double Festin 🍔🍔🍟🥤🥤', nameNl: 'Dubbel Feestdeal 🍔🍔🍟🥤🥤', fixedPrice: 22.00, itemIds: ['1', '2', '3', '5', '7'], isAvailable: true },
];
const SEED_VAT = { foodTakeaway: 6.00, foodDineIn: 12.00, softDrinkTakeaway: 6.00, softDrinkDineIn: 12.00, alcoholTakeaway: 21.00, alcoholDineIn: 21.00 };

const LS = {
  vatRates:   'mino_vat_rates',
  items:      'mino_items',
  categories: 'mino_categories',
  modifiers:  'mino_modifiers',
  deals:      'mino_deals',
  language:   'mino_language',
};

export function MenuProvider({ children }: { children: React.ReactNode }) {

  // ── Initialize with SEED data so server & client first-render match ────────
  // (prevents hydration mismatch — localStorage is read AFTER mount)
  const [hydrated,       setHydrated]       = useState(false);
  const [language,       setLanguage]       = useState<'en' | 'fr' | 'nl'>('en');
  const [items,          setItems]          = useState<MenuItem[]>(SEED_ITEMS);
  const [categories,     setCategories]     = useState<any[]>(SEED_CATEGORIES);
  const [modifierGroups, setModifierGroups] = useState<any[]>(SEED_MODIFIERS);
  const [deals,          setDeals]          = useState<any[]>(SEED_DEALS);
  const [storeVatRates,  setStoreVatRates]  = useState<any>(SEED_VAT);

  // Session-only (no persistence needed yet)
  const [printers, setPrinters] = useState([
    { id: 'p1', name: 'Star Counter Receipt (POS)', connectionType: 'ip', address: '192.168.1.100', role: 'receipt' },
    { id: 'p2', name: 'Epson Kitchen Hot Pass', connectionType: 'usb', address: 'COM3', role: 'kitchen' },
    { id: 'p3', name: 'Bar Drinks Printer', connectionType: 'ip', address: '192.168.1.105', role: 'bar' },
  ]);
  const [shifts, setShifts] = useState([
    { id: 'shift-098', cashier: 'Marie Laurent', terminalName: 'Kiosk-01', terminalType: 'kiosk', opened: '2026-05-23 09:00:00', closed: '2026-05-23 17:30:00', openingCash: 0.00, closingCash: 0.00, status: 'Closed', xReportHash: 'X_SIG_4401_SHA256_FDM_BE', xReportTime: '2026-05-23 13:00:00', zReportHash: 'Z_SIG_4402_SHA256_FDM_BE', totalOrders: 64, grossRevenue: 892.40, totalVat: 89.24, cardTotal: 892.40, cashTotal: 0.00 },
    { id: 'shift-099', cashier: 'Ahmed Bensaid', terminalName: 'POS-01', terminalType: 'pos', opened: '2026-05-23 08:30:00', closed: '2026-05-23 16:45:00', openingCash: 150.00, closingCash: 745.80, status: 'Closed', xReportHash: 'X_SIG_4410_SHA256_FDM_BE', xReportTime: '2026-05-23 12:30:00', zReportHash: 'Z_SIG_4411_SHA256_FDM_BE', totalOrders: 47, grossRevenue: 1231.50, totalVat: 123.15, cardTotal: 635.70, cashTotal: 595.80 },
    { id: 'shift-100', cashier: 'Elena Rossi', terminalName: 'POS-02', terminalType: 'pos', opened: '2026-05-24 07:45:00', closed: '2026-05-24 15:30:00', openingCash: 200.00, closingCash: 1124.30, status: 'Closed', xReportHash: 'X_SIG_5501_SHA256_FDM_BE', xReportTime: '2026-05-24 12:00:00', zReportHash: 'Z_SIG_5502_SHA256_FDM_BE', totalOrders: 58, grossRevenue: 1580.60, totalVat: 158.06, cardTotal: 656.30, cashTotal: 924.30 },
    { id: 'shift-101', cashier: 'Marie Laurent', terminalName: 'Kiosk-01', terminalType: 'kiosk', opened: '2026-05-24 09:00:00', closed: '2026-05-24 21:00:00', openingCash: 0.00, closingCash: 0.00, status: 'Closed', xReportHash: 'X_SIG_5510_SHA256_FDM_BE', xReportTime: '2026-05-24 15:00:00', zReportHash: 'Z_SIG_5511_SHA256_FDM_BE', totalOrders: 91, grossRevenue: 1345.20, totalVat: 134.52, cardTotal: 1345.20, cashTotal: 0.00 },
    { id: 'shift-102', cashier: 'Ahmed Bensaid', terminalName: 'Kiosk-02', terminalType: 'kiosk', opened: '2026-05-24 09:00:00', closed: '2026-05-24 21:00:00', openingCash: 0.00, closingCash: 0.00, status: 'Closed', xReportHash: 'X_SIG_5520_SHA256_FDM_BE', xReportTime: '2026-05-24 14:30:00', zReportHash: 'Z_SIG_5521_SHA256_FDM_BE', totalOrders: 78, grossRevenue: 1102.80, totalVat: 110.28, cardTotal: 1102.80, cashTotal: 0.00 },
    { id: 'shift-103', cashier: 'John Doe', terminalName: 'POS-01', terminalType: 'pos', opened: '2026-05-25 08:00:00', closed: '2026-05-25 16:30:00', openingCash: 150.00, closingCash: 987.60, status: 'Closed', xReportHash: 'X_SIG_6601_SHA256_FDM_BE', xReportTime: '2026-05-25 12:15:00', zReportHash: 'Z_SIG_6602_SHA256_FDM_BE', totalOrders: 52, grossRevenue: 1420.30, totalVat: 142.03, cardTotal: 582.70, cashTotal: 837.60 },
    { id: 'shift-104', cashier: 'John Doe', terminalName: 'POS-02', terminalType: 'pos', opened: '2026-05-25 08:30:12', closed: '2026-05-25 16:45:00', openingCash: 150.00, closingCash: 852.50, status: 'Closed', xReportHash: 'X_SIG_8871_SHA256_FDM_BE', xReportTime: '2026-05-25 12:30:00', zReportHash: 'Z_SIG_8872_SHA256_FDM_BE', totalOrders: 39, grossRevenue: 1075.40, totalVat: 107.54, cardTotal: 372.90, cashTotal: 702.50 },
    { id: 'shift-105', cashier: 'Sarah Connor', terminalName: 'POS-01', terminalType: 'pos', opened: '2026-05-26 17:00:00', closed: null, openingCash: 150.00, closingCash: 0.00, status: 'Active', xReportHash: '', xReportTime: null, zReportHash: '', totalOrders: 12, grossRevenue: 284.60, totalVat: 28.46, cardTotal: 134.60, cashTotal: 150.00 },
    { id: 'shift-106', cashier: 'Marie Laurent', terminalName: 'Kiosk-01', terminalType: 'kiosk', opened: '2026-05-26 09:00:00', closed: null, openingCash: 0.00, closingCash: 0.00, status: 'Active', xReportHash: '', xReportTime: null, zReportHash: '', totalOrders: 31, grossRevenue: 467.20, totalVat: 46.72, cardTotal: 467.20, cashTotal: 0.00 },
  ]);
  const [orders, setOrders] = useState([
    { id: 'ord-9921', orderNumber: 'T-12', time: '2026-05-25 19:42:15', gross: 29.50, net: 26.85, vat: 2.65, method: 'Card', receiptNumber: 'BE-STORE01-20260525-T-12', fdmHash: 'SIG_ab78d91_SHA256_FDM' },
    { id: 'ord-9922', orderNumber: 'D-08', time: '2026-05-25 20:05:33', gross: 12.00, net: 11.32, vat: 0.68, method: 'Bancontact', receiptNumber: 'BE-STORE01-20260525-D-08', fdmHash: 'SIG_bc99e12_SHA256_FDM' },
    { id: 'ord-9923', orderNumber: 'T-13', time: '2026-05-25 20:15:00', gross: 42.10, net: 37.80, vat: 4.30, method: 'Payconiq', receiptNumber: 'BE-STORE01-20260525-T-13', fdmHash: 'SIG_de44f89_SHA256_FDM' },
  ]);

  // ── Hydrate from localStorage AFTER first mount (client-only) ─────────────
  useEffect(() => {
    setLanguage(      lsGet(LS.language,   'en'));
    setItems(         lsGet(LS.items,      SEED_ITEMS));
    setCategories(    lsGet(LS.categories, SEED_CATEGORIES));
    setModifierGroups(lsGet(LS.modifiers,  SEED_MODIFIERS));
    setDeals(         lsGet(LS.deals,      SEED_DEALS));
    setStoreVatRates( lsGet(LS.vatRates,   SEED_VAT));
    setHydrated(true); // ← only NOW allow persist effects to write
  }, []);

  // ── Persist to localStorage — ONLY after hydration is complete ─────────────
  // Guards prevent overwriting saved data with seeds on initial render
  useEffect(() => { if (hydrated) lsSet(LS.language,   language);       }, [hydrated, language]);
  useEffect(() => { if (hydrated) lsSet(LS.items,      items);          }, [hydrated, items]);
  useEffect(() => { if (hydrated) lsSet(LS.categories, categories);     }, [hydrated, categories]);
  useEffect(() => { if (hydrated) lsSet(LS.modifiers,  modifierGroups); }, [hydrated, modifierGroups]);
  useEffect(() => { if (hydrated) lsSet(LS.deals,      deals);          }, [hydrated, deals]);
  useEffect(() => { if (hydrated) lsSet(LS.vatRates,   storeVatRates);  }, [hydrated, storeVatRates]);

  return (
    <MenuContext.Provider value={{
      items, setItems,
      categories, setCategories,
      modifierGroups, setModifierGroups,
      deals, setDeals,
      printers, setPrinters,
      shifts, setShifts,
      orders, setOrders,
      storeVatRates, setStoreVatRates,
      language, setLanguage,
    }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (!context) throw new Error('useMenu must be used within a MenuProvider');
  return context;
}
