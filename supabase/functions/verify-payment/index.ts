/* ==========================================================================
   AURELIA LAB — verify-payment
   Verifies the Razorpay signature for a successful payment and marks the
   matching order row as paid.

   Environment secret:
     RAZORPAY_KEY_SECRET
   ========================================================================== */

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { corsHeaders, json } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET') ?? '';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

function validSignature(orderId: string, paymentId: string, signature: string): boolean {
  try {
    if (!RAZORPAY_KEY_SECRET || !orderId || !paymentId || !signature) return false;
    const expected = createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
    const a = Buffer.from(expected, 'hex');
    const b = Buffer.from(signature, 'hex');
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  let p: any;
  try {
    p = await req.json();
  } catch {
    return json({ error: 'Invalid body.' }, 400);
  }

  const orderId = String(p.order_id || '');
  const paymentId = String(p.payment_id || '');
  const signature = String(p.signature || '');

  if (!orderId || !paymentId || !signature) {
    return json({ error: 'Missing payment details.' }, 400);
  }

  if (!validSignature(orderId, paymentId, signature)) {
    return json({ error: 'Signature verification failed.' }, 400);
  }

  const { data: order, error: findError } = await supabase
    .from('orders')
    .select('id, status')
    .eq('razorpay_order_id', orderId)
    .maybeSingle();

  if (findError || !order) {
    return json({ error: 'Order not found.' }, 404);
  }

  if (order.status === 'paid') {
    return json({ ok: true, reference: order.id, already: true });
  }

  const { error: updateError } = await supabase
    .from('orders')
    .update({
      status: 'paid',
      razorpay_payment_id: paymentId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', order.id);

  if (updateError) {
    console.error('mark-paid error', updateError.message);
    return json({ error: 'Could not finalise your order.' }, 500);
  }

  return json({ ok: true, reference: order.id });
}