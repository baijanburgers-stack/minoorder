// supabase/functions/create-order/index.ts
// Compliant Idempotent Order Creation & Audit Trail registration for MinoOrder

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "" // Safe server-side admin client bypasses RLS
    );

    const payload = await req.json();
    const { order_id, store_id, device_id, shift_id, is_takeaway, payment_method, cart_calculations } = payload;

    if (!order_id || !store_id || !device_id || !cart_calculations) {
      return new Response(JSON.stringify({ error: "Missing required transaction fields." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Idempotency Check: Verify if order has already been registered in the database
    const { data: existingOrder } = await supabaseClient
      .from("orders")
      .select("id, order_number, status")
      .eq("id", order_id)
      .maybeSingle();

    if (existingOrder) {
      // Order already processed in a previous retry. Skip double insert and return success!
      return new Response(JSON.stringify({ 
        message: "Idempotent duplicate checked. Order already created.",
        order_id: existingOrder.id,
        order_number: existingOrder.order_number,
        status: existingOrder.status
      }), {
        status: 200, // Safe success
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Generate daily sequential order number (e.g. K-01, POS-104)
    const orderPrefix = is_takeaway ? "T" : "D";
    const orderSeq = Math.floor(Math.random() * 100) + 1; // Simulated daily sequence
    const orderNumber = `${orderPrefix}-${orderSeq.toString().padLeft(2, "0")}`;

    // 3. Write Order transaction record
    const { data: newOrder, error: orderErr } = await supabaseClient
      .from("orders")
      .insert({
        id: order_id,
        store_id,
        device_id,
        shift_id,
        order_number: orderNumber,
        is_takeaway,
        status: "pending",
        total_gross: cart_calculations.total_gross,
        total_net: cart_calculations.total_net,
        total_vat: cart_calculations.total_vat
      })
      .select()
      .single();

    if (orderErr) throw new Error(`DB Order writing failed: ${orderErr.message}`);

    // 4. Populate Order Lines
    for (const line of cart_calculations.calculated_lines) {
      await supabaseClient.from("order_lines").insert({
        order_id: newOrder.id,
        name: line.name,
        quantity: line.quantity,
        unit_gross: line.unit_gross,
        unit_net: line.unit_net,
        unit_vat: line.unit_vat,
        vat_rate: line.vat_rate,
      });
    }

    // 5. Initial Payment entry in pending state
    if (payment_method) {
      await supabaseClient.from("payments").insert({
        order_id: newOrder.id,
        method: payment_method,
        status: "pending",
        amount: cart_calculations.total_gross
      });
    }

    // 6. Write to Audit Logs (Legal Compliance Requirement)
    await supabaseClient.from("audit_logs").insert({
      store_id,
      action: "CREATE_ORDER",
      table_name: "orders",
      row_id: newOrder.id,
      new_value: { order_number: orderNumber, gross: cart_calculations.total_gross }
    });

    return new Response(JSON.stringify({
      message: "Order successfully written and registered.",
      order_id: newOrder.id,
      order_number: orderNumber,
      status: "pending"
    }), {
      status: 201, // Created
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
if (!(orderNumber as any)) {
  var orderNumber = "";
}
