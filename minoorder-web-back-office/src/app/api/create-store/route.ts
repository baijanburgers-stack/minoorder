import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
    }

    // Verify token with Supabase Auth
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Invalid authentication session' }, { status: 401 });
    }

    // Verify user is a Super Admin
    const { data: storeUser, error: roleError } = await supabaseAdmin
      .from('store_users')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'super_admin')
      .limit(1)
      .maybeSingle();

    if (roleError || !storeUser) {
      return NextResponse.json({ error: 'Forbidden: Requires Super Admin authorization' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const {
      storeName,
      companyName,
      vatNumber,
      street,
      city,
      postalCode,
      country,
      phone,
      email,
      posLimit,
      kioskLimit,
      fiscalSystem,
      isFdmRequired,
      fiscalApiKey,
      logoUrl,
      adminEmail,
      adminPassword,
      vatRates
    } = body;

    // Validate inputs
    if (!storeName || !companyName || !vatNumber || !street || !city || !postalCode || !country || !adminEmail || !adminPassword || !vatRates) {
      return NextResponse.json({ error: 'Bad Request: Missing required store registration fields' }, { status: 400 });
    }

    // 1. Upsert VAT rules for the country
    const categoriesList = ['food', 'soft_drink', 'alcohol', 'service'] as const;
    const ratesMapping = {
      food: { takeaway: parseFloat(vatRates.foodTakeaway || 6), dineIn: parseFloat(vatRates.foodDineIn || 12) },
      soft_drink: { takeaway: parseFloat(vatRates.softDrinkTakeaway || 6), dineIn: parseFloat(vatRates.softDrinkDineIn || 12) },
      alcohol: { takeaway: parseFloat(vatRates.alcoholTakeaway || 21), dineIn: parseFloat(vatRates.alcoholDineIn || 21) },
      service: { takeaway: 0.00, dineIn: 0.00 }
    };

    const vatRulesMap: { [key: string]: string } = {};

    for (const cat of categoriesList) {
      const rate = ratesMapping[cat];
      const { data: rule, error: ruleError } = await supabaseAdmin
        .from('vat_rules')
        .upsert({
          country,
          category: cat,
          takeaway_rate: rate.takeaway,
          dine_in_rate: rate.dineIn,
          description: `${country} standard ${cat} VAT rates`
        }, { onConflict: 'country,category' })
        .select()
        .single();

      if (ruleError || !rule) {
        return NextResponse.json({ error: `Failed to configure VAT rule for ${cat}: ${ruleError?.message}` }, { status: 500 });
      }
      vatRulesMap[cat] = rule.id;
    }

    // 2. Create Tenant
    const { data: tenant, error: tenantError } = await supabaseAdmin
      .from('tenants')
      .insert({
        name: companyName,
        billing_email: email || adminEmail
      })
      .select()
      .single();

    if (tenantError || !tenant) {
      return NextResponse.json({ error: `Failed to provision tenant structure: ${tenantError?.message}` }, { status: 500 });
    }

    // 3. Create Store
    const { data: store, error: storeError } = await supabaseAdmin
      .from('stores')
      .insert({
        tenant_id: tenant.id,
        name: storeName,
        company_name: companyName,
        vat_number: vatNumber,
        street,
        city,
        postal_code: postalCode,
        country,
        phone,
        email: email || adminEmail,
        theme_settings: { logoUrl }
      })
      .select()
      .single();

    if (storeError || !store) {
      return NextResponse.json({ error: `Failed to provision store configuration: ${storeError?.message}` }, { status: 500 });
    }

    // 4. Provision hardware devices mapping
    const devicesToInsert = [];
    for (let i = 1; i <= parseInt(posLimit || 3); i++) {
      devicesToInsert.push({
        tenant_id: tenant.id,
        store_id: store.id,
        name: `POS-${String(i).padStart(2, '0')}`,
        hardware_uuid: `${store.id}-pos-${i}`,
        type: 'pos',
        is_authorized: true
      });
    }
    for (let i = 1; i <= parseInt(kioskLimit || 2); i++) {
      devicesToInsert.push({
        tenant_id: tenant.id,
        store_id: store.id,
        name: `Kiosk-${String(i).padStart(2, '0')}`,
        hardware_uuid: `${store.id}-kiosk-${i}`,
        type: 'kiosk',
        is_authorized: true
      });
    }

    const { error: devicesError } = await supabaseAdmin
      .from('devices')
      .insert(devicesToInsert);

    if (devicesError) {
      return NextResponse.json({ error: `Failed to provision baseline device nodes: ${devicesError.message}` }, { status: 500 });
    }

    // 5. Register Admin User in Supabase Auth
    const { data: authUser, error: authUserError } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true
    });

    if (authUserError || !authUser?.user) {
      return NextResponse.json({ error: `Failed to register administrator auth credentials: ${authUserError?.message}` }, { status: 500 });
    }

    // 6. Create Profile for Admin
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authUser.user.id,
        first_name: storeName.split(' ')[0] || 'Store',
        last_name: 'Operator',
        phone: phone || ''
      });

    if (profileError) {
      return NextResponse.json({ error: `Failed to map user profile ledger: ${profileError.message}` }, { status: 500 });
    }

    // 7. Associate Administrator to Store with store_admin role
    const { error: storeUserMapError } = await supabaseAdmin
      .from('store_users')
      .insert({
        tenant_id: tenant.id,
        store_id: store.id,
        user_id: authUser.user.id,
        role: 'store_admin'
      });

    if (storeUserMapError) {
      return NextResponse.json({ error: `Failed to map operator role credentials: ${storeUserMapError.message}` }, { status: 500 });
    }

    // 8. Seed default seed categories and items into stores table so new stores are operational instantly
    const seedCategories = [
      { store_id: store.id, name: { en: 'Burgers 🍔', nl: 'Burgers 🍔', fr: 'Burgers 🍔' }, sort_order: 1 },
      { store_id: store.id, name: { en: 'Sides 🍟', nl: 'Bijgerechten 🍟', fr: 'Accompagnements 🍟' }, sort_order: 2 },
      { store_id: store.id, name: { en: 'Drinks 🥤', nl: 'Dranken 🥤', fr: 'Boissons 🥤' }, sort_order: 3 }
    ];

    const { data: insertedCats, error: seedCatsError } = await supabaseAdmin
      .from('categories')
      .insert(seedCategories)
      .select();

    if (seedCatsError || !insertedCats) {
      return NextResponse.json({ error: `Failed to seed baseline menu categories: ${seedCatsError?.message}` }, { status: 500 });
    }

    const catMap: { [key: string]: string } = {};
    insertedCats.forEach(c => {
      const enName = (c.name as any).en || '';
      if (enName.includes('Burgers')) catMap['Burgers'] = c.id;
      else if (enName.includes('Sides')) catMap['Sides'] = c.id;
      else if (enName.includes('Drinks')) catMap['Drinks'] = c.id;
    });

    const seedItems = [
      { store_id: store.id, category_id: catMap['Burgers'], name: { en: 'Classic Beef Burger', nl: 'Klassieke Rundvlees Burger', fr: 'Burger au Bœuf Classique' }, gross_price: 10.00, vat_rule_id: vatRulesMap['food'], is_draft: false, sort_order: 1 },
      { store_id: store.id, category_id: catMap['Burgers'], name: { en: 'Gourmet Double Cheese', nl: 'Gourmet Dubbele Kaas', fr: 'Double Cheese Gourmet' }, gross_price: 13.50, vat_rule_id: vatRulesMap['food'], is_draft: false, sort_order: 2 },
      { store_id: store.id, category_id: catMap['Sides'], name: { en: 'Frites Classic Belgian', nl: 'Klassieke Belgische Frieten', fr: 'Frites Belges Classiques' }, gross_price: 3.00, vat_rule_id: vatRulesMap['food'], is_draft: false, sort_order: 1 },
      { store_id: store.id, category_id: catMap['Sides'], name: { en: 'Sweet Potato Fries', nl: 'Zoete Aardappel Friet', fr: 'Frites de Patates Douces' }, gross_price: 4.00, vat_rule_id: vatRulesMap['food'], is_draft: false, sort_order: 2 },
      { store_id: store.id, category_id: catMap['Drinks'], name: { en: 'Coca-Cola Zero 33cl', nl: 'Coca-Cola Zero 33cl', fr: 'Coca-Cola Zéro 33cl' }, gross_price: 2.50, vat_rule_id: vatRulesMap['soft_drink'], is_draft: false, sort_order: 1 },
      { store_id: store.id, category_id: catMap['Drinks'], name: { en: 'Duvel Blonde Ale 33cl', nl: 'Duvel Blond Bier 33cl', fr: 'Bière Blonde Duvel 33cl' }, gross_price: 4.80, vat_rule_id: vatRulesMap['alcohol'], is_draft: false, sort_order: 2 }
    ];

    const { error: seedItemsError } = await supabaseAdmin
      .from('items')
      .insert(seedItems);

    if (seedItemsError) {
      return NextResponse.json({ error: `Failed to seed baseline menu items: ${seedItemsError.message}` }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      storeId: store.id,
      tenantId: tenant.id,
      adminUserId: authUser.user.id
    });
  } catch (err: any) {
    return NextResponse.json({ error: `Server error: ${err?.message || 'Unknown execution failure'}` }, { status: 500 });
  }
}
