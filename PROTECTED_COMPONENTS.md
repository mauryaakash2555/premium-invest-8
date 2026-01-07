# 🔒 PROTECTED COMPONENTS ARCHITECTURE

## Overview

This document describes the bulletproof architecture for critical components that must NEVER break:

1. **Market Ticker** (`/core/marketTicker/`)
2. **AI Chat** (`/core/chat/`)
3. **Admin Login** (`/core/admin/`)

## Why This Architecture?

These components broke repeatedly because:
- Accidental edits during unrelated refactors
- Import path changes
- Shared state mutations causing cascading failures
- CSS class name conflicts with global styles
- Dependency updates breaking functionality

## Design Principles

### 1. Complete Isolation
Each core module is 100% self-contained:
- Own JSX component file
- Own CSS module (scoped)
- Own index.js for clean exports
- ZERO imports from outside the core folder (except React/Next.js)

### 2. No Global State
- All state is local (useState/useRef)
- No Redux, Zustand, or Context
- No localStorage dependencies for core functionality

### 3. Defensive Coding
- All API calls have fallbacks
- Error boundaries wrap everything
- Graceful degradation on failure

### 4. Inline Fallbacks
- Market ticker shows fallback data if API fails
- Chat shows "temporarily unavailable" if crashed
- Admin shows clear error messages

## Directory Structure

```
core/
├── README.md              # Warning not to edit
├── index.js               # Main exports
├── marketTicker/
│   ├── index.js           # Public export
│   ├── MarketTicker.jsx   # Component
│   └── MarketTicker.module.css
├── chat/
│   ├── index.js           # Public exports
│   ├── ChatButton.jsx     # Entry point
│   └── ChatErrorBoundary.jsx
└── admin/
    ├── index.js           # Public exports
    └── AdminAuth.jsx      # Login + auth utilities
```

## Usage

### Market Ticker
```jsx
import MarketTicker from '@/core/marketTicker';

// In your page:
<MarketTicker />
```

### Admin Login
```jsx
import { AdminLogin, fetchAdminJSON, setAdminToken } from '@/core/admin';

// In your admin page:
<AdminLogin
  title="Admin Panel"
  subtitle="Enter password"
  onLogin={async (password) => {
    // Handle login
  }}
/>
```

### Chat Button
```jsx
import { ChatButton } from '@/core/chat';

// In your layout:
<ChatButton />
```

## Rules for AI Assistants

### ❌ NEVER DO:
- Edit any file in `/core/`
- Add imports to core files from outside core
- Refactor core components
- Move or rename core files
- Add new dependencies to core

### ✅ ALWAYS DO:
- Use core components via their index.js exports
- If core breaks, restore from backup first
- Ask user before any core modification
- Create new components OUTSIDE core if needed

## Backup Locations

Backups are stored in:
```
c:\Users\admin\.bmwealth-safety-backups\critical-components-{timestamp}\
```

To restore:
1. Copy files from backup to `/core/`
2. Restart dev server
3. Verify functionality

## Version History

| Date | Change | By |
|------|--------|-----|
| 2026-01-07 | Initial isolation architecture | Copilot |

---

**⚠️ REMINDER: These components are LOCKED. Do not modify without explicit approval from Akash.**
