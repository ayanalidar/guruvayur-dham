import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/razorpay/create-order
 * Creates a Razorpay order ID for the checkout.
 *
 * In production: makes a real API call to Razorpay's /v1/orders endpoint
 * using RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET from env.
 *
 * In demo mode (no keys): returns a simulated order ID so the checkout flow
 * can be tested end-to-end.
 *
 * body: { amount (in paise), receipt, notes? }
 * returns: { orderId, amount, currency, keyId, demo }
 */
export async function POST(req: NextRequest) {
  const { amount, receipt, notes } = await req.json();

  if (!amount || amount < 100) {
    return NextResponse.json({ error: "Amount must be at least ₹1 (100 paise)" }, { status: 400 });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  // ===== DEMO MODE (no API keys) =====
  if (!keyId || !keySecret) {
    const demoOrderId = "order_demo_" + Math.random().toString(36).slice(2, 14);
    return NextResponse.json({
      orderId: demoOrderId,
      amount,
      currency: "INR",
      keyId: "rzp_test_DEMOKEY",
      demo: true,
      message: "Running in DEMO mode — no real payment will be charged. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env for live payments.",
    });
  }

  // ===== PRODUCTION MODE =====
  try {
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const r = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount, // in paise
        currency: "INR",
        receipt: receipt || `GD-${Date.now()}`,
        notes: notes || {},
        payment_capture: 1, // auto-capture
      }),
    });
    const order = await r.json();
    if (!r.ok) {
      return NextResponse.json({ error: order.error?.description || "Razorpay order creation failed" }, { status: 400 });
    }
    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
      demo: false,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
