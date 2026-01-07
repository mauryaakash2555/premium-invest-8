# 🏦 MARKET TICKER SYSTEM - BANK LEVEL PROTECTION

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║   ⛔⛔⛔  MANDATORY READING FOR ALL AI ASSISTANTS  ⛔⛔⛔                    ║
║                                                                              ║
║   If you are an AI assistant (Claude, GPT, Copilot, Cursor, etc.):          ║
║                                                                              ║
║   YOU MUST READ THIS ENTIRE FILE BEFORE TOUCHING ANY CODE IN:               ║
║   - app/api/market-data/                                                     ║
║   - core/marketTicker/                                                       ║
║                                                                              ║
║   FAILURE TO FOLLOW THESE RULES WILL BREAK THE PRODUCTION WEBSITE           ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## 🚨 CRITICAL CHECKLIST (BEFORE ANY CHANGE)

```
□ 1. I have READ this entire README
□ 2. I have RUN the backup command below
□ 3. I will TEST the API after my changes
□ 4. I understand this is MISSION CRITICAL code
```

---

## 💾 BACKUP COMMAND (RUN THIS FIRST!)

```powershell
$ts = Get-Date -Format "yyyyMMdd-HHmmss"
$dir = "C:\Users\admin\.bmwealth-safety-backups\market-ticker-$ts"
New-Item -ItemType Directory -Path $dir -Force | Out-Null
Copy-Item "C:\Users\admin\premium-invest-8\app\api\market-data\*" "$dir\api\" -Recurse -Force
Copy-Item "C:\Users\admin\premium-invest-8\core\marketTicker\*" "$dir\frontend\" -Recurse -Force
"✅ Backup created: $dir"
```

---

## 📁 FILE STRUCTURE (ISOLATED & PROTECTED)

```
core/marketTicker/                    ← FRONTEND (isolated)
├── index.js                          ← Export only
├── MarketTicker.jsx                  ← Main component (NO external deps)
├── MarketTicker.module.css           ← Scoped styles (NO global CSS)
└── README.md                         ← This file (MANDATORY)

app/api/market-data/                  ← BACKEND (isolated)
└── route.js                          ← 12-source API (self-contained)

.env.example                          ← API keys template
```

---

## 🔒 ISOLATION RULES (NEVER BREAK THESE)

### Frontend (core/marketTicker/)
| Rule | Why |
|------|-----|
| ❌ NO imports from outside this folder | Other changes can't break it |
| ❌ NO global CSS | Styling is self-contained |
| ❌ NO global state/context | No side effects |
| ✅ All utilities are internal | Self-sufficient |
| ✅ Only calls /api/market-data | Single dependency |

### Backend (app/api/market-data/)
| Rule | Why |
|------|-----|
| ❌ NO imports except Next.js and Logger | Minimal dependencies |
| ❌ NO database calls | Pure API aggregation |
| ✅ 12 data sources with fallback cascade | Never fails |
| ✅ Hardcoded fallback data | Always returns something |
| ✅ Self-contained validation | Rejects bad data automatically |
| ✅ **Auto-calculate % when sources don't provide it** | Percentage is NEVER 0% or missing |

---

## 📈 AUTO-PERCENTAGE CALCULATION (NEVER SHOWS 0%)

When a data source doesn't provide percentage change:

1. **First**: Check if source provided valid % → Use it
2. **Second**: Calculate from previous price cache (24hr TTL)
3. **Third**: Use fallback data percentage

```javascript
// This runs for EVERY instrument automatically
autoCalculatePct("GOLD", currentPrice, sourcePercentage)
// Returns: calculated % or fallback % - NEVER 0% or null
```

**Result**: Percentage is ALWAYS shown, even if all sources fail to provide it.

---

## 📊 DATA SOURCES (12 TOTAL, 3+ PER INSTRUMENT)

| Instrument | Source 1 | Source 2 | Source 3 | Source 4 |
|------------|----------|----------|----------|----------|
| **NIFTY 50** | Google Finance | NSE India | MoneyControl | Fallback |
| **SENSEX** | Google Finance | BSE India | MoneyControl | Fallback |
| **USD/INR** | Google Finance | Alpha Vantage | ExchangeRate API | Fallback |
| **Bitcoin** | CoinGecko | Binance | Alpha Vantage | Fallback |
| **MCX Gold** | MoneyControl | MCX Official | LiveMint | GoodReturns |
| **MCX Silver** | MoneyControl | MCX Official | LiveMint | GoodReturns |
| **MCX Crude** | MoneyControl | MCX Official | LiveMint | Fallback |

