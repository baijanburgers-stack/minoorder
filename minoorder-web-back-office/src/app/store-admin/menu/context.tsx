'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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
  setItems: (action: React.SetStateAction<MenuItem[]>) => void;
  categories: any[];
  setCategories: (action: React.SetStateAction<any[]>) => void;
  modifierGroups: any[];
  setModifierGroups: (action: React.SetStateAction<any[]>) => void;
  deals: any[];
  setDeals: (action: React.SetStateAction<any[]>) => void;
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

const isUuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<'en' | 'fr' | 'nl'>('en');
  const [items, setItemsState] = useState<MenuItem[]>([]);
  const [categories, setCategoriesState] = useState<any[]>([]);
  const [modifierGroups, setModifierGroupsState] = useState<any[]>([]);
  const [deals, setDealsState] = useState<any[]>([]);
  const [storeVatRates, setStoreVatRates] = useState<any>({
    foodTakeaway: 6.00,
    foodDineIn: 12.00,
    softDrinkTakeaway: 6.00,
    softDrinkDineIn: 12.00,
    alcoholTakeaway: 21.00,
    alcoholDineIn: 21.00
  });

  const [printers, setPrinters] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  // Load active store data from Supabase
  const loadStoreData = async () => {
    try {
      let storeId = localStorage.getItem('mino_active_store_id');
      
      if (!storeId || storeId === 'undefined') {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: userStore } = await supabase
            .from('store_users')
            .select('store_id, stores(name)')
            .eq('user_id', user.id)
            .limit(1)
            .maybeSingle();
            
          if (userStore) {
            storeId = userStore.store_id;
            localStorage.setItem('mino_active_store_id', storeId!);
            localStorage.setItem('mino_active_store_name', (userStore.stores as any)?.name || 'Live Store');
          }
        }
      }

      if (!storeId || storeId === 'undefined') return;

      // 1. Fetch Categories
      const { data: catData } = await supabase
        .from('categories')
        .select('*')
        .eq('store_id', storeId)
        .order('sort_order', { ascending: true });

      const formattedCats = (catData || []).map(c => ({
        id: c.id,
        name: c.name?.en || c.name?.nl || c.name?.fr || '',
        nameEn: c.name?.en || '',
        nameFr: c.name?.fr || '',
        nameNl: c.name?.nl || '',
        sortOrder: c.sort_order,
        visiblePos: c.is_visible_pos,
        visibleKiosk: c.is_visible_kiosk
      }));
      setCategoriesState(formattedCats);

      // 2. Fetch Items
      const { data: itemData } = await supabase
        .from('items')
        .select(`
          *,
          vat_rules (
            category
          )
        `)
        .eq('store_id', storeId)
        .order('sort_order', { ascending: true });

      const formattedItems = (itemData || []).map(i => ({
        id: i.id,
        name: i.name?.en || i.name?.nl || i.name?.fr || '',
        nameEn: i.name?.en || '',
        nameFr: i.name?.fr || '',
        nameNl: i.name?.nl || '',
        grossPrice: parseFloat(i.gross_price),
        vatCategory: (i.vat_rules as any)?.category || 'food',
        categoryId: i.category_id,
        imageUrl: i.image_url || '',
        modifierIds: []
      }));
      setItemsState(formattedItems);

      // 3. Fetch Modifiers
      const { data: modData } = await supabase
        .from('modifier_groups')
        .select(`
          *,
          modifier_options (*)
        `)
        .eq('store_id', storeId);

      const formattedMods = (modData || []).map(mg => ({
        id: mg.id,
        name: mg.name?.en || mg.name?.nl || mg.name?.fr || '',
        nameEn: mg.name?.en || '',
        nameFr: mg.name?.fr || '',
        nameNl: mg.name?.nl || '',
        minSelection: mg.min_selection,
        maxSelection: mg.max_selection,
        isRequired: mg.is_required,
        options: (mg.modifier_options || []).map((o: any) => ({
          id: o.id,
          name: o.name?.en || o.name?.nl || o.name?.fr || '',
          nameEn: o.name?.en || '',
          nameFr: o.name?.fr || '',
          nameNl: o.name?.nl || '',
          upcharge: parseFloat(o.gross_price)
        }))
      }));
      setModifierGroupsState(formattedMods);

      // 4. Fetch VAT rules of store country
      const { data: storeInfo } = await supabase
        .from('stores')
        .select('country')
        .eq('id', storeId)
        .limit(1)
        .maybeSingle();

      if (storeInfo) {
        const { data: rules } = await supabase
          .from('vat_rules')
          .select('*')
          .eq('country', storeInfo.country);

        const vatRates = {
          foodTakeaway: 6,
          foodDineIn: 12,
          softDrinkTakeaway: 6,
          softDrinkDineIn: 12,
          alcoholTakeaway: 21,
          alcoholDineIn: 21
        };

        rules?.forEach((r: any) => {
          if (r.category === 'food') {
            vatRates.foodTakeaway = parseFloat(r.takeaway_rate);
            vatRates.foodDineIn = parseFloat(r.dine_in_rate);
          } else if (r.category === 'soft_drink') {
            vatRates.softDrinkTakeaway = parseFloat(r.takeaway_rate);
            vatRates.softDrinkDineIn = parseFloat(r.dine_in_rate);
          } else if (r.category === 'alcohol') {
            vatRates.alcoholTakeaway = parseFloat(r.takeaway_rate);
            vatRates.alcoholDineIn = parseFloat(r.dine_in_rate);
          }
        });
        setStoreVatRates(vatRates);
      }

      // 5. Fetch Printers
      const { data: printersData } = await supabase
        .from('printer_configs')
        .select('*')
        .eq('store_id', storeId);

      setPrinters((printersData || []).map(p => ({
        id: p.id,
        name: p.name,
        connectionType: p.connection_type,
        address: p.address,
        role: p.role
      })));

      // 6. Fetch Shifts
      const { data: shiftsData } = await supabase
        .from('shifts')
        .select(`
          *,
          profiles (first_name, last_name),
          devices (name, type)
        `)
        .eq('store_id', storeId)
        .order('opened_at', { ascending: false });

      setShifts((shiftsData || []).map(s => ({
        id: s.id,
        cashier: s.profiles ? `${s.profiles.first_name} ${s.profiles.last_name}` : 'Operator',
        terminalName: s.devices?.name || 'POS',
        terminalType: s.devices?.type || 'pos',
        opened: s.opened_at,
        closed: s.closed_at || null,
        openingCash: parseFloat(s.opening_cash),
        closingCash: s.closing_cash ? parseFloat(s.closing_cash) : null,
        status: s.closed_at ? 'Closed' : 'Active',
        totalOrders: 0,
        grossRevenue: 0,
        totalVat: 0,
        cardTotal: 0,
        cashTotal: 0
      })));

      // 7. Fetch Orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select(`
          *,
          payments (*)
        `)
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      setOrders((ordersData || []).map(o => ({
        id: o.id,
        orderNumber: o.order_number,
        time: o.created_at,
        gross: parseFloat(o.total_gross),
        net: parseFloat(o.total_net),
        vat: parseFloat(o.total_vat),
        method: o.payments?.[0]?.method || 'Card',
        receiptNumber: `BE-STORE-${o.order_number}`,
        fdmHash: 'SIG_FDM_ACTIVE'
      })));
    } catch (err) {
      console.error('Failed to load store operations context:', err);
    }
  };

  useEffect(() => {
    loadStoreData();
  }, []);

  // Expose transparent CRUD synchronization state setters
  const setItems = async (action: React.SetStateAction<MenuItem[]>) => {
    const nextItems = typeof action === 'function' ? action(items) : action;
    const resolvedItems = nextItems.map(item => ({
      ...item,
      id: isUuid(item.id) ? item.id : crypto.randomUUID()
    }));

    setItemsState(resolvedItems);

    const storeId = localStorage.getItem('mino_active_store_id');
    if (!storeId) return;

    try {
      // Find deleted items
      const deletedIds = items.filter(item => !resolvedItems.some(ri => ri.id === item.id)).map(item => item.id);
      if (deletedIds.length > 0) {
        await supabase.from('items').delete().in('id', deletedIds);
      }

      // Find added or modified items
      const changedItems = resolvedItems.filter(ri => {
        const prev = items.find(item => item.id === ri.id);
        return !prev || JSON.stringify(prev) !== JSON.stringify(ri);
      });

      for (const item of changedItems) {
        const { data: rules } = await supabase
          .from('vat_rules')
          .select('id')
          .eq('category', item.vatCategory)
          .limit(1);

        const ruleId = rules?.[0]?.id;
        if (!ruleId) continue;

        await supabase.from('items').upsert({
          id: item.id,
          store_id: storeId,
          category_id: item.categoryId || '00000000-0000-0000-0000-000000000000',
          name: { en: item.nameEn || item.name, fr: item.nameFr || item.name, nl: item.nameNl || item.name },
          gross_price: item.grossPrice,
          vat_rule_id: ruleId,
          is_available: true,
          is_draft: false
        });
      }
    } catch (err) {
      console.error('Failed to sync items change to Supabase:', err);
    }
  };

  const setCategories = async (action: React.SetStateAction<any[]>) => {
    const nextCats = typeof action === 'function' ? action(categories) : action;
    const resolvedCats = nextCats.map(c => ({
      ...c,
      id: isUuid(c.id) ? c.id : crypto.randomUUID()
    }));

    setCategoriesState(resolvedCats);

    const storeId = localStorage.getItem('mino_active_store_id');
    if (!storeId) return;

    try {
      const deletedIds = categories.filter(c => !resolvedCats.some(rc => rc.id === c.id)).map(c => c.id);
      if (deletedIds.length > 0) {
        await supabase.from('categories').delete().in('id', deletedIds);
      }

      const changedCats = resolvedCats.filter(rc => {
        const prev = categories.find(c => c.id === rc.id);
        return !prev || JSON.stringify(prev) !== JSON.stringify(rc);
      });

      for (const cat of changedCats) {
        await supabase.from('categories').upsert({
          id: cat.id,
          store_id: storeId,
          name: { en: cat.nameEn || cat.name, fr: cat.nameFr || cat.name, nl: cat.nameNl || cat.name },
          sort_order: cat.sortOrder || 0,
          is_visible_pos: cat.visiblePos !== false,
          is_visible_kiosk: cat.visibleKiosk !== false
        });
      }
    } catch (err) {
      console.error('Failed to sync categories changes to Supabase:', err);
    }
  };

  const setModifierGroups = async (action: React.SetStateAction<any[]>) => {
    const nextGroups = typeof action === 'function' ? action(modifierGroups) : action;
    const resolvedGroups = nextGroups.map(g => ({
      ...g,
      id: isUuid(g.id) ? g.id : crypto.randomUUID(),
      options: (g.options || []).map((o: any) => ({
        ...o,
        id: isUuid(o.id) ? o.id : crypto.randomUUID()
      }))
    }));

    setModifierGroupsState(resolvedGroups);

    const storeId = localStorage.getItem('mino_active_store_id');
    if (!storeId) return;

    try {
      const deletedIds = modifierGroups.filter(g => !resolvedGroups.some(rg => rg.id === g.id)).map(g => g.id);
      if (deletedIds.length > 0) {
        await supabase.from('modifier_groups').delete().in('id', deletedIds);
      }

      const changedGroups = resolvedGroups.filter(rg => {
        const prev = modifierGroups.find(g => g.id === rg.id);
        return !prev || JSON.stringify(prev) !== JSON.stringify(rg);
      });

      for (const group of changedGroups) {
        await supabase.from('modifier_groups').upsert({
          id: group.id,
          store_id: storeId,
          name: { en: group.nameEn || group.name, fr: group.nameFr || group.name, nl: group.nameNl || group.name },
          min_selection: group.minSelection || 0,
          max_selection: group.maxSelection || 1,
          is_required: group.isRequired === true
        });

        const prevGroup = modifierGroups.find(g => g.id === group.id);
        const prevOptions = prevGroup?.options || [];

        const deletedOptIds = prevOptions.filter((o: any) => !group.options.some((ro: any) => ro.id === o.id)).map((o: any) => o.id);
        if (deletedOptIds.length > 0) {
          await supabase.from('modifier_options').delete().in('id', deletedOptIds);
        }

        const changedOpts = group.options.filter((ro: any) => {
          const prev = prevOptions.find((o: any) => o.id === ro.id);
          return !prev || JSON.stringify(prev) !== JSON.stringify(ro);
        });

        const { data: foodVatRules } = await supabase
          .from('vat_rules')
          .select('id')
          .eq('category', 'food')
          .limit(1);

        const foodVatRuleId = foodVatRules?.[0]?.id;

        for (const opt of changedOpts) {
          if (!foodVatRuleId) continue;
          await supabase.from('modifier_options').upsert({
            id: opt.id,
            modifier_group_id: group.id,
            name: { en: opt.nameEn || opt.name, fr: opt.nameFr || opt.name, nl: opt.nameNl || opt.name },
            gross_price: opt.upcharge || 0.00,
            vat_rule_id: foodVatRuleId
          });
        }
      }
    } catch (err) {
      console.error('Failed to sync modifier groups changes to Supabase:', err);
    }
  };

  const setDeals = async (action: React.SetStateAction<any[]>) => {
    const nextDeals = typeof action === 'function' ? action(deals) : action;
    const resolvedDeals = nextDeals.map(d => ({
      ...d,
      id: isUuid(d.id) ? d.id : crypto.randomUUID()
    }));

    setDealsState(resolvedDeals);

    const storeId = localStorage.getItem('mino_active_store_id');
    if (!storeId) return;

    try {
      const deletedIds = deals.filter(d => !resolvedDeals.some(rd => rd.id === d.id)).map(d => d.id);
      if (deletedIds.length > 0) {
        await supabase.from('combos').delete().in('id', deletedIds);
      }

      const changedDeals = resolvedDeals.filter(rd => {
        const prev = deals.find(d => d.id === rd.id);
        return !prev || JSON.stringify(prev) !== JSON.stringify(rd);
      });

      for (const deal of changedDeals) {
        await supabase.from('combos').upsert({
          id: deal.id,
          store_id: storeId,
          name: { en: deal.nameEn || deal.name, fr: deal.nameFr || deal.name, nl: deal.nameNl || deal.name },
          fixed_price: deal.fixedPrice,
          is_available: deal.isAvailable !== false
        });
      }
    } catch (err) {
      console.error('Failed to sync combo deals changes to Supabase:', err);
    }
  };

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
