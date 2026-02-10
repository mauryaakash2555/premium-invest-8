# 💳 ITR TOOL PAYMENT FLOW

## USER JOURNEY:

### STEP 1: Upload & Extract (FREE)
User uploads Form16 → System extracts → Shows:
- ✅ Gross Salary: ₹25,57,983
- ✅ TDS: ₹4,83,740
- ✅ Standard Deduction: ₹50,000
- ✅ 80C: ₹1,50,000
- ℹ️ "Please verify these values before proceeding"

### STEP 2: Calculate Tax (FREE)
User clicks "Calculate Tax" → Shows:
- Old Regime: Tax = ₹5,40,691
- New Regime: Tax = ₹4,86,091 ✓ (Recommended)
- Potential Savings: ₹54,600

### STEP 3: Payment Gate (₹299)
Button: "Get Your Full ITR Summary" - ₹299

When clicked → Opens Razorpay payment:
- Amount: ₹299
- Description: "ITR Filing Report - AY 2025-26"
- Merchant: BM Wealth

### STEP 4: After Payment
Payment Success → Generate PDF with:
- Complete tax breakdown
- Regime comparison
- Deduction details
- Ready-to-file summary
- BM Wealth branding

Auto-download PDF

---

## RAZORPAY INTEGRATION:

### Test Mode Credentials:
- Key ID: rzp_test_xxx (use existing)
- Secret: xxx (use existing)

### Payment Flow:
```javascript
const options = {
  key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
  amount: 29900, // ₹299 in paise
  currency: 'INR',
  name: 'BM Wealth',
  description: 'ITR Filing Report',
  handler: function(response) {
    // Verify payment on backend
    // Generate PDF
    // Download
  }
};

const razorpay = new Razorpay(options);
razorpay.open();
```

---

## BACKEND API ENDPOINTS:

### POST /api/itr/extract-v2
- Input: Form16 file
- Output: Extracted fields
- Cost: FREE

### POST /api/itr/calculate
- Input: Extracted fields
- Output: Tax calculations (both regimes)
- Cost: FREE

### POST /api/payment/create-order
- Input: amount, userId
- Output: Razorpay order_id
- Cost: FREE (creates order)

### POST /api/payment/verify
- Input: razorpay_payment_id, razorpay_order_id, razorpay_signature
- Output: { verified: true/false }
- Action: If verified, generate PDF

### GET /api/itr/download-report/:payment_id
- Input: payment_id (verified)
- Output: PDF file
- Requires: Valid payment

---

## UI CHANGES NEEDED:

### Current Flow:
Upload → Extract → Calculate → Download PDF

### New Flow:
Upload → Extract → Calculate → **PAY ₹299** → Download PDF

### Components to Update:
1. `ITRFilingHelp.jsx` - Add payment button
2. Create `PaymentButton.jsx` - Razorpay integration
3. Create `/api/payment/create-order` - Generate Razorpay order
4. Create `/api/payment/verify` - Verify payment signature
5. Update PDF generation to require payment_id

---

## DATABASE (Optional for now):

If you want to track payments:
- payments table: payment_id, user_email, amount, status, created_at
- For MVP: Can skip, just verify signature and generate PDF

---

## SECURITY:

1. ✅ Verify Razorpay signature on backend
2. ✅ Don't trust frontend payment status
3. ✅ Generate PDF only after backend verification
4. ✅ Use environment variables for secrets

---

## READY TO IMPLEMENT?

I can build this now. Just confirm:
1. Do you have Razorpay account? (Test mode works for now)
2. Should I track payments in Supabase or skip for MVP?
3. Should PDF be auto-downloaded or emailed?