**GUARANTEE**: If all 12 sources fail, hardcoded fallback data is returned. API NEVER fails.

---

## 🔑 API KEYS (Only 2 Required)

| Key | Required | Free Tier | Get It |
|-----|----------|-----------|--------|
| `ALPHA_VANTAGE_API_KEY` | ✅ Yes | 25/day | https://www.alphavantage.co/support/#api-key |
| `GOLDAPI_KEY` | ⚠️ Optional | 300/month | https://www.goldapi.io/ |
| `EXCHANGE_RATE_API_KEY` | ⚠️ Optional | 1500/month | https://www.exchangerate-api.com/ |

**9 sources work WITHOUT any API key** (Google, NSE, BSE, MCX, CoinGecko, Binance, etc.)

---

## 📊 PRICE VALIDATION RANGES (MCX FUTURES)

| Instrument | Min | Max | Notes |
|------------|-----|-----|-------|
| NIFTY 50 | 15,000 | 35,000 | Index points |
| SENSEX | 50,000 | 120,000 | Index points |
| USD/INR | 70 | 100 | ₹ per USD |
| Bitcoin | 10,000 | 500,000 | USD |
| **MCX Gold** | **70,000** | **200,000** | ₹/10g **FUTURES** (not spot) |
| **MCX Silver** | **200,000** | **350,000** | ₹/kg **FUTURES** (not spot) |
| MCX Crude | 4,000 | 12,000 | ₹/barrel |

> ⚠️ **IMPORTANT**: MCX shows FUTURES prices, NOT spot prices!
> - Gold FUTURES: ~₹1,38,000/10g (Spot is ~₹78,000)
> - Silver FUTURES: ~₹2,55,000/kg (Spot is ~₹90,000)

---

## 🛡️ FALLBACK DATA (Updated 2026-01-07)

If all sources fail, these values are returned:

```javascript
{ id: "NIFTY50",   value: 26133,  changePct: -0.24 }
{ id: "SENSEX",    value: 84880,  changePct: -0.17 }
{ id: "GOLD",      value: 138357, changePct: -0.52 }  // MCX FUTURES
{ id: "SILVER",    value: 255052, changePct: -1.45 }  // MCX FUTURES
{ id: "CRUDEOIL",  value: 5077,   changePct: -2.55 }
{ id: "BTC",       value: 92605,  changePct: -1.25 }
{ id: "USDINR",    value: 85.75,  changePct: +0.05 }
```

---

## 🧪 TEST COMMAND

```powershell
Invoke-RestMethod "http://localhost:3000/api/market-data" | ConvertTo-Json
```

**Expected**: All 7 items with `value`, `changePct`, `direction`, `source`, `live: true`

---

## 🆘 EMERGENCY RECOVERY

```powershell
# Find and restore latest backup
$backup = Get-ChildItem "C:\Users\admin\.bmwealth-safety-backups\market-ticker-*" | 
          Sort-Object Name -Descending | Select-Object -First 1
Copy-Item "$($backup.FullName)\api\*" "C:\Users\admin\premium-invest-8\app\api\market-data\" -Force
Copy-Item "$($backup.FullName)\frontend\*" "C:\Users\admin\premium-invest-8\core\marketTicker\" -Force
"✅ Restored from: $($backup.Name)"
```

---

## ❌ DO NOT

- ❌ Delete or modify fallback data without testing
- ❌ Change validation ranges without understanding MCX FUTURES
- ❌ Remove any data source
- ❌ Add external dependencies to frontend component
- ❌ Edit without creating backup first
- ❌ Import from outside core/marketTicker/ in frontend
- ❌ Add global CSS that could leak

---

## ✅ SAFE TO DO

- ✅ Add NEW data sources (as backup, not replacement)
- ✅ Update fallback values with current market prices
- ✅ Add new instruments (with 3+ sources each)
- ✅ Adjust cache timing (currently 90 seconds)
- ✅ Improve error logging
- ✅ Fix bugs (with backup first)

---

## 📞 CONTACT

If unsure about any change, ASK THE USER before proceeding.

---

**Last Updated**: 2026-01-07 | **Version**: Bulletproof 2.0
