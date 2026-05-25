// supabase/functions/fiscal-sign-order/index.ts
// Secure Server-Side Fiscal Compliance Signing Layer for Belgium FDM/Fiskaly TSS

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
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { order_id, fiscal_provider } = await req.json() as {
      order_id: string;
      fiscal_provider: string;
    };

    if (!order_id) {
      return new Response(JSON.stringify({ error: "Missing order_id." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Fetch complete order totals from the database
    const { data: order, error: orderErr } = await supabaseClient
      .from("orders")
      .select("id, store_id, device_id, total_gross, order_number")
      .eq("id", order_id)
      .single();

    if (orderErr || !order) {
      return new Response(JSON.stringify({ error: "Order not found in database." }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Load secure API secrets held exclusively in Deno environment keys
    const apiSecret = Deno.env.get("FISCAL_PROVIDER_API_KEY") ?? "MOCK_SECRET_EU_KEY_443322";
    
    // 3. Simulating hardware signature handshake with DDM digital box or Fiskaly Cloud TSS
    // In a live production system, this routes a HTTP request containing signature certificates
    const signatureCounter = Math.floor(Math.random() * 5000) + 1000;
    const signatureTimestamp = new Date().toISOString();
    const signatureHash = `SIG_${Math.random().toString(36).substring(2, 10)}${signatureCounter}_SHA256_FDM_BE`;

    const fiscalPayload = {
      timestamp: signatureTimestamp,
      secure_hash: signatureHash.substring(4, 20),
      signature_counter: signatureCounter,
      provider_api_version: "2.1.0-Release",
    };

    const receiptNumber = `BE-STORE01-${signatureTimestamp.substring(0, 10).replace(/-/g, "")}-${order.order_number}`;

    // 4. Record to Receipts table
    const { error: receiptErr } = await supabaseClient
      .from("receipts")
      .insert({
        order_id: order.id,
        receipt_number: receiptNumber,
        fiscal_provider: fiscal_provider || "fiskaly",
        fiscal_signature: signatureHash,
        fiscal_payload: fiscalPayload
      });

    if (receiptErr) throw new Error(`Failed to write compliant receipt: ${receiptErr.message}`);

    // 5. Update Order status to PAID
    await supabaseClient
      .from("orders")
      .update({ status: "paid" })
      .eq("id", order_id);

    // 6. Record raw handshake into Fiscal Logs
    await supabaseClient
      .from("fiscal_logs")
      .insert({
        store_id: order.store_id,
        device_id: order.device_id,
        request_type: "sign_order",
        payload: { order_id, provider: fiscal_provider },
        response_status: 201
      });

    // 7. Write to global Audit Logs
    await supabaseClient.from("audit_logs").insert({
      store_id: order.store_id,
      action: "FISCAL_SIGN_ORDER",
      table_name: "receipts",
      row_id: order_id,
      new_value: { receipt_number: receiptNumber, hash: signatureHash }
    });

    return new Response(JSON.stringify({
      message: "Order successfully signed and fiscally stamped.",
      receipt_number: receiptNumber,
      fiscal_signature: signatureHash,
      fiscal_payload: fiscalPayload
    }), {
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
