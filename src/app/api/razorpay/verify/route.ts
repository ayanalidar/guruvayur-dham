import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * POST /api/razorpay/verify
 * Verifies the Razorpay payment signature after checkout.
 *
 * In production: verifies HMAC SHA256 signature using RAZORPAY_KEY_SECRET.
 * In demo mode (no secret): accepts any payment as valid.
 *
 * body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 * returns: { verified: boolean, paymentId }
 */
export async function POST(req: NextRequest) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

  if (!razorpay_order_id || !razorpay_payment_id) {
    return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  // ===== DEMO MODE =====
  if (!keySecret || razorpay_order_id.startsWith("order_demo_")) {
    return NextResponse.json({
      verified: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      demo: true,
      message: "Payment verified in DEMO mode. No real charge was made.",
    });
  }

  // ===== PRODUCTION MODE =====
  try {
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const verified = expectedSignature === razorpay_signature;
    if (!verified) {
      return NextResponse.json({ verified: false, error: "Signature mismatch — possible tampering" }, { status: 400 });
    }
    return NextResponse.json({
      verified: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      demo: false,
    });
  } catch (e: any) {
    return NextResponse.json({ verified: false, error: e.message }, { status: 500 });
  }
}
