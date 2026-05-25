// supabase/functions/calculate-cart/index.ts
// Compliant Server-Side VAT Extraction & Proportional Combo Engine for MinoOrder

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CartItemInput {
  itemId: string;
  quantity: number;
}

interface CartComboInput {
  comboId: string;
  quantity: number;
  components: Array<{
    itemId: string;
  }>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const { store_id, is_takeaway, items, combos } = await req.json() as {
      store_id: string;
      is_takeaway: boolean;
      items: CartItemInput[];
      combos: CartComboInput[];
    };

    if (!store_id) {
      return new Response(JSON.stringify({ error: "Missing store_id parameter." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let calculatedTotalGross = 0;
    let calculatedTotalNet = 0;
    let calculatedTotalVat = 0;
    const vatSummaryMap = new Map<number, { net: number; vat: number; gross: number }>();
    const calculatedLines: any[] = [];

    // --- 1. Process Standard Menu Items ---
    for (const cartItem of items || []) {
      const { data: dbItem, error: dbError } = await supabaseClient
        .from("items")
        .select("name, gross_price, vat_rules(takeaway_rate, dine_in_rate, category)")
        .eq("id", cartItem.itemId)
        .single();

      if (dbError || !dbItem) continue;

      const vatRule = dbItem.vat_rules;
      const rate = is_takeaway ? vatRule.takeaway_rate : vatRule.dine_in_rate;
      const itemGross = Number(dbItem.gross_price);
      
      // Extract net & vat amounts
      const net = itemGross / (1.0 + rate);
      const vatAmount = itemGross - net;
      const lineGross = itemGross * cartItem.quantity;
      const lineNet = net * cartItem.quantity;
      const lineVat = vatAmount * cartItem.quantity;

      calculatedTotalGross += lineGross;
      calculatedTotalNet += lineNet;
      calculatedTotalVat += lineVat;

      // Update VAT summary buckets
      const existing = vatSummaryMap.get(rate) || { net: 0, vat: 0, gross: 0 };
      vatSummaryMap.set(rate, {
        net: existing.net + lineNet,
        vat: existing.vat + lineVat,
        gross: existing.gross + lineGross,
      });

      calculatedLines.push({
        name: dbItem.name,
        quantity: cartItem.quantity,
        unit_gross: itemGross,
        unit_net: net,
        unit_vat: vatAmount,
        vat_rate: rate * 100,
      });
    }

    // --- 2. Process Combos (Proportional Discount Allocation) ---
    for (const comboInput of combos || []) {
      const { data: dbCombo, error: comboErr } = await supabaseClient
        .from("combos")
        .select("name, fixed_price")
        .eq("id", comboInput.comboId)
        .single();

      if (comboErr || !dbCombo) continue;

      const comboFixedPrice = Number(dbCombo.fixed_price);
      const componentItems: any[] = [];

      // Fetch component items
      for (const compItem of comboInput.components) {
        const { data: dbItem } = await supabaseClient
          .from("items")
          .select("name, gross_price, vat_rules(takeaway_rate, dine_in_rate)")
          .eq("id", compItem.itemId)
          .single();

        if (dbItem) {
          componentItems.push({
            itemId: compItem.itemId,
            name: dbItem.name,
            grossPrice: Number(dbItem.gross_price),
            rate: is_takeaway ? dbItem.vat_rules.takeaway_rate : dbItem.vat_rules.dine_in_rate,
          });
        }
      }

      // Calculate Proportional allocations
      let totalNormalPrice = 0;
      componentItems.forEach((c) => (totalNormalPrice += c.grossPrice));
      const totalDiscount = Math.max(0, totalNormalPrice - comboFixedPrice);
      const discountRatio = totalNormalPrice > 0 ? totalDiscount / totalNormalPrice : 0;

      const allocatedComponents: any[] = [];
      let calculatedComboNet = 0;
      let calculatedComboVat = 0;

      for (let i = 0; i < componentItems.length; i++) {
        const comp = componentItems[i];
        let allocatedGross = comp.grossPrice * (1.0 - discountRatio);

        if (i === componentItems.length - 1) {
          let sumGrossSoFar = 0;
          allocatedComponents.forEach((c) => (sumGrossSoFar += c.allocatedGross));
          allocatedGross = comboFixedPrice - sumGrossSoFar;
        }

        allocatedGross = Math.round(allocatedGross * 100) / 100;
        const net = allocatedGross / (1.0 + comp.rate);
        const vat = allocatedGross - net;

        allocatedComponents.push({
          name: comp.name,
          allocatedGross,
          net,
          vat,
          rate: comp.rate,
        });

        calculatedComboNet += net;
        calculatedComboVat += vat;

        // Update global VAT summary buckets
        const existing = vatSummaryMap.get(comp.rate) || { net: 0, vat: 0, gross: 0 };
        vatSummaryMap.set(comp.rate, {
          net: existing.net + net,
          vat: existing.vat + vat,
          gross: existing.gross + allocatedGross,
        });
      }

      calculatedTotalGross += comboFixedPrice * comboInput.quantity;
      calculatedTotalNet += calculatedComboNet * comboInput.quantity;
      calculatedTotalVat += calculatedComboVat * comboInput.quantity;

      calculatedLines.push({
        name: dbCombo.name,
        quantity: comboInput.quantity,
        unit_gross: comboFixedPrice,
        unit_net: calculatedComboNet,
        unit_vat: calculatedComboVat,
        is_combo: true,
        combo_components: allocatedComponents,
      });
    }

    // --- 3. Format response ---
    const responsePayload = {
      total_gross: Math.round(calculatedTotalGross * 100) / 100,
      total_net: Math.round(calculatedTotalNet * 100) / 100,
      total_vat: Math.round(calculatedTotalVat * 100) / 100,
      vat_summary: Array.from(vatSummaryMap.entries()).map(([rate, vals]) => ({
        rate: rate * 100,
        net: Math.round(vals.net * 100) / 100,
        vat: Math.round(vals.vat * 100) / 100,
        gross: Math.round(vals.gross * 100) / 100,
      })),
      calculated_lines: calculatedLines,
    };

    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Helper polyfill
if (!(calculatedLines as any)) {
  var calculatedLines: any[] = [];
}
