import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * POST /api/razorpay/verify
 * Verifies the Razorpay payment signature after checkout.
 *
 * In production: verifies HMAC SHA256 signature using RAZORPAY_KEY_SECRET.
 * In demo mode (no secret configured): accepts any payment as valid.
 *
 * SECURITY (Round 3 S3 fix): removed the `order_demo_*` bypass — was an
 * `||` short-circuit that let attackers bypass signature verification in
 * production by submitting `razorpay_order_id: "order_demo_anything"`.
 * Demo mode is now keyed solely on `!keySecret`.
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

  // ===== DEMO MODE (only when RAZORPAY_KEY_SECRET is unset) =====
  if (!keySecret) {
    return NextResponse.json({
      verified: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      demo: true,
      message: "Payment verified in DEMO mode. No real charge was made.",
    });
  }

  // ===== PRODUCTION MODE (signature verification required) =====
  try {
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    // Constant-time comparison to prevent timing attacks.
    const sigBuf = Buffer.from(String(razorpay_signature || ""));
    const expBuf = Buffer.from(expectedSignature);
    const verified =
      sigBuf.length === expBuf.length &&
      crypto.timingSafeEqual(sigBuf, expBuf);

    if (!verified) {
      return NextResponse.json({ verified: false, error: "Signature mismatch · possible tampering" }, { status: 400 });
    }
    return NextResponse.json({
      verified: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      demo: false,
    });
  } catch (e: any) {
    return NextResponse.json({ verified: false, error: "Payment verification failed" }, { status: 500 });
  }
}
