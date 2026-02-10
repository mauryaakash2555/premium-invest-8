# 🤖 VS CODE AGENT - PHASE 1 IMPLEMENTATION INSTRUCTIONS

## 📋 CONTEXT

User has a digital store at **store.bmwealth.co.in** with Razorpay integration. ITR tool at **bmwealth.co.in/tools/itr-filing-help** needs to:

1. Extract data from Form16 (any format - digital/scanned/image)
2. Calculate tax (free)
3. Gate PDF download behind ₹299 payment (via store.bmwealth.co.in)

---

## 🎯 TASKS TO COMPLETE

### TASK 1: Update ITR Extraction API with 3-Layer System

**File:** `/app/api/itr/extract-v2/route.js` (already created)

**Update the `extractFields` function** to use universal patterns:

```javascript
function extractFields(text) {
  const fields = {
    grossSalary: 0,
    tds: 0,
    standardDeduction: 0,
    deductions80C: 0
  };

  let match = null;

  // GROSS SALARY - Multiple patterns for different templates
  match = text.match(/section\s+17\s*\(\s*1\s*\).*?(\d{6,8})/is);
  if (match) fields.grossSalary = parseInt(match[1]);

  if (!fields.grossSalary) {
    match = text.match(/Salary\s+as\s+per\s+provisions.*?(\d{6,8})/is);
    if (match) fields.grossSalary = parseInt(match[1]);
  }

  if (!fields.grossSalary) {
    match = text.match(/Gross\s+Salary.*?(\d{6,8})/is);
    if (match) fields.grossSalary = parseInt(match[1]);
  }

  // TDS - Multiple patterns
  match = text.match(/Total\s*\(?\s*Rs\.?\s*\)?\s+(\d{4,8})/i);
  if (match) fields.tds = parseInt(match[1]);

  if (!fields.tds) {
    match = text.match(/Amount\s+of\s+tax\s+deducted.*?(\d{4,8})/is);
    if (match) fields.tds = parseInt(match[1]);
  }

  if (!fields.tds) {
    match = text.match(/tax\s+deducted.*?source.*?(\d{4,8})/is);
    if (match) fields.tds = parseInt(match[1]);
  }

  // STANDARD DEDUCTION - Multiple patterns
  match = text.match(/Standard\s+deduction.*?(\d{5})/is);
  if (match) fields.standardDeduction = parseInt(match[1]);

  if (!fields.standardDeduction) {
    match = text.match(/(?:section|u\/s)\s+16\s*\(\s*ia\s*\).*?(\d{5})/is);
    if (match) fields.standardDeduction = parseInt(match[1]);
  }

  if (!fields.standardDeduction && text.match(/50000/)) {
    fields.standardDeduction = 50000; // Common value
  }

  // 80C DEDUCTIONS - Multiple patterns
  match = text.match(/80\s*C.*?(\d{5,7})/is);
  if (match) fields.deductions80C = parseInt(match[1]);

  if (!fields.deductions80C) {
    match = text.match(/(?:Life\s+Insurance|PPF|ELSS).*?(\d{5,7})/is);
    if (match) fields.deductions80C = parseInt(match[1]);
  }

  return fields;
}
```

**CRITICAL:** Replace the simple extractFields function with this universal version.

---

### TASK 2: Create Razorpay Payment Integration

**File:** `/app/api/payment/create-order/route.js` (NEW)

```javascript
export async function POST(request) {
  try {
    const { amount, currency = 'INR', receipt } = await request.json();

    // For store.bmwealth.co.in integration
    // Return order details that will redirect to store

    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return Response.json({
      success: true,
      orderId,
      amount,
      currency,
      // Store URL for payment
      paymentUrl: `https://store.bmwealth.co.in/products/itr-report?order_id=${orderId}&amount=${amount}`
    });

  } catch (error) {
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
```

---

### TASK 3: Update Frontend - Add Payment Button

**File:** Find the ITR filing component (likely `/components/tools/ITRFilingHelp.jsx` or similar)

**After the tax calculation results**, add this button:

```jsx
{taxCalculated && (
  <div className="mt-8 text-center">
    <button
      onClick={handleDownloadReport}
      className="bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black px-8 py-4 rounded-lg font-bold text-lg hover:opacity-90 transition-all"
    >
      Get Your Full ITR Report - ₹299
    </button>
    <p className="text-gray-400 text-sm mt-2">
      Secure payment via BM Digital Store
    </p>
  </div>
)}
```

**Add the handler function:**

```javascript
const handleDownloadReport = async () => {
  try {
    // Create payment order
    const response = await fetch('/api/payment/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 29900, // ₹299 in paise
        receipt: `itr_${Date.now()}`
      })
    });

    const data = await response.json();

    if (data.success) {
      // Redirect to store for payment
      window.location.href = data.paymentUrl;
    }
  } catch (error) {
    console.error('Payment error:', error);
    alert('Payment initialization failed. Please try again.');
  }
};
```

---

### TASK 4: Create Store Product Page (OPTIONAL - if not already exists)

**On store.bmwealth.co.in**, create product:
- **Product Name:** "ITR Filing Report - AY 2025-26"
- **Price:** ₹299
- **Type:** Digital Download
- **Description:** "Complete ITR summary with tax calculations for both regimes"

**After successful payment on store**, redirect back to:
```
https://bmwealth.co.in/tools/itr-filing-help?payment_success=true&order_id={ORDER_ID}
```

---

### TASK 5: Handle Payment Success & Generate PDF

**File:** Update ITR filing component to detect payment success

```javascript
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const paymentSuccess = urlParams.get('payment_success');
  const orderId = urlParams.get('order_id');

  if (paymentSuccess === 'true' && orderId) {
    // Generate and download PDF
    generatePDF();
  }
}, []);

const generatePDF = async () => {
  // Use existing PDF generation logic
  // Just trigger the download
  const blob = await generateITRReportPDF(extractedFields, taxResults);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ITR_Report_${Date.now()}.pdf`;
  a.click();
};
```

---

## 🔒 SECURITY NOTES

1. **Store handles actual payment** - bmwealth.co.in just receives confirmation
2. **No Razorpay keys needed on main site** - store handles that
3. **PDF generation happens after redirect back from store**
4. **Order ID tracking** - can optionally log in Supabase

---

## 📁 FILES TO MODIFY

1. ✅ `/app/api/itr/extract-v2/route.js` - Update extractFields function
2. ✅ `/app/api/payment/create-order/route.js` - Create new file
3. ✅ ITR Filing Component - Add payment button
4. ✅ ITR Filing Component - Handle payment success

---

## 🎯 SUCCESS CRITERIA

After implementation:
1. ✅ User uploads Form16 → Extraction works (digital/scanned)
2. ✅ User sees tax calculation (FREE)
3. ✅ User clicks "Get Report ₹299" → Redirects to store
4. ✅ User pays on store → Redirects back
5. ✅ PDF auto-downloads

---

## 🚨 CRITICAL: NO EXCUSES

- Handle ALL Form16 formats (multiple regex patterns)
- Payment must go through store.bmwealth.co.in
- PDF download ONLY after payment confirmation
- Test with both digital and scanned PDFs

---

## 📞 QUESTIONS FOR USER

Before implementing, confirm:
1. Does store.bmwealth.co.in already have ITR Report product?
2. What should happen if OCR fails completely (0/4 fields)?
3. Should we log payments in Supabase or just use store's tracking?

---

**READY TO IMPLEMENT?** Start with Task 1 (API update) and work through sequentially.
