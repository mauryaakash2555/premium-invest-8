import Razorpay from 'razorpay';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getKeyId() {
  return String(process.env.RAZORPAY_KEY_ID || '').trim();
}

function getKeySecret() {
  return String(process.env.RAZORPAY_KEY_SECRET || '').trim();
}

export async function POST(request) {
  try {
    const keyId = getKeyId();
    const keySecret = getKeySecret();
    if (!keyId || !keySecret) {
      return Response.json({ success: false, error: 'Razorpay not configured' }, { status: 500 });
    }

    const { amount } = await request.json(); // amount in paise

    const safeAmount = Number(amount);
    if (!Number.isFinite(safeAmount) || safeAmount <= 0) {
      return Response.json({ success: false, error: 'Invalid amount' }, { status: 400 });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount: safeAmount,
      currency: 'INR',
      receipt: `itr_${Date.now()}`,
    });

    return Response.json({ success: true, orderId: order.id });
  } catch (error) {
    return Response.json({ success: false, error: error?.message || 'Payment error' }, { status: 500 });
  }
}
