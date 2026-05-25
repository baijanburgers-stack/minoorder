'use client';

import React, { useState } from 'react';
import '../../styles/globals.css';

interface VatRates {
  foodTakeaway: number;
  foodDineIn: number;
  softDrinkTakeaway: number;
  softDrinkDineIn: number;
  alcoholTakeaway: number;
  alcoholDineIn: number;
}

interface StorePerformance {
  id: string;
  name: string;
  companyName: string;
  vatNumber: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  dailySales: number;
  monthlySales: number;
  activeDevices: number;
  posLimit: number;
  kioskLimit: number;
  status: 'online' | 'offline';
  isFdmRequired: boolean;
  fiscalSystem: string;
  fiscalApiKey?: string;
  logoUrl?: string; // Store logo image as Base64 Data URL or path
  adminEmail?: string; // Store administrator account login username/email
  vatRates: VatRates; // Custom dynamically assigned VAT rules per store
}

// 20 Eurozone countries using Euro currency
const EUROZONE_COUNTRIES = [
  { code: 'AT', name: 'Austria', placeholder: 'AT U12345678' },
  { code: 'BE', name: 'Belgium', placeholder: 'BE 0741.982.634' },
  { code: 'HR', name: 'Croatia', placeholder: 'HR 12345678901' },
  { code: 'CY', name: 'Cyprus', placeholder: 'CY 12345678X' },
  { code: 'EE', name: 'Estonia', placeholder: 'EE 123456789' },
  { code: 'FI', name: 'Finland', placeholder: 'FI 12345678' },
  { code: 'FR', name: 'France', placeholder: 'FR 12345678901' },
  { code: 'DE', name: 'Germany', placeholder: 'DE 123456789' },
  { code: 'GR', name: 'Greece', placeholder: 'EL 123456789' },
  { code: 'IE', name: 'Ireland', placeholder: 'IE 1234567FA' },
  { code: 'IT', name: 'Italy', placeholder: 'IT 12345678901' },
  { code: 'LV', name: 'Latvia', placeholder: 'LV 12345678901' },
  { code: 'LT', name: 'Lithuania', placeholder: 'LT 123456789012' },
  { code: 'LU', name: 'Luxembourg', placeholder: 'LU 12345678' },
  { code: 'MT', name: 'Malta', placeholder: 'MT 12345678' },
  { code: 'NL', name: 'Netherlands', placeholder: 'NL 123456789B01' },
  { code: 'PT', name: 'Portugal', placeholder: 'PT 123456789' },
  { code: 'SK', name: 'Slovakia', placeholder: 'SK 1234567890' },
  { code: 'SI', name: 'Slovenia', placeholder: 'SI 12345678' },
  { code: 'ES', name: 'Spain', placeholder: 'ES A1234567B' },
];

const getComplianceSystem = (countryCode: string) => {
  switch (countryCode) {
    case 'AT': return { code: 'AT_RKSV', name: 'Austria RKSV QR Module', placeholder: 'e.g. AT-RKSV-TSS-987214' };
    case 'BE': return { code: 'BE_FDM', name: 'Belgium FDM Black-Box', placeholder: 'e.g. BE-FDM-BOX-0741982' };
    case 'HR': return { code: 'HR_CIS', name: 'Croatia FISCAL CIS', placeholder: 'e.g. HR-CIS-KEY-12345678' };
    case 'CY': return { code: 'CY_ESD', name: 'Cyprus Fiscal ESD', placeholder: 'e.g. CY-ESD-SIGN-998811' };
    case 'EE': return { code: 'EE_LEDGER', name: 'Estonia Fiscal Ledger', placeholder: 'e.g. EE-LDG-ID-887766' };
    case 'FI': return { code: 'FI_UNIT', name: 'Finland Fiscal Unit', placeholder: 'e.g. FI-FU-CERT-554433' };
    case 'FR': return { code: 'FR_NF525', name: 'France NF525 Certified', placeholder: 'e.g. FR-NF525-HASH-112233' };
    case 'DE': return { code: 'DE_TSS', name: 'Germany TSS Cloud (Fiskaly)', placeholder: 'e.g. DE-TSS-CLIENT-KEY-4433' };
    case 'GR': return { code: 'GR_ESD', name: 'Greece ESD Signature', placeholder: 'e.g. EL-ESD-SIGN-778899' };
    case 'IE': return { code: 'IE_SIGN', name: 'Ireland Revenue Sign', placeholder: 'e.g. IE-REV-SIGN-1234-A5' };
    case 'IT': return { code: 'IT_RT', name: 'Italy RT Telematico', placeholder: 'e.g. IT-RT-SERIAL-88990011' };
    case 'LV': return { code: 'LV_ESD', name: 'Latvia ESD Unit', placeholder: 'e.g. LV-ESD-CERT-223344' };
    case 'LT': return { code: 'LT_SPA', name: 'Lithuania SPA Unit', placeholder: 'e.g. LT-SPA-UNIT-556677' };
    case 'LU': return { code: 'LU_LOG', name: 'Luxembourg Fiscal Log', placeholder: 'e.g. LU-FL-HASH-991122' };
    case 'MT': return { code: 'MT_SIGN', name: 'Malta Fiscal Sign', placeholder: 'e.g. MT-FS-CERT-334455' };
    case 'NL': return { code: 'NL_KMEF', name: 'Netherlands Keurmerk EF', placeholder: 'e.g. NL-KMEF-BOX-667788' };
    case 'PT': return { code: 'PT_SAFT', name: 'Portugal SAF-T Sign', placeholder: 'e.g. PT-SAFT-CERT-445566' };
    case 'SK': return { code: 'SK_EKASA', name: 'Slovakia e-Kasa Client', placeholder: 'e.g. SK-EKASA-CLIENT-8822' };
    case 'SI': return { code: 'SI_SIGN', name: 'Slovenia Tax Sign', placeholder: 'e.g. SI-TAX-SIGN-556677' };
    case 'ES': return { code: 'ES_TBAI', name: 'Spain TicketBAI Signature', placeholder: 'e.g. ES-TBAI-LICENSE-9922' };
    default: return { code: 'STANDARD', name: 'Standard VAT Ledger', placeholder: 'e.g. N/A' };
  }
};

