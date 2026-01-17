# Live Intelligence Overlay Fixes

## NON-CRITICAL ISSUES (Can Ship)

### 1. Notification Overlay Z-Index Issue

**Problem:**
A notification dialog appeared on top of the Live Intelligence overlay when it opened, creating a stacked dialog experience. The notification has an "Ok" button that successfully dismisses it, but users may be confused by the extra layer.

**Root Cause:**
- CookieConsent component has z-index: 9999
- LiveIntelligenceOverlay also had z-index: 9999
- When both are visible, they compete for stacking order

**Solution:**
- Increase LiveIntelligenceOverlay z-index from `9999` to `10001`
- Increase sticky back button z-index from `9999` to `10002`

**Files Changed:**
- `components/user/LiveIntelligenceOverlay.jsx`

---

### 2. Chart Loading State

**Problem:**
The Live Chart (NIFTY 50 TradingView embed) displays a loading spinner for an extended period. This is acceptable for async data loading, but should have a timeout or error fallback visible.

**Solution:**
Created `ChartLoadingWrapper` component with:
- Animated loading spinner while chart loads
- 15-second timeout before showing error state
- Friendly error message: "Chart is taking longer than expected"
- Retry button to reload the chart

**Applied to:**
- NIFTY 50 Live Chart
- Global Markets TradingView widget

**Files Changed:**
- `components/user/LiveIntelligenceOverlay.jsx`

---

## Deployment

**Commit:** `a98227a` - "Fix: z-index for overlay above cookie consent + chart loading timeout"

**Branches Updated:**
- ✅ staging
- ✅ main
