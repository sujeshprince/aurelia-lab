/* ==========================================================================
   AURELIA LAB — create-order
   Validates the bag against the server-side catalogue, computes the total,
   then either creates a Razorpay order (real INR payment) or records a
   manual "order without payment".

   Environment secrets (set with `supabase secrets set`):
     RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
   ========================================================================== */

import { createClient } from 'jsr:@supabase/supabase-js@2';
import {
  CATALOG,
  SHIPPING_THRESHOLD,
  SHIPPING_FEE,
  MAX_LINE_QTY,
  MAX_SUBTOTAL,
} from '../_shared/catalog.ts';
import { corsHeaders, json } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID') ?? '';
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET') ?? '';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

export async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400);
  }

  const itemsIn = Array.isArray(payload.items) ? payload.items : [];
  const customer = payload.customer && typeof payload.customer === 'object' ? payload.customer : {};
  const mode = payload.mode === 'manual' ? 'manual' : 'auto';

  if (itemsIn.length === 0) {
    return json({ error: 'Your bag is empty.' }, 400);
  }

  const name = String(customer.name || '').trim().slice(0, 120);
  const email = String(customer.email || '').trim().toLowerCase().slice(0, 254);
  const phone = String(customer.phone || '').trim().slice(0, 20);
  if (!EMAIL_RE.test(email)) {
    return json({ error: 'Enter a valid email address.' }, 400);
  }

  /* Build line items against the server catalogue — never trust client prices. */
  const lines: Array<{
    product_id: string;
    name: string;
    qty: number;
    price: number;
    line_total: number;
  }> = [];
  let subtotal = 0;

  for (const raw of itemsIn) {
    const id = String((raw && raw.id) || '');
    const qtyRaw = Number((raw && raw.qty) || 1);
    const qty = Math.max(1, Math.min(MAX_LINE_QTY, Math.floor(qtyRaw) || 1));
    const item = CATALOG[id];
    if (!item) {
      return json({ error: `Unknown product: ${id}` }, 400);
    }
    const lineTotal = item.price * qty;
    subtotal += lineTotal;
    if (subtotal > MAX_SUBTOTAL) {
      return json({ error: 'Order total exceeds our limit. Please contact us.' }, 400);
    }
    lines.push({ product_id: item.id, name: item.name, qty, price: item.price, line_total: lineTotal });
  }

  const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;

  /* Resolve the user from the JWT when a signed-in shopper placed the order. */
  let userId: string | null = null;
  const authHeader = req.headers.get('Authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const { data } = await supabase.auth.getUser(token);
    if (data && data.user) userId = data.user.id;
  }

  const orderBase = {
    user_id: userId,
    email,
    name,
    phone,
    items: lines,
    subtotal,
    shipping,
    total,
    currency: 'INR',
  };

  const razorpayAvailable = Boolean(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET);

  /* ------------------------- Razorpay (real payment) ------------------------ */
  if (razorpayAvailable && mode !== 'manual') {
    const basic = 'Basic ' + btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
    const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: basic },
      body: JSON.stringify({
        amount: total * 100, // paise
        currency: 'INR',
        receipt: `al_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        payment_capture: 1,
        notes: {
          products: lines.map((l) => `${l.name} x${l.qty}`).join(', ').slice(0, 255),
        },
      }),
    });

    if (rzpRes.status >= 400) {
      const body = await rzpRes.text();
      console.error('razorpay create-order error', rzpRes.status, body.slice(0, 300));
      return json({ error: 'Payment gateway could not create the order. Please try again.' }, 502);
    }

    const rzpOrder = await rzpRes.json();
    if (!rzpOrder.id) {
      return json({ error: 'Payment gateway could not create the order. Please try again.' }, 502);
    }

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        ...orderBase,
        status: 'created',
        mode: 'razorpay',
        razorpay_order_id: rzpOrder.id,
      })
      .select('id')
      .single();

    if (error) {
      console.error('db insert (razorpay) error', error.message);
      return json({ error: 'Could not save your order. Please try again.' }, 500);
    }

    return json({
      mode: 'razorpay',
      razorpayKeyId: RAZORPAY_KEY_ID,
      orderId: rzpOrder.id,
      reference: order.id,
      subtotal,
      shipping,
      amount: total,
      amountPaise: total * 100,
    });
  }

  /* --------------------- Manual order (no payment taken) -------------------- */
  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      ...orderBase,
      status: 'pending',
      mode: 'manual',
    })
    .select('id')
    .single();

  if (error) {
    console.error('db insert (manual) error', error.message);
    return json({ error: 'Could not save your order. Please try again.' }, 500);
  }

  return json({
    mode: 'manual',
    reference: order.id,
    subtotal,
    shipping,
    amount: total,
  });
}