const getFiscalBadge = (system: string) => {
  switch (system) {
    case 'BE_FDM': return { text: 'BE-FDM Box', color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: '#10b981' };
    case 'DE_TSS': return { text: 'DE-TSS Cloud', color: '#818cf8', bg: 'rgba(129,140,248,0.1)', border: '#818cf8' };
    case 'FR_NF525': return { text: 'FR-NF525 Chain', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: '#f59e0b' };
    case 'AT_RKSV': return { text: 'AT-RKSV QR', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', border: '#60a5fa' };
    case 'IT_RT': return { text: 'IT-RT XML', color: '#f472b6', bg: 'rgba(244,114,182,0.1)', border: '#f472b6' };
    case 'ES_TBAI': return { text: 'ES-TicketBAI', color: '#2dd4bf', bg: 'rgba(45,212,191,0.1)', border: '#2dd4bf' };
    case 'HR_CIS': return { text: 'HR-CIS Sign', color: '#a855f7', bg: 'rgba(168,85,247,0.1)', border: '#a855f7' };
    case 'CY_ESD': return { text: 'CY-ESD Sign', color: '#ec4899', bg: 'rgba(236,72,153,0.1)', border: '#ec4899' };
    case 'EE_LEDGER': return { text: 'EE-Ledger', color: '#06b6d4', bg: 'rgba(6,182,212,0.1)', border: '#06b6d4' };
    case 'FI_UNIT': return { text: 'FI-Fiscal Unit', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: '#3b82f6' };
    case 'GR_ESD': return { text: 'GR-ESD Sign', color: '#14b8a6', bg: 'rgba(20,184,166,0.1)', border: '#14b8a6' };
    case 'IE_SIGN': return { text: 'IE-Revenue Sign', color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: '#22c55e' };
    case 'LV_ESD': return { text: 'LV-ESD Unit', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: '#ef4444' };
    case 'LT_SPA': return { text: 'LT-SPA Unit', color: '#eab308', bg: 'rgba(234,179,8,0.1)', border: '#eab308' };
    case 'LU_LOG': return { text: 'LU-Fiscal Log', color: '#a855f7', bg: 'rgba(168,85,247,0.1)', border: '#a855f7' };
    case 'MT_SIGN': return { text: 'MT-Fiscal Sign', color: '#f97316', bg: 'rgba(249,115,22,0.1)', border: '#f97316' };
    case 'NL_KMEF': return { text: 'NL-Keurmerk EF', color: '#6366f1', bg: 'rgba(99,102,241,0.1)', border: '#6366f1' };
    case 'PT_SAFT': return { text: 'PT-SAF-T Sign', color: '#06b6d4', bg: 'rgba(6,182,212,0.1)', border: '#06b6d4' };
    case 'SK_EKASA': return { text: 'SK-eKasa Client', color: '#ec4899', bg: 'rgba(236,72,153,0.1)', border: '#ec4899' };
    case 'SI_SIGN': return { text: 'SI-Tax Sign', color: '#14b8a6', bg: 'rgba(20,184,166,0.1)', border: '#14b8a6' };
    default: return { text: 'Standard VAT', color: '#9ca3af', bg: 'rgba(156,163,175,0.05)', border: 'rgba(156,163,175,0.15)' };
  }
};

const formatNumber = (num: number): string => {
  return num.toLocaleString('de-DE');
};

export default function CleanSuperAdminPortal() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'stores' | 'settings'>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Multi-store performance records with granular VAT rules
  const [storePerformances, setStorePerformances] = useState<StorePerformance[]>([
    {
      id: 's1',
      name: 'Bella Italia - Central',
      companyName: 'Bella Italia Group SA',
      vatNumber: 'BE 0441.982.634',
      street: 'Anspachlaan 42',
      city: 'Brussels',
      postalCode: '1000',
      country: 'BE',
      phone: '+32 2 543 21 00',
      email: 'brussels@bellaitalia.be',
      dailySales: 1240,
      monthlySales: 38400,
      activeDevices: 4,
      posLimit: 5,
      kioskLimit: 3,
      status: 'online',
      isFdmRequired: true,
      fiscalSystem: 'BE_FDM',
      fiscalApiKey: 'BE-FDM-BOX-0441982',
      logoUrl: '',
      adminEmail: 'brussels@bellaitalia.be',
      vatRates: { foodTakeaway: 6, foodDineIn: 12, softDrinkTakeaway: 6, softDrinkDineIn: 12, alcoholTakeaway: 21, alcoholDineIn: 21 }
    },
    {
      id: 's2',
      name: 'Bella Italia - Express',
      companyName: 'Bella Italia Group SA',
      vatNumber: 'BE 0441.982.634',
      street: 'Meir 12',
      city: 'Antwerp',
      postalCode: '2000',
      country: 'BE',
      phone: '+32 3 987 65 43',
      email: 'antwerp@bellaitalia.be',
      dailySales: 850,
      monthlySales: 24500,
      activeDevices: 2,
      posLimit: 3,
      kioskLimit: 2,
      status: 'online',
      isFdmRequired: false,
      fiscalSystem: 'STANDARD',
      logoUrl: '',
      adminEmail: 'antwerp@bellaitalia.be',
      vatRates: { foodTakeaway: 6, foodDineIn: 12, softDrinkTakeaway: 6, softDrinkDineIn: 12, alcoholTakeaway: 21, alcoholDineIn: 21 }
    },
    {
      id: 's3',
      name: 'Le Bistrot Classic',
      companyName: 'Horeca Wallonie SRL',
      vatNumber: 'BE 0812.345.678',
      street: 'Rue de la Cathedrale 8',
      city: 'Liege',
      postalCode: '4000',
      country: 'BE',
      phone: '+32 4 230 11 22',
      email: 'contact@lebistrot.be',
      dailySales: 980,
      monthlySales: 29800,
      activeDevices: 3,
      posLimit: 3,
      kioskLimit: 2,
      status: 'online',
      isFdmRequired: true,
      fiscalSystem: 'BE_FDM',
      fiscalApiKey: 'BE-FDM-BOX-0812345',
      logoUrl: '',
      adminEmail: 'contact@lebistrot.be',
      vatRates: { foodTakeaway: 6, foodDineIn: 12, softDrinkTakeaway: 6, softDrinkDineIn: 12, alcoholTakeaway: 21, alcoholDineIn: 21 }
    },
    {
      id: 's4',
      name: 'Brussels Waffle House',
      companyName: 'Waffle House Brussels BV',
      vatNumber: 'BE 0909.112.233',
      street: 'Grote Markt 5',
      city: 'Brussels',
      postalCode: '1000',
      country: 'BE',
      phone: '+32 2 443 32 21',
      email: 'info@brusselswaffle.be',
      dailySales: 1450,
      monthlySales: 44200,
      activeDevices: 5,
      posLimit: 6,
      kioskLimit: 4,
      status: 'online',
      isFdmRequired: true,
      fiscalSystem: 'BE_FDM',
      fiscalApiKey: 'BE-FDM-BOX-0909112',
      logoUrl: '',
      adminEmail: 'info@brusselswaffle.be',
      vatRates: { foodTakeaway: 6, foodDineIn: 12, softDrinkTakeaway: 6, softDrinkDineIn: 12, alcoholTakeaway: 21, alcoholDineIn: 21 }
    },
  ]);

  // Form states to add new stores
  const [storeName, setStoreName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [vatNumber, setVatNumber] = useState('BE '); // Default prefix matches default BE selection
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('BE');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [posLimit, setPosLimit] = useState('3');
  const [kioskLimit, setKioskLimit] = useState('2');
  const [fiscalSystem, setFiscalSystem] = useState('BE_FDM');
  const [isFdmRequired, setIsFdmRequired] = useState(true);
  const [fiscalApiKey, setFiscalApiKey] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [globalLogoUrl, setGlobalLogoUrl] = useState('');
  const [globalComplianceSystem, setGlobalComplianceSystem] = useState('BE_FDM');
  const [heartbeatInterval, setHeartbeatInterval] = useState(60);
  const [wormLogsEnabled, setWormLogsEnabled] = useState(true);
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Logo size must be under 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGlobalLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Logo size must be under 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setGlobalLogoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyGlobalSettings = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Global Platform Rules Applied Successfully!\n\n- Primary Compliance Fallback: ${globalComplianceSystem}\n- License Heartbeat Interval: ${heartbeatInterval} seconds\n- White-Label Logo status: ${globalLogoUrl ? 'Active Custom Brand Logo' : 'Default PlatePixels Brand'}\n- Transaction Deviation Logs (WORM): ${wormLogsEnabled ? 'Enabled & Audited to AWS S3 Redundant Buckets' : 'Disabled'}\n\nPlatform configuration has been synced to all active POS and Kiosk nodes.`);
  };

  const handleGeneratePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let pass = '';
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setAdminPassword(pass);
  };

  // Dynamic VAT Rule states configured inside modal form
  const [foodTakeaway, setFoodTakeaway] = useState('6.00');
  const [foodDineIn, setFoodDineIn] = useState('12.00');
  const [softTakeaway, setSoftTakeaway] = useState('6.00');
  const [softDineIn, setSoftDineIn] = useState('12.00');
  const [alcoholTakeaway, setAlcoholTakeaway] = useState('21.00');
  const [alcoholDineIn, setAlcoholDineIn] = useState('21.00');

  // Edit Store modal form states
  const [editingStore, setEditingStore] = useState<StorePerformance | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editStoreName, setEditStoreName] = useState('');
  const [editCompanyName, setEditCompanyName] = useState('');
  const [editVatNumber, setEditVatNumber] = useState('');
  const [editStreet, setEditStreet] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editPostalCode, setEditPostalCode] = useState('');
  const [editCountry, setEditCountry] = useState('BE');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPosLimit, setEditPosLimit] = useState('3');
  const [editKioskLimit, setEditKioskLimit] = useState('2');
  const [editFiscalSystem, setEditFiscalSystem] = useState('BE_FDM');
  const [editIsFdmRequired, setEditIsFdmRequired] = useState(true);
  const [editFiscalApiKey, setEditFiscalApiKey] = useState('');
  const [editLogoUrl, setEditLogoUrl] = useState('');

  const handleEditLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Logo size must be under 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditLogoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Edit VAT rates state
  const [editFoodTakeaway, setEditFoodTakeaway] = useState('6.00');
  const [editFoodDineIn, setEditFoodDineIn] = useState('12.00');
  const [editSoftTakeaway, setEditSoftTakeaway] = useState('6.00');
  const [editSoftDineIn, setEditSoftDineIn] = useState('12.00');
  const [editAlcoholTakeaway, setEditAlcoholTakeaway] = useState('21.00');
  const [editAlcoholDineIn, setEditAlcoholDineIn] = useState('21.00');

  // Active handler when country dropdown changes: updates VAT rates, prefixes, and placeholders
  const handleCountryChange = (selectedCountry: string) => {
    setCountry(selectedCountry);
    
    // 1. Update VAT code prefix
    const strippedVat = vatNumber.replace(/^(AT|BE|HR|CY|EE|FI|FR|DE|GR|EL|IE|IT|LV|LT|LU|MT|NL|PT|SK|SI|ES)\s*/i, '');
    const prefixCode = selectedCountry === 'GR' ? 'EL' : selectedCountry;
    const newPrefix = `${prefixCode} `;
    setVatNumber(newPrefix + strippedVat);

    // 2. Auto-detect compliance system based on selected country
    const system = getComplianceSystem(selectedCountry);
    setFiscalSystem(system.code);
    setIsFdmRequired(system.code !== 'STANDARD');

    // 3. Pre-populate country specific standard VAT tax matrices
    if (selectedCountry === 'BE') {
      setFoodTakeaway('6.00'); setFoodDineIn('12.00');
      setSoftTakeaway('6.00'); setSoftDineIn('12.00');
      setAlcoholTakeaway('21.00'); setAlcoholDineIn('21.00');
    } else if (selectedCountry === 'DE') {
      setFoodTakeaway('7.00'); setFoodDineIn('19.00');
      setSoftTakeaway('19.00'); setSoftDineIn('19.00');
      setAlcoholTakeaway('19.00'); setAlcoholDineIn('19.00');
    } else if (selectedCountry === 'FR') {
      setFoodTakeaway('5.50'); setFoodDineIn('10.00');
      setSoftTakeaway('5.50'); setSoftDineIn('10.00');
      setAlcoholTakeaway('20.00'); setAlcoholDineIn('20.00');
    } else if (selectedCountry === 'AT') {
      setFoodTakeaway('10.00'); setFoodDineIn('10.00');
      setSoftTakeaway('20.00'); setSoftDineIn('20.00');
      setAlcoholTakeaway('20.00'); setAlcoholDineIn('20.00');
    } else if (selectedCountry === 'IT') {
      setFoodTakeaway('10.00'); setFoodDineIn('10.00');
      setSoftTakeaway('22.00'); setSoftDineIn('22.00');
      setAlcoholTakeaway('22.00'); setAlcoholDineIn('22.00');
    } else if (selectedCountry === 'ES') {
      setFoodTakeaway('10.00'); setFoodDineIn('10.00');
      setSoftTakeaway('21.00'); setSoftDineIn('21.00');
      setAlcoholTakeaway('21.00'); setAlcoholDineIn('21.00');
    } else {
      // Standard baseline Eurozone defaults
      setFoodTakeaway('6.00'); setFoodDineIn('15.00');
      setSoftTakeaway('15.00'); setSoftDineIn('15.00');
      setAlcoholTakeaway('21.00'); setAlcoholDineIn('21.00');
    }
  };

  const getVatPlaceholder = () => {
    const matched = EUROZONE_COUNTRIES.find(c => c.code === country);
    return matched ? matched.placeholder : 'BE 0741.982.634';
  };

  const handleAddStoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logoUrl) {
      alert('Store Brand Logo is mandatory! Please upload a brand logo from your PC.');
      return;
    }
    if (!storeName || !companyName || !vatNumber || !city || !street || !postalCode || !phone || !email) {
      alert('All brand, location, contact, and logo fields are mandatory for store creation!');
      return;
    }
    if (!adminName || !adminEmail || !adminPassword) {
      alert('All initial administrator credential fields are mandatory!');
      return;
    }

    const newStore: StorePerformance = {
      id: Date.now().toString(),
      name: storeName,
      companyName,
      vatNumber,
      street,
      city,
      postalCode,
      country,
      phone,
      email,
      dailySales: 0,
      monthlySales: 0,
      activeDevices: 0,
      posLimit: parseInt(posLimit),
      kioskLimit: parseInt(kioskLimit),
      status: 'online',
      isFdmRequired,
      fiscalSystem,
      fiscalApiKey: isFdmRequired ? fiscalApiKey : '',
      logoUrl: logoUrl,
      adminEmail: adminEmail,
      vatRates: {
        foodTakeaway: parseFloat(foodTakeaway),
        foodDineIn: parseFloat(foodDineIn),
        softDrinkTakeaway: parseFloat(softTakeaway),
        softDrinkDineIn: parseFloat(softDineIn),
        alcoholTakeaway: parseFloat(alcoholTakeaway),
        alcoholDineIn: parseFloat(alcoholDineIn),
      }
    };

    setStorePerformances([...storePerformances, newStore]);
    
    // Beautiful alert confirmation showing provisioned credentials
    alert(`Store Node Deployed Successfully!\n\nStore Admin Account Registered:\nUser: ${adminEmail}\nPass: ${adminPassword}\n\nPlease share these credentials securely with the Store Admin.`);
    
    setIsModalOpen(false); // Close comprehensive modal

    // Clear form fields
    setStoreName('');
    setCompanyName('');
    setVatNumber('BE ');
    setStreet('');
    setCity('');
    setPostalCode('');
    setPhone('');
    setEmail('');
    setPosLimit('3');
    setKioskLimit('2');
    setFiscalSystem('BE_FDM');
    setFiscalApiKey('');
    setLogoUrl('');
    setAdminName('');
    setAdminEmail('');
    setAdminPassword('');
    setCountry('BE');
    setIsFdmRequired(true);
    setFoodTakeaway('6.00'); setFoodDineIn('12.00');
    setSoftTakeaway('6.00'); setSoftDineIn('12.00');
    setAlcoholTakeaway('21.00'); setAlcoholDineIn('21.00');
  };

  const handleEditCountryChange = (selectedCountry: string) => {
    setEditCountry(selectedCountry);
    
    // Update VAT prefix
    const strippedVat = editVatNumber.replace(/^(AT|BE|HR|CY|EE|FI|FR|DE|GR|EL|IE|IT|LV|LT|LU|MT|NL|PT|SK|SI|ES)\s*/i, '');
    const prefixCode = selectedCountry === 'GR' ? 'EL' : selectedCountry;
    const newPrefix = `${prefixCode} `;
    setEditVatNumber(newPrefix + strippedVat);

    // Auto-detect compliance system based on selected country
    const system = getComplianceSystem(selectedCountry);
    setEditFiscalSystem(system.code);
    setEditIsFdmRequired(system.code !== 'STANDARD');

    // Default rates
    if (selectedCountry === 'BE') {
      setEditFoodTakeaway('6.00'); setEditFoodDineIn('12.00');
      setEditSoftTakeaway('6.00'); setEditSoftDineIn('12.00');
      setEditAlcoholTakeaway('21.00'); setEditAlcoholDineIn('21.00');
    } else if (selectedCountry === 'DE') {
      setEditFoodTakeaway('7.00'); setEditFoodDineIn('19.00');
      setEditSoftTakeaway('19.00'); setEditSoftDineIn('19.00');
      setEditAlcoholTakeaway('19.00'); setEditAlcoholDineIn('19.00');
    } else if (selectedCountry === 'FR') {
      setEditFoodTakeaway('5.50'); setEditFoodDineIn('10.00');
      setEditSoftTakeaway('5.50'); setEditSoftDineIn('10.00');
      setEditAlcoholTakeaway('20.00'); setEditAlcoholDineIn('20.00');
    } else if (selectedCountry === 'AT') {
      setEditFoodTakeaway('10.00'); setEditFoodDineIn('10.00');
      setEditSoftTakeaway('20.00'); setEditSoftDineIn('20.00');
      setEditAlcoholTakeaway('20.00'); setEditAlcoholDineIn('20.00');
    } else if (selectedCountry === 'IT') {
      setEditFoodTakeaway('10.00'); setEditFoodDineIn('10.00');
      setEditSoftTakeaway('22.00'); setEditSoftDineIn('22.00');
      setEditAlcoholTakeaway('22.00'); setEditAlcoholDineIn('22.00');
    } else if (selectedCountry === 'ES') {
      setEditFoodTakeaway('10.00'); setEditFoodDineIn('10.00');
      setEditSoftTakeaway('21.00'); setEditSoftDineIn('21.00');
      setEditAlcoholTakeaway('21.00'); setEditAlcoholDineIn('21.00');
    } else {
      setEditFoodTakeaway('6.00'); setEditFoodDineIn('15.00');
      setEditSoftTakeaway('15.00'); setEditSoftDineIn('15.00');
      setEditAlcoholTakeaway('21.00'); setEditAlcoholDineIn('21.00');
    }
  };

  const triggerOpenEditModal = (store: StorePerformance) => {
    setEditingStore(store);
    setEditStoreName(store.name);
    setEditCompanyName(store.companyName);
    setEditVatNumber(store.vatNumber);
    setEditStreet(store.street);
    setEditCity(store.city);
    setEditPostalCode(store.postalCode);
    setEditCountry(store.country);
    setEditPhone(store.phone || '');
    setEditEmail(store.email || '');
    setEditPosLimit(store.posLimit ? store.posLimit.toString() : '3');
    setEditKioskLimit(store.kioskLimit ? store.kioskLimit.toString() : '2');
    setEditFiscalSystem(store.fiscalSystem || (store.isFdmRequired ? 'BE_FDM' : 'STANDARD'));
    setEditIsFdmRequired(store.isFdmRequired);
    setEditFiscalApiKey(store.fiscalApiKey || '');
    setEditLogoUrl(store.logoUrl || '');

    setEditFoodTakeaway(store.vatRates.foodTakeaway.toFixed(2));
    setEditFoodDineIn(store.vatRates.foodDineIn.toFixed(2));
    setEditSoftTakeaway(store.vatRates.softDrinkTakeaway.toFixed(2));
    setEditSoftDineIn(store.vatRates.softDrinkDineIn.toFixed(2));
    setEditAlcoholTakeaway(store.vatRates.alcoholTakeaway.toFixed(2));
    setEditAlcoholDineIn(store.vatRates.alcoholDineIn.toFixed(2));
    
    setIsEditModalOpen(true);
  };

  const handleEditStoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStore || !editStoreName || !editCompanyName || !editVatNumber || !editCity) return;

    setStorePerformances(storePerformances.map(store => {
      if (store.id === editingStore.id) {
        return {
          ...store,
          name: editStoreName,
          companyName: editCompanyName,
          vatNumber: editVatNumber,
          street: editStreet,
          city: editCity,
          postalCode: editPostalCode,
          country: editCountry,
          phone: editPhone,
          email: editEmail,
          posLimit: parseInt(editPosLimit),
          kioskLimit: parseInt(editKioskLimit),
          fiscalSystem: editFiscalSystem,
          isFdmRequired: editIsFdmRequired,
          fiscalApiKey: editIsFdmRequired ? editFiscalApiKey : '',
          logoUrl: editLogoUrl,
          vatRates: {
            foodTakeaway: parseFloat(editFoodTakeaway),
            foodDineIn: parseFloat(editFoodDineIn),
            softDrinkTakeaway: parseFloat(editSoftTakeaway),
            softDrinkDineIn: parseFloat(editSoftDineIn),
            alcoholTakeaway: parseFloat(editAlcoholTakeaway),
            alcoholDineIn: parseFloat(editAlcoholDineIn),
          }
        };
      }
      return store;
    }));

    setIsEditModalOpen(false);
    setEditingStore(null);
  };

  const handleToggleStatus = (id: string) => {
    setStorePerformances(storePerformances.map(store => {
      if (store.id === id) {
        const nextStatus = store.status === 'online' ? 'offline' : 'online';
        return { ...store, status: nextStatus };
      }
      return store;
    }));
  };

  const triggerOpenModal = () => {
    setCountry('BE');
    setVatNumber('BE ');
    setIsModalOpen(true);
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-body)',
    }}>
      
      {/* 1. LEFT SIDEBAR NAVIGATION */}
      <div className="glass-card" style={{
        width: '260px',
        borderRadius: '0px',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        borderTop: 'none',
        borderBottom: 'none',
        borderLeft: 'none',
        display: 'flex',
        flexDirection: 'column',
        padding: '32px 24px',
        background: 'rgba(17, 24, 39, 0.95)',
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        zIndex: 100,
      }}>
        {/* Branding header */}
        <div style={{ marginBottom: '40px', paddingLeft: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          {globalLogoUrl ? (
            <img src={globalLogoUrl} alt="Logo" style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} />
          ) : (
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, var(--primary) 0%, #a5b4fc 100%)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontWeight: 'bold',
              fontSize: '1rem',
              color: '#ffffff'
            }}>
              M
            </div>
          )}
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.1 }}>
              <span className="text-gradient">Mino</span>Order
            </h2>
            <span style={{ fontSize: '0.70rem', color: 'var(--text-muted)', letterSpacing: '0.05em', fontWeight: 600, display: 'block', marginTop: '2px' }}>
              PLATEPIXELS ADMIN
            </span>
          </div>
        </div>

        {/* Sidebar Tabs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
          <button
            onClick={() => setActiveTab('dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              width: '100%',
              background: activeTab === 'dashboard' ? 'linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%)' : 'transparent',
              boxShadow: activeTab === 'dashboard' ? '0 4px 14px rgba(99, 102, 241, 0.25)' : 'none',
              border: 'none',
              borderRadius: '12px',
              color: '#ffffff',
              padding: '14px 20px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.95rem',
              textAlign: 'left',
              transition: 'var(--transition-smooth)'
            }}
          >
            <span style={{ fontSize: '1.3rem' }}>📊</span> Dashboard
          </button>
          <button
            onClick={() => setActiveTab('stores')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              width: '100%',
              background: activeTab === 'stores' ? 'linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%)' : 'transparent',
              boxShadow: activeTab === 'stores' ? '0 4px 14px rgba(99, 102, 241, 0.25)' : 'none',
              border: 'none',
              borderRadius: '12px',
              color: '#ffffff',
              padding: '14px 20px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.95rem',
              textAlign: 'left',
              transition: 'var(--transition-smooth)'
            }}
          >
            <span style={{ fontSize: '1.3rem' }}>🏪</span> Manage Stores
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              width: '100%',
              background: activeTab === 'settings' ? 'linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%)' : 'transparent',
              boxShadow: activeTab === 'settings' ? '0 4px 14px rgba(99, 102, 241, 0.25)' : 'none',
              border: 'none',
              borderRadius: '12px',
              color: '#ffffff',
              padding: '14px 20px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.95rem',
              textAlign: 'left',
              transition: 'var(--transition-smooth)'
            }}
          >
            <span style={{ fontSize: '1.3rem' }}>⚙️</span> Settings
          </button>
        </div>

        {/* User Footer Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'var(--primary)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontWeight: 'bold',
            fontSize: '0.875rem'
          }}>PP</div>
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600 }}>Super Admin</h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>License Managed</span>
          </div>
        </div>
      </div>

      {/* 2. MAIN VIEWPORT CONTENT (OFFSET BY SIDEBAR WIDTH) */}
      <div style={{
        marginLeft: '260px',
        width: 'calc(100% - 260px)',
        padding: '40px 48px',
        background: 'var(--bg-primary)',
        minHeight: '100vh',
        boxSizing: 'border-box',
      }}>
        
        {/* TAB 1: CLEAN DASHBOARD WITH PERFORMANCE CHARTS */}
        {activeTab === 'dashboard' && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '4px' }}>System Performance</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Dynamic visual ledger of all licensed restaurant locations & total sales.</p>
            </div>

            {/* Metrics Spark Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '36px' }}>
              <div className="glass-card" style={{ padding: '24px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>TOTAL DAILY REVENUE</span>
                <h2 suppressHydrationWarning style={{ fontSize: '2rem', marginTop: '8px', color: 'var(--accent)' }}>
                  € {formatNumber(storePerformances.reduce((sum, s) => sum + s.dailySales, 0))}
                </h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Realtime checkout sums</span>
              </div>
              <div className="glass-card" style={{ padding: '24px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>MONTHLY SAAS ARRUP</span>
                <h2 suppressHydrationWarning style={{ fontSize: '2rem', marginTop: '8px' }}>
                  € {formatNumber(storePerformances.reduce((sum, s) => sum + s.monthlySales, 0))}
                </h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Aggregate restaurant gross</span>
              </div>
              <div className="glass-card" style={{ padding: '24px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>ACTIVE TERMINALS</span>
                <h2 style={{ fontSize: '2rem', marginTop: '8px' }}>
                  {storePerformances.reduce((sum, s) => sum + s.activeDevices, 0)} Nodes
                </h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600 }}>100% Licensed & Binding checked</span>
              </div>
              <div className="glass-card" style={{ padding: '24px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>FDM SYSTEM STATUS</span>
                <h2 style={{ fontSize: '2rem', marginTop: '8px' }}>99.98%</h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>BE regulatory sync certified</span>
              </div>
            </div>

            {/* GORGEOUS STORE PERFORMANCE BAR CHART */}
            <div className="glass-card" style={{ padding: '32px', marginBottom: '36px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Restaurant Sales Performances</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>Comparing total monthly transactional volume in EUR (€)</p>
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: 'var(--primary)' }} />
                    <span>Monthly Sales (€)</span>
                  </div>
                </div>
              </div>

              {/* Render Beautiful Responsive Custom CSS Bar Graph */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                padding: '16px 0',
              }}>
                {storePerformances.map(store => {
                  const maxScale = 50000;
                  const percentageWidth = Math.min(100, (store.monthlySales / maxScale) * 100);

                  return (
                    <div key={store.id} style={{ display: 'grid', gridTemplateColumns: '1.8fr 7fr 1.2fr', alignItems: 'center', gap: '16px' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                        {store.name}
                      </span>
                      
                      <div style={{
                        height: '24px',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        position: 'relative',
                        border: '1px solid rgba(255,255,255,0.04)'
                      }}>
                        <div style={{
                          width: `${percentageWidth}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, var(--primary) 0%, #a5b4fc 100%)',
                          borderRadius: '5px',
                          transition: 'width 1s ease-in-out',
                          boxShadow: '0px 0px 10px rgba(99, 102, 241, 0.2)'
                        }} />
                      </div>
                      
                      <span suppressHydrationWarning style={{ textAlign: 'right', fontWeight: 700, color: 'var(--accent)', fontSize: '0.875rem' }}>
                        € {formatNumber(store.monthlySales)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STORES MANAGEMENT */}
        {activeTab === 'stores' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div>
                <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '6px', letterSpacing: '-0.02em' }}>Restaurant Stores Console</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Manage store locations, licensing properties, and online synchronization status.</p>
              </div>
              
              <button 
                onClick={triggerOpenModal}
                className="btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '14px 28px',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap'
                }}
              >
                <span>➕</span> Create Store Node
              </button>
            </div>

            {/* Active Locations list table */}
            <div className="glass-card" style={{ padding: '36px' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '24px', fontWeight: 700 }}>Operational Store Locations</h3>
              
              {/* Outer overflow container to completely eliminate squishing on laptops */}
              <div style={{ overflowX: 'auto', width: '100%', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <table style={{ width: '100%', minWidth: '1150px', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ 
                      borderBottom: '2px solid rgba(255,255,255,0.08)', 
                      color: 'var(--text-secondary)', 
                      fontSize: '0.875rem', 
                      fontFamily: 'var(--font-display)', 
                      fontWeight: 700, 
                      letterSpacing: '0.05em' 
                    }}>
                      <th style={{ padding: '16px 14px', width: '22%' }}>STORE NAME</th>
                      <th style={{ padding: '16px 14px', width: '12%' }}>VAT NUMBER</th>
                      <th style={{ padding: '16px 14px', width: '16%' }}>LOCATION</th>
                      <th style={{ padding: '16px 14px', width: '12%' }}>TERMINALS</th>
                      <th style={{ padding: '16px 14px', width: '15%' }}>VAT RULES (F/S/A)</th>
                      <th style={{ padding: '16px 14px', width: '11%' }}>COMPLIANCE</th>
                      <th style={{ padding: '16px 14px', width: '12%' }}>STATUS</th>
                      <th style={{ padding: '16px 14px', width: '20%', textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {storePerformances.map(store => (
                      <tr key={store.id} style={{ 
                        borderBottom: '1px solid rgba(255,255,255,0.05)', 
                        fontSize: '0.9rem', 
                        transition: 'var(--transition-smooth)'
                      }}>
                        <td style={{ padding: '10px 14px', fontWeight: 600 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {store.logoUrl ? (
                              <img src={store.logoUrl} alt={store.name} style={{ width: '34px', height: '34px', borderRadius: '8px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} />
                            ) : (
                              <div style={{
                                width: '34px',
                                height: '34px',
                                borderRadius: '8px',
                                background: 'linear-gradient(135deg, var(--primary) 0%, #a5b4fc 100%)',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                fontWeight: 'bold',
                                fontSize: '0.8125rem',
                                color: '#ffffff',
                                boxShadow: '0 2px 4px rgba(99, 102, 241, 0.15)',
                                flexShrink: 0
                              }}>
                                {store.name.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>{store.name}</span>
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'normal', marginTop: '2px' }}>{store.companyName}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '10px 14px', color: '#a5b4fc', fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 600 }}>{store.vatNumber}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <div>
                            <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#ffffff' }}>{store.city}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '4px' }}>({store.country})</span>
                            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{store.street}</span>
                          </div>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#ffffff' }}>
                              {store.activeDevices} Active
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                              Limits: <span style={{ color: '#a5b4fc', fontWeight: 600 }}>{store.posLimit || 3}P</span> / <span style={{ color: '#a5b4fc', fontWeight: 600 }}>{store.kioskLimit || 2}K</span>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ display: 'flex', gap: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
                            <span style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px', color: '#fca5a5' }} title="Food (Takeaway/Dine-In)">
                              F: {store.vatRates.foodTakeaway}/{store.vatRates.foodDineIn}%
                            </span>
                            <span style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px', color: '#93c5fd' }} title="Soft Drinks (Takeaway/Dine-In)">
                              S: {store.vatRates.softDrinkTakeaway}/{store.vatRates.softDrinkDineIn}%
                            </span>
                            <span style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px', color: '#fde047' }} title="Alcohol (Takeaway/Dine-In)">
                              A: {store.vatRates.alcoholTakeaway}/{store.vatRates.alcoholDineIn}%
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: getFiscalBadge(store.fiscalSystem || (store.isFdmRequired ? 'BE_FDM' : 'STANDARD')).color,
                            fontWeight: 'bold',
                            fontSize: '0.6875rem',
                            background: getFiscalBadge(store.fiscalSystem || (store.isFdmRequired ? 'BE_FDM' : 'STANDARD')).bg,
                            border: `1px solid ${getFiscalBadge(store.fiscalSystem || (store.isFdmRequired ? 'BE_FDM' : 'STANDARD')).border}`,
                            padding: '4px 8px',
                            borderRadius: '6px',
                            textTransform: 'uppercase',
                            fontFamily: 'var(--font-body)',
                            letterSpacing: '0.04em'
                          }}>
                            {getFiscalBadge(store.fiscalSystem || (store.isFdmRequired ? 'BE_FDM' : 'STANDARD')).text}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: store.status === 'online' ? 'var(--accent)' : 'var(--danger)',
                            fontSize: '0.6875rem',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            background: store.status === 'online' ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)',
                            border: store.status === 'online' ? '1px solid rgba(16,185,129,0.12)' : '1px solid rgba(239,68,68,0.12)',
                            padding: '3px 6px',
                            borderRadius: '5px'
                          }}>
                            <span style={{ 
                              width: '5px', 
                              height: '5px', 
                              borderRadius: '50%', 
                              backgroundColor: store.status === 'online' ? 'var(--accent)' : 'var(--danger)',
                              boxShadow: store.status === 'online' ? '0 0 6px var(--accent)' : '0 0 6px var(--danger)'
                            }} />
                            {store.status}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <button
                              type="button"
                              onClick={() => triggerOpenEditModal(store)}
                              style={{
                                background: 'rgba(99, 102, 241, 0.05)',
                                border: '1px solid rgba(99, 102, 241, 0.15)',
                                color: '#a5b4fc',
                                borderRadius: '6px',
                                padding: '5px 10px',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                transition: 'var(--transition-smooth)',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(store.id)}
                              style={{
                                background: store.status === 'online' ? 'rgba(239, 68, 68, 0.05)' : 'rgba(16, 185, 129, 0.05)',
                                border: store.status === 'online' ? '1px solid rgba(239, 68, 68, 0.15)' : '1px solid rgba(16, 185, 129, 0.15)',
                                color: store.status === 'online' ? '#fca5a5' : '#a7f3d0',
                                borderRadius: '6px',
                                padding: '5px 10px',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                transition: 'var(--transition-smooth)',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {store.status === 'online' ? 'Disconnect' : 'Connect'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PLATFORM SETTINGS */}
        {activeTab === 'settings' && (
          <div className="glass-card" style={{ padding: '36px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', fontWeight: 700 }}>PlatePixels Global Configurations</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '28px' }}>
              Set system-wide compliance structures, FDM black-box certifications, and API polling configurations.
            </p>
            
            <form onSubmit={handleApplyGlobalSettings} style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '8px' }}>REGULATORY REGIONAL SYSTEM</label>
                <select 
                  className="form-input" 
                  style={{ background: '#111827' }}
                  value={globalComplianceSystem}
                  onChange={e => setGlobalComplianceSystem(e.target.value)}
                >
                  {EUROZONE_COUNTRIES.map(c => {
                    const sys = getComplianceSystem(c.code);
                    return (
                      <option key={c.code} value={sys.code}>
                        {c.name} - {sys.name} ({sys.code})
                      </option>
                    );
                  })}
                  <option value="STANDARD">Standard - Standard VAT Ledger (STANDARD)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '8px' }}>GLOBAL PLATFORM BRAND LOGO</label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  background: 'rgba(255,255,255,0.01)',
                  border: '1.5px dashed rgba(255,255,255,0.12)',
                  borderRadius: '12px',
                  padding: '16px',
                  position: 'relative',
                  cursor: 'pointer'
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'hidden',
                    flexShrink: 0
                  }}>
                    {globalLogoUrl ? (
                      <img src={globalLogoUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '1.5rem' }}>🖼️</span>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#ffffff' }}>
                      {globalLogoUrl ? 'Change Global Logo' : 'Upload Global Logo'}
                    </span>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      PNG, JPG or SVG up to 2MB. Drag and drop or browse files.
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleGlobalLogoUpload}
                    style={{
                      position: 'absolute',
                      top: 0, left: 0, right: 0, bottom: 0,
                      opacity: 0,
                      cursor: 'pointer',
                      width: '100%',
                      height: '100%'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '8px' }}>LICENSING HEARTBEAT INTERVAL (SECONDS)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={heartbeatInterval} 
                  onChange={e => setHeartbeatInterval(parseInt(e.target.value) || 0)}
                  min="5"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '8px' }}>SECURE DECOGNITION DEVIATION LOGS (WORM)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input 
                    type="checkbox" 
                    checked={wormLogsEnabled} 
                    onChange={e => setWormLogsEnabled(e.target.checked)}
                    style={{ width: '20px', height: '20px' }} 
                  />
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Automatically push transactional audit hashes to redundant AWS S3 buckets.</span>
                </div>
              </div>

              <div style={{ marginTop: '12px' }}>
                <button type="submit" className="btn-primary" style={{ padding: '12px 24px', fontSize: '0.875rem' }}>
                  Apply Global Rules
                </button>
              </div>
            </form>
          </div>
        )}

      </div>

      {/* 3. COMPREHENSIVE OVERLAY MODAL FORM */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(5, 8, 16, 0.85)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '780px',
            padding: '36px',
            background: 'rgba(17, 24, 39, 0.95)',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Create New Store Node</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>Configure legal merchant profiles, device allocations, and custom tax rules.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddStoreSubmit}>
              
              {/* SECTION A: Brand Details */}
              <h3 style={{ fontSize: '0.9375rem', color: 'var(--primary)', marginBottom: '12px', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px' }}>
                MERCHANT BRAND DETAILS
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>STORE BRAND TITLE *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Waffle Central Express"
                    value={storeName}
                    onChange={e => setStoreName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>LEGAL COMPANY NAME *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Waffle Central SRL"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>STORE BRAND LOGO *</label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  background: 'rgba(255,255,255,0.01)',
                  border: '1.5px dashed rgba(255,255,255,0.12)',
                  borderRadius: '12px',
                  padding: '16px',
                  position: 'relative',
                  cursor: 'pointer'
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'hidden',
                    flexShrink: 0
                  }}>
                    {logoUrl ? (
                      <img src={logoUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '1.5rem' }}>🖼️</span>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#ffffff' }}>
                      {logoUrl ? 'Change Store Logo' : 'Upload Store Logo'}
                    </span>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      PNG, JPG or SVG up to 2MB. Drag and drop or browse files.
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    style={{
                      position: 'absolute',
                      top: 0, left: 0, right: 0, bottom: 0,
                      opacity: 0,
                      cursor: 'pointer',
                      width: '100%',
                      height: '100%'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>REGIONAL COUNTRY (EUROZONE) *</label>
                  <select 
                    value={country}
                    onChange={e => handleCountryChange(e.target.value)}
                    className="form-input" 
                    style={{ background: '#111827' }}
                  >
                    {EUROZONE_COUNTRIES.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>FISCAL SYSTEM (AUTO-DETECTED)</label>
                  <div className="form-input" style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    height: '42px'
                  }}>
                    {getComplianceSystem(country).name}
                  </div>
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>VAT IDENTIFICATION NUMBER *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={getVatPlaceholder()}
                    value={vatNumber}
                    onChange={e => setVatNumber(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Compliance Activation & API Fields */}
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.04)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#ffffff' }}>Fiscal Compliance Activation</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Toggle to enable digital audit signing and compliant telemetry transmission.</p>
                  </div>
                  <label style={{
                    position: 'relative',
                    display: 'inline-block',
                    width: '46px',
                    height: '24px',
                    cursor: 'pointer'
                  }}>
                    <input 
                      type="checkbox" 
                      checked={isFdmRequired}
                      onChange={e => setIsFdmRequired(e.target.checked)}
                      style={{ opacity: 0, width: 0, height: 0 }} 
                    />
                    <span style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0, left: 0, right: 0, bottom: 0,
                      backgroundColor: isFdmRequired ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
                      transition: '0.3s',
                      borderRadius: '24px'
                    }}>
                      <span style={{
                        position: 'absolute',
                        content: '""',
                        height: '18px',
                        width: '18px',
                        left: isFdmRequired ? '24px' : '3px',
                        bottom: '3px',
                        backgroundColor: '#ffffff',
                        transition: '0.3s',
                        borderRadius: '50%',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }} />
                    </span>
                  </label>
                </div>

                {isFdmRequired && (
                  <div style={{
                    marginTop: '4px',
                    paddingTop: '12px',
                    borderTop: '1px solid rgba(255,255,255,0.06)'
                  }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#a5b4fc', marginBottom: '6px', fontWeight: 600 }}>
                      FISCAL DEVICE API KEY / ID
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      style={{ fontFamily: 'monospace', borderColor: 'rgba(99, 102, 241, 0.3)' }}
                      placeholder={getComplianceSystem(country).placeholder}
                      value={fiscalApiKey}
                      onChange={e => setFiscalApiKey(e.target.value)}
                      required={isFdmRequired}
                    />
                  </div>
                )}
              </div>

              {/* [NEW] SECTION B: Custom VAT Rules (Dine-in, Takeaway, Food, Drinks, Alcohol) */}
              <h3 style={{ fontSize: '0.9375rem', color: 'var(--primary)', marginBottom: '12px', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px' }}>
                VAT RATES SETUP (ZERO-HARDCODING)
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px', background: 'rgba(255,255,255,0.01)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                {/* 1. Food Group */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#a5b4fc', marginBottom: '8px', fontWeight: 700 }}>🍔 STANDARD FOOD</label>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>Takeaway VAT (%)</span>
                    <input type="number" step="0.01" className="form-input" style={{ padding: '6px 10px', marginTop: '4px' }} value={foodTakeaway} onChange={e => setFoodTakeaway(e.target.value)} required />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>Dine-In VAT (%)</span>
                    <input type="number" step="0.01" className="form-input" style={{ padding: '6px 10px', marginTop: '4px' }} value={foodDineIn} onChange={e => setFoodDineIn(e.target.value)} required />
                  </div>
                </div>

                {/* 2. Soft Drinks Group */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#a5b4fc', marginBottom: '8px', fontWeight: 700 }}>🥤 SOFT DRINKS</label>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>Takeaway VAT (%)</span>
                    <input type="number" step="0.01" className="form-input" style={{ padding: '6px 10px', marginTop: '4px' }} value={softTakeaway} onChange={e => setSoftTakeaway(e.target.value)} required />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>Dine-In VAT (%)</span>
                    <input type="number" step="0.01" className="form-input" style={{ padding: '6px 10px', marginTop: '4px' }} value={softDineIn} onChange={e => setSoftDineIn(e.target.value)} required />
                  </div>
                </div>

                {/* 3. Alcohol Group */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#a5b4fc', marginBottom: '8px', fontWeight: 700 }}>🍺 ALCOHOLIC BEV</label>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>Takeaway VAT (%)</span>
                    <input type="number" step="0.01" className="form-input" style={{ padding: '6px 10px', marginTop: '4px' }} value={alcoholTakeaway} onChange={e => setAlcoholTakeaway(e.target.value)} required />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>Dine-In VAT (%)</span>
                    <input type="number" step="0.01" className="form-input" style={{ padding: '6px 10px', marginTop: '4px' }} value={alcoholDineIn} onChange={e => setAlcoholDineIn(e.target.value)} required />
                  </div>
                </div>
              </div>

              {/* SECTION C: Location & Contacts */}
              <h3 style={{ fontSize: '0.9375rem', color: 'var(--primary)', marginBottom: '12px', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px' }}>
                LOCATION & CONTACT INFO
              </h3>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>STREET ADDRESS *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Boulevard Anspach 12"
                  value={street}
                  onChange={e => setStreet(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>CITY *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Brussels"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>POSTAL CODE *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 1000"
                    value={postalCode}
                    onChange={e => setPostalCode(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>CONTACT PHONE *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. +32 2 555 44 33"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>OPERATIONS EMAIL *</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="e.g. contact@waffles.be"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* SECTION D: Licensing Setup */}
              <h3 style={{ fontSize: '0.9375rem', color: 'var(--primary)', marginBottom: '12px', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px' }}>
                LICENSING LIMITS SETUP
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>POS TERMINAL LIMIT *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={posLimit}
                    onChange={e => setPosLimit(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>KIOSK TERMINAL LIMIT *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={kioskLimit}
                    onChange={e => setKioskLimit(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* SECTION E: Initial Store Admin Credentials */}
              <h3 style={{ fontSize: '0.9375rem', color: 'var(--primary)', marginBottom: '12px', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px' }}>
                INITIAL STORE ADMINISTRATOR ACCOUNT
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>ADMIN FULL NAME *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. John Doe"
                    value={adminName}
                    onChange={e => setAdminName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>ADMIN LOGIN EMAIL *</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="e.g. manager@waffles.be"
                    value={adminEmail}
                    onChange={e => setAdminEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>ADMIN LOGIN PASSWORD *</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input
                    type="text"
                    className="form-input"
                    style={{ fontFamily: 'monospace' }}
                    placeholder="Enter secure password"
                    value={adminPassword}
                    onChange={e => setAdminPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: 'var(--accent)',
                      padding: '0 16px',
                      cursor: 'pointer',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      transition: 'var(--transition-smooth)'
                    }}
                  >
                    🔑 Generate
                  </button>
                </div>
              </div>

              {/* Submit & Cancel Buttons */}
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginTop: '32px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#ffffff',
                    padding: '12px 24px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ padding: '12px 32px', fontSize: '0.875rem' }}>
                  Deploy Store Node
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 4. COMPREHENSIVE OVERLAY MODAL FORM FOR EDITING STORES & VAT RULES */}
      {isEditModalOpen && editingStore && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(5, 8, 16, 0.85)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '780px',
            padding: '36px',
            background: 'rgba(17, 24, 39, 0.95)',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Edit Store & VAT Rules</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>Configure legal merchant profiles, device allocations, and custom tax rules for {editingStore.name}.</p>
              </div>
              <button 
                onClick={() => { setIsEditModalOpen(false); setEditingStore(null); }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditStoreSubmit}>
              
              {/* SECTION A: Brand Details */}
              <h3 style={{ fontSize: '0.9375rem', color: 'var(--primary)', marginBottom: '12px', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px' }}>
                MERCHANT BRAND DETAILS
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>STORE BRAND TITLE</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Waffle Central Express"
                    value={editStoreName}
                    onChange={e => setEditStoreName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>LEGAL COMPANY NAME</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Waffle Central SRL"
                    value={editCompanyName}
                    onChange={e => setEditCompanyName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>STORE BRAND LOGO</label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  background: 'rgba(255,255,255,0.01)',
                  border: '1.5px dashed rgba(255,255,255,0.12)',
                  borderRadius: '12px',
                  padding: '16px',
                  position: 'relative',
                  cursor: 'pointer'
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'hidden',
                    flexShrink: 0
                  }}>
                    {editLogoUrl ? (
                      <img src={editLogoUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '1.5rem' }}>🖼️</span>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#ffffff' }}>
                      {editLogoUrl ? 'Change Store Logo' : 'Upload Store Logo'}
                    </span>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      PNG, JPG or SVG up to 2MB. Drag and drop or browse files.
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEditLogoUpload}
                    style={{
                      position: 'absolute',
                      top: 0, left: 0, right: 0, bottom: 0,
                      opacity: 0,
                      cursor: 'pointer',
                      width: '100%',
                      height: '100%'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>REGIONAL COUNTRY (EUROZONE)</label>
                  <select 
                    value={editCountry}
                    onChange={e => handleEditCountryChange(e.target.value)}
                    className="form-input" 
                    style={{ background: '#111827' }}
                  >
                    {EUROZONE_COUNTRIES.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>FISCAL SYSTEM (AUTO-DETECTED)</label>
                  <div className="form-input" style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    height: '42px'
                  }}>
                    {getComplianceSystem(editCountry).name}
                  </div>
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>VAT IDENTIFICATION NUMBER</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={EUROZONE_COUNTRIES.find(c => c.code === editCountry)?.placeholder || 'BE 0741.982.634'}
                    value={editVatNumber}
                    onChange={e => setEditVatNumber(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Compliance Activation & API Fields */}
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.04)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#ffffff' }}>Fiscal Compliance Activation</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Toggle to enable digital audit signing and compliant telemetry transmission.</p>
                  </div>
                  <label style={{
                    position: 'relative',
                    display: 'inline-block',
                    width: '46px',
                    height: '24px',
                    cursor: 'pointer'
                  }}>
                    <input 
                      type="checkbox" 
                      checked={editIsFdmRequired}
                      onChange={e => setEditIsFdmRequired(e.target.checked)}
                      style={{ opacity: 0, width: 0, height: 0 }} 
                    />
                    <span style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0, left: 0, right: 0, bottom: 0,
                      backgroundColor: editIsFdmRequired ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
                      transition: '0.3s',
                      borderRadius: '24px'
                    }}>
                      <span style={{
                        position: 'absolute',
                        content: '""',
                        height: '18px',
                        width: '18px',
                        left: editIsFdmRequired ? '24px' : '3px',
                        bottom: '3px',
                        backgroundColor: '#ffffff',
                        transition: '0.3s',
                        borderRadius: '50%',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }} />
                    </span>
                  </label>
                </div>

                {editIsFdmRequired && (
                  <div style={{
                    marginTop: '4px',
                    paddingTop: '12px',
                    borderTop: '1px solid rgba(255,255,255,0.06)'
                  }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#a5b4fc', marginBottom: '6px', fontWeight: 600 }}>
                      FISCAL DEVICE API KEY / ID
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      style={{ fontFamily: 'monospace', borderColor: 'rgba(99, 102, 241, 0.3)' }}
                      placeholder={getComplianceSystem(editCountry).placeholder}
                      value={editFiscalApiKey}
                      onChange={e => setEditFiscalApiKey(e.target.value)}
                      required={editIsFdmRequired}
                    />
                  </div>
                )}
              </div>

              {/* SECTION B: Custom VAT Rules (Dine-in, Takeaway, Food, Drinks, Alcohol) */}
              <h3 style={{ fontSize: '0.9375rem', color: 'var(--primary)', marginBottom: '12px', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px' }}>
                VAT RATES SETUP (ZERO-HARDCODING)
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px', background: 'rgba(255,255,255,0.01)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                {/* 1. Food Group */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#a5b4fc', marginBottom: '8px', fontWeight: 700 }}>🍔 STANDARD FOOD</label>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>Takeaway VAT (%)</span>
                    <input type="number" step="0.01" className="form-input" style={{ padding: '6px 10px', marginTop: '4px' }} value={editFoodTakeaway} onChange={e => setEditFoodTakeaway(e.target.value)} required />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>Dine-In VAT (%)</span>
                    <input type="number" step="0.01" className="form-input" style={{ padding: '6px 10px', marginTop: '4px' }} value={editFoodDineIn} onChange={e => setEditFoodDineIn(e.target.value)} required />
                  </div>
                </div>

                {/* 2. Soft Drinks Group */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#a5b4fc', marginBottom: '8px', fontWeight: 700 }}>🥤 SOFT DRINKS</label>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>Takeaway VAT (%)</span>
                    <input type="number" step="0.01" className="form-input" style={{ padding: '6px 10px', marginTop: '4px' }} value={editSoftTakeaway} onChange={e => setEditSoftTakeaway(e.target.value)} required />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>Dine-In VAT (%)</span>
                    <input type="number" step="0.01" className="form-input" style={{ padding: '6px 10px', marginTop: '4px' }} value={editSoftDineIn} onChange={e => setEditSoftDineIn(e.target.value)} required />
                  </div>
                </div>

                {/* 3. Alcohol Group */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#a5b4fc', marginBottom: '8px', fontWeight: 700 }}>🍺 ALCOHOLIC BEV</label>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>Takeaway VAT (%)</span>
                    <input type="number" step="0.01" className="form-input" style={{ padding: '6px 10px', marginTop: '4px' }} value={editAlcoholTakeaway} onChange={e => setEditAlcoholTakeaway(e.target.value)} required />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>Dine-In VAT (%)</span>
                    <input type="number" step="0.01" className="form-input" style={{ padding: '6px 10px', marginTop: '4px' }} value={editAlcoholDineIn} onChange={e => setEditAlcoholDineIn(e.target.value)} required />
                  </div>
                </div>
              </div>

              {/* SECTION C: Location & Contacts */}
              <h3 style={{ fontSize: '0.9375rem', color: 'var(--primary)', marginBottom: '12px', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px' }}>
                LOCATION & CONTACT INFO
              </h3>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>STREET ADDRESS</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Boulevard Anspach 12"
                  value={editStreet}
                  onChange={e => setEditStreet(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>CITY</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Brussels"
                    value={editCity}
                    onChange={e => setEditCity(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>POSTAL CODE</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 1000"
                    value={editPostalCode}
                    onChange={e => setEditPostalCode(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>CONTACT PHONE</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. +32 2 555 44 33"
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>OPERATIONS EMAIL</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="e.g. contact@waffles.be"
                    value={editEmail}
                    onChange={e => setEditEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* SECTION D: Licensing Setup */}
              <h3 style={{ fontSize: '0.9375rem', color: 'var(--primary)', marginBottom: '12px', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px' }}>
                LICENSING LIMITS SETUP
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>POS TERMINAL LIMIT</label>
                  <input
                    type="number"
                    className="form-input"
                    value={editPosLimit}
                    onChange={e => setEditPosLimit(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>KIOSK TERMINAL LIMIT</label>
                  <input
                    type="number"
                    className="form-input"
                    value={editKioskLimit}
                    onChange={e => setEditKioskLimit(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Submit & Cancel Buttons */}
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginTop: '32px' }}>
                <button
                  type="button"
                  onClick={() => { setIsEditModalOpen(false); setEditingStore(null); }}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#ffffff',
                    padding: '12px 24px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ padding: '12px 32px', fontSize: '0.875rem' }}>
                  Save Changes
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
